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

      // First try to create the profile - if it exists, this will fail
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{ id: userId }]);

      // If there's no error, profile was created successfully
      if (!insertError) {
        toast.success('Profile created successfully');
        return true;
      }

      // If there was an error but it's not a duplicate key error, something went wrong
      if (insertError.code !== '23505') { // PostgreSQL unique violation error code
        console.error('Error creating profile:', insertError);
        toast.error('Failed to create user profile');
        return false;
      }

      // If we got here, the profile already exists (due to duplicate key error)
      // Let's verify we can access it
      const { data: existingProfile, error: selectError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (selectError) {
        console.error('Error verifying existing profile:', selectError);
        toast.error('Failed to verify existing profile');
        return false;
      }

      if (!existingProfile) {
        console.error('Profile not found after duplicate key error');
        toast.error('Failed to verify user profile');
        return false;
      }

      return true;
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