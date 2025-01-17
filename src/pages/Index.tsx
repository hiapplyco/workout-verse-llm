import { Navigation } from "@/components/Navigation";
import { WeeklyPromptForm } from "@/components/WeeklyPromptForm";
import { WorkoutList } from "@/components/WorkoutList";
import { Welcome } from "@/components/Welcome";
import { useWorkouts } from "@/hooks/useWorkouts";
import { useAuth } from "@/hooks/useAuth";
import { AuthLoading } from "@/components/auth/AuthLoading";

const Index = () => {
  const { session, isLoading: isAuthLoading } = useAuth();
  const {
    workouts,
    weeklyPrompt,
    isGenerating,
    setWeeklyPrompt,
    handleChange,
    generateWeeklyWorkouts,
  } = useWorkouts();

  if (isAuthLoading) {
    return <AuthLoading />;
  }

  if (!session) {
    return null;
  }

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
          />
        )}
      </main>
    </div>
  );
};

export default Index;