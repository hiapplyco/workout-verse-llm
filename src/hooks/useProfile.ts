import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useDebounce } from "./useDebounce";

export const useProfile = () => {
  const [isLoading, setIsLoading] = useState(false);

  const debouncedEnsureProfile = useDebounce(async (userId: string): Promise<boolean> => {
    if (!userId) {
      console.error('No userId provided');
      return false;
    }

    try {
      setIsLoading(true);
      
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        console.error('No valid session');
        return false;
      }

      // Check if profile exists
      const { data: existingProfile, error: selectError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        console.error('Error checking profile:', selectError);
        return false;
      }

      if (!existingProfile) {
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
      }

      return true;
    } catch (error) {
      console.error('Error in ensureProfile:', error);
      toast.error('Failed to verify user profile');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, 500);

  return {
    isLoading,
    ensureProfile: debouncedEnsureProfile,
  };
};