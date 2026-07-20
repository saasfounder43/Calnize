import { NextRequest, NextResponse } from 'next/server';

import { getAuthenticatedUserId } from '@/lib/ai/auth';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getOrCreateOnboardingSession, getConversationHistory } from '@/lib/onboarding/conversation';

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServerSupabaseClient();
    const session = await getOrCreateOnboardingSession(supabase, userId);

    const messages = session.conversation_id
      ? await getConversationHistory(supabase, session.conversation_id)
      : [];

    return NextResponse.json({
      step: session.current_step ?? 'profession',
      completed: session.is_completed,
      messages: messages.map((m) => ({ role: m.role, content: m.content, created_at: m.created_at })),
    });
  } catch (error) {
    console.error('[api/onboarding/resume]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}