import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/google';
import { rateLimit, getIP, LIMITS } from '@/lib/rateLimit';

export async function GET(request: Request) {
    // Rate limit: 5 OAuth attempts/min per IP
    const ip = getIP(request);
    const rl = rateLimit(ip, 'googleConnect', LIMITS.googleConnect);
    if (!rl.allowed) {
        return NextResponse.json(
            { error: 'Too many requests. Please wait before trying again.' },
            { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
        );
    }

    try {
        if (!process.env.GOOGLE_CLIENT_ID) {
            console.error('CRITICAL: GOOGLE_CLIENT_ID is missing');
            return NextResponse.json({ error: 'System configuration error: Google Client ID missing' }, { status: 500 });
        }

        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            { cookies: { getAll() { return cookieStore.getAll(); } } }
        );

        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'You must be logged in to connect Google Calendar' }, { status: 401 });
        }

        const url = getAuthUrl(user.id);
        return NextResponse.redirect(url);
    } catch (error) {
        console.error('Google connect error:', error);
        return NextResponse.json({ error: 'Failed to initialize Google OAuth' }, { status: 500 });
    }
}
