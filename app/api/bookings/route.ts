import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { rateLimit, getIP, LIMITS } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
    const ip = getIP(request);
    const rl = rateLimit(ip, 'bookings', LIMITS.bookings);
    if (!rl.allowed) {
        return NextResponse.json(
            { error: 'Too many requests. Please wait a moment and try again.' },
            { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
        );
    }

    try {
        const body = await request.json();
        const { booking_type_id, guest_name, guest_email, guest_notes, start_time, end_time } = body;

        if (!booking_type_id || !guest_name || !guest_email || !start_time || !end_time) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const supabase = createServerSupabaseClient();

        const { data: bookingType, error: btError } = await supabase
            .from('booking_types').select('*').eq('id', booking_type_id).eq('is_active', true).single();

        if (btError || !bookingType) {
            return NextResponse.json({ error: 'Booking type not found or inactive' }, { status: 404 });
        }

        const { data: conflicts } = await supabase
            .from('bookings').select('id').eq('host_user_id', bookingType.user_id)
            .lt('start_time', end_time).gt('end_time', start_time);

        if (conflicts && conflicts.length > 0) {
            return NextResponse.json({ error: 'This time slot is no longer available' }, { status: 409 });
        }

        if (bookingType.max_bookings_per_day) {
            const dateStr = new Date(start_time).toISOString().split('T')[0];
            const { count } = await supabase.from('bookings').select('*', { count: 'exact', head: true })
                .eq('booking_type_id', booking_type_id).eq('status', 'confirmed')
                .gte('start_time', `${dateStr}T00:00:00Z`).lte('start_time', `${dateStr}T23:59:59Z`);
            if ((count || 0) >= bookingType.max_bookings_per_day) {
                return NextResponse.json({ error: `Daily limit of ${bookingType.max_bookings_per_day} bookings reached.` }, { status: 429 });
            }
        }

        const isPaid = bookingType.price && bookingType.price > 0;

        // PAID BOOKING — create pending booking then redirect to payment_link
        if (isPaid) {
            if (!bookingType.payment_link) {
                return NextResponse.json(
                    { error: 'This booking type has no payment link configured. Please contact the host.' },
                    { status: 400 }
                );
            }

            const { data: pendingBooking, error: pendingError } = await supabase
                .from('bookings')
                .insert({
                    booking_type_id,
                    host_user_id: bookingType.user_id,
                    guest_name, guest_email, guest_notes,
                    start_time, end_time,
                    payment_status: 'pending',
                    status: 'pending_payment',
                })
                .select().single();

            if (pendingError) {
                return NextResponse.json({ error: pendingError.message }, { status: 500 });
            }

            // Notify both parties even for pending payment
            try {
                await sendEmails(supabase, bookingType, pendingBooking, guest_name, guest_email, guest_notes, start_time);
            } catch (e) { console.error('Email error (non-blocking):', e); }

            // Return paymentLink for client to redirect
            return NextResponse.json({
                confirmed: false,
                pending: true,
                paymentLink: bookingType.payment_link,
                bookingId: pendingBooking.id,
            });
        }

        // FREE BOOKING — confirm immediately
        const { data: booking, error: bookingError } = await supabase
            .from('bookings')
            .insert({
                booking_type_id, host_user_id: bookingType.user_id,
                guest_name, guest_email, guest_notes,
                start_time, end_time,
                payment_status: 'free', status: 'confirmed',
            })
            .select().single();

        if (bookingError) return NextResponse.json({ error: bookingError.message }, { status: 500 });

        try {
            const { data: oauthToken } = await supabase.from('oauth_tokens').select('*').eq('user_id', bookingType.user_id).single();
            if (oauthToken) {
                const { getCalendarClient } = await import('@/lib/google');
                const calendar = getCalendarClient(oauthToken.access_token);
                const event = await calendar.events.insert({
                    calendarId: 'primary',
                    requestBody: {
                        summary: `${bookingType.title} with ${guest_name}`,
                        description: `Guest: ${guest_name} (${guest_email})\n${guest_notes ? `Notes: ${guest_notes}` : ''}`,
                        start: { dateTime: start_time }, end: { dateTime: end_time },
                        attendees: [{ email: guest_email }],
                    },
                });
                if (event.data.id) await supabase.from('bookings').update({ calendar_event_id: event.data.id }).eq('id', booking.id);
            }
        } catch (calError) { console.error('Calendar error (non-blocking):', calError); }

        try {
            await sendEmails(supabase, bookingType, booking, guest_name, guest_email, guest_notes, start_time);
        } catch (e) { console.error('Email error (non-blocking):', e); }

        return NextResponse.json({ booking, confirmed: true });
    } catch (error) {
        console.error('Booking creation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

async function sendEmails(supabase: any, bookingType: any, booking: any, guestName: string, guestEmail: string, guestNotes: string, startTime: string) {
    const { sendBookingConfirmation, sendHostNotification } = await import('@/lib/email');
    const { data: hostUser } = await supabase.from('users').select('email, full_name, timezone').eq('id', bookingType.user_id).single();
    if (!hostUser) return;

    const formattedTime = new Date(startTime).toLocaleString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit', timeZone: hostUser.timezone || 'UTC',
    });
    const cancelLink = `${process.env.NEXT_PUBLIC_APP_URL}/api/bookings/${booking.id}/cancel`;

    await sendBookingConfirmation(guestEmail, {
        guestName, hostName: hostUser.full_name || 'Your Host',
        bookingTitle: bookingType.title, startTime: formattedTime,
        timezone: hostUser.timezone || 'UTC', cancelLink,
        participationMode: bookingType.participation_mode, meetingLink: bookingType.meeting_link,
    });
    await sendHostNotification(hostUser.email, {
        guestName, guestEmail, bookingTitle: bookingType.title,
        startTime: formattedTime, timezone: hostUser.timezone || 'UTC',
        notes: guestNotes, participationMode: bookingType.participation_mode,
        meetingLink: bookingType.meeting_link,
    });
}

export async function GET(request: NextRequest) {
    try {
        const supabase = createServerSupabaseClient();
        const authHeader = request.headers.get('authorization');
        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const filter = searchParams.get('filter') || 'upcoming';
        let query = supabase.from('bookings').select('*').eq('host_user_id', user.id);

        if (filter === 'upcoming') query = query.eq('status', 'confirmed').gte('start_time', new Date().toISOString()).order('start_time', { ascending: true });
        else if (filter === 'past') query = query.eq('status', 'confirmed').lt('start_time', new Date().toISOString()).order('start_time', { ascending: false });
        else query = query.order('start_time', { ascending: false });

        const { data, error } = await query;
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
