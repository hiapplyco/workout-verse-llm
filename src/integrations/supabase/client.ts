import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://ulnsvkrrdcmfiguibkpx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsbnN2a3JyZGNtZmlndWlia3B4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDY4MjU2MDAsImV4cCI6MjAyMjQwMTYwMH0.SbUPHgkFiv_xwh9kQEQxW7ivNRLXvSLkQ9UHRnXZUYI';

if (!supabaseAnonKey) {
  throw new Error('Missing Supabase anon key');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});