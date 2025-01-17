import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const verifySession = async () => {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError || !session) {
    console.error('Session error or no session:', sessionError);
    toast({
      title: "Error",
      description: "Authentication required",
      variant: "destructive",
    });
    return null;
  }

  console.log('Session verified:', {
    id: session.user.id,
    email: session.user.email,
  });

  return session;
};

const checkExistingProfile = async (userId: string) => {
  const { data: existingProfile, error: checkError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single();

  if (checkError) {
    console.error('Error checking profile existence:', checkError);
    toast({
      title: "Error",
      description: "Failed to verify user profile",
      variant: "destructive",
    });
    return null;
  }

  if (existingProfile) {
    console.log('Existing profile found:', existingProfile.id);
    return existingProfile;
  }

  return null;
};

const createNewProfile = async (userId: string) => {
  const { data: newProfile, error: insertError } = await supabase
    .from('profiles')
    .insert([{ id: userId }])
    .select()
    .single();

  if (insertError) {
    console.error('Error creating profile:', insertError);
    toast({
      title: "Error",
      description: "Failed to create user profile",
      variant: "destructive",
    });
    return null;
  }

  console.log('New profile created successfully:', newProfile);
  toast({
    title: "Success",
    description: "Profile created successfully",
  });
  return newProfile;
};

export const useProfile = () => {
  const [isLoading, setIsLoading] = useState(false);

  const verifyProfile = async (userId: string) => {
    console.log('Starting profile verification for user:', userId);
    
    if (!userId) {
      console.error('Profile verification failed: No user ID provided');
      toast({
        title: "Error",
        description: "User ID is required",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsLoading(true);
      
      const session = await verifySession();
      if (!session) return false;

      const existingProfile = await checkExistingProfile(userId);
      if (existingProfile) return true;

      const newProfile = await createNewProfile(userId);
      return !!newProfile;

    } catch (error) {
      console.error('Unexpected error in profile verification:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    verifyProfile,
  };
};