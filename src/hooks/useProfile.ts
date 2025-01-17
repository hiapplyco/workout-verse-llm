import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProfile = () => {
  const [isLoading, setIsLoading] = useState(false);

  const ensureProfile = async (userId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const { data: profile, error: selectError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (selectError) {
        console.error('Error checking profile:', selectError);
        toast.error('Failed to verify user profile');
        return false;
      }

      if (!profile) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ id: userId });

        if (insertError) {
          console.error('Error creating profile:', insertError);
          toast.error('Failed to create user profile');
          return false;
        }
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