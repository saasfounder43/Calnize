import { NextRequest, NextResponse } from 'next/server';

import { getAuthenticatedUserId } from '@/lib/ai/auth';
import { createServerSupabaseClient } from '@/lib/supabase';
import { createBookingType } from '@/lib/onboarding/createBookingType';
import { setupAvailability } from '@/lib/onboarding/setupAvailability';
import { parseOnboardingStep } from '@/lib/ai/parseOnboardingStep';
import { validateStepAnswer } from '@/lib/onboarding/validateStepAnswer';
import { generateGoogleMeetLink } from '@/lib/onboarding/generateMeetLink';
import {
  getOrCreateOnboardingSession,
  appendMessage,
  saveStepData,
  loadAnswers,
  advanceStep,
  markCompleted,
  nextStepAfter,
} from '@/lib/onboarding/conversation';
import {
  professionBucketToUserType,
  type OnboardingStepKey,
  type OnboardingAnswers,
  type PricingStepFields,
  type MeetingFormatStepFields,
  type AvailabilityStepFields,
} from '@/lib/onboarding/types';

function assistantPromptFor(step: OnboardingStepKey): string {
  switch (step) {
    case 'profession':
      return "Welcome! Let's get you set up in a couple minutes. First — what do you do? (e.g. consultant, coach, freelancer, designer, doctor, sales)";
    case 'pricing':
      return 'Do you charge for your meetings? If so, how much, and — if you have one handy — a link where you\'d like to receive payment.';
    case 'meeting_format':
      return 'How do you meet with people — video call, phone, or in person?';
    case 'availability':
      return 'What are your usual working hours? (e.g. "weekdays 9 to 5")';
    case 'theme':
      return 'Want to pick a color theme for your booking page? Totally optional — just say "skip" if you\'d rather use the default.';
    case 'calendar':
      return 'Last step — connect your Google Calendar so clients only see times you\'re actually free.';
    default:
      return 'All set!';
  }
}

