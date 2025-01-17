import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Workout } from "@/types/workout";

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const useWorkoutFetch = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [hasShownWelcomeToast, setHasShownWelcomeToast] = useState(false);

  const sortWorkouts = (workoutsToSort: Workout[]) => {
    return workoutsToSort.sort((a, b) => {
      const dayA = WEEKDAYS.indexOf(a.day);
      const dayB = WEEKDAYS.indexOf(b.day);
      return dayA - dayB;
    });
  };

  const fetchWorkouts = async (userId: string) => {
    console.log('Starting workout fetch for user:', userId);
    
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        toast.error('Authentication error. Please sign in again.');
        return;
      }

      if (!session) {
        console.error('No valid session found during workout fetch');
        toast.error('Please sign in to view workouts');
        return;
      }

      console.log('Session verified, fetching workouts');
      const { data: existingWorkouts, error: fetchError } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .in('day', WEEKDAYS);

      if (fetchError) {
        console.error('Error fetching workouts:', fetchError);
        toast.error('Failed to fetch workouts');
        return;
      }

      if (!existingWorkouts?.length && !hasShownWelcomeToast) {
        console.log('No existing workouts found for new user');
        toast.info('Welcome! Generate your weekly workout plan using the form above.');
        setHasShownWelcomeToast(true);
      } else if (existingWorkouts?.length) {
        console.log('Fetched workouts successfully:', existingWorkouts.length);
        setWorkouts(sortWorkouts(existingWorkouts));
      }
    } catch (error) {
      console.error('Unexpected error in fetchWorkouts:', error);
      toast.error('Failed to fetch workouts. Please try signing in again.');
    }
  };

  return {
    workouts,
    setWorkouts,
    fetchWorkouts,
    sortWorkouts,
  };
};