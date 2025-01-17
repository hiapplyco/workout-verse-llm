import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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
      
      // Get and log current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Current Session:', {
        id: session?.user?.id,
        email: session?.user?.email,
        aud: session?.user?.aud,
      });
      
      if (sessionError) {
        console.error('Session error:', sessionError);
      }
      
      if (session?.access_token) {
        console.log('Access Token Present:', session.access_token.substring(0, 10) + '...');
      }

      console.log('Checking for existing profile with ID:', userId);

      // First check if profile exists using maybeSingle() instead of single()
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking profile existence:', checkError);
        toast({
          title: "Error",
          description: "Failed to verify user profile",
          variant: "destructive",
        });
        return false;
      }

      if (existingProfile) {
        console.log('Existing profile found:', existingProfile.id);
        return true;
      }

      console.log('No existing profile found, creating new profile for user:', userId);
      console.log('Insert payload:', { id: userId });

      // If no profile exists, create one
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
        return false;
      }

      console.log('New profile created successfully:', newProfile);
      toast({
        title: "Success",
        description: "Profile created successfully",
      });
      return true;

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