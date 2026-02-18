import { NextRequest, NextResponse } from 'next/server';
import { getAvailableSlots, getAvailableDates, isSlotAvailable, createCalendarEvent } from '@/lib/google-calendar';
import { getSettings, createBooking, getDocument } from '@/lib/firestore';
import { sendBookingConfirmationToClient, sendBookingNotificationToAdmin } from '@/lib/sendgrid';
import { Timestamp } from 'firebase/firestore';
import type { Service, Settings } from '@/types';

// GET - Get available slots or dates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const dateStr = searchParams.get('date');

    // Get settings for working hours
    const settings = await getSettings();
    const calendar = settings?.calendar || {
      workingDays: [1, 2, 3, 4, 5],
      workingHours: { start: '09:00', end: '18:00' },
      sessionDuration: 50,
      bufferTime: 10,
    };

    if (action === 'dates') {
      // Get available dates for the next 30 days
      const dates = await getAvailableDates(
        30,
        calendar.workingDays,
        calendar.workingHours,
        calendar.sessionDuration,
        calendar.bufferTime
      );

      return NextResponse.json({
        success: true,
        dates: dates.map(d => d.toISOString().split('T')[0]),
      });
    }

    if (action === 'slots' && dateStr) {
      // Get available slots for a specific date
      const date = new Date(dateStr);
      
      // Check if the date is a working day
      if (!calendar.workingDays.includes(date.getDay())) {
        return NextResponse.json({
          success: true,
          slots: [],
          message: 'Not a working day',
        });
      }

      const slots = await getAvailableSlots(
        date,
        calendar.workingHours,
        calendar.sessionDuration,
        calendar.bufferTime
      );

      return NextResponse.json({
        success: true,
        slots: slots.map(slot => ({
          start: slot.start.toISOString(),
          end: slot.end.toISOString(),
          label: slot.start.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' }),
        })),
      });
    }

    return NextResponse.json({ 
      success: true, 
      settings: {
        workingDays: calendar.workingDays,
        workingHours: calendar.workingHours,
        sessionDuration: calendar.sessionDuration,
      }
    });
  } catch (error) {
    console.error('Calendar API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch calendar data' },
      { status: 500 }
    );
  }
}

// POST - Create a booking with calendar event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { clientName, clientEmail, clientPhone, serviceId, datetime, notes } = body;

    // Validate required fields
    if (!clientName || !clientEmail || !clientPhone || !serviceId || !datetime) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const bookingDatetime = new Date(datetime);

    // Get settings for session duration
    const settings = await getSettings();
    const sessionDuration = settings?.calendar?.sessionDuration || 50;

    // Calculate end time
    const endDatetime = new Date(bookingDatetime.getTime() + sessionDuration * 60 * 1000);

    // Check if slot is still available
    const available = await isSlotAvailable(bookingDatetime, endDatetime);
    if (!available) {
      return NextResponse.json(
        { error: 'This time slot is no longer available' },
        { status: 409 }
      );
    }

    // Get service name for calendar event
    const service = await getDocument<Service>('services', serviceId);
    const serviceName = service?.title?.ro || serviceId;

    // Create Google Calendar event
    let googleEventId: string | undefined;
    try {
      googleEventId = await createCalendarEvent({
        summary: `Psihoterapie: ${clientName}`,
        description: `
Serviciu: ${serviceName}
Client: ${clientName}
Email: ${clientEmail}
Telefon: ${clientPhone}
${notes ? `Notite: ${notes}` : ''}
        `.trim(),
        start: bookingDatetime,
        end: endDatetime,
        attendees: [{ email: clientEmail }],
      });
    } catch (calendarError) {
      console.error('Failed to create calendar event:', calendarError);
      // Continue without calendar event - we'll create the booking anyway
    }

    // Create booking in Firestore
    const bookingId = await createBooking({
      clientName,
      clientEmail,
      clientPhone,
      serviceId,
      datetime: Timestamp.fromDate(bookingDatetime),
      status: 'pending',
      googleEventId,
      notes,
    });

    // Format date for emails
    const formattedDatetime = bookingDatetime.toLocaleDateString('ro-RO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Send confirmation emails
    try {
      await Promise.all([
        sendBookingConfirmationToClient({
          clientName,
          clientEmail,
          clientPhone,
          serviceName,
          datetime: formattedDatetime,
          notes,
        }),
        sendBookingNotificationToAdmin({
          clientName,
          clientEmail,
          clientPhone,
          serviceName,
          datetime: formattedDatetime,
          notes,
        }),
      ]);
    } catch (emailError) {
      console.error('Failed to send booking emails:', emailError);
      // Don't fail the request - booking is already created
    }

    return NextResponse.json({
      success: true,
      bookingId,
      googleEventId,
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}
