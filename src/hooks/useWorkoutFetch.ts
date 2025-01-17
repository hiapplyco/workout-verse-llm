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

  const verifyProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error checking profile existence:', error);
        return false;
      }

      if (!profile) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ id: userId });

        if (insertError) {
          console.error('Error creating profile:', insertError);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Error in profile verification:', error);
      return false;
    }
  };

  const fetchWorkouts = async (userId: string) => {
    console.log('Starting workout fetch for user:', userId);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('No valid session found during workout fetch');
        toast.error('Please sign in to view workouts');
        return;
      }

      console.log('Session verified, proceeding with profile verification');
      const profileExists = await verifyProfile(userId);
      
      if (!profileExists) {
        console.error('Profile verification failed for user:', userId);
        toast.error('Unable to verify user profile');
        return;
      }

      console.log('Profile verified, fetching workouts');
      const { data: existingWorkouts, error: fetchError } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .in('day', WEEKDAYS)
        .order('created_at', { ascending: false });

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