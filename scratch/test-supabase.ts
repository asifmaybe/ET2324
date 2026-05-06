import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(url, key);

async function test() {
  const { data, error } = await supabase.from('notices').select('*').limit(1);
  if (error) {
    console.error("Error connecting to supabase:", error.message);
  } else {
    console.log("Success:", data);
  }
}
test();
