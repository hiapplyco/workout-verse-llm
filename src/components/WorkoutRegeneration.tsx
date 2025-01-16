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
      const { data, error } = await supabase.functions.invoke('regenerate-workout', {
        body: {
          warmUp: workout.warmUp,
          wod: workout.wod,
          notes: workout.notes,
          userPrompt: userPrompt,
          day: workout.day
        }
      });

      console.log('Received response from regenerate-workout:', data);

      if (error) {
        console.error('Error from regenerate-workout:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data received from regenerate-workout');
      }

      // Validate the response structure
      const { warmUp, wod, notes } = data;
      
      if (typeof warmUp !== 'string' || typeof wod !== 'string' || typeof notes !== 'string') {
        console.error('Invalid data structure received:', data);
        throw new Error('Invalid workout data structure received');
      }

      // Update all fields with Gemini's response
      onChange("warmUp", warmUp);
      onChange("wod", wod);
      onChange("notes", notes);
      
      // Save workout history
      await saveWorkoutHistory({
        workoutId: workout.id,
        userPrompt,
        previousWod: workout.wod,
        newWod: wod,
      });

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