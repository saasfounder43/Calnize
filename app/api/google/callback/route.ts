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

        if (!tokens.access_token || !tokens.refresh_token) {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=missing_tokens`
            );
        }

        // Get user from cookie/session — for now we'll use authorization header or cookie
        const supabase = createServerSupabaseClient();

        // We need the user ID. In a real flow, we'd use the session cookie.
        // For now, we store with a temporary approach using the state parameter.
        // This is simplified — in production, pass user_id via OAuth state parameter.

        const cookieHeader = request.cookies.get('sb-access-token')?.value;
        let userId: string | null = null;

        if (cookieHeader) {
            const { data: { user } } = await supabase.auth.getUser(cookieHeader);
            userId = user?.id || null;
        }

        if (!userId) {
            // Fallback: try to get from any available auth cookie
            const allCookies = request.cookies.getAll();
            for (const cookie of allCookies) {
                if (cookie.name.includes('auth-token') || cookie.name.includes('sb-')) {
                    try {
                        const { data: { user } } = await supabase.auth.getUser(cookie.value);
                        if (user) {
                            userId = user.id;
                            break;
                        }
                    } catch {
                        continue;
                    }
                }
            }
        }

        if (!userId) {
            return NextResponse.redirect(
                `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/integrations?error=not_authenticated`
            );
        }

        // Upsert OAuth tokens
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
