import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;
    const { id: bookingId } = await params;

    try {
        const supabase = createServerSupabaseClient();

        // Fetch the booking
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .maybeSingle();

        if (fetchError || !booking) {
            return NextResponse.redirect(`${appUrl}/booking/cancelled?error=not_found`);
        }

        if (booking.status === 'cancelled') {
            return NextResponse.redirect(`${appUrl}/booking/cancelled?error=already_cancelled`);
        }

        // Fetch booking type for title
        const { data: bookingType } = await supabase
            .from('booking_types')
            .select('title, user_id, participation_mode, meeting_link')
            .eq('id', booking.booking_type_id)
            .single();

        // Fetch host details
        const { data: hostUser } = await supabase
            .from('users')
            .select('email, full_name, timezone')
            .eq('id', bookingType?.user_id)
            .single();

        // Cancel the booking
        const { error: updateError } = await supabase
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('id', bookingId);

        if (updateError) {
            console.error('Cancel update error:', updateError);
            return NextResponse.redirect(`${appUrl}/booking/cancelled?error=cancel_failed`);
        }

        // Cancel Google Calendar event if exists
        if (booking.calendar_event_id && bookingType?.user_id) {
            try {
                const { data: oauthToken } = await supabase
                    .from('oauth_tokens')
                    .select('*')
                    .eq('user_id', bookingType.user_id)
                    .single();

                if (oauthToken) {
                    const { getCalendarClient } = await import('@/lib/google');
                    const calendar = getCalendarClient(oauthToken.access_token);
                    await calendar.events.delete({
                        calendarId: 'primary',
                        eventId: booking.calendar_event_id,
                    });
                }
            } catch (calError) {
                console.error('Calendar event deletion error (non-blocking):', calError);
            }
        }

        // Send cancellation emails to both guest and host
        try {
            const { sendCancellationEmail } = await import('@/lib/email');

            const formattedTime = new Date(booking.start_time).toLocaleString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long',
                day: 'numeric', hour: '2-digit', minute: '2-digit',
                timeZone: hostUser?.timezone || 'UTC',
            });

            const rescheduleLink = `${appUrl}`;

            // Email to guest
            await sendCancellationEmail(booking.guest_email, {
                guestName: booking.guest_name,
                hostName: hostUser?.full_name || 'Your Host',
                bookingTitle: bookingType?.title || 'Meeting',
                startTime: formattedTime,
                rescheduleLink,
            });

            // Email to host
            if (hostUser?.email) {
                await sendCancellationEmail(hostUser.email, {
                    guestName: booking.guest_name,
                    hostName: hostUser?.full_name || 'Host',
                    bookingTitle: bookingType?.title || 'Meeting',
                    startTime: formattedTime,
                    rescheduleLink: `${appUrl}/dashboard/bookings`,
                });
            }
        } catch (emailError) {
            console.error('Cancellation email error (non-blocking):', emailError);
        }

        return NextResponse.redirect(`${appUrl}/booking/cancelled?name=${encodeURIComponent(booking.guest_name)}`);
    } catch (error) {
        console.error('Cancel booking error:', error);
        return NextResponse.redirect(`${appUrl}/booking/cancelled?error=server_error`);
    }
}
