import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import type { Workout } from "@/types/workout";

export const useWorkoutFetch = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchWorkouts = async (userId: string): Promise<boolean> => {
    console.log('Starting workout fetch for user:', userId);
    setIsLoading(true);

    try {
      // First verify the profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Profile fetch failed:', profileError);
        toast.error('Failed to verify user profile');
        setIsLoading(false);
        return false;
      }

      if (!profile) {
        console.log('No profile found for user');
        setWorkouts([]);
        setIsLoading(false);
        return false;
      }

      console.log('Session verified, fetching workouts');
      
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (workoutError) {
        console.error('Failed to fetch workouts:', workoutError);
        toast.error('Failed to fetch workouts');
        setIsLoading(false);
        return false;
      }

      if (!workoutData?.length) {
        console.log('No existing workouts found for new user');
        setWorkouts([]);
        setIsLoading(false);
        return true;
      }

      setWorkouts(workoutData as Workout[]);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Unexpected error in fetchWorkouts:', error);
      toast.error('An unexpected error occurred');
      setIsLoading(false);
      return false;
    }
  };

  return {
    workouts,
    isLoading,
    fetchWorkouts,
  };
};