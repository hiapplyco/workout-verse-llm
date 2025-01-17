import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = 'https://ulnsvkrrdcmfiguibkpx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsbnN2a3JyZGNtZmlndWlia3B4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDg5NjQ5NjAsImV4cCI6MjAyNDU0MDk2MH0.9JxDLJKI8i7-ssb2J2_ZXzZkRvWVspeFTMFo8kzGAXI';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
});