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

      // Clear the existing workout fields immediately
      onChange("warmUp", "");
      onChange("wod", "");
      onChange("notes", "");

      const requestBody = {
        warmUp: workout.warmUp,
        wod: workout.wod,
        notes: workout.notes,
        userPrompt: prompt,
        day: workout.day
      };
      console.log('Sending request to regenerate-workout:', requestBody);

      const { data, error } = await supabase.functions.invoke<RegenerateWorkoutResponse>('regenerate-workout', {
        body: requestBody
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
      return data;
    },
    onSuccess: async (data) => {
      // Update workout fields with new data
      onChange("warmUp", data.warmUp);
      onChange("wod", data.wod);
      onChange("notes", data.notes);
      
      // Save workout history
      const historyResult = await saveWorkoutHistory({
        workoutId: workout.id,
        userPrompt,
        previousWod: workout.wod,
        newWod: data.wod,
      });

      if (!historyResult) {
        console.warn('Failed to save workout history');
      }

      setUserPrompt("");
      toast.success(`${workout.day}'s workout updated successfully!`);
    },
    onError: (error) => {
      // Restore the original workout data if there's an error
      onChange("warmUp", workout.warmUp);
      onChange("wod", workout.wod);
      onChange("notes", workout.notes);
      
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