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

      // First check if profile exists
      const { data: profile, error: selectError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      // If profile exists, return true
      if (profile) {
        return true;
      }

      // If no profile exists (404 error), create one
      if (selectError && selectError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ id: userId })
          .select()
          .single();

        if (insertError) {
          // If insert fails with duplicate key error, profile might have been created in a race condition
          if (insertError.code === '23505') {
            return true;
          }
          console.error('Error creating profile:', insertError);
          toast.error('Failed to create user profile');
          return false;
        }

        return true;
      }

      console.error('Error checking profile:', selectError);
      toast.error('Failed to verify user profile');
      return false;

    } catch (error) {
      console.error('Error in ensureProfile:', error);
      toast.error('An unexpected error occurred');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    ensureProfile,
    isLoading,
  };
};