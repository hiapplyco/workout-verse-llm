import { Navigation } from "@/components/Navigation";
import { WeeklyPromptForm } from "@/components/WeeklyPromptForm";
import { WorkoutList } from "@/components/WorkoutList";
import { Welcome } from "@/components/Welcome";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useAuth } from "@/hooks/useAuth";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { AuthLoading } from "@/components/auth/AuthLoading";
import { Workout } from "@/types/workout";
import { supabase } from "@/integrations/supabase/client";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";

const Index = () => {
  const { session, isLoading: isAuthLoading } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const {
    workouts,
    weeklyPrompt,
    isGenerating,
    setWeeklyPrompt,
    handleChange,
    generateWeeklyWorkouts,
  } = useWorkouts();

  useEffect(() => {
    if (!session && !isAuthLoading) {
      setShowAuthDialog(true);
    } else {
      setShowAuthDialog(false);
    }
  }, [session, isAuthLoading]);

  const handleWorkoutSpeak = async (workout: Workout) => {
    try {
      const speechText = `
        ${workout.day}.
        Warm Up: ${workout.warmup}.
        Workout Of the Day: ${workout.wod}.
        ${workout.notes ? `Notes: ${workout.notes}` : ''}
      `;

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: speechText }
      });

      if (error) throw error;

      if (data?.audioContent && audioRef.current) {
        audioRef.current.src = `data:audio/mp3;base64,${data.audioContent}`;
        await audioRef.current.play();
      }
    } catch (error) {
      console.error("Error generating speech:", error);
      toast.error("Failed to generate speech. Please try again.");
    }
  };

  if (isAuthLoading) {
    return <AuthLoading />;
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <main className="container py-8">
        <AuthDialog 
          isOpen={showAuthDialog} 
          onOpenChange={setShowAuthDialog} 
        />
        {session && (
          <>
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
                onWorkoutSpeak={handleWorkoutSpeak}
              />
            )}
          </>
        )}
        <audio ref={audioRef} hidden />
      </main>
    </div>
  );
};

export default Index;