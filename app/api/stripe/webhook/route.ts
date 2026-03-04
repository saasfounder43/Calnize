import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// POST /api/stripe/webhook
export async function POST(request: NextRequest) {
    try {
        const body = await request.text();
        const sig = request.headers.get('stripe-signature');

        if (!sig) {
            return NextResponse.json({ error: 'No signature' }, { status: 400 });
        }

        const { stripe } = await import('@/lib/stripe');

        let event;
        try {
            event = stripe.webhooks.constructEvent(
                body,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET!
            );
        } catch (err) {
            console.error('Webhook signature verification failed:', err);
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const metadata = session.metadata;

            if (!metadata) {
                return NextResponse.json({ error: 'No metadata' }, { status: 400 });
            }

            const supabase = createServerSupabaseClient();

            // Update booking payment status
            const { error: updateError } = await supabase
                .from('bookings')
                .update({ payment_status: 'paid' })
                .eq('stripe_payment_intent_id', session.id);

            if (updateError) {
                console.error('Error updating booking:', updateError);
            }

            // Create Google Calendar event
            try {
                const { data: oauthToken } = await supabase
                    .from('oauth_tokens')
                    .select('*')
                    .eq('user_id', metadata.host_user_id)
                    .single();

                if (oauthToken) {
                    const { getCalendarClient } = await import('@/lib/google');
                    const calendar = getCalendarClient(oauthToken.access_token);

                    const calEvent = await calendar.events.insert({
                        calendarId: 'primary',
                        requestBody: {
                            summary: `Paid booking with ${metadata.guest_name}`,
                            start: { dateTime: metadata.start_time },
                            end: { dateTime: metadata.end_time },
                            attendees: [{ email: metadata.guest_email }],
                        },
                    });

                    if (calEvent.data.id) {
                        await supabase
                            .from('bookings')
                            .update({ calendar_event_id: calEvent.data.id })
                            .eq('stripe_payment_intent_id', session.id);
                    }
                }
            } catch (calErr) {
                console.error('Calendar event error (non-blocking):', calErr);
            }

            // Send confirmation email
            try {
                const { sendEmail, buildConfirmationEmail } = await import('@/lib/email');
                const { data: hostUser } = await supabase
                    .from('users')
                    .select('full_name, timezone')
                    .eq('id', metadata.host_user_id)
                    .single();

                const emailHtml = buildConfirmationEmail({
                    guestName: metadata.guest_name,
                    hostName: hostUser?.full_name || 'Your Host',
                    bookingTitle: 'Paid Consultation',
                    startTime: new Date(metadata.start_time).toLocaleString(),
                    timezone: hostUser?.timezone || 'UTC',
                    cancelLink: `${process.env.NEXT_PUBLIC_APP_URL}/api/bookings/${session.id}/cancel`,
                });

                await sendEmail({
                    to: metadata.guest_email,
                    subject: 'Booking Confirmed — Payment Received',
                    html: emailHtml,
                });
            } catch (emailErr) {
                console.error('Email error (non-blocking):', emailErr);
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
