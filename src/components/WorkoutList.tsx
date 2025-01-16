import WorkoutCard from "@/components/WorkoutCard";
import { Workout } from "@/types/workout";

interface WorkoutListProps {
  workouts: Workout[];
  onWorkoutChange: (index: number, key: string, value: string) => void;
  onWorkoutSpeak: (workout: Workout) => void;
}

export const WorkoutList = ({ workouts, onWorkoutChange, onWorkoutSpeak }: WorkoutListProps) => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {workouts.map((workout, index) => (
        <WorkoutCard
          key={workout.id}
          workout={workout}
          onChange={(key, value) => onWorkoutChange(index, key, value)}
          onSpeak={() => onWorkoutSpeak(workout)}
        />
      ))}
    </div>
  );
};