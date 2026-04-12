import { NextRequest, NextResponse } from 'next/server';
import { getOAuth2Client } from '@/lib/google';
import { createServerSupabaseClient } from '@/lib/supabase';
import { rateLimit, getIP, LIMITS } from '@/lib/rateLimit';

export async function GET(request: NextRequest) {
    // Rate limit: 10 callbacks/min per IP
    const ip = getIP(request);
    const rl = rateLimit(ip, 'googleCallback', LIMITS.googleCallback);
    if (!rl.allowed) {
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=rate_limited`
        );
    }

    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=no_code`);
        }

        const oauth2Client = getOAuth2Client();
        const { tokens } = await oauth2Client.getToken(code);
        let stateObj: { userId?: string, returnUrl?: string } = {};
        
        if (!tokens.access_token || !tokens.refresh_token) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=missing_tokens`);
        }
        
        const stateRaw = searchParams.get('state');
        if (stateRaw) {
            try {
                const decoded = Buffer.from(stateRaw, 'base64').toString('utf8');
                stateObj = JSON.parse(decoded);
            } catch (e) {
                stateObj = { userId: stateRaw }; // fallback
            }
        }
        
        let userId = stateObj.userId;

        if (!userId) {
            const supabaseAuth = createServerSupabaseClient();
            const cookieHeader = request.cookies.get('sb-access-token')?.value;
            if (cookieHeader) {
                const { data: { user } } = await supabaseAuth.auth.getUser(cookieHeader);
                userId = user?.id || null;
            }
        }

        if (!userId) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=not_authenticated`);
        }

        const supabase = createServerSupabaseClient();
        await supabase.from('oauth_tokens').upsert({
            user_id: userId,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expiry_date: tokens.expiry_date || Date.now() + 3600000,
        });

        // Update calendar_connected flag on users table
        await supabase.from('users').update({ calendar_connected: true }).eq('id', userId);

        const redirectPath = stateObj.returnUrl || '/dashboard/integrations?success=google_connected';
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}${redirectPath}`);
    } catch (error) {
        console.error('Google callback error:', error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=callback_failed`);
    }
}
