import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { error } = await supabase.from('booking_types').select('buffer_minutes').limit(1);
  if (error) {
    console.error("Column buffer_minutes is missing or error:", error.message);
  } else {
    console.log("Column buffer_minutes exists.");
  }
}
check();
