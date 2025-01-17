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
      console.log('Checking user session...');
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      console.log('Session check result:', {
        session: session ? 'Present' : 'None',
        error: authError || 'None'
      });
      
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

      console.log('User authenticated:', {
        id: session.user.id,
        email: session.user.email,
        lastSignIn: session.user.last_sign_in_at
      });

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

  // Add auth state change listener with logging
  useEffect(() => {
    console.log('Setting up auth state change listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', { event, userId: session?.user?.id });
      
      if (event === 'SIGNED_OUT') {
        console.log('User signed out, redirecting to auth');
        navigate('/auth');
      } else if (!session) {
        console.log('No session found, redirecting to auth');
        navigate('/auth');
      }
    });

    return () => {
      console.log('Cleaning up auth state change listener');
      subscription.unsubscribe();
    };
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