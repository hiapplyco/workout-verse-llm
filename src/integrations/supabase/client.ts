import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Access the environment variables with fallback to secrets
const getEnvVar = (key: string): string => {
  const value = import.meta.env[key];
  if (!value) {
    console.error(`Missing ${key} environment variable`);
    throw new Error(`Missing ${key} environment variable. Please ensure it is set in your Supabase secrets.`);
  }
  return value;
};

// Get required environment variables
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

// Create and export the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);