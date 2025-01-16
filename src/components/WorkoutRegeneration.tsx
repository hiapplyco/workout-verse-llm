import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WorkoutRegenerationForm } from "./WorkoutRegenerationForm";
import { WorkoutPreview } from "./WorkoutPreview";
import { useMutation } from "@tanstack/react-query";
import { workoutAgents } from "@/services/workoutAgents";
import { useDebounce } from "@/hooks/useDebounce";
import { Loader2 } from "lucide-react";
import { saveWorkoutHistory, updateWorkoutHistory } from "@/services/workoutMutations";

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
    warmup: string | null;
    wod: string | null;
    notes: string | null;
  }>({
    warmup: null,
    wod: null,
    notes: null
  });

  const regenerateWorkoutMutation = useMutation({
    mutationFn: async (prompt: string) => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
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
        await saveWorkoutHistory(
          workout.id,
          user.id,
          prompt,
          originalWorkout.wod,
          originalWorkout.wod
        );

        const [warmupResponse, wodResponse, notesResponse] = await Promise.all([
          workoutAgents.generateWarmup(originalWorkout, prompt, workout.day),
          workoutAgents.generateWOD(originalWorkout, prompt, workout.day),
          workoutAgents.generateNotes(originalWorkout, prompt, workout.day)
        ]);

        const newWorkout = {
          warmup: warmupResponse.content.replace(/[*_#`]/g, ''),
          wod: wodResponse.content.replace(/[*_#`]/g, ''),
          notes: notesResponse.content.replace(/[*_#`]/g, '')
        };

        console.log('Generated new workout content:', newWorkout);

        await updateWorkoutHistory(workout.id, user.id, newWorkout.wod);

        return newWorkout;
      } catch (error) {
        setWorkoutContent({
          warmup: null,
          wod: null,
          notes: null
        });
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('Setting workout content with:', data);
      setWorkoutContent(data);
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

  const handleApplyChanges = (key: string, value: string) => {
    onChange(key, value);
    setWorkoutContent(prev => ({
      ...prev,
      [key]: null
    }));
    toast.success(`${key.charAt(0).toUpperCase() + key.slice(1)} updated successfully!`);
  };

  return (
    <div className="space-y-4">
      <WorkoutRegenerationForm
        day={workout.day}
        userPrompt={userPrompt}
        isRegenerating={regenerateWorkoutMutation.isPending}
        onPromptChange={setUserPrompt}
        onRegenerate={handleRegenerate}
      />

      <WorkoutPreview
        type="warmup"
        content={workoutContent.warmup}
        onApply={(value) => handleApplyChanges("warmup", value)}
      />

      <WorkoutPreview
        type="wod"
        content={workoutContent.wod}
        onApply={(value) => handleApplyChanges("wod", value)}
      />

      <WorkoutPreview
        type="notes"
        content={workoutContent.notes}
        onApply={(value) => handleApplyChanges("notes", value)}
      />

      {regenerateWorkoutMutation.isPending && (
        <div className="flex items-center justify-center space-x-2 py-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Generating new workout content...</span>
        </div>
      )}
    </div>
  );
};