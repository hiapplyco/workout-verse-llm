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
    
    console.log('Session verified successfully:', {
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
    console.log('Verifying profile for user:', userId);
    
    // First try to fetch the profile using single() since we expect exactly one match
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        console.log('No profile found, attempting to create one');
        // Profile doesn't exist, try to create one
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{ id: userId }])
          .select('id')
          .single();

        if (insertError) {
          console.error('Failed to create profile:', insertError);
          toast.error('Failed to create user profile');
          return null;
        }

        console.log('Profile created successfully:', newProfile);
        return newProfile;
      }
      
      console.error('Profile verification failed:', profileError);
      return null;
    }

    console.log('Profile verified successfully:', profile);
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
  if (error.message.includes('User already registered')) {
    return 'This email is already registered. Please sign in instead.';
  }
  
  switch (error.message) {
    case 'Invalid login credentials':
      return 'Invalid email or password';
    case 'Email not confirmed':
      return 'Please verify your email address';
    case 'missing email or phone':
      return 'Please enter your email address';
    default:
      return error.message;
  }
};