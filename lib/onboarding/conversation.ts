import type { SupabaseClient } from '@supabase/supabase-js';

import type { OnboardingAnswers, OnboardingStepKey } from '@/lib/onboarding/types';
import { ONBOARDING_STEP_ORDER } from '@/lib/onboarding/types';

export interface OnboardingSessionRow {
  id: string;
  user_id: string;
  conversation_id: string | null;
  current_step: string | null;
  booking_type_id: string | null;
  is_completed: boolean;
}

export interface MessageRow {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

/** Finds the user's most recent incomplete onboarding session, or creates a fresh one. */
export async function getOrCreateOnboardingSession(
  supabase: SupabaseClient,
  userId: string
): Promise<OnboardingSessionRow> {
  const { data: existing, error: findError } = await supabase
    .from('onboarding_sessions')
    .select('id, user_id, conversation_id, current_step, booking_type_id, is_completed')
    .eq('user_id', userId)
    .eq('is_completed', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (findError) throw new Error(`Failed to look up onboarding session: ${findError.message}`);
  if (existing) return existing as OnboardingSessionRow;

  const { data: conversation, error: convError } = await supabase
    .from('conversations')
    .insert({ user_id: userId, type: 'onboarding', title: 'Onboarding' })
    .select('id')
    .single();
  if (convError) throw new Error(`Failed to create conversation: ${convError.message}`);

  const { data: session, error: sessionError } = await supabase
    .from('onboarding_sessions')
    .insert({
      user_id: userId,
      conversation_id: conversation.id,
      current_step: ONBOARDING_STEP_ORDER[0],
      is_completed: false,
    })
    .select('id, user_id, conversation_id, current_step, booking_type_id, is_completed')
    .single();
  if (sessionError) throw new Error(`Failed to create onboarding session: ${sessionError.message}`);

  return session as OnboardingSessionRow;
}

export async function appendMessage(
  supabase: SupabaseClient,
  conversationId: string,
  role: 'user' | 'assistant',
  content: string
): Promise<void> {
  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    role,
    content,
  });
  if (error) throw new Error(`Failed to save message: ${error.message}`);
}

export async function getConversationHistory(
  supabase: SupabaseClient,
  conversationId: string
): Promise<MessageRow[]> {
  const { data, error } = await supabase
    .from('messages')
    .select('id, role, content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(`Failed to load conversation history: ${error.message}`);
  return (data ?? []) as MessageRow[];
}

/** Saves (or overwrites) the validated answer for a step. */
export async function saveStepData(
  supabase: SupabaseClient,
  sessionId: string,
  step: OnboardingStepKey,
  data: Record<string, unknown>
): Promise<void> {
  const { error } = await supabase.from('onboarding_step_data').insert({
    onboarding_session_id: sessionId,
    step,
    data,
  });
  if (error) throw new Error(`Failed to save step data: ${error.message}`);
}

/** Loads all previously-saved step answers for a session, keyed by step (latest wins per step). */
export async function loadAnswers(
  supabase: SupabaseClient,
  sessionId: string
): Promise<OnboardingAnswers> {
  const { data, error } = await supabase
    .from('onboarding_step_data')
    .select('step, data, created_at')
    .eq('onboarding_session_id', sessionId)
    .order('created_at', { ascending: true });
  if (error) throw new Error(`Failed to load step data: ${error.message}`);

  const answers: Record<string, unknown> = {};
  for (const row of data ?? []) {
    answers[row.step as string] = row.data;
  }
  return answers as OnboardingAnswers;
}

export async function advanceStep(
  supabase: SupabaseClient,
  sessionId: string,
  nextStep: OnboardingStepKey
): Promise<void> {
  const { error } = await supabase
    .from('onboarding_sessions')
    .update({ current_step: nextStep, updated_at: new Date().toISOString() })
    .eq('id', sessionId);
  if (error) throw new Error(`Failed to advance onboarding step: ${error.message}`);
}

export async function markCompleted(
  supabase: SupabaseClient,
  sessionId: string,
  bookingTypeId: string
): Promise<void> {
  const { error } = await supabase
    .from('onboarding_sessions')
    .update({
      current_step: 'done',
      booking_type_id: bookingTypeId,
      is_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId);
  if (error) throw new Error(`Failed to mark onboarding complete: ${error.message}`);
}

export function nextStepAfter(step: OnboardingStepKey): OnboardingStepKey {
  const idx = ONBOARDING_STEP_ORDER.indexOf(step);
  if (idx === -1 || idx === ONBOARDING_STEP_ORDER.length - 1) return 'done';
  return ONBOARDING_STEP_ORDER[idx + 1];
}