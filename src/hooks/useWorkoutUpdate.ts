import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Workout } from "@/types/workout";

export const useWorkoutUpdate = (workouts: Workout[], setWorkouts: (workouts: Workout[]) => void) => {
  const handleChange = async (index: number, key: string, value: string) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        toast.error('Authentication error. Please sign in again.');
        return;
      }

      if (!session?.user) {
        toast.error('You must be logged in to update workouts');
        return;
      }

      const newWorkouts = [...workouts];
      newWorkouts[index] = { ...newWorkouts[index], [key]: value };
      setWorkouts(newWorkouts);

      const { error: updateError } = await supabase
        .from('workouts')
        .update({ [key]: value })
        .eq('id', workouts[index].id)
        .eq('user_id', session.user.id)
        .single();

      if (updateError) {
        console.error('Error updating workout:', updateError);
        toast.error('Failed to save workout changes');
      }
    } catch (error) {
      console.error('Error in handleChange:', error);
      toast.error('Failed to update workout');
    }
  };

  return {
    handleChange,
  };
};