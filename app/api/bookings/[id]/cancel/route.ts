import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { sendCancellationEmail } from '@/lib/email';

// GET /api/bookings/[id]/cancel — Cancel a booking
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const supabase = createServerSupabaseClient();

        // 1. Fetch booking details before deleting
        const { data: booking, error: fetchError } = await supabase
            .from('bookings')
            .select(`
                *,
                booking_types (
                    title,
                    user_id,
                    slug
                ),
                users!bookings_host_user_id_fkey (
                    email,
                    full_name,
                    username
                )
            `)
            .eq('id', id)
            .single();

        if (fetchError || !booking) {
            return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
        }

        // 2. Mark booking as cancelled
        const { error: updateError } = await supabase
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('id', id);

        if (updateError) {
            return NextResponse.json({ error: updateError.message }, { status: 500 });
        }

        // 3. Send cancellation email
        const hostUser = booking.users;
        const bookingType = booking.booking_types;

        const formattedTime = new Date(booking.start_time).toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });

        const rescheduleLink = `${process.env.NEXT_PUBLIC_APP_URL}/booking/${hostUser.username}/${bookingType.slug}`;

        await sendCancellationEmail(booking.guest_email, {
            guestName: booking.guest_name,
            hostName: hostUser.full_name || 'Your Host',
            bookingTitle: bookingType.title,
            startTime: formattedTime,
            rescheduleLink
        });

        // 4. Redirect to a confirmation page
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/booking/cancelled`);
    } catch (error) {
        console.error('Cancellation error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
