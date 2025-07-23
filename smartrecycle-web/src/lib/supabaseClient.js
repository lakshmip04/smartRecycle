import { createClient } from '@supabase/supabase-js';

// These variables will be loaded from your environment variables (.env file)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a single, reusable Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
