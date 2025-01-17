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

      // Try to create the profile first
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{ id: userId }]);

      // If insert succeeds, we're done
      if (!insertError) {
        toast.success('Profile created successfully');
        return true;
      }

      // If insert fails with duplicate key error, verify profile exists
      if (insertError.code === '23505') {
        const { data: profile, error: selectError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .maybeSingle();

        if (selectError) {
          console.error('Error verifying profile:', selectError);
          toast.error('Failed to verify profile');
          return false;
        }

        // Profile exists
        if (profile) {
          return true;
        }
      }

      // Any other error
      console.error('Error creating/verifying profile:', insertError);
      toast.error('Failed to create/verify profile');
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