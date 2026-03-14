import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/google';

// GET /api/google/connect — Redirect to Google OAuth consent screen
export async function GET() {
    try {
        // Validate environment variables
        if (!process.env.GOOGLE_CLIENT_ID) {
            console.error('CRITICAL: GOOGLE_CLIENT_ID is missing from environment variables');
            return NextResponse.json(
                { error: 'System configuration error: Google Client ID missing' },
                { status: 500 }
            );
        }

        const cookieStore = await cookies();
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                },
            }
        );

        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
            console.error('Google connect error: No authenticated user found');
            return NextResponse.json(
                { error: 'You must be logged in to connect Google Calendar' },
                { status: 401 }
            );
        }

        console.log(`Initiating Google OAuth for user: ${user.id}`);
        const url = getAuthUrl(user.id);
        return NextResponse.redirect(url);
    } catch (error) {
        console.error('Google connect error:', error);
        return NextResponse.json(
            { error: 'Failed to initialize Google OAuth' },
            { status: 500 }
        );
    }
}
