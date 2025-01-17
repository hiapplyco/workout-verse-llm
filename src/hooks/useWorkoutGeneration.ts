import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Workout } from "@/types/workout";

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const createWeeklyPrompt = (weeklyPrompt: string) => `
You are an expert CrossFit coach creating a comprehensive Monday-Friday workout program.
User's request: ${weeklyPrompt}

Create a detailed 5-day workout plan incorporating these periodization principles:

1. Progressive Overload:
   - Strategic variation of volume and intensity across the week
   - Planned deload periods to prevent overtraining
   - Concurrent development of strength and conditioning

2. Training Variables Balance:
   - Alternate between high-volume/low-intensity and low-volume/high-intensity days
   - Include pushing, pulling, squatting, hinging, and core work
   - Balance skill work, strength development, and metabolic conditioning

3. Energy System Development:
   - Structured variation between aerobic and anaerobic workouts
   - Strategic placement of strength sessions relative to conditioning work
   - Intentional work-to-rest ratios based on desired adaptation

4. Recovery Integration:
   - Alternate body parts and movement patterns
   - Include active recovery elements
   - Account for cumulative fatigue throughout the week

For each day, provide:

1. Warmup (10-15 minutes):
   - Movement preparation specific to the day's training focus
   - Targeted mobility work for primary movement patterns
   - Progressive intensity buildup
   - Skill practice for complex movements

2. WOD (Workout of the Day):
   - Clear structure (AMRAP, For Time, EMOM, etc.)
   - Specific rep schemes and weights with % of 1RM where applicable
   - Precise work-to-rest ratios
   - Target time domain and intended stimulus
   - Primary and secondary movement patterns addressed

3. Coaching Notes:
   - Detailed movement standards
   - Scaling options for different fitness levels
   - Strategy recommendations
   - Safety considerations
   - Recovery guidelines
   - Intended training effect within the weekly cycle

Return a JSON array with 5 objects, one per weekday, formatted as:
[{
  "day": "Monday",
  "warmup": "detailed warmup plan",
  "wod": "workout details",
  "notes": "coaching notes"
}]

Consider these periodization factors when programming:
- Each day's workout should have a clear primary focus while maintaining GPP
- Include strategic deload elements to prevent overtraining
- Account for the cumulative effect of workouts throughout the week
- Balance the development of different physical qualities (strength, endurance, skill)
- Incorporate targeted skill work to address common weaknesses
- Ensure proper placement of high-intensity sessions relative to strength work

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
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        toast.error('Authentication error. Please sign in again.');
        return;
      }

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

      if (!Array.isArray(data) || data.length !== 5) {
        throw new Error('Invalid response format from generate-weekly-workouts');
      }

      // First, delete existing workouts for the user
      const { error: deleteError } = await supabase
        .from('workouts')
        .delete()
        .eq('user_id', session.user.id);

      if (deleteError) {
        console.error('Error deleting existing workouts:', deleteError);
        throw deleteError;
      }

      const workoutsToInsert = data.map((workout, index) => ({
        id: crypto.randomUUID(),
        day: WEEKDAYS[index],
        warmup: workout.warmup,
        wod: workout.wod,
        notes: workout.notes,
        user_id: session.user.id,
      }));

      console.log('Inserting workouts:', workoutsToInsert);

      const { error: insertError } = await supabase
        .from('workouts')
        .insert(workoutsToInsert);

      if (insertError) {
        console.error('Error inserting workouts:', insertError);
        throw insertError;
      }

      // Fetch the newly inserted workouts to ensure we have the correct data
      const { data: insertedWorkouts, error: fetchError } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching inserted workouts:', fetchError);
        throw fetchError;
      }

      setWorkouts(insertedWorkouts);
      setWeeklyPrompt("");
      toast.success("Weekly workout plan generated successfully!");
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