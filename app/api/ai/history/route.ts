import { NextRequest, NextResponse } from 'next/server';

import { getAuthenticatedUserId } from '@/lib/ai/auth';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const limit = Math.min(
      50,
      Math.max(1, parseInt(request.nextUrl.searchParams.get('limit') || '20', 10))
    );

    const supabase = createServerSupabaseClient();

    const { data: commands, error: cmdError } = await supabase
      .from('ai_command_logs')
      .select('id, raw_prompt, parsed_intent, execution_status, response_message, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (cmdError) {
      if (cmdError.code === '42P01') {
        return NextResponse.json({
          commands: [],
          actions: [],
          notice: 'AI tables not migrated yet. Run supabase/migrations/20260528000000_ai_scheduling_tables.sql',
        });
      }
      return NextResponse.json({ error: cmdError.message }, { status: 500 });
    }

    const { data: actions, error: actError } = await supabase
      .from('ai_action_history')
      .select('id, action_type, success, execution_result, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (actError && actError.code !== '42P01') {
      return NextResponse.json({ error: actError.message }, { status: 500 });
    }

    return NextResponse.json({
      commands: commands ?? [],
      actions: actions ?? [],
    });
  } catch (error) {
    console.error('[api/ai/history]', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
