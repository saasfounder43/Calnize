import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Calnize <onboarding@resend.dev>';

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey || apiKey === 're_placeholder') {
    console.error('📧 EMAIL ERROR: RESEND_API_KEY is missing or is set to placeholder.');
    console.error('Please update your .env.local file with a real key from https://resend.com');
    return {
      success: false,
      error: 'RESEND_API_KEY is not configured. Email could not be sent.'
    };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    if (error) {
      console.error('📧 Resend Error:', error);
      return { success: false, error };
    }

    console.log('📧 Email sent successfully to:', to, 'ID:', data?.id);
    return { success: true, data };
  } catch (err) {
    console.error('📧 Email send exception:', err);
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
  participationMode?: string;
  meetingLink?: string;
}) {
  return `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #eee; border-radius: 12px;">
      <h2 style="color: #6C63FF;">Your meeting is confirmed ✅</h2>
      <p>Hi ${params.guestName},</p>
      <p>Your booking with <strong>${params.hostName}</strong> is scheduled.</p>
      <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0;"><strong>Meeting:</strong> ${params.bookingTitle}</p>
        <p style="margin: 0 0 8px 0;"><strong>Time:</strong> ${params.startTime}</p>
        <p style="margin: 0;"><strong>Timezone:</strong> ${params.timezone}</p>
        ${params.participationMode === 'virtual' && params.meetingLink ? `
          <div style="margin-top: 20px;">
            <a href="${params.meetingLink}" style="display: inline-block; background: #6C63FF; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Join Meeting</a>
            <p style="font-size: 12px; color: #666; margin-top: 8px;">Link: ${params.meetingLink}</p>
          </div>
        ` : params.participationMode === 'in_person' ? `
          <p style="margin: 8px 0 0 0;"><strong>Location:</strong> In-person</p>
        ` : ''}
      </div>
      <p>Need to cancel? <a href="${params.cancelLink}" style="color: #6C63FF; text-decoration: none; font-weight: 600;">Click here to cancel</a></p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #999; font-size: 11px; text-align: center;">Powered by Calnize</p>
    </div>
  `;
}

export function buildHostNotificationEmail(params: {
  guestName: string;
  guestEmail: string;
  bookingTitle: string;
  startTime: string;
  timezone: string;
  notes?: string;
  participationMode?: string;
  meetingLink?: string;
}) {
  return `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #eee; border-radius: 12px;">
      <h2 style="color: #6C63FF;">New booking received 🚀</h2>
      <p>Great news! You have a new meeting scheduled.</p>
      <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0;"><strong>Guest:</strong> ${params.guestName} (${params.guestEmail})</p>
        <p style="margin: 0 0 8px 0;"><strong>Meeting:</strong> ${params.bookingTitle}</p>
        <p style="margin: 0 0 8px 0;"><strong>Time:</strong> ${params.startTime} (${params.timezone})</p>
        ${params.participationMode ? `<p style="margin: 0 0 8px 0;"><strong>Mode:</strong> ${params.participationMode}</p>` : ''}
        ${params.meetingLink ? `<p style="margin: 0 0 8px 0;"><strong>Meeting Link:</strong> ${params.meetingLink}</p>` : ''}
        ${params.notes ? `<p style="margin: 0;"><strong>Notes:</strong> ${params.notes}</p>` : ''}
      </div>
      <p>View all your bookings in your <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/bookings" style="color: #6C63FF; text-decoration: none; font-weight: 600;">Calnize Dashboard</a>.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #999; font-size: 11px; text-align: center;">Sent via Calnize</p>
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
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #eee; border-radius: 12px;">
      <h2 style="color: #1a1a2e;">Reminder: Upcoming Meeting ⏰</h2>
      <p>Hi ${params.guestName},</p>
      <p>This is a reminder about your meeting with <strong>${params.hostName}</strong>.</p>
      <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0;"><strong>Meeting:</strong> ${params.bookingTitle}</p>
        <p style="margin: 0 0 8px 0;"><strong>Time:</strong> ${params.startTime}</p>
        <p style="margin: 0;"><strong>Timezone:</strong> ${params.timezone}</p>
      </div>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #999; font-size: 11px; text-align: center;">Sent via Calnize</p>
    </div>
  `;
}

export function buildCancellationEmail(params: {
  guestName: string;
  hostName: string;
  bookingTitle: string;
  startTime: string;
  rescheduleLink: string;
}) {
  return `
    <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #eee; border-radius: 12px;">
      <h2 style="color: #FF4757;">Meeting Cancelled ❌</h2>
      <p>Hi ${params.guestName},</p>
      <p>The following meeting has been cancelled:</p>
      <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin: 20px 0;">
        <p style="margin: 0 0 8px 0;"><strong>Booking:</strong> ${params.bookingTitle}</p>
        <p style="margin: 0;"><strong>Original Time:</strong> ${params.startTime}</p>
      </div>
      <p>Want to reschedule? <a href="${params.rescheduleLink}" style="display: inline-block; background: #6C63FF; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Reschedule Now</a></p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #999; font-size: 11px; text-align: center;">Sent via Calnize</p>
    </div>
  `;
}

// Helper functions for common email tasks
export async function sendBookingConfirmation(to: string, params: Parameters<typeof buildConfirmationEmail>[0]) {
  return sendEmail({
    to,
    subject: "Your meeting is confirmed",
    html: buildConfirmationEmail(params)
  });
}

export async function sendHostNotification(to: string, params: Parameters<typeof buildHostNotificationEmail>[0]) {
  return sendEmail({
    to,
    subject: `New booking: ${params.bookingTitle}`,
    html: buildHostNotificationEmail(params)
  });
}

export async function sendCancellationEmail(to: string, params: Parameters<typeof buildCancellationEmail>[0]) {
  return sendEmail({
    to,
    subject: `Meeting Cancelled: ${params.bookingTitle}`,
    html: buildCancellationEmail(params)
  });
}
