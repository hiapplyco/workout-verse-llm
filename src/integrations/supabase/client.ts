import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Create and export the Supabase client
export const supabase = createClient<Database>(
  'https://ulnsvkrrdcmfiguibkpx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsbnN2a3JyZGNtZmlndWlia3B4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU0OTc2MDAsImV4cCI6MjAyMTA3MzYwMH0.0vVDjhy5x_OVLILXEDLgrqHqGhH2O1A4_qG4W_K7ppY'
);