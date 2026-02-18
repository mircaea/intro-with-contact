import { NextRequest, NextResponse } from 'next/server';
import { createBooking, getBookings, updateBookingStatus } from '@/lib/firestore';
import { Timestamp } from 'firebase/firestore';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'pending' | 'confirmed' | 'cancelled' | null;

    const bookings = await getBookings(status || undefined);

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { service, date, time, name, email, phone, notes } = body;

    // Validate required fields
    if (!service || !date || !time || !name || !email || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Parse datetime
    const datetime = Timestamp.fromDate(new Date(`${date}T${time}:00`));

    // Create booking in Firestore
    const id = await createBooking({
      serviceId: service,
      datetime,
      clientName: name,
      clientEmail: email,
      clientPhone: phone,
      notes: notes || undefined,
      status: 'pending',
    });

    // TODO: Create Google Calendar event
    // TODO: Send confirmation email via SendGrid
    // These will be implemented in Phase 4

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Create booking error:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await updateBookingStatus(id, status);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    );
  }
}
