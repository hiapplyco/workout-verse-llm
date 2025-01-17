import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { WeeklyPromptForm } from "@/components/WeeklyPromptForm";
import { WorkoutList } from "@/components/WorkoutList";
import { Welcome } from "@/components/Welcome";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useProfile } from "@/hooks/useProfile";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);
  const { verifyProfile } = useProfile();
  const {
    workouts,
    weeklyPrompt,
    isGenerating,
    setWeeklyPrompt,
    handleChange,
    generateWeeklyWorkouts,
    fetchWorkouts,
  } = useWorkouts();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        console.error('Auth error:', authError);
        toast.error('Authentication error. Please sign in again.');
        navigate("/auth");
        return;
      }

      if (!session?.user) {
        console.log('No session found, redirecting to auth');
        navigate("/auth");
        return;
      }

      // Verify profile first
      const profileVerified = await verifyProfile(session.user.id);
      if (!profileVerified) {
        console.error('Profile verification failed');
        toast.error('Error setting up user profile');
        return;
      }

      // Only fetch workouts if profile is verified
      await fetchWorkouts(session.user.id);
    };

    checkUser();
  }, [navigate, fetchWorkouts, verifyProfile]);

  // Add auth state change listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        navigate('/auth');
      } else if (!session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSpeakPlan = async (workout: {
    day: string;
    warmup: string;
    wod: string;
    notes: string;
  }) => {
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
        {workouts.length === 0 ? (
          <Welcome />
        ) : (
          <WorkoutList
            workouts={workouts}
            onWorkoutChange={handleChange}
            onWorkoutSpeak={handleSpeakPlan}
          />
        )}
        <audio ref={audioRef} hidden />
      </main>
    </div>
  );
};

export default Index;