import { useState } from "react";
import { useWorkoutFetch } from "./useWorkoutFetch";
import { useWorkoutGeneration } from "./useWorkoutGeneration";
import { useWorkoutUpdate } from "./useWorkoutUpdate";
import type { Workout } from "@/types/workout";

export const useWorkouts = () => {
  const [localWorkouts, setLocalWorkouts] = useState<Workout[]>([]);
  const { workouts, isLoading, fetchWorkouts } = useWorkoutFetch();
  const { weeklyPrompt, isGenerating, setWeeklyPrompt, generateWeeklyWorkouts } = useWorkoutGeneration(setLocalWorkouts);
  const { handleChange } = useWorkoutUpdate(localWorkouts, setLocalWorkouts);

  // Keep localWorkouts in sync with fetched workouts
  if (workouts !== localWorkouts) {
    setLocalWorkouts(workouts);
  }

  return {
    workouts: localWorkouts,
    weeklyPrompt,
    isGenerating,
    isLoading,
    setWeeklyPrompt,
    handleChange,
    generateWeeklyWorkouts,
    fetchWorkouts,
  };
};
