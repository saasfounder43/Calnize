import { NextRequest, NextResponse } from 'next/server';

import { getAuthenticatedUserId } from '@/lib/ai/auth';
import { logCommandParse } from '@/lib/ai/logging';
import { parseSchedulingCommand } from '@/lib/ai/parseCommand';

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const prompt = body?.prompt;

    if (typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Expected JSON body with a non-empty string field "prompt".' },
        { status: 400 }
      );
    }

    const parsed = await parseSchedulingCommand(prompt);
    const commandLogId = await logCommandParse(userId, prompt.trim(), parsed);

    return NextResponse.json({
      parsed,
      command_log_id: commandLogId,
    });
  } catch (error) {
    console.error('[api/ai/parse]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
