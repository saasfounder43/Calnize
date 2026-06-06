import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { saveMessage } from '@/lib/conversation';
import { createBookingType, setupAvailability } from '@/lib/booking';
import { getSessionForUser, saveStepData, validateAnswerForStep, moveToNextStep, createSessionForUser, getStepData, completeOnboarding } from '@/lib/onboarding/service';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as Record<string, any>;
    const conversationId = body?.conversationId as string | undefined;
    const message = typeof body?.message === 'string' ? body.message : '';

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
    }

    // Persist user message
    const userMsg = await saveMessage(conversationId, 'user', message, { raw: message });

    // Ensure onboarding session exists for user
    let session = await getSessionForUser(user.id);
    if (!session) {
      session = await createSessionForUser(user.id, conversationId);
    }

    const currentStep = session.current_step || 'STEP_1_BOOKING_TYPE';
    const parsedAnswer = parseAnswerForStep(currentStep, message);
    const valid = validateAnswerForStep(currentStep, parsedAnswer);

    if (!valid) {
      const friendly = getFriendlyValidationPrompt(currentStep);
      const assistantMsg = await saveMessage(conversationId, 'assistant', friendly, {});
      return NextResponse.json({ userMessage: userMsg, assistantMessage: assistantMsg, valid: false });
    }

    // Save normalized step data
    await saveStepData(session.id, currentStep, parsedAnswer);

    // Advance state
    const { nextStep, isCompleted } = await moveToNextStep(session.id);

    let assistantContent = generateAssistantPrompt(nextStep);
    let bookingLink: string | null = null;

    if (isCompleted) {
      const bookingTypeName = await getStepData(session.id, 'STEP_1_BOOKING_TYPE');
      const pricing = await getStepData(session.id, 'STEP_2_PRICING');
      const duration = await getStepData(session.id, 'STEP_3_DURATION');
      const availability = await getStepData(session.id, 'STEP_4_AVAILABILITY');
      const calendarChoice = await getStepData(session.id, 'STEP_5_CALENDAR');

      const payload = {
        userId: user.id,
        title: typeof bookingTypeName === 'string' ? bookingTypeName : 'Meeting',
        isPaid: Boolean(pricing?.is_paid),
        price: typeof pricing?.price === 'number' ? pricing.price : undefined,
        durationMinutes: Number(duration) || 30,
        availability: Array.isArray(availability) ? availability : [String(availability)],
        calendarConnection: calendarChoice === 'connect' ? ('connect' as const) : ('skip' as const),
      };

      const booking = await createBookingType(payload);
      await setupAvailability(booking.id, payload.availability);
      await completeOnboarding(session.id, booking.id);
      bookingLink = booking.link;
      assistantContent = `Fantastic! Your booking page is ready: ${booking.link}\n\nShare this link with your clients or go to the dashboard to manage availability.`;
    }

    const assistantMsg = await saveMessage(conversationId, 'assistant', assistantContent, { step: nextStep, bookingLink });

    return NextResponse.json({
      userMessage: userMsg,
      assistantMessage: assistantMsg,
      nextStep,
      isCompleted,
      bookingLink,
      session: {
        id: session.id,
        current_step: nextStep,
        is_completed: isCompleted,
      },
    });
  } catch (err) {
    console.error('[api/chat/send] Error sending message', err);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

function getFriendlyValidationPrompt(step: string) {
  switch (step) {
    case 'STEP_3_DURATION':
      return "Hmm, I didn't quite understand that duration. Could you choose 15, 30, 45, 60, 90 or 120 minutes?";
    case 'STEP_2_PRICING':
      return "I didn't get that. Is this meeting free or paid? If paid, what's the price (number)?";
    case 'STEP_1_BOOKING_TYPE':
      return "Okay — what kind of meeting is this? For example: Consultation, Coaching, Sales Call, Interview, or Other.";
    default:
      return "I didn't understand that — could you rephrase?";
  }
}

function generateAssistantPrompt(step: string) {
  switch (step) {
    case 'STEP_2_PRICING':
      return "Is this meeting free or paid?";
    case 'STEP_3_DURATION':
      return "How long should this meeting be? Choose 15, 30, 45, 60, 90 or 120 minutes.";
    case 'STEP_4_AVAILABILITY':
      return "When are you typically available? Examples: Weekdays 9-5, Weekends, After 7 PM, or Custom.";
    case 'STEP_5_CALENDAR':
      return "Would you like to connect your Google Calendar? Say 'connect' or 'skip'.";
    case 'STEP_6_COMPLETE':
      return "Great — I'm finishing setup now. I'll create your booking page and availability.";
    default:
      return "Thanks — got it. Moving on.";
  }
}

function parseAnswerForStep(step: string, message: string) {
  switch (step) {
    case 'STEP_2_PRICING':
      return parsePricingAnswer(message);
    case 'STEP_3_DURATION':
      return parseDurationAnswer(message);
    case 'STEP_4_AVAILABILITY':
      return parseAvailabilityAnswer(message);
    case 'STEP_5_CALENDAR':
      return parseCalendarAnswer(message);
    default:
      return message.trim();
  }
}

function parsePricingAnswer(value: string) {
  const raw = value.trim();
  if (/free|no|not paid|complimentary/i.test(raw)) {
    return { is_paid: false };
  }

  const currencyMatch = raw.match(/\d+[.,]?\d*/);
  if (currencyMatch) {
    const normalized = currencyMatch[0].replace(',', '.');
    const price = Number(normalized);
    if (!Number.isNaN(price) && price > 0) {
      return { is_paid: true, price };
    }
  }

  return raw;
}

function parseDurationAnswer(value: string) {
  const raw = value.trim();
  const match = raw.match(/\d+/);
  if (match) {
    return Number(match[0]);
  }
  return raw;
}

function parseAvailabilityAnswer(value: string) {
  const raw = value.trim();
  if (!raw) return [];
  if (raw.includes(',')) {
    return raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (raw.includes('\n')) {
    return raw
      .split(/\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [raw];
}

function parseCalendarAnswer(value: string) {
  const raw = value.trim().toLowerCase();
  if (raw.includes('connect')) return 'connect';
  if (raw.includes('skip') || raw.includes('later') || raw.includes('not now')) return 'skip';
  return raw;
}
