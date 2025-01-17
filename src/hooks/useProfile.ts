import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProfile = () => {
  const [isLoading, setIsLoading] = useState(false);

  const ensureProfile = async (userId: string): Promise<boolean> => {
    if (!userId) {
      console.error('No userId provided');
      return false;
    }

    try {
      setIsLoading(true);
      
      // First verify we have a valid session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData.session) {
        console.error('No valid session:', sessionError);
        toast.error('Authentication required');
        return false;
      }

      // Check if profile exists
      const { data: existingProfile, error: selectError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Error checking profile:', selectError);
        toast.error('Failed to verify user profile');
        return false;
      }

      if (!existingProfile) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([{ id: userId }]);

        if (insertError) {
          console.error('Error creating profile:', insertError);
          toast.error('Failed to create user profile');
          return false;
        }
        
        toast.success('Profile created successfully');
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