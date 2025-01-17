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
    
    return session;
  } catch (error) {
    console.error('Unexpected error during session verification:', error);
    return null;
  }
};

export const verifyProfile = async (userId: string) => {
  try {
    console.log('Verifying profile for user:', userId);
    
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .limit(1);

    if (profileError) {
      console.error('Profile verification failed:', profileError);
      return null;
    }

    if (!profiles || profiles.length === 0) {
      console.log('No profile found, attempting to create one');
      const { data: newProfile, error: insertError } = await supabase
        .from('profiles')
        .insert([{ id: userId }])
        .select()
        .single();

      if (insertError) {
        console.error('Failed to create profile:', insertError);
        toast.error('Failed to create user profile');
        return null;
      }

      console.log('Profile created successfully:', newProfile);
      return newProfile;
    }

    console.log('Profile verified successfully:', profiles[0]);
    return profiles[0];
  } catch (error) {
    console.error('Profile verification failed:', error);
    return null;
  }
};

export const handleSignOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    toast.success('Signed out successfully');
    return true;
  } catch (error) {
    console.error('Sign out failed:', error);
    toast.error('Failed to sign out');
    return false;
  }
};