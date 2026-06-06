import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { generateTimeSlots } from '@/lib/slotGenerator';
import { rateLimit, getIP, LIMITS } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
    // Rate limit: 60 slot checks/min per IP
    const ip = getIP(request);
    const rl = rateLimit(ip, 'slots', LIMITS.slots);
    if (!rl.allowed) {
        return NextResponse.json(
            { error: 'Too many requests. Please slow down.' },
            { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');
        const date = searchParams.get('date');
        const userId = searchParams.get('userId');

        if (!slug || !date || !userId) {
            return NextResponse.json({ error: 'Missing required parameters: userId, slug, date' }, { status: 400 });
        }

        const supabase = createServerSupabaseClient();

        const { data: bookingType, error: btError } = await supabase
            .from('booking_types').select('*').eq('user_id', userId).eq('slug', slug).eq('is_active', true).single();

        if (btError || !bookingType) {
            return NextResponse.json({ error: 'Booking type not found' }, { status: 404 });
        }

        const { data: hostUser } = await supabase.from('users').select('timezone').eq('id', userId).single();
        const hostTimezone = hostUser?.timezone || 'UTC';

        const { data: availabilityRules } = await supabase.from('availability_rules').select('*').eq('user_id', userId);

        if (!availabilityRules || availabilityRules.length === 0) {
            return NextResponse.json({ slots: [], message: 'No availability set' });
        }

        const dateStart = new Date(`${date}T00:00:00Z`);
        dateStart.setUTCHours(dateStart.getUTCHours() - 6);
        const dateEnd = new Date(`${date}T23:59:59Z`);
        dateEnd.setUTCHours(dateEnd.getUTCHours() + 6);

        const { data: existingBookings } = await supabase
            .from('bookings').select('id, start_time, end_time, status')
            .eq('host_user_id', userId).eq('status', 'confirmed')
            .gte('start_time', dateStart.toISOString()).lte('end_time', dateEnd.toISOString());

        if (bookingType.max_bookings_per_day) {
            const todayBookings = (existingBookings || []).filter(b =>
                b.status === 'confirmed' && new Date(b.start_time).toISOString().split('T')[0] === date
            );
            if (todayBookings.length >= bookingType.max_bookings_per_day) {
                return NextResponse.json({ slots: [], message: `Maximum of ${bookingType.max_bookings_per_day} bookings reached for this day.` });
            }
        }

        let googleBusySlots: { start: string; end: string }[] = [];
        const { data: oauthToken } = await supabase.from('oauth_tokens').select('*').eq('user_id', userId).single();

        if (oauthToken) {
            try {
                const { getCalendarClient } = await import('@/lib/google');
                const calendar = getCalendarClient(oauthToken.access_token);
                const response = await calendar.freebusy.query({
                    requestBody: { timeMin: dateStart.toISOString(), timeMax: dateEnd.toISOString(), items: [{ id: 'primary' }] },
                });
                const busy = response.data.calendars?.primary?.busy || [];
                googleBusySlots = busy.map((b) => ({ start: b.start || '', end: b.end || '' }));
            } catch (err) {
                console.error('Google Calendar error (continuing without busy slots):', err);
            }
        }

        const slots = generateTimeSlots({
            date,
            durationMinutes: bookingType.duration_minutes,
            bufferMinutes: bookingType.buffer_minutes || 0,
            minimumNoticeMinutes: bookingType.minimum_notice_minutes || 0,
            availabilityRules,
            existingBookings: (existingBookings || []).map((b) => ({ start: b.start_time, end: b.end_time })),
            googleBusySlots,
            hostTimezone,
        });

        return NextResponse.json({
            slots,
            bookingType: { id: bookingType.id, title: bookingType.title, description: bookingType.description, duration_minutes: bookingType.duration_minutes, price: bookingType.price, currency: bookingType.currency },
        });
    } catch (error) {
        console.error('Slots API error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
