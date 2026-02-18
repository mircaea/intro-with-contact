import { NextRequest, NextResponse } from 'next/server';
import { createContactSubmission } from '@/lib/firestore';
import { sendContactNotification } from '@/lib/sendgrid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, message } = body;

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create contact submission in Firestore
    const id = await createContactSubmission({
      name,
      email,
      phone: phone || undefined,
      message,
    });

    // Send email notification to admin
    await sendContactNotification({
      name,
      email,
      phone,
      message,
    });

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to submit contact form' },
      { status: 500 }
    );
  }
}
