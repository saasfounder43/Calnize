import { NextResponse } from 'next/server';
import { getAuthUrl } from '@/lib/google';

// GET /api/google/connect — Redirect to Google OAuth consent screen
export async function GET() {
    try {
        const url = getAuthUrl();
        return NextResponse.redirect(url);
    } catch (error) {
        console.error('Google connect error:', error);
        return NextResponse.json(
            { error: 'Failed to initialize Google OAuth' },
            { status: 500 }
        );
    }
}
