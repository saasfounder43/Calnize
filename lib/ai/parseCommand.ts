import Groq from 'groq-sdk';

import { injectCurrentDateIntoSchedulerPrompt } from '@/lib/agenticSchedulerPrompt';
import { GROQ_MEETING_PARSER_MODEL } from '@/lib/parseRequest';
import { AI_INTENTS, type AiIntent, type ParsedAiCommand } from '@/lib/ai/types';

const CONFIRMATION_INTENTS: AiIntent[] = [
  'update_working_hours',
  'block_time',
  'edit_meeting_type',
  'set_availability',
];

function buildSystemPrompt(): string {
  const todayLine = injectCurrentDateIntoSchedulerPrompt(
    undefined,
    new Date(),
    process.env.NYLAS_DEFAULT_TIMEZONE?.trim()
  );

  return `You are the Calnize AI Scheduling Assistant. Parse the user's natural-language command into structured scheduling intent. Respond with ONLY one JSON object (no markdown).

${todayLine}

Supported intents (use exactly one):
${AI_INTENTS.map((i) => `- ${i}`).join('\n')}

Intent meanings:
- set_availability / update_working_hours: set recurring weekly working hours (may replace existing)
- block_time: block unavailable time (recurring weekday window or one-off date)
- create_meeting_type: new free booking type
- create_paid_meeting: new paid booking type (requires price)
- edit_meeting_type: update existing booking type (needs booking_type_title or booking_type_id)
- set_buffer: set buffer_minutes on one or all booking types

Payload fields (include only what applies):
- weekdays: string[] e.g. ["Mon","Tue"] or numbers 0-6 (0=Sunday)
- start_time, end_time: "HH:mm" 24h
- after_time, before_time: for block_time partial day blocks
- date: "YYYY-MM-DD" for one-off block_time
- title, description, duration_minutes, price, currency (USD|INR|EUR), buffer_minutes
- booking_type_title: string to match existing type
- apply_to_all: boolean for set_buffer on all types
- replace_existing: boolean when replacing all availability rules

Rules:
- temperature-style: be deterministic; use status "missing_info" if required fields are unclear with one short clarification_needed question.
- status "unsupported" if the request is outside supported intents.
- status "success" only when intent and required payload fields are present.
- summary: one sentence describing what will happen (for user confirmation).
- Never invent booking_type_id; use booking_type_title when needed.

JSON shape:
{
  "status": "success" | "missing_info" | "unsupported",
  "intent": "<intent>" | null,
  "payload": { },
  "clarification_needed": "",
  "summary": ""
}`;
}

function stripJsonFence(raw: string): string {
  const trimmed = raw.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/im;
  const m = trimmed.match(fence);
  return m ? m[1].trim() : trimmed;
}

function isAiIntent(value: unknown): value is AiIntent {
  return typeof value === 'string' && (AI_INTENTS as readonly string[]).includes(value);
}

function normalizeParsed(parsed: unknown): ParsedAiCommand {
  const fallback: ParsedAiCommand = {
    status: 'missing_info',
    intent: null,
    payload: {},
    clarification_needed: 'Could not parse model output.',
    summary: '',
    requires_confirmation: false,
  };

  if (!parsed || typeof parsed !== 'object') return fallback;
  const o = parsed as Record<string, unknown>;

  const status =
    o.status === 'success' || o.status === 'missing_info' || o.status === 'unsupported'
      ? o.status
      : 'missing_info';

  const intent = isAiIntent(o.intent) ? o.intent : null;
  const payload =
    o.payload && typeof o.payload === 'object' && !Array.isArray(o.payload)
      ? (o.payload as Record<string, unknown>)
      : {};

  const clarification_needed =
    typeof o.clarification_needed === 'string' ? o.clarification_needed : '';
  const summary = typeof o.summary === 'string' ? o.summary : '';

  const requires_confirmation =
    status === 'success' && intent !== null && CONFIRMATION_INTENTS.includes(intent);

  return {
    status,
    intent,
    payload,
    clarification_needed,
    summary,
    requires_confirmation,
  };
}

export async function parseSchedulingCommand(prompt: string): Promise<ParsedAiCommand> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey || apiKey === 'your_groq_key_here') {
    throw new Error(
      'GROQ_API_KEY is not configured. Add it to .env.local or Vercel environment variables.'
    );
  }

  const trimmed = prompt.trim();
  if (!trimmed) {
    return {
      status: 'missing_info',
      intent: null,
      payload: {},
      clarification_needed: 'Please describe what you want Calnize to do.',
      summary: '',
      requires_confirmation: false,
    };
  }

  const groq = new Groq({ apiKey });
  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MEETING_PARSER_MODEL ?? GROQ_MEETING_PARSER_MODEL,
    temperature: 0.1,
    max_tokens: 1536,
    messages: [
      { role: 'system', content: buildSystemPrompt() },
      { role: 'user', content: trimmed },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    return {
      status: 'missing_info',
      intent: null,
      payload: {},
      clarification_needed: 'The model returned no content. Try again.',
      summary: '',
      requires_confirmation: false,
    };
  }

  try {
    return normalizeParsed(JSON.parse(stripJsonFence(content)));
  } catch {
    return {
      status: 'missing_info',
      intent: null,
      payload: {},
      clarification_needed: 'Model output was not valid JSON. Try rephrasing your command.',
      summary: '',
      requires_confirmation: false,
    };
  }
}
