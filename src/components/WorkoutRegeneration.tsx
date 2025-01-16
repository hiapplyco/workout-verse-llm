import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WorkoutRegenerationForm } from "./WorkoutRegenerationForm";
import { useMutation } from "@tanstack/react-query";
import { workoutAgents } from "@/services/workoutAgents";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "./ui/button";
import { Loader2 } from "lucide-react";

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

        // Generate new content using all three agents concurrently
        const [warmupResponse, wodResponse, notesResponse] = await Promise.all([
          workoutAgents.generateWarmup(originalWorkout, prompt, workout.day),
          workoutAgents.generateWOD(originalWorkout, prompt, workout.day),
          workoutAgents.generateNotes(originalWorkout, prompt, workout.day)
        ]);

        const newWorkout = {
          warmup: warmupResponse.content,
          wod: wodResponse.content,
          notes: notesResponse.content
        };

        console.log('Generated new workout content:', newWorkout);

        // Update workout history with new WOD
        const { error: updateHistoryError } = await supabase
          .from('workout_history')
          .update({ newwod: newWorkout.wod })
          .eq('workout_id', workout.id)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);

        if (updateHistoryError) throw updateHistoryError;

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

      {/* Preview sections */}
      {workoutContent.warmup !== null && (
        <div className="rounded border-2 border-primary bg-background p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase text-secondary">New Warmup</h3>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleApplyChanges("warmup", workoutContent.warmup)}
              >
                Apply Changes
              </Button>
            </div>
          </div>
          <p className="whitespace-pre-wrap font-medium">{workoutContent.warmup}</p>
        </div>
      )}

      {workoutContent.wod !== null && (
        <div className="rounded border-2 border-primary bg-background p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase text-secondary">New WOD</h3>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleApplyChanges("wod", workoutContent.wod)}
              >
                Apply Changes
              </Button>
            </div>
          </div>
          <p className="whitespace-pre-wrap font-medium">{workoutContent.wod}</p>
        </div>
      )}

      {workoutContent.notes !== null && (
        <div className="rounded border-2 border-primary bg-background p-4">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase text-secondary">New Notes</h3>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleApplyChanges("notes", workoutContent.notes)}
              >
                Apply Changes
              </Button>
            </div>
          </div>
          <p className="whitespace-pre-wrap font-medium">{workoutContent.notes}</p>
        </div>
      )}

      {regenerateWorkoutMutation.isPending && (
        <div className="flex items-center justify-center space-x-2 py-4">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Generating new workout content...</span>
        </div>
      )}
    </div>
  );
};