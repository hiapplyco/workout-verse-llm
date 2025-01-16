import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { initialWorkouts } from "@/data/initialWorkouts";
import { Navigation } from "@/components/Navigation";
import { WeeklyPromptForm } from "@/components/WeeklyPromptForm";
import { WorkoutList } from "@/components/WorkoutList";
import type { Workout } from "@/types/workout";

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const Index = () => {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [weeklyPrompt, setWeeklyPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const sortWorkouts = (workoutsToSort: Workout[]) => {
    return workoutsToSort.sort((a, b) => {
      const dayA = WEEKDAYS.indexOf(a.day);
      const dayB = WEEKDAYS.indexOf(b.day);
      return dayA - dayB;
    });
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        navigate("/auth");
        return;
      }

      const { data: existingWorkouts, error: fetchError } = await supabase
        .from('workouts')
        .select('id, day, warmup, wod, notes')
        .eq('user_id', user.id)
        .in('day', WEEKDAYS)
        .order('created_at', { ascending: false })
        .limit(5);

      if (fetchError) {
        console.error('Error fetching workouts:', fetchError);
        toast.error('Failed to fetch workouts');
        return;
      }

      if (!existingWorkouts?.length) {
        console.log('No existing workouts found, inserting initial workouts');
        const workoutsToInsert = initialWorkouts.map((workout, index) => ({
          ...workout,
          day: WEEKDAYS[index],
          user_id: user.id,
        }));

        const { error: insertError } = await supabase
          .from('workouts')
          .insert(workoutsToInsert);

        if (insertError) {
          console.error('Error inserting initial workouts:', insertError);
          toast.error('Failed to initialize workouts');
          return;
        }

        setWorkouts(sortWorkouts(initialWorkouts));
        toast.success('Initial workouts created successfully!');
      } else {
        console.log('Existing workouts found:', existingWorkouts);
        setWorkouts(sortWorkouts(existingWorkouts as Workout[]));
      }
    };

    checkUser();
  }, [navigate]);

  const handleChange = async (index: number, key: string, value: string) => {
    const newWorkouts = [...workouts];
    newWorkouts[index] = { ...newWorkouts[index], [key]: value };
    setWorkouts(newWorkouts);

    const { error } = await supabase
      .from('workouts')
      .update({ [key]: value })
      .eq('id', workouts[index].id);

    if (error) {
      console.error('Error updating workout:', error);
      toast.error('Failed to save workout changes');
    }
  };

  const handleSpeakPlan = async (workout: Workout) => {
    const speechText = `
      ${workout.day}.
      Warm Up: ${workout.warmup}.
      Workout Of the Day: ${workout.wod}.
      Notes: ${workout.notes}.
    `;

    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: speechText }
      });

      if (error) throw error;

      if (data?.audioContent && audioRef.current) {
        audioRef.current.src = `data:audio/mp3;base64,${data.audioContent}`;
        await audioRef.current.play();
      }
    } catch (error) {
      console.error("Error calling text-to-speech:", error);
    }
  };

  const generateWeeklyWorkouts = async () => {
    if (!weeklyPrompt.trim()) {
      toast.error("Please enter how you'd like to customize the weekly workouts");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-weekly-workouts', {
        body: { weeklyPrompt }
      });

      if (error) throw error;

      if (Array.isArray(data) && data.length === 5) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const workoutsToUpdate = data.map((workout, index) => ({
          ...workout,
          day: WEEKDAYS[index],
          user_id: user.id,
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

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="container py-8">
        <WeeklyPromptForm
          weeklyPrompt={weeklyPrompt}
          isGenerating={isGenerating}
          onPromptChange={setWeeklyPrompt}
          onGenerate={generateWeeklyWorkouts}
        />
        <WorkoutList
          workouts={workouts}
          onWorkoutChange={handleChange}
          onWorkoutSpeak={handleSpeakPlan}
        />
        <audio ref={audioRef} hidden />
      </main>
    </div>
  );
};

export default Index;