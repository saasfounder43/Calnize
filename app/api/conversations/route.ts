import { NextRequest, NextResponse } from 'next/server';
import { createConversation } from '@/lib/conversation';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const title = typeof body?.title === 'string' ? body.title : 'Setup My Scheduling';
    const type = typeof body?.type === 'string' ? body.type : 'onboarding';

    const convo = await createConversation(user.id, { title, type });
    return NextResponse.json({ conversation: convo }, { status: 201 });
  } catch (err) {
    console.error('[api/conversations] Error creating conversation', err);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}
