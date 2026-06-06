import Groq from 'groq-sdk';

import { injectCurrentDateIntoSchedulerPrompt } from '@/lib/agenticSchedulerPrompt';

/** Groq Cloud model for structured extraction (`llama-3.1-70b-versatile` was retired; see Groq deprecations). */
export const GROQ_MEETING_PARSER_MODEL = 'llama-3.3-70b-versatile' as const;

export type MeetingParseStatus = 'success' | 'missing_info';

export interface MeetingDetails {
  attendee_name: string | null;
  date: string;
  time: string;
  duration_minutes: number;
  topic: string | null;
}

export interface ParseMeetingRequestResult {
  status: MeetingParseStatus;
  meeting_details: MeetingDetails;
  clarification_needed: string;
}

const EMPTY_DETAILS: MeetingDetails = {
  attendee_name: null,
  date: '',
  time: '',
  duration_minutes: 30,
  topic: null,
};

function buildSystemPrompt(): string {
  const todayLine = injectCurrentDateIntoSchedulerPrompt();
  return `You are the Calnize Agentic Scheduler. Extract meeting details from unstructured user text and respond with ONLY a single JSON object (no markdown, no prose).

${todayLine}

Rules:
- If the user does not specify a duration, use duration_minutes: 30.
- Resolve relative dates ("tomorrow", "next Friday", etc.) to an exact calendar date using Today's Date above.
- time must be 24-hour "HH:mm" (e.g. 14:00 for 2pm).
- date must be "YYYY-MM-DD".
- If any required field cannot be determined, set status to "missing_info" and ask one short question in clarification_needed. Use empty strings for unknown date/time when status is missing_info.
- attendee_name and topic may be null if absent.
- status is "success" only when date, time, and enough context to schedule are present.

Required JSON shape:
{
  "status": "success" | "missing_info",
  "meeting_details": {
    "attendee_name": string | null,
    "date": string,
    "time": string,
    "duration_minutes": number,
    "topic": string | null
  },
  "clarification_needed": string
}`;
}

function stripJsonFence(raw: string): string {
  const trimmed = raw.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/im;
  const m = trimmed.match(fence);
  return m ? m[1].trim() : trimmed;
}

function normalizeResult(parsed: unknown): ParseMeetingRequestResult {
  if (!parsed || typeof parsed !== 'object') {
    return {
      status: 'missing_info',
      meeting_details: { ...EMPTY_DETAILS },
      clarification_needed: 'Could not parse model output.',
    };
  }
  const o = parsed as Record<string, unknown>;
  const status: MeetingParseStatus =
    o.status === 'success' || o.status === 'missing_info' ? o.status : 'missing_info';
  const md = o.meeting_details;
  let meeting_details: MeetingDetails = { ...EMPTY_DETAILS };

  if (md && typeof md === 'object') {
    const m = md as Record<string, unknown>;
    meeting_details = {
      attendee_name: typeof m.attendee_name === 'string' ? m.attendee_name : m.attendee_name === null ? null : null,
      date: typeof m.date === 'string' ? m.date : '',
      time: typeof m.time === 'string' ? m.time : '',
      duration_minutes:
        typeof m.duration_minutes === 'number' && Number.isFinite(m.duration_minutes)
          ? Math.max(1, Math.round(m.duration_minutes))
          : 30,
      topic: typeof m.topic === 'string' ? m.topic : m.topic === null ? null : null,
    };
  }

  const clarification_needed =
    typeof o.clarification_needed === 'string' ? o.clarification_needed : '';

  return { status, meeting_details, clarification_needed };
}

/**
 * Calls Groq (Llama 3.3 70B Versatile by default) to extract structured meeting fields from free-form text.
 * Server-only: requires GROQ_API_KEY (e.g. in .env.local or Vercel env).
 */
export async function parseMeetingRequest(text: string): Promise<ParseMeetingRequestResult> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey || apiKey === 'your_groq_key_here') {
    throw new Error(
      'GROQ_API_KEY is not configured. Add it to .env.local (or Vercel environment variables).'
    );
  }

  const trimmed = text.trim();
  if (!trimmed) {
    return {
      status: 'missing_info',
      meeting_details: { ...EMPTY_DETAILS },
      clarification_needed: 'No meeting text was provided.',
    };
  }

  const groq = new Groq({ apiKey });
  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MEETING_PARSER_MODEL ?? GROQ_MEETING_PARSER_MODEL,
    temperature: 0.1,
    max_tokens: 1024,
    messages: [
      { role: 'system', content: buildSystemPrompt() },
      { role: 'user', content: trimmed },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    return {
      status: 'missing_info',
      meeting_details: { ...EMPTY_DETAILS },
      clarification_needed: 'The model returned no content.',
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripJsonFence(content));
  } catch {
    return {
      status: 'missing_info',
      meeting_details: { ...EMPTY_DETAILS },
      clarification_needed: 'Model output was not valid JSON.',
    };
  }

  return normalizeResult(parsed);
}
