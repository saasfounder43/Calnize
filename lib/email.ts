import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Booking Tool <noreply@yourdomain.com>',
      to,
      subject,
      html,
    });

    if (error) {
      console.error('Email send error:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Email send exception:', err);
    return { success: false, error: err };
  }
}

export function buildConfirmationEmail(params: {
  guestName: string;
  hostName: string;
  bookingTitle: string;
  startTime: string;
  timezone: string;
  cancelLink: string;
}) {
  return `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
      <h2 style="color: #1a1a2e;">Booking Confirmed ✅</h2>
      <p>Hi ${params.guestName},</p>
      <p>Your booking with <strong>${params.hostName}</strong> has been confirmed.</p>
      <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <p><strong>Meeting:</strong> ${params.bookingTitle}</p>
        <p><strong>Time:</strong> ${params.startTime}</p>
        <p><strong>Timezone:</strong> ${params.timezone}</p>
      </div>
      <p>Need to cancel? <a href="${params.cancelLink}" style="color: #6c5ce7;">Click here</a></p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px;">Sent via Calnize</p>
    </div>
  `;
}

export function buildReminderEmail(params: {
  guestName: string;
  hostName: string;
  bookingTitle: string;
  startTime: string;
  timezone: string;
}) {
  return `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
      <h2 style="color: #1a1a2e;">Reminder: Upcoming Meeting ⏰</h2>
      <p>Hi ${params.guestName},</p>
      <p>This is a reminder about your meeting with <strong>${params.hostName}</strong> in 24 hours.</p>
      <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <p><strong>Meeting:</strong> ${params.bookingTitle}</p>
        <p><strong>Time:</strong> ${params.startTime}</p>
        <p><strong>Timezone:</strong> ${params.timezone}</p>
      </div>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #999; font-size: 12px;">Sent via Calnize</p>
    </div>
  `;
}
