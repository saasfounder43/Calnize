import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// POST /api/bookings — Create a new booking (public, no auth required)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            booking_type_id,
            guest_name,
            guest_email,
            guest_notes,
            start_time,
            end_time,
        } = body;

        if (!booking_type_id || !guest_name || !guest_email || !start_time || !end_time) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const supabase = createServerSupabaseClient();

        // 1. Fetch booking type to get host info and pricing
        const { data: bookingType, error: btError } = await supabase
            .from('booking_types')
            .select('*')
            .eq('id', booking_type_id)
            .eq('is_active', true)
            .single();

        if (btError || !bookingType) {
            return NextResponse.json(
                { error: 'Booking type not found or inactive' },
                { status: 404 }
            );
        }

        // 2. Check for double booking (race condition prevention)
        const { data: conflicts } = await supabase
            .from('bookings')
            .select('id')
            .eq('host_user_id', bookingType.user_id)
            .lt('start_time', end_time)
            .gt('end_time', start_time);

        if (conflicts && conflicts.length > 0) {
            return NextResponse.json(
                { error: 'This time slot is no longer available' },
                { status: 409 }
            );
        }

        // 3. If paid booking type, create Stripe checkout
        if (bookingType.price && bookingType.price > 0) {
            try {
                const { stripe } = await import('@/lib/stripe');

                const session = await stripe.checkout.sessions.create({
                    payment_method_types: ['card'],
                    line_items: [
                        {
                            price_data: {
                                currency: bookingType.currency.toLowerCase(),
                                product_data: {
                                    name: bookingType.title,
                                    description: bookingType.description || `${bookingType.duration_minutes} minute meeting`,
                                },
                                unit_amount: Math.round(bookingType.price * 100),
                            },
                            quantity: 1,
                        },
                    ],
                    mode: 'payment',
                    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/confirmation?session_id={CHECKOUT_SESSION_ID}`,
                    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/cancelled`,
                    metadata: {
                        booking_type_id,
                        host_user_id: bookingType.user_id,
                        guest_name,
                        guest_email,
                        guest_notes: guest_notes || '',
                        start_time,
                        end_time,
                    },
                });

                // Create pending booking
                await supabase.from('bookings').insert({
                    booking_type_id,
                    host_user_id: bookingType.user_id,
                    guest_name,
                    guest_email,
                    guest_notes,
                    start_time,
                    end_time,
                    payment_status: 'pending',
                    stripe_payment_intent_id: session.id,
                });

                return NextResponse.json({ checkout_url: session.url });
            } catch (stripeError) {
                console.error('Stripe error:', stripeError);
                return NextResponse.json(
                    { error: 'Payment processing error. Please try again.' },
                    { status: 500 }
                );
            }
        }

        // 4. Free booking — confirm immediately
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .insert({
                booking_type_id,
                host_user_id: bookingType.user_id,
                guest_name,
                guest_email,
                guest_notes,
                start_time,
                end_time,
                payment_status: 'free',
            })
            .select()
            .single();

        if (bookingError) {
            return NextResponse.json(
                { error: bookingError.message },
                { status: 500 }
            );
        }

        // 5. Create Google Calendar event (if connected)
        try {
            const { data: oauthToken } = await supabase
                .from('oauth_tokens')
                .select('*')
                .eq('user_id', bookingType.user_id)
                .single();

            if (oauthToken) {
                const { getCalendarClient } = await import('@/lib/google');
                const calendar = getCalendarClient(oauthToken.access_token);

                const event = await calendar.events.insert({
                    calendarId: 'primary',
                    requestBody: {
                        summary: `${bookingType.title} with ${guest_name}`,
                        description: `Guest: ${guest_name} (${guest_email})\n${guest_notes ? `Notes: ${guest_notes}` : ''}`,
                        start: { dateTime: start_time },
                        end: { dateTime: end_time },
                        attendees: [{ email: guest_email }],
                    },
                });

                // Update booking with calendar event ID
                if (event.data.id) {
                    await supabase
                        .from('bookings')
                        .update({ calendar_event_id: event.data.id })
                        .eq('id', booking.id);
                }
            }
        } catch (calError) {
            console.error('Google Calendar event creation error (non-blocking):', calError);
        }

        // 6. Send confirmation emails (non-blocking)
        try {
            const {
                sendBookingConfirmation,
                sendHostNotification
            } = await import('@/lib/email');

            const { data: hostUser } = await supabase
                .from('users')
                .select('email, full_name, timezone')
                .eq('id', bookingType.user_id)
                .single();

            if (hostUser) {
                const formattedTime = new Date(start_time).toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: hostUser.timezone || 'UTC'
                });

                // Send to Guest
                await sendBookingConfirmation(guest_email, {
                    guestName: guest_name,
                    hostName: hostUser.full_name || 'Your Host',
                    bookingTitle: bookingType.title,
                    startTime: formattedTime,
                    timezone: hostUser.timezone || 'UTC',
                    cancelLink: `${process.env.NEXT_PUBLIC_APP_URL}/api/bookings/${booking.id}/cancel`,
                    participationMode: bookingType.participation_mode,
                    meetingLink: bookingType.meeting_link,
                });

                // Send to Host
                await sendHostNotification(hostUser.email, {
                    guestName: guest_name,
                    guestEmail: guest_email,
                    bookingTitle: bookingType.title,
                    startTime: formattedTime,
                    timezone: hostUser.timezone || 'UTC',
                    notes: guest_notes,
                    participationMode: bookingType.participation_mode,
                    meetingLink: bookingType.meeting_link,
                });
            }
        } catch (emailError) {
            console.error('Email send error (non-blocking):', emailError);
        }

        return NextResponse.json({ booking, confirmed: true });
    } catch (error) {
        console.error('Booking creation error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

// GET /api/bookings — List bookings for authenticated user
export async function GET(request: NextRequest) {
    try {
        const supabase = createServerSupabaseClient();
        const authHeader = request.headers.get('authorization');

        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const filter = searchParams.get('filter') || 'upcoming';

        let query = supabase
            .from('bookings')
            .select('*')
            .eq('host_user_id', user.id);

        if (filter === 'upcoming') {
            query = query
                .eq('status', 'confirmed')
                .gte('start_time', new Date().toISOString())
                .order('start_time', { ascending: true });
        } else if (filter === 'past') {
            query = query
                .eq('status', 'confirmed')
                .lt('start_time', new Date().toISOString())
                .order('start_time', { ascending: false });
        } else {
            query = query.order('start_time', { ascending: false });
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
