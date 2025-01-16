import { useWorkoutFetch } from "./useWorkoutFetch";
import { useWorkoutGeneration } from "./useWorkoutGeneration";
import { useWorkoutUpdate } from "./useWorkoutUpdate";

export const useWorkouts = () => {
  const { workouts, setWorkouts, fetchWorkouts } = useWorkoutFetch();
  const { weeklyPrompt, isGenerating, setWeeklyPrompt, generateWeeklyWorkouts } = useWorkoutGeneration(setWorkouts);
  const { handleChange } = useWorkoutUpdate(workouts, setWorkouts);

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