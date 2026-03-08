import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { isAdmin } from '@/lib/admin';

export async function GET(request: NextRequest) {
    try {
        const supabase = createServerSupabaseClient();

        // This is a server component/route, we need to check auth
        const authHeader = request.headers.get('authorization');
        if (!authHeader) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is admin
        const { data: profile } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();

        if (profile?.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fetch Stats
        const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
        const { count: bookingCount } = await supabase.from('bookings').select('*', { count: 'exact', head: true });
        const { count: activeBookingTypes } = await supabase.from('booking_types').select('*', { count: 'exact', head: true }).eq('is_active', true);

        // Revenue (simplified for MVP)
        const { data: payments } = await supabase.from('bookings').select('price').eq('payment_status', 'paid');
        const theoreticalRevenue = payments?.reduce((acc, curr) => acc + (curr.price || 0), 0) || 0;

        return NextResponse.json({
            totalUsers: userCount || 0,
            totalBookings: bookingCount || 0,
            activeBookingTypes: activeBookingTypes || 0,
            revenue: theoreticalRevenue
        });

    } catch (error) {
        console.error('Admin stats error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
