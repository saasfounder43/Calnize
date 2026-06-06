import { format, parse } from 'date-fns';
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

import { createCalendarEvent } from '@/lib/calendarService';
import { parseMeetingRequest } from '@/lib/parseRequest';

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Calnize <noreply@calnize.com>';

function htmlToPlainText(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatHumanSchedule(date: string, time: string): string {
  try {
    const day = parse(date, 'yyyy-MM-dd', new Date());
    const clock = parse(time, 'HH:mm', new Date(2000, 0, 1));
    return `${format(day, 'MMMM d, yyyy')} at ${format(clock, 'h:mm a')}`;
  } catch {
    return `${date} at ${time}`;
  }
}

function inboundBodyText(text?: string | null, html?: string | null): string {
  const plain = text?.trim();
  if (plain) return plain;
  const fromHtml = html?.trim();
  if (fromHtml) return htmlToPlainText(fromHtml);
  return '';
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY is not configured.' }, { status: 500 });
  }

  const resend = new Resend(apiKey);
  const raw = await request.text();

  let event: unknown;
  try {
    const secret = process.env.RESEND_WEBHOOK_SECRET?.trim();
    if (secret) {
      const id = request.headers.get('svix-id');
      const timestamp = request.headers.get('svix-timestamp');
      const signature = request.headers.get('svix-signature');
      if (!id || !timestamp || !signature) {
        return NextResponse.json({ error: 'Missing Svix signature headers.' }, { status: 401 });
      }
      event = resend.webhooks.verify({
        payload: raw,
        headers: { id, timestamp, signature },
        webhookSecret: secret,
      });
    } else {
      event = JSON.parse(raw) as unknown;
    }
  } catch (e) {
    console.error('[email-inbound] invalid webhook payload', e);
    return NextResponse.json({ error: 'Invalid webhook payload or signature.' }, { status: 400 });
  }

  if (!event || typeof event !== 'object' || !('type' in event)) {
    return NextResponse.json({ ignored: true }, { status: 200 });
  }

  const type = (event as { type?: string }).type;
  if (type !== 'email.received') {
    return NextResponse.json({ ignored: true }, { status: 200 });
  }

  const data = (event as { data?: Record<string, unknown> }).data;
  const emailId = typeof data?.email_id === 'string' ? data.email_id : null;
  const from = typeof data?.from === 'string' ? data.from : null;
  const subject = typeof data?.subject === 'string' ? data.subject : '(no subject)';
  const messageId = typeof data?.message_id === 'string' ? data.message_id : null;

  if (!emailId || !from || !messageId) {
    return NextResponse.json({ error: 'Missing email_id, from, or message_id on event.' }, { status: 400 });
  }

  const senderEmail = from;
  const threadMessageId = messageId;

  const received = await resend.emails.receiving.get(emailId);
  if (received.error || !received.data) {
    console.error('[email-inbound] receiving.get failed', received.error);
    return NextResponse.json({ error: 'Could not load inbound email content.' }, { status: 502 });
  }

  const { text, html } = received.data as { text?: string | null; html?: string | null };
  const schedulingText = inboundBodyText(text, html);
  if (!schedulingText) {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: senderEmail,
      subject: `Re: ${subject}`,
      text: 'We could not find any text in your email. Please send your meeting request as plain text (or include a text part in your message).',
      html: '<p>We could not find any text in your email. Please send your meeting request as plain text (or include a text part in your message).</p>',
      headers: { 'In-Reply-To': threadMessageId, References: threadMessageId },
    });
    return NextResponse.json({ ok: true, reason: 'empty_body' }, { status: 200 });
  }

  async function sendReply(body: string) {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: senderEmail,
      subject: `Re: ${subject}`,
      text: body,
      html: `<p>${escapeHtml(body).replace(/\n/g, '<br/>')}</p>`,
      headers: { 'In-Reply-To': threadMessageId, References: threadMessageId },
    });
    if (error) {
      console.error('[email-inbound] reply send failed', error);
    }
  }

  try {
    const parsed = await parseMeetingRequest(schedulingText);

    if (parsed.status === 'missing_info') {
      await sendReply(parsed.clarification_needed || 'Could you share more details about the meeting?');
      return NextResponse.json({ ok: true, status: 'missing_info' }, { status: 200 });
    }

    try {
      await createCalendarEvent(parsed.meeting_details);
    } catch (calErr) {
      const msg = calErr instanceof Error ? calErr.message : 'Calendar error';
      await sendReply(
        `We understood your request but could not create the calendar event: ${msg}\n\nPlease try again or check your calendar connection.`
      );
      return NextResponse.json({ ok: true, status: 'calendar_error' }, { status: 200 });
    }

    const md = parsed.meeting_details;
    const who = md.attendee_name?.trim() || 'your guest';
    const when = formatHumanSchedule(md.date, md.time);
    await sendReply(`Your meeting has been scheduled for ${when} with ${who}.`);

    return NextResponse.json({ ok: true, status: 'scheduled' }, { status: 200 });
  } catch (e) {
    console.error('[email-inbound] processing error', e);
    const msg = e instanceof Error ? e.message : 'Unexpected error';
    try {
      await sendReply(`Something went wrong while scheduling: ${msg}`);
    } catch {
      /* ignore */
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
