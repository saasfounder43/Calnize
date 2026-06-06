import { NextRequest, NextResponse } from 'next/server';

import { createCalendarEvent } from '@/lib/calendarService';
import { parseMeetingRequest } from '@/lib/parseRequest';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = body?.text;

    if (typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Expected JSON body with a string field "text".' },
        { status: 400 }
      );
    }

    const parsed = await parseMeetingRequest(text);

    if (parsed.status === 'missing_info') {
      return NextResponse.json(
        {
          clarification_needed: parsed.clarification_needed,
          meeting_details: parsed.meeting_details,
        },
        { status: 200 }
      );
    }

    const event = await createCalendarEvent(parsed.meeting_details);
    return NextResponse.json(
      {
        event,
        meeting_details: parsed.meeting_details,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[api/schedule]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
