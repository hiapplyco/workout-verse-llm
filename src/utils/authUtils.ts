import { AuthError } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const verifySession = async () => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session verification failed:', sessionError);
      return null;
    }
    
    if (!session?.user) {
      console.log('No active session found');
      return null;
    }
    
    console.log('Session check result:', {
      session: session ? 'Present' : 'None',
      error: sessionError ? sessionError.message : 'None'
    });

    console.log('User authenticated:', {
      id: session.user.id,
      email: session.user.email,
      lastSignIn: session.user.last_sign_in_at
    });
    
    return session;
  } catch (error) {
    console.error('Unexpected error during session verification:', error);
    return null;
  }
};

export const verifyProfile = async (userId: string) => {
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Profile verification failed:', profileError);
      return null;
    }

    if (!profile) {
      console.error('No profile found for user');
      return null;
    }

    return profile;
  } catch (error) {
    console.error('Profile verification failed:', error);
    return null;
  }
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