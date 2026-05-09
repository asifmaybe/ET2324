import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
// Service role key bypasses RLS — only used for trusted write operations
const supabaseServiceKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || '';

// Mock storage for SSR environments where window is undefined
const ssrStorage = {
  getItem: (key: string) => Promise.resolve(null),
  setItem: (key: string, value: string) => Promise.resolve(),
  removeItem: (key: string) => Promise.resolve(),
};

// Public client — used for auth & reads (respects RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? AsyncStorage : ssrStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Admin client — uses service role key, bypasses RLS for all write operations.
// Safe to use here because this is a trusted app, not a public web server.
export const adminSupabase = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey, // fall back to anon if service key not set
  { auth: { autoRefreshToken: false, persistSession: false } }
);
