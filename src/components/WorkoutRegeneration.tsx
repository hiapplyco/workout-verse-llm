import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WorkoutRegenerationForm } from "./WorkoutRegenerationForm";
import { useMutation } from "@tanstack/react-query";

interface WorkoutRegenerationProps {
  workout: {
    id: string;
    day: string;
    warmUp: string;
    wod: string;
    notes: string;
  };
  onChange: (key: string, value: string) => void;
}

interface RegenerateWorkoutResponse {
  warmUp: string;
  wod: string;
  notes: string;
}

export const WorkoutRegeneration = ({ workout, onChange }: WorkoutRegenerationProps) => {
  const [userPrompt, setUserPrompt] = useState("");

  const regenerateWorkoutMutation = useMutation({
    mutationFn: async (prompt: string) => {
      // First check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Authentication error:', authError);
        throw new Error('You must be logged in to modify workouts');
      }

      console.log('Starting workout regeneration for:', workout.day);
      console.log('User prompt:', prompt);

      // Store the original values
      const originalWorkout = {
        warmUp: workout.warmUp,
        wod: workout.wod,
        notes: workout.notes
      };

      try {
        // Save workout history before making any changes
        const { error: historyError } = await supabase
          .from('workout_history')
          .insert({
            workout_id: workout.id,
            user_id: user.id,
            prompt: prompt,
            previous_wod: originalWorkout.wod,
            new_wod: originalWorkout.wod, // Will be updated after regeneration
          });

        if (historyError) {
          console.error('Error saving workout history:', historyError);
          throw historyError;
        }

        // Clear the fields immediately
        onChange("warmUp", "");
        onChange("wod", "");
        onChange("notes", "");

        const { data, error } = await supabase.functions.invoke<RegenerateWorkoutResponse>('regenerate-workout', {
          body: {
            warmUp: originalWorkout.warmUp,
            wod: originalWorkout.wod,
            notes: originalWorkout.notes,
            userPrompt: prompt,
            day: workout.day
          }
        });

        console.log('Raw response from regenerate-workout:', data);

        if (error) {
          console.error('Error from regenerate-workout:', error);
          throw error;
        }

        if (!data) {
          console.error('No data received from regenerate-workout');
          throw new Error('No data received from regenerate-workout');
        }

        // Type guard to ensure response structure
        const isValidWorkoutResponse = (response: any): response is RegenerateWorkoutResponse => {
          return (
            typeof response === 'object' &&
            response !== null &&
            typeof response.warmUp === 'string' &&
            typeof response.wod === 'string' &&
            typeof response.notes === 'string'
          );
        };

        if (!isValidWorkoutResponse(data)) {
          console.error('Invalid response structure:', data);
          throw new Error('Invalid workout data structure received');
        }

        console.log('Updating workout with validated data:', data);

        // Update the workout history with the new WOD
        const { error: updateHistoryError } = await supabase
          .from('workout_history')
          .update({ new_wod: data.wod })
          .eq('workout_id', workout.id)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (updateHistoryError) {
          console.error('Error updating workout history:', updateHistoryError);
          throw updateHistoryError;
        }

        return data;
      } catch (error) {
        // Restore original values on error
        onChange("warmUp", originalWorkout.warmUp);
        onChange("wod", originalWorkout.wod);
        onChange("notes", originalWorkout.notes);
        throw error;
      }
    },
    onSuccess: (data) => {
      // Update workout fields with new data
      onChange("warmUp", data.warmUp);
      onChange("wod", data.wod);
      onChange("notes", data.notes);
      
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