import Groq from 'groq-sdk';

import { GROQ_MEETING_PARSER_MODEL } from '@/lib/parseRequest';
import type { OnboardingStepKey, ParsedOnboardingStep } from '@/lib/onboarding/types';

function stripJsonFence(raw: string): string {
  const trimmed = raw.trim();
  const fence = /^```(?:json)?\s*([\s\S]*?)```$/im;
  const m = trimmed.match(fence);
  return m ? m[1].trim() : trimmed;
}

/** One prompt fragment per step describing exactly what fields to extract and how. */
function stepInstructions(step: OnboardingStepKey): string {
  switch (step) {
    case 'profession':
      return `The user is answering: "What do you do?"
Extract which ONE of these buckets best matches their answer: consultant, coach, freelancer, designer, doctor, sales_team, other.
Fields to return: { "profession_bucket": "<one of the buckets above>" | null }
If the answer is too vague to pick a bucket, use "other" rather than asking again — this field is low-stakes.`;

    case 'pricing':
      return `The user is answering: "Do you charge for your meetings?" (and if so, how much, in what currency, and where should payment be sent).
Fields to return: {
  "charges": true | false | null,
  "price": <number> | null (only if charges is true),
  "currency": one of "USD","EUR","GBP","INR","AUD","CAD" | null (only if charges is true; default to "USD" if a price is given but no currency is mentioned),
  "payment_link": "<url the user gives to receive payment, e.g. a Stripe Payment Link or PayPal.me link>" | null
}
If charges is true but no price is given at all, set status to "missing_info" and ask specifically for the price.
If charges is true and a price is given but no payment link, set status "success" anyway — payment_link is optional and can be added later. Do not block on it.
If charges is false, price/currency/payment_link should all be null and status is "success".`;

    case 'meeting_format':
      return `The user is answering: "How do you meet with people — video call, phone, or in person?"
Fields to return: {
  "mode": "video" | "phone" | "in_person" | null,
  "meeting_link": "<url, only if mode is video and they pasted/mentioned a specific link>" | null,
  "location": "<address or place, only if mode is in_person>" | null,
  "auto_generate_meet": true | false (true if mode is video AND they did NOT give a specific link AND they seem open to Calnize generating one automatically once their calendar is connected; default true when mode is video and no link was given)
}
If mode is in_person and no location was given, set status "missing_info" and ask for the location.
If mode is video, a missing meeting_link is fine (auto_generate_meet handles it) — do not ask for one.`;

    case 'availability':
      return `The user is answering: "What are your working hours?" (which days, and what hours each day).
Fields to return: {
  "days": [ { "day": "Monday".."Sunday", "enabled": true|false, "startTime": "HH:mm" (24h), "endTime": "HH:mm" (24h) }, ... for all 7 days ... ] | null
}
Always return all 7 days in the array, in order Monday through Sunday. Days not mentioned should default to enabled:false with startTime "09:00" endTime "17:00".
If the user says something like "weekdays 9 to 5", enable Monday-Friday with those hours and disable Saturday/Sunday.
If the message is too vague to infer any schedule at all (e.g. "I don't know"), set status "missing_info" and ask them to name at least which days they're generally available.`;

    case 'theme':
      return `The user is answering: "Want to pick a color theme for your booking page?" This step is optional and skippable.
Fields to return: { "theme": "<short theme name or color the user mentioned>" | null, "skipped": true | false }
If the user says anything indicating they want to skip, don't care, or want the default, set skipped:true and theme:null, status "success".
Never ask a follow-up on this step — always return status "success".`;

    default:
      return `Extract any relevant structured information from the user's message as a flat JSON object under "fields".`;
  }
}

function buildSystemPrompt(step: OnboardingStepKey): string {
  return `You are the Calnize onboarding assistant, helping a brand-new user set up their account through natural conversation instead of a form. Parse the user's free-text reply into structured data. Respond with ONLY one JSON object (no markdown, no commentary).

${stepInstructions(step)}

JSON shape (always this exact shape, "fields" containing only the keys described above for this step):
{
  "status": "success" | "missing_info" | "unsupported",
  "fields": { },
  "clarification_needed": "<one short, specific question — only set when status is missing_info>"
}

Rules:
- Be lenient and generous in interpreting phrasing — the user may phrase things very differently than the literal question. Use judgment.
- Only use "missing_info" when a genuinely required field is missing or too ambiguous to guess safely — see per-field notes above for what's actually required vs optional.
- Use "unsupported" only if the message is completely unrelated to the question (e.g. random chatter, or a question back).
- Never invent specific values (like a price or address) that weren't stated or clearly implied.`;
}

function normalizeParsed(parsed: unknown): ParsedOnboardingStep {
  const fallback: ParsedOnboardingStep = {
    status: 'missing_info',
    fields: {},
    clarification_needed: 'Could not parse that — could you rephrase?',
  };

  if (!parsed || typeof parsed !== 'object') return fallback;
  const o = parsed as Record<string, unknown>;

  const status =
    o.status === 'success' || o.status === 'missing_info' || o.status === 'unsupported'
      ? o.status
      : 'missing_info';

  const fields =
    o.fields && typeof o.fields === 'object' && !Array.isArray(o.fields)
      ? (o.fields as Record<string, unknown>)
      : {};

  const clarification_needed =
    typeof o.clarification_needed === 'string' ? o.clarification_needed : '';

  return { status, fields, clarification_needed };
}

export async function parseOnboardingStep(
  step: OnboardingStepKey,
  userMessage: string
): Promise<ParsedOnboardingStep> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey || apiKey === 'your_groq_key_here') {
    throw new Error(
      'GROQ_API_KEY is not configured. Add it to .env.local or Vercel environment variables.'
    );
  }

  const trimmed = userMessage.trim();
  if (!trimmed) {
    return {
      status: 'missing_info',
      fields: {},
      clarification_needed: 'Could you share your answer?',
    };
  }

  const groq = new Groq({ apiKey });
  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MEETING_PARSER_MODEL ?? GROQ_MEETING_PARSER_MODEL,
    temperature: 0.1,
    max_tokens: 1024,
    messages: [
      { role: 'system', content: buildSystemPrompt(step) },
      { role: 'user', content: trimmed },
    ],
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    return {
      status: 'missing_info',
      fields: {},
      clarification_needed: 'I didn\'t catch that — could you try again?',
    };
  }

  try {
    return normalizeParsed(JSON.parse(stripJsonFence(content)));
  } catch {
    return {
      status: 'missing_info',
      fields: {},
      clarification_needed: 'Sorry, I had trouble understanding that — could you rephrase?',
    };
  }
}