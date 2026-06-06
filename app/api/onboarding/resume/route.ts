import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getConversation, getMessages } from '@/lib/conversation';
import {
  getOrCreateSessionForUser,
  associateConversationWithSession,
  STEPS,
} from '@/lib/onboarding/service';
import { createConversation, saveMessage } from '@/lib/conversation';

function getInitialAssistantPrompt(step: string) {
  switch (step) {
    case 'STEP_2_PRICING':
      return 'Is this meeting free or paid?';
    case 'STEP_3_DURATION':
      return 'How long should this meeting be? Choose 15, 30, 45, 60, 90 or 120 minutes.';
    case 'STEP_4_AVAILABILITY':
      return 'When are you typically available? Examples: Weekdays 9-5, Weekends, After 7 PM, or Custom.';
    case 'STEP_5_CALENDAR':
      return "Would you like to connect your Google Calendar? Say 'connect' or 'skip'.";
    case 'STEP_6_COMPLETE':
      return "Great — I'm finishing setup now. I'll create your booking page and availability.";
    default:
      return 'Welcome! Let’s set up your first meeting type. What kind of meeting would you like to offer?';
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let session = await getOrCreateSessionForUser(user.id);

    let conversation = null;
    let messages = [];

    if (!session.conversation_id) {
      conversation = await createConversation(user.id, { title: 'Onboarding Setup', type: 'onboarding' });
      await associateConversationWithSession(session.id, conversation.id);
      session.conversation_id = conversation.id;
    } else {
      conversation = await getConversation(session.conversation_id);
    }

    let bookingLink: string | null = null;
    if (session.conversation_id) {
      messages = await getMessages(session.conversation_id);
      if (messages.length === 0) {
        const assistantMessage = await saveMessage(
          session.conversation_id,
          'assistant',
          getInitialAssistantPrompt(session.current_step || STEPS[0]),
          { step: session.current_step || STEPS[0] }
        );
        messages = [assistantMessage];
      }
    }

    if (session.is_completed && session.booking_type_id) {
      bookingLink = `https://calnize.example.com/book/${session.booking_type_id}`;
    }

    return NextResponse.json({ session, conversation, messages, bookingLink });
  } catch (err) {
    console.error('[api/onboarding/resume] Error', err);
    return NextResponse.json({ error: 'Failed to resume onboarding' }, { status: 500 });
  }
}
