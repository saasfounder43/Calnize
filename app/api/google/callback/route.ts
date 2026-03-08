import { NextRequest, NextResponse } from 'next/server';
import { getOAuth2Client } from '@/lib/google';
import { createServerSupabaseClient } from '@/lib/supabase';

// GET /api/google/callback — Handle Google OAuth callback
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=no_code`
            );
        }

        const oauth2Client = getOAuth2Client();
        const { tokens } = await oauth2Client.getToken(code);
        const state = searchParams.get('state');

        if (!tokens.access_token || !tokens.refresh_token) {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=missing_tokens`
            );
        }

        // Use the state parameter which we passed as userId
        let userId = state;

        if (!userId) {
            // Fallback for security (if state got lost but user is logged in)
            const supabaseAuth = createServerSupabaseClient();
            const cookieHeader = request.cookies.get('sb-access-token')?.value;
            if (cookieHeader) {
                const { data: { user } } = await supabaseAuth.auth.getUser(cookieHeader);
                userId = user?.id || null;
            }
        }

        if (!userId) {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=not_authenticated`
            );
        }

        // Upsert OAuth tokens
        const supabase = createServerSupabaseClient();
        await supabase.from('oauth_tokens').upsert({
            user_id: userId,
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expiry_date: tokens.expiry_date || Date.now() + 3600000,
        });

        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?success=google_connected`
        );
    } catch (error) {
        console.error('Google callback error:', error);
        return NextResponse.redirect(
            `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=callback_failed`
        );
    }
}
