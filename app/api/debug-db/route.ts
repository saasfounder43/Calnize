import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase.rpc('add_theme_column');
  
  // Alternative if RPC not available: try to run a direct raw query if enabled (usually not)
  // Since we can't do that easily, let's try to just update a row and catch error
  const { error: updateError } = await supabase
    .from('booking_types')
    .update({ color_theme: 'blue' })
    .limit(1);

  return new Response(JSON.stringify({ error, updateError }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
