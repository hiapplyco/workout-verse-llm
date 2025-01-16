import { Workout } from "@/types/workout";

export const initialWorkouts: Workout[] = [
  {
    id: "1",
    day: "Monday",
    warmup: "3 rounds:\n- 1 minute jump rope\n- 10 arm circles each direction\n- 10 air squats\n- 10 push-ups",
    wod: "For Time:\n4 rounds of:\n- 400m run\n- 15 burpees\n- 15 kettlebell swings",
    notes: "Scale burpees to step-ups if needed. Focus on form over speed."
  },
  {
    id: "2",
    day: "Tuesday",
    warmup: "2 rounds:\n- 20 jumping jacks\n- 10 lunges each leg\n- 10 mountain climbers\n- 10 shoulder rolls",
    wod: "AMRAP in 20 minutes:\n- 5 pull-ups\n- 10 dips\n- 15 box jumps",
    notes: "Use resistance bands for pull-ups if needed. Step-ups instead of box jumps for beginners."
  },
  {
    id: "3",
    day: "Wednesday",
    warmup: "3 rounds:\n- 30 seconds high knees\n- 10 hip circles each direction\n- 10 downward dog to cobra\n- 10 leg swings each side",
    wod: "5 rounds for time:\n- 20 wall balls\n- 15 deadlifts\n- 10 handstand push-ups",
    notes: "Scale handstand push-ups to pike push-ups. Use appropriate weight for wall balls."
  },
  {
    id: "4",
    day: "Thursday",
    warmup: "2 rounds:\n- 1 minute plank hold\n- 15 arm circles each direction\n- 10 cat-cow stretches\n- 10 bodyweight squats",
    wod: "Every 2 minutes for 20 minutes:\n- 10 thrusters\n- Max pull-ups",
    notes: "Record total pull-ups across all rounds. Scale thrusters weight as needed."
  },
  {
    id: "5",
    day: "Friday",
    warmup: "3 rounds:\n- 30 seconds jump rope\n- 10 walking lunges each leg\n- 10 arm circles\n- 10 hip openers",
    wod: "For time:\n- 1000m row\n- 50 kettlebell swings\n- 40 box jumps\n- 30 push-ups\n- 20 pull-ups",
    notes: "Break up the reps as needed. Focus on maintaining good form throughout."
  }
];