/** Looks up the free-plan-gate requirement the same way the existing form-based step does. */
function planRequiresUpgrade(planType: string | null | undefined): boolean {
  const isPro = planType === 'pro' || planType === 'early' || planType === 'paid';
  return !isPro;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const message = typeof body?.message === 'string' ? body.message : '';
    const action = typeof body?.action === 'string' ? body.action : null;

    if (!message.trim() && !action) {
      return NextResponse.json({ error: 'Expected a non-empty "message" or an "action" field.' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();
    const session = await getOrCreateOnboardingSession(supabase, userId);
    const step = (session.current_step as OnboardingStepKey) || 'profession';

    if (message.trim() && session.conversation_id) {
      await appendMessage(supabase, session.conversation_id, 'user', message);
    }

    // Brand-new session — just send the first step's prompt, no parsing needed.
    if (action === 'start') {
      const firstPrompt = assistantPromptFor(step);
      if (session.conversation_id) await appendMessage(supabase, session.conversation_id, 'assistant', firstPrompt);
      return NextResponse.json({
        step,
        assistant_message: firstPrompt,
        awaiting_action: step === 'calendar',
        completed: false,
      });
    }

    // Handle returning from a successful plan upgrade: the pricing answer
    // was already saved before the upgrade gate triggered, so just advance
    // past it rather than re-asking the same question.
    if (step === 'pricing' && action === 'plan_upgraded') {
      const next = nextStepAfter('pricing');
      await advanceStep(supabase, session.id, next);
      const nextPrompt = assistantPromptFor(next);
      if (session.conversation_id) await appendMessage(supabase, session.conversation_id, 'assistant', nextPrompt);
      return NextResponse.json({
        step: next,
        assistant_message: nextPrompt,
        awaiting_action: next === 'calendar',
        completed: false,
      });
    }

    // Calendar step is an action (OAuth redirect), not free text.
    if (step === 'calendar') {
      if (action === 'calendar_connected' || action === 'skip_calendar') {
        const finished = await finishOnboarding(supabase, userId, session.id, {
          calendarConnected: action === 'calendar_connected',
        });
        if (session.conversation_id) {
          await appendMessage(supabase, session.conversation_id, 'assistant', finished.message);
        }
        return NextResponse.json({
          step: 'done',
          assistant_message: finished.message,
          awaiting_action: false,
          completed: true,
          booking_type_slug: finished.bookingTypeSlug,
        });
      }
      return NextResponse.json({
        step,
        assistant_message: assistantPromptFor(step),
        awaiting_action: true,
        completed: false,
      });
    }

    if (step === 'done') {
      return NextResponse.json({
        step,
        assistant_message: assistantPromptFor(step),
        awaiting_action: false,
        completed: true,
      });
    }

    const parsed = await parseOnboardingStep(step, message);

    if (parsed.status !== 'success') {
      const clarification = parsed.clarification_needed || 'Could you rephrase that?';
      if (session.conversation_id) await appendMessage(supabase, session.conversation_id, 'assistant', clarification);
      return NextResponse.json({ step, assistant_message: clarification, awaiting_action: false, completed: false });
    }

    const validation = validateStepAnswer(step, parsed.fields);
    if (!validation.valid) {
      const clarification = validation.error || 'Could you clarify that?';
      if (session.conversation_id) await appendMessage(supabase, session.conversation_id, 'assistant', clarification);
      return NextResponse.json({ step, assistant_message: clarification, awaiting_action: false, completed: false });
    }

    await saveStepData(supabase, session.id, step, validation.cleaned as Record<string, unknown>);

    // Pricing step: if the user wants to charge and is still on the free plan,
    // stop here and tell the client to send them through the same upgrade
    // checkout the existing form-based flow already uses.
    if (step === 'pricing') {
      const pricing = validation.cleaned as PricingStepFields;
      if (pricing.charges) {
        const { data: userRow } = await supabase
          .from('users')
          .select('plan_type')
          .eq('id', userId)
          .maybeSingle();

        if (planRequiresUpgrade(userRow?.plan_type)) {
          const upgradeMessage =
            'Paid meetings need one of Calnize\'s paid plans — Lifetime Access ($21 one-time) or Monthly ($9/month). Which would you like?';
          if (session.conversation_id) await appendMessage(supabase, session.conversation_id, 'assistant', upgradeMessage);
          return NextResponse.json({
            step,
            assistant_message: upgradeMessage,
            awaiting_action: true,
            requires_upgrade: true,
            completed: false,
          });
        }
      }
    }

    const next = nextStepAfter(step);
    await advanceStep(supabase, session.id, next);

    if (next === 'done') {
      const finished = await finishOnboarding(supabase, userId, session.id, { calendarConnected: false });
      if (session.conversation_id) {
        await appendMessage(supabase, session.conversation_id, 'assistant', finished.message);
      }
      return NextResponse.json({
        step: 'done',
        assistant_message: finished.message,
        awaiting_action: false,
        completed: true,
        booking_type_slug: finished.bookingTypeSlug,
      });
    }

    const nextPrompt = assistantPromptFor(next);
    if (session.conversation_id) await appendMessage(supabase, session.conversation_id, 'assistant', nextPrompt);

    return NextResponse.json({
      step: next,
      assistant_message: nextPrompt,
      awaiting_action: next === 'calendar',
      completed: false,
    });
  } catch (error) {
    console.error('[api/onboarding/chat]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function finishOnboarding(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  userId: string,
  sessionId: string,
  options: { calendarConnected: boolean }
): Promise<{ message: string; bookingTypeSlug: string }> {
  const answers: OnboardingAnswers = await loadAnswers(supabase, sessionId);

  const { data: userRow } = await supabase
    .from('users')
    .select('plan_type')
    .eq('id', userId)
    .maybeSingle();

  const profession = answers.profession?.profession_bucket ?? 'other';
  const pricing = answers.pricing as PricingStepFields | undefined;
  const meetingFormat = answers.meeting_format as MeetingFormatStepFields | undefined;
  const availability = answers.availability as AvailabilityStepFields | undefined;

  const userType = professionBucketToUserType(profession);
  const isPaid = Boolean(pricing?.charges);

  let meetingLink = meetingFormat?.meeting_link ?? null;
  if (
    !meetingLink &&
    meetingFormat?.mode === 'video' &&
    meetingFormat.auto_generate_meet &&
    options.calendarConnected
  ) {
    meetingLink = await generateGoogleMeetLink(supabase, userId);
  }

  const bookingTypeSlug = await createBookingType({
    userId,
    userType,
    planType: userRow?.plan_type ?? 'free',
    price: isPaid ? pricing?.price ?? 0 : 0,
    currency: isPaid ? pricing?.currency ?? 'USD' : 'USD',
    meetingMode: meetingFormat?.mode ?? 'video',
    meetingLink,
    location: meetingFormat?.location ?? null,
    paymentLink: pricing?.payment_link ?? null,
    supabase,
  });

  // location isn't persisted by createBookingType (pre-existing gap, left as-is —
  // see note in createBookingType.ts), so set it here as a follow-up update
  // rather than changing that shared function's behavior.
  if (meetingFormat?.mode === 'in_person' && meetingFormat.location) {
    await supabase
      .from('booking_types')
      .update({ location: meetingFormat.location })
      .eq('user_id', userId)
      .eq('slug', bookingTypeSlug);
  }

  const { data: bookingTypeRow } = await supabase
    .from('booking_types')
    .select('id')
    .eq('user_id', userId)
    .eq('slug', bookingTypeSlug)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (availability?.days) {
    await setupAvailability(userId, availability.days, supabase);
  }

  if (bookingTypeRow?.id) {
    await markCompleted(supabase, sessionId, bookingTypeRow.id);
  }

  await supabase
    .from('users')
    .update({ onboarding_completed: true })
    .eq('id', userId);

  return {
    message: `All set! Your booking page is ready — clients can now book with you. You can fine-tune anything from your dashboard.`,
    bookingTypeSlug,
  };
}