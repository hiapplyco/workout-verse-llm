import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WorkoutRegenerationForm } from "./WorkoutRegenerationForm";
import { saveWorkoutHistory } from "./WorkoutHistoryTracker";
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
      console.log('Starting workout regeneration for:', workout.day);
      console.log('User prompt:', prompt);

      // Store the original values
      const originalWorkout = {
        warmUp: workout.warmUp,
        wod: workout.wod,
        notes: workout.notes
      };

      // Clear the fields immediately
      onChange("warmUp", "");
      onChange("wod", "");
      onChange("notes", "");

      try {
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
        return { data, originalWorkout };
      } catch (error) {
        // Restore original values on error
        onChange("warmUp", originalWorkout.warmUp);
        onChange("wod", originalWorkout.wod);
        onChange("notes", originalWorkout.notes);
        throw error;
      }
    },
    onSuccess: async ({ data, originalWorkout }) => {
      // Update workout fields with new data
      onChange("warmUp", data.warmUp);
      onChange("wod", data.wod);
      onChange("notes", data.notes);
      
      try {
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('No authenticated user found');
        }

        // Save workout history
        const { error: historyError } = await supabase
          .from('workout_history')
          .insert({
            workout_id: workout.id,
            user_id: user.id,
            prompt: userPrompt,
            previous_wod: originalWorkout.wod,
            new_wod: data.wod,
          });

        if (historyError) {
          console.error('Error saving workout history:', historyError);
          throw historyError;
        }

        setUserPrompt("");
        toast.success(`${workout.day}'s workout updated successfully!`);
      } catch (error) {
        console.error('Error saving workout history:', error);
        toast.error('Failed to save workout history');
      }
    },
    onError: (error) => {
      console.error('Error regenerating workout:', error);
      toast.error(`Failed to update ${workout.day}'s workout. Please try again.`);
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