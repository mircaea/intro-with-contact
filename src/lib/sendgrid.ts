import sgMail from '@sendgrid/mail';

// Initialize SendGrid
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

interface ContactNotificationData {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

interface BookingNotificationData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  serviceName: string;
  datetime: string;
  notes?: string;
}

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || process.env.SENDGRID_FROM_EMAIL || '';

/**
 * Send a generic email
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured, skipping email');
    return false;
  }

  try {
    await sgMail.send({
      to: options.to,
      from: FROM_EMAIL,
      subject: options.subject,
      text: options.text || ' ',
      html: options.html || undefined,
    });
    return true;
  } catch (error) {
    console.error('SendGrid error:', error);
    return false;
  }
}

/**
 * Send contact form notification to admin
 */
export async function sendContactNotification(data: ContactNotificationData): Promise<boolean> {
  const subject = `Nou mesaj de contact de la ${data.name}`;
  
  const html = `
    <h2>Ai primit un nou mesaj de contact</h2>
    <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Nume</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${data.name}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Email</td>
        <td style="padding: 10px; border: 1px solid #ddd;"><a href="mailto:${data.email}">${data.email}</a></td>
      </tr>
      ${data.phone ? `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Telefon</td>
        <td style="padding: 10px; border: 1px solid #ddd;"><a href="tel:${data.phone}">${data.phone}</a></td>
      </tr>
      ` : ''}
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Mesaj</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${data.message.replace(/\n/g, '<br>')}</td>
      </tr>
    </table>
  `;

  const text = `
Nou mesaj de contact

Nume: ${data.name}
Email: ${data.email}
${data.phone ? `Telefon: ${data.phone}` : ''}
Mesaj:
${data.message}
  `.trim();

  return sendEmail({
    to: ADMIN_EMAIL,
    subject,
    html,
    text,
  });
}

/**
 * Send booking confirmation to client
 */
export async function sendBookingConfirmationToClient(data: BookingNotificationData): Promise<boolean> {
  const subject = 'Confirmare programare - Psihoterapie';
  
  const html = `
    <h2>Programarea ta a fost inregistrata</h2>
    <p>Draga ${data.clientName},</p>
    <p>Ti-am inregistrat programarea cu succes. Iata detaliile:</p>
    <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Serviciu</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${data.serviceName}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Data si ora</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${data.datetime}</td>
      </tr>
      ${data.notes ? `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Notite</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${data.notes}</td>
      </tr>
      ` : ''}
    </table>
    <p>Vei primi un email de confirmare in curand.</p>
    <p>Multumim!</p>
  `;

  const text = `
Programarea ta a fost inregistrata

Draga ${data.clientName},

Ti-am inregistrat programarea cu succes. Iata detaliile:

Serviciu: ${data.serviceName}
Data si ora: ${data.datetime}
${data.notes ? `Notite: ${data.notes}` : ''}

Vei primi un email de confirmare in curand.

Multumim!
  `.trim();

  return sendEmail({
    to: data.clientEmail,
    subject,
    html,
    text,
  });
}

/**
 * Send booking notification to admin
 */
export async function sendBookingNotificationToAdmin(data: BookingNotificationData): Promise<boolean> {
  const subject = `Noua programare de la ${data.clientName}`;
  
  const html = `
    <h2>Ai primit o noua programare</h2>
    <table style="border-collapse: collapse; width: 100%; max-width: 600px;">
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Client</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${data.clientName}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Email</td>
        <td style="padding: 10px; border: 1px solid #ddd;"><a href="mailto:${data.clientEmail}">${data.clientEmail}</a></td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Telefon</td>
        <td style="padding: 10px; border: 1px solid #ddd;"><a href="tel:${data.clientPhone}">${data.clientPhone}</a></td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Serviciu</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${data.serviceName}</td>
      </tr>
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Data si ora</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${data.datetime}</td>
      </tr>
      ${data.notes ? `
      <tr>
        <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Notite</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${data.notes}</td>
      </tr>
      ` : ''}
    </table>
    <p><a href="${process.env.NEXT_PUBLIC_BASE_URL || ''}/admin/bookings">Vezi in panoul de administrare</a></p>
  `;

  const text = `
Noua programare

Client: ${data.clientName}
Email: ${data.clientEmail}
Telefon: ${data.clientPhone}
Serviciu: ${data.serviceName}
Data si ora: ${data.datetime}
${data.notes ? `Notite: ${data.notes}` : ''}
  `.trim();

  return sendEmail({
    to: ADMIN_EMAIL,
    subject,
    html,
    text,
  });
}

/**
 * Send booking status update to client
 */
export async function sendBookingStatusUpdate(
  clientEmail: string,
  clientName: string,
  status: 'confirmed' | 'cancelled',
  datetime: string,
  serviceName: string
): Promise<boolean> {
  const isConfirmed = status === 'confirmed';
  const subject = isConfirmed 
    ? 'Programarea ta a fost confirmata' 
    : 'Programarea ta a fost anulata';
  
  const html = isConfirmed 
    ? `
      <h2>Programarea ta a fost confirmata!</h2>
      <p>Draga ${clientName},</p>
      <p>Te asteptam la sedinta de <strong>${serviceName}</strong> pe <strong>${datetime}</strong>.</p>
      <p>Daca ai intrebari, nu ezita sa ne contactezi.</p>
      <p>Multumim!</p>
    `
    : `
      <h2>Programarea ta a fost anulata</h2>
      <p>Draga ${clientName},</p>
      <p>Din pacate, sedinta de <strong>${serviceName}</strong> programata pentru <strong>${datetime}</strong> a fost anulata.</p>
      <p>Te rugam sa ne contactezi pentru a reprograma.</p>
      <p>Ne cerem scuze pentru orice inconvenienta.</p>
    `;

  return sendEmail({
    to: clientEmail,
    subject,
    html,
  });
}
