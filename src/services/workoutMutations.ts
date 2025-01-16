import { supabase } from "@/integrations/supabase/client";

export const saveWorkoutHistory = async (
  workoutId: string,
  userId: string,
  prompt: string,
  previousWod: string,
  newWod: string
) => {
  const { error } = await supabase
    .from('workout_history')
    .insert({
      workout_id: workoutId,
      user_id: userId,
      prompt,
      previouswod: previousWod,
      newwod: newWod,
    });

  if (error) throw error;
};

export const updateWorkoutHistory = async (
  workoutId: string,
  userId: string,
  newWod: string
) => {
  const { error } = await supabase
    .from('workout_history')
    .update({ newwod: newWod })
    .eq('workout_id', workoutId)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) throw error;
};