import { createServerSupabaseClient } from '@/lib/supabase';

export const STEPS = [
  'STEP_1_BOOKING_TYPE',
  'STEP_2_PRICING',
  'STEP_3_DURATION',
  'STEP_4_AVAILABILITY',
  'STEP_5_CALENDAR',
  'STEP_6_COMPLETE',
];

export async function getSessionForUser(userId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from('onboarding_sessions').select('*').eq('user_id', userId).limit(1).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createSessionForUser(userId: string, conversationId?: string) {
  const supabase = await createServerSupabaseClient();
  const payload: any = { user_id: userId, current_step: STEPS[0], is_completed: false };
  if (conversationId) payload.conversation_id = conversationId;
  const { data, error } = await supabase.from('onboarding_sessions').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function saveStepData(sessionId: string, step: string, data: any) {
  const supabase = await createServerSupabaseClient();
  const { data: row, error } = await supabase.from('onboarding_step_data').insert({ onboarding_session_id: sessionId, step, data }).select().single();
  if (error) throw error;
  return row;
}

export async function getStepData(sessionId: string, step: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('onboarding_step_data')
    .select('data')
    .eq('onboarding_session_id', sessionId)
    .eq('step', step)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data?.data ?? null;
}

export async function getAllStepData(sessionId: string) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('onboarding_step_data')
    .select('step, data')
    .eq('onboarding_session_id', sessionId);
  if (error) throw error;
  return data || [];
}

export async function associateConversationWithSession(sessionId: string, conversationId: string) {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from('onboarding_sessions').update({ conversation_id: conversationId }).eq('id', sessionId);
  if (error) throw error;
  return true;
}

export async function getOrCreateSessionForUser(userId: string, conversationId?: string) {
  let session = await getSessionForUser(userId);
  if (session) {
    if (!session.conversation_id && conversationId) {
      await associateConversationWithSession(session.id, conversationId);
      session.conversation_id = conversationId;
    }
    return session;
  }

  return createSessionForUser(userId, conversationId);
}

export async function moveToNextStep(sessionId: string) {
  const supabase = await createServerSupabaseClient();
  const { data: session, error: sErr } = await supabase.from('onboarding_sessions').select('*').eq('id', sessionId).single();
  if (sErr) throw sErr;
  const idx = STEPS.indexOf(session.current_step || '');
  const next = idx >= 0 && idx < STEPS.length - 1 ? STEPS[idx + 1] : STEPS[STEPS.length - 1];
  const isCompleted = next === 'STEP_6_COMPLETE';
  const { error } = await supabase.from('onboarding_sessions').update({ current_step: next, is_completed: isCompleted }).eq('id', sessionId);
  if (error) throw error;
  return { nextStep: next, isCompleted };
}

export async function completeOnboarding(sessionId: string, bookingTypeId?: string) {
  const supabase = await createServerSupabaseClient();
  const updates: any = { current_step: 'STEP_6_COMPLETE', is_completed: true };
  if (bookingTypeId) updates.booking_type_id = bookingTypeId;
  const { error } = await supabase.from('onboarding_sessions').update(updates).eq('id', sessionId);
  if (error) throw error;
  return true;
}

export function validateAnswerForStep(step: string, answer: any) {
  switch (step) {
    case 'STEP_1_BOOKING_TYPE':
      return typeof answer === 'string' && answer.trim().length > 0;
    case 'STEP_2_PRICING':
      if (typeof answer === 'string') {
        return /free|no|not paid/i.test(answer) || /\d/.test(answer);
      }
      if (typeof answer === 'object' && typeof answer.is_paid === 'boolean') {
        if (!answer.is_paid) return true;
        return typeof answer.price === 'number' && answer.price > 0;
      }
      return false;
    case 'STEP_3_DURATION':
      if (typeof answer === 'string' && /\d+/.test(answer)) {
        return [15,30,45,60,90,120].includes(Number(answer.match(/\d+/)?.[0]));
      }
      return [15,30,45,60,90,120].includes(Number(answer));
    case 'STEP_4_AVAILABILITY':
      if (Array.isArray(answer)) return answer.length > 0;
      return typeof answer === 'string' && answer.trim().length > 0;
    case 'STEP_5_CALENDAR':
      return typeof answer === 'string' && /^(connect|skip)$/i.test(answer.trim());
    default:
      return true;
  }
}
