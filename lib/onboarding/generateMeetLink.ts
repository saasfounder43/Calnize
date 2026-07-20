import type { SupabaseClient } from '@supabase/supabase-js';

import { getCalendarClient } from '@/lib/google';

/**
 * Creates a single placeholder Google Calendar event with auto-generated
 * conferencing, purely to obtain a reusable Meet link for the user's booking
 * page. Returns null (never throws) if anything goes wrong — a missing Meet
 * link just means the user is asked to paste one manually later, so this must
 * never block onboarding from completing.
 */
export async function generateGoogleMeetLink(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  try {
    const { data: tokenRow, error } = await supabase
      .from('oauth_tokens')
      .select('access_token')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !tokenRow?.access_token) return null;

    const calendar = getCalendarClient(tokenRow.access_token);

    const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const end = new Date(start.getTime() + 30 * 60 * 1000);

    const res = await calendar.events.insert({
      calendarId: 'primary',
      conferenceDataVersion: 1,
      requestBody: {
        summary: 'Calnize booking link (placeholder)',
        description: 'Auto-created by Calnize to generate a reusable Google Meet link for your booking page.',
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
        conferenceData: {
          createRequest: {
            requestId: `calnize-onboarding-${userId}-${Date.now()}`,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
      },
    });

    const entryPoints = res.data.conferenceData?.entryPoints ?? [];
    const videoEntry = entryPoints.find(
      (e: { entryPointType?: string | null; uri?: string | null }) => e.entryPointType === 'video'
    );
    return videoEntry?.uri ?? null;
  } catch (err) {
    console.error('[generateGoogleMeetLink]', err);
    return null;
  }
}