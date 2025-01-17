import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProfile = () => {
  const [isLoading, setIsLoading] = useState(false);

  const ensureProfile = async (userId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      console.log('Starting ensureProfile for userId:', userId);
      
      // First verify we have a valid session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('No valid session:', sessionError);
        toast.error('Authentication required');
        return false;
      }
      console.log('Valid session found:', session.user.id);

      // Check if profile exists
      const { data: existingProfile, error: selectError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Error checking profile:', selectError);
        toast.error('Failed to verify user profile');
        return false;
      }

      if (!existingProfile) {
        console.log('No existing profile found, creating new profile for user:', userId);
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{ id: userId }])
          .select()
          .single();

        if (insertError) {
          console.error('Error creating profile:', insertError);
          toast.error('Failed to create user profile');
          return false;
        }
        
        console.log('Profile created successfully');
        toast.success('Profile created successfully');
      } else {
        console.log('Existing profile found:', existingProfile.id);
      }

      return true;
    } catch (error) {
      console.error('Error in ensureProfile:', error);
      toast.error('Failed to verify user profile');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    ensureProfile,
  };
};