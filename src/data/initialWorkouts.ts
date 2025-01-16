import { addDays, format } from "date-fns";

const today = new Date();
const saturday = new Date(today.setDate(today.getDate() - today.getDay() + 6)); // First get to Saturday

export const initialWorkouts = [
  {
    id: crypto.randomUUID(),
    day: `Saturday (${format(saturday, 'MMM d')})`,
    warmup: "3 rounds of: 10 air squats, 10 sit-ups, 10 push-ups",
    wod: "For Time: 21-15-9 Thrusters (95/65 lb), Pull-Ups",
    notes: "Focus on keeping elbows high during thrusters."
  },
  {
    id: crypto.randomUUID(),
    day: `Sunday (${format(addDays(saturday, 1), 'MMM d')})`,
    warmup: "2 rounds of: 200m run, 10 walking lunges",
    wod: "AMRAP 12: 10 Kettlebell Swings, 10 Box Jumps, 10 Push-Ups",
    notes: "Aim for consistent pacing."
  }
];