import { AuthError } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const verifySession = async () => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    console.error('Session verification failed:', sessionError);
    return null;
  }
  
  if (!session?.user) {
    console.log('No active session found');
    return null;
  }
  
  return session;
};

export const verifyProfile = async (userId: string) => {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('Profile verification failed:', profileError);
    return null;
  }

  return profile;
};

export const handleSignOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Verify session is cleared
    const session = await verifySession();
    if (session) {
      throw new Error('Session persisted after sign out');
    }
    
    toast.success('Signed out successfully');
    return true;
  } catch (error) {
    console.error('Sign out failed:', error);
    toast.error('Failed to sign out');
    return false;
  }
};

export const getAuthErrorMessage = (error: AuthError) => {
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Invalid email or password';
    case 'Email not confirmed':
      return 'Please verify your email address';
    default:
      return error.message;
  }
};