import { google } from 'googleapis';

// Google Calendar API configuration
const calendar = google.calendar('v3');

// OAuth2 client setup
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CALENDAR_CLIENT_ID,
  process.env.GOOGLE_CALENDAR_CLIENT_SECRET
);

// Set credentials using refresh token
if (process.env.GOOGLE_CALENDAR_REFRESH_TOKEN) {
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN,
  });
}

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID || 'primary';

interface TimeSlot {
  start: Date;
  end: Date;
}

interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  attendees?: { email: string }[];
}

/**
 * Get busy times from Google Calendar for a date range
 */
export async function getBusyTimes(startDate: Date, endDate: Date): Promise<TimeSlot[]> {
  try {
    const response = await calendar.freebusy.query({
      auth: oauth2Client,
      requestBody: {
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        items: [{ id: CALENDAR_ID }],
      },
    });

    const busySlots = response.data.calendars?.[CALENDAR_ID]?.busy || [];
    
    return busySlots.map((slot) => ({
      start: new Date(slot.start!),
      end: new Date(slot.end!),
    }));
  } catch (error) {
    console.error('Error getting busy times:', error);
    throw error;
  }
}

/**
 * Get available time slots for a specific date
 */
export async function getAvailableSlots(
  date: Date,
  workingHours: { start: string; end: string },
  sessionDuration: number, // in minutes
  bufferTime: number // in minutes
): Promise<TimeSlot[]> {
  const startOfDay = new Date(date);
  const [startHour, startMinute] = workingHours.start.split(':').map(Number);
  startOfDay.setHours(startHour, startMinute, 0, 0);

  const endOfDay = new Date(date);
  const [endHour, endMinute] = workingHours.end.split(':').map(Number);
  endOfDay.setHours(endHour, endMinute, 0, 0);

  // Get busy times for this day
  const busyTimes = await getBusyTimes(startOfDay, endOfDay);

  // Generate all possible slots
  const slots: TimeSlot[] = [];
  let currentStart = new Date(startOfDay);

  while (currentStart < endOfDay) {
    const slotEnd = new Date(currentStart.getTime() + sessionDuration * 60 * 1000);
    
    if (slotEnd <= endOfDay) {
      // Check if this slot conflicts with any busy time
      const isAvailable = !busyTimes.some((busy) => {
        return currentStart < busy.end && slotEnd > busy.start;
      });

      if (isAvailable) {
        slots.push({
          start: new Date(currentStart),
          end: new Date(slotEnd),
        });
      }
    }

    // Move to next slot (session + buffer)
    currentStart = new Date(currentStart.getTime() + (sessionDuration + bufferTime) * 60 * 1000);
  }

  return slots;
}

/**
 * Create a calendar event for a booking
 */
export async function createCalendarEvent(event: CalendarEvent): Promise<string> {
  try {
    const response = await calendar.events.insert({
      auth: oauth2Client,
      calendarId: CALENDAR_ID,
      requestBody: {
        summary: event.summary,
        description: event.description,
        start: {
          dateTime: event.start.toISOString(),
          timeZone: 'Europe/Bucharest',
        },
        end: {
          dateTime: event.end.toISOString(),
          timeZone: 'Europe/Bucharest',
        },
        attendees: event.attendees,
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 60 }, // 1 hour before
          ],
        },
      },
    });

    return response.data.id!;
  } catch (error) {
    console.error('Error creating calendar event:', error);
    throw error;
  }
}

/**
 * Update a calendar event
 */
export async function updateCalendarEvent(eventId: string, event: Partial<CalendarEvent>): Promise<void> {
  try {
    const updateData: Record<string, unknown> = {};
    
    if (event.summary) updateData.summary = event.summary;
    if (event.description) updateData.description = event.description;
    if (event.start) {
      updateData.start = {
        dateTime: event.start.toISOString(),
        timeZone: 'Europe/Bucharest',
      };
    }
    if (event.end) {
      updateData.end = {
        dateTime: event.end.toISOString(),
        timeZone: 'Europe/Bucharest',
      };
    }

    await calendar.events.patch({
      auth: oauth2Client,
      calendarId: CALENDAR_ID,
      eventId,
      requestBody: updateData,
    });
  } catch (error) {
    console.error('Error updating calendar event:', error);
    throw error;
  }
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(eventId: string): Promise<void> {
  try {
    await calendar.events.delete({
      auth: oauth2Client,
      calendarId: CALENDAR_ID,
      eventId,
    });
  } catch (error) {
    console.error('Error deleting calendar event:', error);
    throw error;
  }
}

/**
 * Check if a specific time slot is available
 */
export async function isSlotAvailable(start: Date, end: Date): Promise<boolean> {
  try {
    const busyTimes = await getBusyTimes(start, end);
    return busyTimes.length === 0;
  } catch (error) {
    console.error('Error checking slot availability:', error);
    return false;
  }
}

/**
 * Get available dates for the next N days
 */
export async function getAvailableDates(
  daysAhead: number,
  workingDays: number[], // 0 = Sunday, 6 = Saturday
  workingHours: { start: string; end: string },
  sessionDuration: number,
  bufferTime: number
): Promise<Date[]> {
  const availableDates: Date[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i <= daysAhead; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);

    // Check if this day is a working day
    if (workingDays.includes(date.getDay())) {
      // Check if there are any available slots on this day
      const slots = await getAvailableSlots(date, workingHours, sessionDuration, bufferTime);
      if (slots.length > 0) {
        availableDates.push(date);
      }
    }
  }

  return availableDates;
}
