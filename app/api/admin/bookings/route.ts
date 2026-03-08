import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// GET /api/admin/bookings - List all bookings
export async function GET(request: NextRequest) {
    try {
        const supabase = createServerSupabaseClient();
        const authHeader = request.headers.get('authorization');

        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const token = authHeader.replace('Bearer ', '');
        const { data: { user: currentUser } } = await supabase.auth.getUser(token);

        if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Admin check
        const { data: profile } = await supabase.from('users').select('role').eq('id', currentUser.id).single();
        if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        // Fetch all bookings with user and booking type info
        const { data: bookings, error } = await supabase
            .from('bookings')
            .select(`
                *,
                host:users!bookings_host_user_id_fkey(email, full_name),
                booking_type:booking_types(title)
            `)
            .order('start_time', { ascending: false });

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json(bookings);
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/admin/bookings/action - Cancel/Delete booking
export async function POST(request: NextRequest) {
    try {
        const supabase = createServerSupabaseClient();
        const authHeader = request.headers.get('authorization');

        if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const token = authHeader.replace('Bearer ', '');
        const { data: { user: currentUser } } = await supabase.auth.getUser(token);

        if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Admin check
        const { data: profile } = await supabase.from('users').select('role').eq('id', currentUser.id).single();
        if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const body = await request.json();
        const { bookingId, action } = body;

        if (!bookingId || !action) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });

        if (action === 'cancel') {
            const { error } = await supabase
                .from('bookings')
                .update({ status: 'cancelled' })
                .eq('id', bookingId);
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        } else if (action === 'delete') {
            const { error } = await supabase
                .from('bookings')
                .delete()
                .eq('id', bookingId);
            if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
