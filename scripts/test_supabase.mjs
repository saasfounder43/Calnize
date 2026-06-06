import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://omzszsbqcrdejfdmkmmo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tenN6c2JxY3JkZWpmZG1rbW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjY1MDc3MSwiZXhwIjoyMDg4MjI2NzcxfQ.zN98b6itBblgzD7HXCvPyWG65_bSg8ms3EegzxXP8mg';
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.rpc('get_schema');
  console.log("RPC get_schema:", data, error);
}
check();
