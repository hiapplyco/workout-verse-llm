import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WorkoutRegenerationForm } from "./WorkoutRegenerationForm";
import { useMutation } from "@tanstack/react-query";
import { workoutService } from "@/services/workoutService";
import { useDebounce } from "@/hooks/useDebounce";

interface WorkoutRegenerationProps {
  workout: {
    id: string;
    day: string;
    warmup: string;
    wod: string;
    notes: string;
  };
  onChange: (key: string, value: string) => void;
}

export const WorkoutRegeneration = ({ workout, onChange }: WorkoutRegenerationProps) => {
  const [userPrompt, setUserPrompt] = useState("");
  const [workoutContent, setWorkoutContent] = useState<{
    warmup: string;
    wod: string;
    notes: string;
  } | null>(null);

  const regenerateWorkoutMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Authentication error:', authError);
        throw new Error('You must be logged in to modify workouts');
      }

      console.log('Starting workout regeneration for:', workout.day);
      console.log('User prompt:', prompt);

      const originalWorkout = {
        warmup: workout.warmup,
        wod: workout.wod,
        notes: workout.notes
      };

      try {
        // Save initial workout history
        const { error: historyError } = await supabase
          .from('workout_history')
          .insert({
            workout_id: workout.id,
            user_id: user.id,
            prompt: prompt,
            previouswod: originalWorkout.wod,
            newwod: originalWorkout.wod,
          });

        if (historyError) throw historyError;

        // Set loading state by keeping original content
        setWorkoutContent(originalWorkout);

        // Get regenerated workout from service
        const data = await workoutService.regenerateWorkout(originalWorkout, prompt, workout.day);
        console.log('Received regenerated workout:', data);

        // Update workout history with new WOD
        const { error: updateHistoryError } = await supabase
          .from('workout_history')
          .update({ newwod: data.wod })
          .eq('workout_id', workout.id)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (updateHistoryError) throw updateHistoryError;

        return data;
      } catch (error) {
        // Reset workout content on error
        setWorkoutContent(null);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Updating workout fields with:', data);
      
      // Update all workout fields with new data
      if (data.warmup) onChange("warmup", data.warmup);
      if (data.wod) onChange("wod", data.wod);
      if (data.notes) onChange("notes", data.notes);
      
      // Clear workout content state
      setWorkoutContent(null);
      setUserPrompt("");
      
      toast.success(`${workout.day}'s workout updated successfully!`);
    },
    onError: (error: Error) => {
      console.error('Error regenerating workout:', error);
      toast.error(error.message || `Failed to update ${workout.day}'s workout. Please try again.`);
    }
  });

  const debouncedRegenerate = useDebounce((prompt: string) => {
    regenerateWorkoutMutation.mutate(prompt);
  }, 500);

  const handleRegenerate = async () => {
    if (!userPrompt.trim()) {
      toast.error("Please enter how you'd like to modify the workout");
      return;
    }

    debouncedRegenerate(userPrompt);
  };

  // Use workout content if available, otherwise use actual workout data
  const displayData = workoutContent || workout;

  return (
    <WorkoutRegenerationForm
      day={workout.day}
      userPrompt={userPrompt}
      isRegenerating={regenerateWorkoutMutation.isPending}
      onPromptChange={setUserPrompt}
      onRegenerate={handleRegenerate}
    />
  );
};
