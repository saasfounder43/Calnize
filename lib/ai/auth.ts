import { NextRequest } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function getAuthenticatedUserId(request: NextRequest): Promise<string | null> {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.replace('Bearer ', '').trim();
    const admin = createServerSupabaseClient();
    const { data, error } = await admin.auth.getUser(token);
    if (!error && data.user) return data.user.id;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user.id;
}
