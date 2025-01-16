import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WorkoutRegenerationForm } from "./WorkoutRegenerationForm";
import { useMutation } from "@tanstack/react-query";

interface WorkoutRegenerationProps {
  workout: {
    id: string;
    day: string;
    warm_up: string;
    wod: string;
    notes: string;
  };
  onChange: (key: string, value: string) => void;
}

interface RegenerateWorkoutResponse {
  warm_up: string;
  wod: string;
  notes: string;
}

export const WorkoutRegeneration = ({ workout, onChange }: WorkoutRegenerationProps) => {
  const [userPrompt, setUserPrompt] = useState("");

  const regenerateWorkoutMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Authentication error:', authError);
        throw new Error('You must be logged in to modify workouts');
      }

      console.log('Starting workout regeneration for:', workout.day);
      console.log('User prompt:', prompt);

      // Store original workout state
      const originalWorkout = {
        warm_up: workout.warm_up,
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
            previous_wod: originalWorkout.wod,
            new_wod: originalWorkout.wod,
          });

        if (historyError) throw historyError;

        // Clear fields before regeneration
        Object.keys(originalWorkout).forEach(key => 
          onChange(key, "")
        );

        // Get regenerated workout from Gemini
        const { data, error } = await supabase.functions.invoke<RegenerateWorkoutResponse>('regenerate-workout', {
          body: {
            currentWorkout: originalWorkout,
            userPrompt: prompt,
            day: workout.day
          }
        });

        if (error) throw error;
        if (!data) throw new Error('No data received from regenerate-workout');

        // Validate response structure
        const isValidWorkoutResponse = (response: any): response is RegenerateWorkoutResponse => {
          return response && 
                 typeof response.warm_up === 'string' && 
                 typeof response.wod === 'string' && 
                 typeof response.notes === 'string';
        };

        if (!isValidWorkoutResponse(data)) {
          throw new Error('Invalid workout data structure received');
        }

        // Update workout history with new WOD
        const { error: updateHistoryError } = await supabase
          .from('workout_history')
          .update({ new_wod: data.wod })
          .eq('workout_id', workout.id)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (updateHistoryError) throw updateHistoryError;

        return data;
      } catch (error) {
        // Restore original values on error
        Object.entries(originalWorkout).forEach(([key, value]) => 
          onChange(key, value)
        );
        throw error;
      }
    },
    onSuccess: (data) => {
      // Update all workout fields with new data
      Object.entries(data).forEach(([key, value]) => 
        onChange(key, value)
      );
      
      setUserPrompt("");
      toast.success(`${workout.day}'s workout updated successfully!`);
    },
    onError: (error: Error) => {
      console.error('Error regenerating workout:', error);
      toast.error(error.message || `Failed to update ${workout.day}'s workout. Please try again.`);
    }
  });

  const handleRegenerate = async () => {
    if (!userPrompt.trim()) {
      toast.error("Please enter how you'd like to modify the workout");
      return;
    }

    regenerateWorkoutMutation.mutate(userPrompt);
  };

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