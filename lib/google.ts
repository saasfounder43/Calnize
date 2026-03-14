import { google } from 'googleapis';

export function getOAuth2Client() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    // Fallback to dynamic redirect URI if not explicitly set
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || 
        (process.env.NEXT_PUBLIC_APP_URL 
            ? `${process.env.NEXT_PUBLIC_APP_URL}/api/google/callback` 
            : 'http://localhost:3000/api/google/callback');

    if (!clientId || !clientSecret) {
        console.error('CRITICAL: Google OAuth credentials missing from environment (GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET)');
        throw new Error('Google OAuth configuration missing');
    }

    return new google.auth.OAuth2(
        clientId,
        clientSecret,
        redirectUri
    );
}

export function getCalendarClient(accessToken: string) {
    const auth = getOAuth2Client();
    auth.setCredentials({ access_token: accessToken });
    return google.calendar({ version: 'v3', auth });
}

export function getAuthUrl(state?: string) {
    const oauth2Client = getOAuth2Client();
    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
            'https://www.googleapis.com/auth/calendar.readonly',
            'https://www.googleapis.com/auth/calendar.events',
        ],
        prompt: 'consent',
        state: state
    });
}
