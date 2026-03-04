import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { addHours, isWithinInterval } from 'date-fns';

// POST /api/cron/send-reminders
// Triggered daily via Vercel cron or manually
export async function POST() {
    try {
        const supabase = createServerSupabaseClient();

        const now = new Date();
        const in24Hours = addHours(now, 24);
        const in25Hours = addHours(now, 25);

        // Find bookings starting in the next 24-25 hours
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select('*, booking_types(title), users!bookings_host_user_id_fkey(full_name, timezone)')
            .gte('start_time', in24Hours.toISOString())
            .lt('start_time', in25Hours.toISOString());

        if (error) {
            console.error('Error fetching upcoming bookings:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!bookings || bookings.length === 0) {
            return NextResponse.json({ message: 'No reminders to send', sent: 0 });
        }

        let sentCount = 0;

        for (const booking of bookings) {
            try {
                const { sendEmail, buildReminderEmail } = await import('@/lib/email');

                const emailHtml = buildReminderEmail({
                    guestName: booking.guest_name,
                    hostName: (booking as any).users?.full_name || 'Your Host',
                    bookingTitle: (booking as any).booking_types?.title || 'Meeting',
                    startTime: new Date(booking.start_time).toLocaleString(),
                    timezone: (booking as any).users?.timezone || 'UTC',
                });

                await sendEmail({
                    to: booking.guest_email,
                    subject: 'Reminder: Your meeting is tomorrow',
                    html: emailHtml,
                });

                sentCount++;
            } catch (err) {
                console.error(`Failed to send reminder for booking ${booking.id}:`, err);
            }
        }

        return NextResponse.json({
            message: `Sent ${sentCount} reminders`,
            sent: sentCount,
            total: bookings.length,
        });
    } catch (error) {
        console.error('Cron error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
