import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// POST /api/bookings/[id]/cancel
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const supabase = createServerSupabaseClient();

        // 1. Find the booking
        const { data: booking, error: findError } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', id)
            .single();

        if (findError || !booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // 2. Delete Google Calendar event if exists
        if (booking.calendar_event_id) {
            try {
                const { data: oauthToken } = await supabase
                    .from('oauth_tokens')
                    .select('*')
                    .eq('user_id', booking.host_user_id)
                    .single();

                if (oauthToken) {
                    const { getCalendarClient } = await import('@/lib/google');
                    const calendar = getCalendarClient(oauthToken.access_token);
                    await calendar.events.delete({
                        calendarId: 'primary',
                        eventId: booking.calendar_event_id,
                    });
                }
            } catch (err) {
                console.error('Error deleting calendar event:', err);
            }
        }

        // 3. Send cancellation email
        try {
            const { sendEmail } = await import('@/lib/email');
            await sendEmail({
                to: booking.guest_email,
                subject: 'Booking Cancelled',
                html: `
          <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 32px;">
            <h2 style="color: #1a1a2e;">Booking Cancelled ❌</h2>
            <p>Hi ${booking.guest_name},</p>
            <p>Your booking on ${new Date(booking.start_time).toLocaleString()} has been cancelled.</p>
            <p>If you wish to rebook, please visit the booking page again.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #999; font-size: 12px;">Sent via Calnize</p>
          </div>
        `,
            });
        } catch (err) {
            console.error('Error sending cancellation email:', err);
        }

        // 4. Delete the booking
        const { error: deleteError } = await supabase
            .from('bookings')
            .delete()
            .eq('id', id);

        if (deleteError) {
            return NextResponse.json({ error: deleteError.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'Booking cancelled' });
    } catch (error) {
        console.error('Cancel booking error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
