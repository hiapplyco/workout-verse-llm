import WorkoutCard from "@/components/WorkoutCard";
import { Workout } from "@/types/workout";

interface WorkoutListProps {
  workouts: Workout[];
  onWorkoutChange: (index: number, key: string, value: string) => void;
  onWorkoutSpeak: (workout: Workout) => void;
}

export const WorkoutList = ({ workouts, onWorkoutChange, onWorkoutSpeak }: WorkoutListProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto">
      {workouts.map((workout, index) => (
        <div key={workout.id} className="h-fit">
          <WorkoutCard
            workout={workout}
            onChange={(key, value) => onWorkoutChange(index, key, value)}
            onSpeak={() => onWorkoutSpeak(workout)}
          />
        </div>
      ))}
    </div>
  );
};