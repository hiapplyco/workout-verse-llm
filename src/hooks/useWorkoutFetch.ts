import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Workout } from "@/types/workout";

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const useWorkoutFetch = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [hasShownWelcomeToast, setHasShownWelcomeToast] = useState(false);
  const [hasShownProfileErrorToast, setHasShownProfileErrorToast] = useState(false);

  const sortWorkouts = (workoutsToSort: Workout[]) => {
    return workoutsToSort.sort((a, b) => {
      const dayA = WEEKDAYS.indexOf(a.day);
      const dayB = WEEKDAYS.indexOf(b.day);
      return dayA - dayB;
    });
  };

  const fetchWorkouts = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('No valid session found');
        toast.error('Please sign in to view workouts');
        return;
      }

      // First get the user's profile ID
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        if (!hasShownProfileErrorToast) {
          toast.error('Failed to fetch user profile');
          setHasShownProfileErrorToast(true);
        }
        return;
      }

      if (!profileData) {
        console.error('No profile found for user');
        if (!hasShownProfileErrorToast) {
          toast.error('Profile not found. Please try signing out and back in.');
          setHasShownProfileErrorToast(true);
        }
        return;
      }

      const { data: existingWorkouts, error: fetchError } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', profileData.id)
        .in('day', WEEKDAYS)
        .order('created_at', { ascending: false })
        .limit(5);

      if (fetchError) {
        console.error('Error fetching workouts:', fetchError);
        toast.error('Failed to fetch workouts');
        return;
      }

      if (!existingWorkouts?.length && !hasShownWelcomeToast) {
        console.log('No existing workouts found');
        toast.info('Welcome! Generate your weekly workout plan using the form above.');
        setHasShownWelcomeToast(true);
      } else if (existingWorkouts?.length) {
        console.log('Existing workouts found:', existingWorkouts);
        setWorkouts(sortWorkouts(existingWorkouts));
      }
    } catch (error) {
      console.error('Error in fetchWorkouts:', error);
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