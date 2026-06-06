import { NextRequest, NextResponse } from 'next/server';
import { getConversation, getMessages } from '@/lib/conversation';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id: convoId } = await params;

    const convo = await getConversation(convoId);
    if (!convo) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const messages = await getMessages(convoId);
    return NextResponse.json({ conversation: convo, messages });
  } catch (err) {
    console.error('[api/conversations/[id]]', err);
    return NextResponse.json({ error: 'Failed to fetch conversation' }, { status: 500 });
  }
}
