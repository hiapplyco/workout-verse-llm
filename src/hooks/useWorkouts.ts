import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Workout } from "@/types/workout";

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export const useWorkouts = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [weeklyPrompt, setWeeklyPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const sortWorkouts = (workoutsToSort: Workout[]) => {
    return workoutsToSort.sort((a, b) => {
      const dayA = WEEKDAYS.indexOf(a.day);
      const dayB = WEEKDAYS.indexOf(b.day);
      return dayA - dayB;
    });
  };

  const fetchWorkouts = async (userId: string) => {
    const { data: existingWorkouts, error: fetchError } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', userId)
      .in('day', WEEKDAYS)
      .order('created_at', { ascending: false })
      .limit(5);

    if (fetchError) {
      console.error('Error fetching workouts:', fetchError);
      toast.error('Failed to fetch workouts');
      return;
    }

    if (!existingWorkouts?.length) {
      console.log('No existing workouts found');
      toast.info('Welcome! Generate your weekly workout plan using the form above.');
    } else {
      console.log('Existing workouts found:', existingWorkouts);
      setWorkouts(sortWorkouts(existingWorkouts));
    }
  };

  const handleChange = async (index: number, key: string, value: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      toast.error('You must be logged in to update workouts');
      return;
    }

    const newWorkouts = [...workouts];
    newWorkouts[index] = { ...newWorkouts[index], [key]: value };
    setWorkouts(newWorkouts);

    const { error } = await supabase
      .from('workouts')
      .update({ [key]: value })
      .eq('id', workouts[index].id)
      .eq('user_id', session.user.id);

    if (error) {
      console.error('Error updating workout:', error);
      toast.error('Failed to save workout changes');
    }
  };

  const generateWeeklyWorkouts = async () => {
    if (!weeklyPrompt.trim()) {
      toast.error("Please enter how you'd like to customize the weekly workouts");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      toast.error('You must be logged in to generate workouts');
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-weekly-workouts', {
        body: { weeklyPrompt }
      });

      if (error) throw error;

      if (Array.isArray(data) && data.length === 5) {
        const workoutsToUpdate = data.map((workout, index) => ({
          ...workout,
          day: WEEKDAYS[index],
          user_id: session.user.id,
        }));

        const { error: updateError } = await supabase
          .from('workouts')
          .upsert(workoutsToUpdate, { onConflict: 'id' });

        if (updateError) throw updateError;

        setWorkouts(sortWorkouts(data));
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
    workouts,
    weeklyPrompt,
    isGenerating,
    setWeeklyPrompt,
    handleChange,
    generateWeeklyWorkouts,
    fetchWorkouts,
  };
};