import { createServerSupabaseClient } from './supabase';

export async function createConversation(userId: string, opts: { title?: string; type?: string } = {}) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_id: userId, title: opts.title ?? 'Setup My Scheduling', type: opts.type ?? 'onboarding' })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getConversation(conversationId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from('conversations').select('*').eq('id', conversationId).single();
  if (error) throw error;
  return data;
}

export async function saveMessage(conversationId: string, role: 'user' | 'assistant' | 'system', content: string, metadata: any = {}) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, role, content, metadata })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMessages(conversationId: string, limit = 200) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data;
}
