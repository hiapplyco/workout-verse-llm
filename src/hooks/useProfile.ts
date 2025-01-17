import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProfile = () => {
  const verifyProfile = async (userId: string) => {
    try {
      console.log('Starting profile verification for user:', userId);
      
      // First verify the session is valid
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        return false;
      }
      
      if (session?.user) {
        console.log('Session verified:', {
          id: session.user.id,
          email: session.user.email
        });

        // Check if profile exists
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) {
          if (profileError.code === 'PGRST116') {
            console.log('Profile not found, creating new profile');
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({ id: userId });

            if (insertError) {
              console.error('Error creating profile:', insertError);
              toast.error('Failed to create user profile');
              return false;
            }

            console.log('Profile created successfully');
            return true;
          }

          console.error('Error checking profile:', profileError);
          return false;
        }

        if (profile) {
          console.log('Profile found:', profile);
          return true;
        }

        return false;
      }

      return false;
    } catch (error) {
      console.error('Error in verifyProfile:', error);
      return false;
    }
  };

  return {
    verifyProfile
  };
};