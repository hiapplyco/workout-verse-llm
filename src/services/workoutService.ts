import { supabase } from "@/integrations/supabase/client";

interface RegenerateWorkoutResponse {
  warmup: string;
  wod: string;
  notes: string;
}

export const workoutService = {
  async regenerateWorkout(currentWorkout: {
    warmup: string;
    wod: string;
    notes: string;
  }, userPrompt: string, day: string): Promise<RegenerateWorkoutResponse> {
    console.log('Regenerating workout with prompt:', userPrompt);
    
    const { data, error } = await supabase.functions.invoke<RegenerateWorkoutResponse>('regenerate-workout', {
      body: {
        currentWorkout,
        userPrompt,
        day
      }
    });

    if (error) {
      console.error('Error regenerating workout:', error);
      throw error;
    }

    if (!data) {
      throw new Error('No data received from regenerate-workout');
    }

    return data;
  }
};