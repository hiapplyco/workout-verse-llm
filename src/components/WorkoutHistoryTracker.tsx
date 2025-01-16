import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WorkoutHistoryTrackerProps {
  workoutId: string;
  userPrompt: string;
  previousWod: string;
  newWod: string;
}

export const saveWorkoutHistory = async ({
  workoutId,
  userPrompt,
  previousWod,
  newWod,
}: WorkoutHistoryTrackerProps) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      console.log('Saving workout history for user:', user.id);
      console.log('Workout ID:', workoutId); // Add this log
      
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(workoutId)) {
        console.error('Invalid UUID format for workout_id:', workoutId);
        toast.error('Invalid workout ID format');
        return false;
      }

      const { error: historyError } = await supabase
        .from('workout_history')
        .insert({
          workout_id: workoutId,
          user_id: user.id,
          prompt: userPrompt,
          previous_wod: previousWod,
          new_wod: newWod
        });

      if (historyError) {
        console.error('Error saving workout history:', historyError);
        toast.error('Failed to save workout history');
        return false;
      }
      
      console.log('Successfully saved workout history');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error saving workout history:', error);
    return false;
  }
};