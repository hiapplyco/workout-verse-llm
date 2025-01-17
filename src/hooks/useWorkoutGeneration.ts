import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Workout } from "@/types/workout";

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const createWeeklyPrompt = (weeklyPrompt: string) => `
You are an expert CrossFit coach creating a comprehensive Monday-Friday workout program.

User's request: ${weeklyPrompt}

Create a detailed 5-day workout plan following these principles:
1. Progressive Overload: Gradually increase intensity across the week
2. Movement Pattern Balance: Include pushing, pulling, squatting, hinging, and core work
3. Energy System Development: Mix cardio, strength, and skill work
4. Recovery Consideration: Alternate body parts and intensity levels

For each day, provide:
1. Warmup (10-15 minutes):
   - Movement preparation specific to the day's workout
   - Mobility work for key joints involved
   - Progressive intensity buildup

2. WOD (Workout of the Day):
   - Clear structure (AMRAP, For Time, EMOM, etc.)
   - Specific rep schemes and weights
   - Work-to-rest ratios
   - Target time domain

3. Coaching Notes:
   - Detailed movement standards
   - Scaling options for different fitness levels
   - Strategy recommendations
   - Safety considerations

Return a JSON array with 5 objects, one per weekday, formatted as:
[{
  "day": "Monday",
  "warmup": "detailed warmup plan",
  "wod": "workout details",
  "notes": "coaching notes"
}]

Ensure all text is clear, concise, and free of markdown formatting.
`;

export const useWorkoutGeneration = (setWorkouts: (workouts: Workout[]) => void) => {
  const [weeklyPrompt, setWeeklyPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateWeeklyWorkouts = async () => {
    if (!weeklyPrompt.trim()) {
      toast.error("Please enter how you'd like to customize the weekly workouts");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error('You must be logged in to generate workouts');
        return;
      }

      console.log('Generating workouts for user:', session.user.id);
      setIsGenerating(true);
      
      const { data, error } = await supabase.functions.invoke('generate-weekly-workouts', {
        body: { weeklyPrompt: createWeeklyPrompt(weeklyPrompt) }
      });

      if (error) {
        console.error('Error generating workouts:', error);
        throw error;
      }

      if (Array.isArray(data) && data.length === 5) {
        const workoutsToInsert = data.map((workout, index) => ({
          id: crypto.randomUUID(),
          day: WEEKDAYS[index],
          warmup: workout.warmup,
          wod: workout.wod,
          notes: workout.notes,
          user_id: session.user.id,
        }));

        console.log('Inserting workouts:', workoutsToInsert);

        const { error: upsertError } = await supabase
          .from('workouts')
          .upsert(workoutsToInsert);

        if (upsertError) {
          console.error('Error upserting workouts:', upsertError);
          throw upsertError;
        }

        setWorkouts(workoutsToInsert);
        setWeeklyPrompt("");
        toast.success("Weekly workout plan generated successfully!");
      } else {
        throw new Error('Invalid response format from generate-weekly-workouts');
      }
    } catch (error) {
      console.error('Error generating weekly workouts:', error);
      toast.error("Failed to generate weekly workouts. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    weeklyPrompt,
    isGenerating,
    setWeeklyPrompt,
    generateWeeklyWorkouts,
  };
};