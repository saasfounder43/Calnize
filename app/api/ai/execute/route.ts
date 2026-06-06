import { NextRequest, NextResponse } from 'next/server';

import { getAuthenticatedUserId } from '@/lib/ai/auth';
import { executeSchedulingCommand } from '@/lib/ai/executors';
import { logActionExecution } from '@/lib/ai/logging';
import { createServerSupabaseClient } from '@/lib/supabase';
import type { AiIntent, ParsedAiCommand } from '@/lib/ai/types';
import { AI_INTENTS } from '@/lib/ai/types';

function isParsedCommand(value: unknown): value is ParsedAiCommand {
  if (!value || typeof value !== 'object') return false;
  const o = value as ParsedAiCommand;
  if (o.status !== 'success') return false;
  if (!o.intent || !AI_INTENTS.includes(o.intent as AiIntent)) return false;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = body?.parsed;
    const commandLogId =
      typeof body?.command_log_id === 'string' ? body.command_log_id : null;
    const confirmed = body?.confirmed === true;

    if (!isParsedCommand(parsed)) {
      return NextResponse.json(
        { error: 'Expected parsed command with status "success" and a valid intent.' },
        { status: 400 }
      );
    }

    if (parsed.requires_confirmation && !confirmed) {
      return NextResponse.json(
        {
          error: 'confirmation_required',
          message: 'This action needs your confirmation before running.',
          summary: parsed.summary,
        },
        { status: 409 }
      );
    }

    const supabase = createServerSupabaseClient();
    const result = await executeSchedulingCommand(supabase, userId, parsed);

    await logActionExecution(
      userId,
      commandLogId,
      parsed.intent!,
      parsed.payload,
      result.success,
      result.message,
      result.data
    );

    return NextResponse.json({ result }, { status: result.success ? 200 : 422 });
  } catch (error) {
    console.error('[api/ai/execute]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
