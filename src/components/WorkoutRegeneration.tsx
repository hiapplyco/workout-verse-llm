import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WorkoutRegenerationForm } from "./WorkoutRegenerationForm";
import { saveWorkoutHistory } from "./WorkoutHistoryTracker";

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

export const WorkoutRegeneration = ({ workout, onChange }: WorkoutRegenerationProps) => {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [userPrompt, setUserPrompt] = useState("");

  const handleRegenerate = async () => {
    if (!userPrompt.trim()) {
      toast.error("Please enter how you'd like to modify the workout");
      return;
    }

    console.log('Starting workout regeneration for:', workout.day);
    console.log('User prompt:', userPrompt);
    
    setIsRegenerating(true);
    try {
      // Prepare and log request data
      const requestBody = {
        warmUp: workout.warmUp,
        wod: workout.wod,
        notes: workout.notes,
        userPrompt: userPrompt,
        day: workout.day
      };
      console.log('Sending request to regenerate-workout:', requestBody);

      const { data: responseData, error: responseError } = await supabase.functions.invoke('regenerate-workout', {
        body: requestBody
      });

      console.log('Raw response from regenerate-workout:', responseData);

      if (responseError) {
        console.error('Error from regenerate-workout:', responseError);
        throw responseError;
      }

      if (!responseData) {
        console.error('No data received from regenerate-workout');
        throw new Error('No data received from regenerate-workout');
      }

      // Type guard to ensure response structure
      const isValidWorkoutResponse = (data: any): data is { warmUp: string; wod: string; notes: string } => {
        return (
          typeof data === 'object' &&
          data !== null &&
          typeof data.warmUp === 'string' &&
          typeof data.wod === 'string' &&
          typeof data.notes === 'string'
        );
      };

      if (!isValidWorkoutResponse(responseData)) {
        console.error('Invalid response structure:', responseData);
        throw new Error('Invalid workout data structure received');
      }

      const { warmUp, wod, notes } = responseData;
      
      console.log('Updating workout with validated data:', { warmUp, wod, notes });

      // Update workout fields
      onChange("warmUp", warmUp);
      onChange("wod", wod);
      onChange("notes", notes);
      
      // Save workout history
      const historyResult = await saveWorkoutHistory({
        workoutId: workout.id,
        userPrompt,
        previousWod: workout.wod,
        newWod: wod,
      });

      if (!historyResult) {
        console.warn('Failed to save workout history');
      }

      setUserPrompt("");
      toast.success(`${workout.day}'s workout updated successfully!`);
    } catch (error) {
      console.error('Error regenerating workout:', error);
      toast.error(`Failed to update ${workout.day}'s workout. Please try again.`);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <WorkoutRegenerationForm
      day={workout.day}
      userPrompt={userPrompt}
      isRegenerating={isRegenerating}
      onPromptChange={setUserPrompt}
      onRegenerate={handleRegenerate}
    />
  );
};