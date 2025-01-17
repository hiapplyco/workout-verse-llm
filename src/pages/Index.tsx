import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navigation } from "@/components/Navigation";
import { WeeklyPromptForm } from "@/components/WeeklyPromptForm";
import { WorkoutList } from "@/components/WorkoutList";
import { Welcome } from "@/components/Welcome";
import { useWorkouts } from "@/hooks/useWorkouts";
import { toast } from "sonner";
import { TestSupabase } from "@/components/TestSupabase";

const Index = () => {
  const navigate = useNavigate();
  const audioRef = useRef<HTMLAudioElement>(null);
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
    let isMounted = true;

    const checkUserSession = async () => {
      console.log('Checking user session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      console.log('Session check result:', {
        session: session ? 'Present' : 'None',
        error: sessionError || 'None'
      });
      
      if (sessionError) {
        console.error('Auth error:', sessionError);
        toast.error('Authentication error. Please sign in again.');
        navigate("/auth");
        return;
      }

      if (!session?.user) {
        console.log('No session found, redirecting to auth');
        navigate("/auth");
        return;
      }

      console.log('User authenticated:', {
        id: session.user.id,
        email: session.user.email,
        lastSignIn: session.user.last_sign_in_at
      });

      // Fetch workouts for authenticated user
      if (isMounted) {
        await fetchWorkouts(session.user.id);
      }
    };

    // Initial session check
    checkUserSession();

    // Set up auth state change listener
    console.log('Setting up auth state change listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', { event, userId: session?.user?.id });
      
      if (isMounted) {
        if (event === 'SIGNED_IN' && session) {
          console.log('User signed in, fetching workouts');
          checkUserSession();
        } else if (event === 'SIGNED_OUT' || !session) {
          console.log('User signed out or no session, redirecting to auth');
          navigate('/auth');
        }
      }
    });

    return () => {
      console.log('Cleaning up auth state change listener');
      subscription.unsubscribe();
      isMounted = false;
    };
  }, [navigate, fetchWorkouts]);

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
        <TestSupabase />
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