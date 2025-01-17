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
      
      // Get and verify current session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('Session error or no session:', sessionError);
        toast({
          title: "Error",
          description: "Authentication required",
          variant: "destructive",
        });
        return false;
      }

      console.log('Session verified:', {
        id: session.user.id,
        email: session.user.email,
      });

      // Check for existing profile using .single()
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (checkError) {
        if (checkError.code === 'PGRST116') {
          console.log('No profile found, will create one');
          
          // Create new profile
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
        } else {
          console.error('Error checking profile existence:', checkError);
          toast({
            title: "Error",
            description: "Failed to verify user profile",
            variant: "destructive",
          });
          return false;
        }
      }

      if (existingProfile) {
        console.log('Existing profile found:', existingProfile.id);
        return true;
      }

      return false;

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