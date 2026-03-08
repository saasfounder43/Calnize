import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const supabase = createServerSupabaseClient();

        // This is a debug route. In production, this should be disabled or protected.
        // We check for a header or just allow it if it's localhost.
        const origin = request.headers.get('origin') || '';
        if (!origin.includes('localhost')) {
            return NextResponse.json({ error: 'This route is only available in development.' }, { status: 403 });
        }

        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required.' }, { status: 400 });
        }

        const { error } = await supabase
            .from('users')
            .update({ plan: 'pro' })
            .eq('id', userId);

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true, message: 'User upgraded to Pro' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
