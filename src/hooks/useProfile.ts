import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useProfile = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const verifyProfile = async (userId: string) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID is required",
        variant: "destructive",
      });
      return false;
    }

    try {
      setIsLoading(true);

      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select()
        .eq('id', userId)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking profile:', checkError);
        toast({
          title: "Error",
          description: "Failed to verify user profile",
          variant: "destructive",
        });
        return false;
      }

      if (existingProfile) {
        return true;
      }

      const { error: insertError } = await supabase
        .from('profiles')
        .insert([{ id: userId }]);

      if (insertError) {
        if (insertError.code === '23505') { // Duplicate key error
          console.log('Profile already exists (race condition)');
          return true;
        }
        console.error('Error creating profile:', insertError);
        toast({
          title: "Error",
          description: "Failed to create user profile",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: "Profile created successfully",
      });
      return true;

    } catch (error) {
      console.error('Unexpected error:', error);
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