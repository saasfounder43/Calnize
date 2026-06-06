import { createServerSupabaseClient } from '@/lib/supabase';

import type { AiIntent, ParsedAiCommand } from '@/lib/ai/types';

export async function logCommandParse(
  userId: string,
  rawPrompt: string,
  parsed: ParsedAiCommand
): Promise<string | null> {
  const supabase = createServerSupabaseClient();
  const { data, error } = await supabase
    .from('ai_command_logs')
    .insert({
      user_id: userId,
      raw_prompt: rawPrompt,
      parsed_intent: parsed.intent,
      parsed_payload: parsed.payload,
      execution_status: parsed.status === 'success' ? 'parsed' : parsed.status,
      response_message: parsed.clarification_needed || parsed.summary || null,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[ai/logging] command log failed:', error.message);
    return null;
  }
  return data?.id ?? null;
}

export async function logActionExecution(
  userId: string,
  commandLogId: string | null,
  intent: AiIntent,
  payload: Record<string, unknown>,
  success: boolean,
  message: string,
  data?: Record<string, unknown>
): Promise<void> {
  const supabase = createServerSupabaseClient();

  await supabase.from('ai_action_history').insert({
    user_id: userId,
    command_log_id: commandLogId,
    action_type: intent,
    action_payload: payload,
    execution_result: { message, ...(data ? { data } : {}) },
    success,
  });

  if (commandLogId) {
    await supabase
      .from('ai_command_logs')
      .update({
        execution_status: success ? 'success' : 'failed',
        response_message: message,
      })
      .eq('id', commandLogId)
      .eq('user_id', userId);
  }
}
