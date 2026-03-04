import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { generateTimeSlots } from '@/lib/slotGenerator';

// GET /api/slots?username=john&slug=consultation&date=2026-03-10
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');
        const date = searchParams.get('date');
        const userId = searchParams.get('userId');

        if (!slug || !date || !userId) {
            return NextResponse.json(
                { error: 'Missing required parameters: userId, slug, date' },
                { status: 400 }
            );
        }

        const supabase = createServerSupabaseClient();

        // 1. Fetch booking type
        const { data: bookingType, error: btError } = await supabase
            .from('booking_types')
            .select('*')
            .eq('user_id', userId)
            .eq('slug', slug)
            .eq('is_active', true)
            .single();

        if (btError || !bookingType) {
            return NextResponse.json(
                { error: 'Booking type not found' },
                { status: 404 }
            );
        }

        // 2. Fetch host user profile (for timezone)
        const { data: hostUser } = await supabase
            .from('users')
            .select('timezone')
            .eq('id', userId)
            .single();

        const hostTimezone = hostUser?.timezone || 'UTC';

        // 3. Fetch availability rules for host
        const { data: availabilityRules } = await supabase
            .from('availability_rules')
            .select('*')
            .eq('user_id', userId);

        if (!availabilityRules || availabilityRules.length === 0) {
            return NextResponse.json({ slots: [], message: 'No availability set' });
        }

        // 4. Fetch existing bookings for the date range
        const dateStart = new Date(`${date}T00:00:00`).toISOString();
        const dateEnd = new Date(`${date}T23:59:59`).toISOString();

        const { data: existingBookings } = await supabase
            .from('bookings')
            .select('start_time, end_time')
            .eq('host_user_id', userId)
            .gte('start_time', dateStart)
            .lte('end_time', dateEnd);

        // 5. Fetch Google Calendar busy slots (if connected)
        let googleBusySlots: { start: string; end: string }[] = [];

        const { data: oauthToken } = await supabase
            .from('oauth_tokens')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (oauthToken) {
            try {
                // Import dynamically to avoid issues when Google APIs aren't configured
                const { getCalendarClient } = await import('@/lib/google');
                const calendar = getCalendarClient(oauthToken.access_token);

                const response = await calendar.freebusy.query({
                    requestBody: {
                        timeMin: dateStart,
                        timeMax: dateEnd,
                        items: [{ id: 'primary' }],
                    },
                });

                const busy = response.data.calendars?.primary?.busy || [];
                googleBusySlots = busy.map((b) => ({
                    start: b.start || '',
                    end: b.end || '',
                }));
            } catch (err) {
                console.error('Google Calendar error (continuing without busy slots):', err);
            }
        }

        // 6. Generate slots
        const slots = generateTimeSlots({
            date,
            durationMinutes: bookingType.duration_minutes,
            bufferMinutes: bookingType.buffer_time_minutes || 0,
            availabilityRules,
            existingBookings: (existingBookings || []).map((b) => ({
                start: b.start_time,
                end: b.end_time,
            })),
            googleBusySlots,
            hostTimezone,
        });

        return NextResponse.json({
            slots,
            bookingType: {
                id: bookingType.id,
                title: bookingType.title,
                description: bookingType.description,
                duration_minutes: bookingType.duration_minutes,
                price: bookingType.price,
                currency: bookingType.currency,
            },
        });
    } catch (error) {
        console.error('Slots API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
