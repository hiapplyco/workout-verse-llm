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
  },
  {
    id: crypto.randomUUID(),
    day: `Monday (${format(addDays(saturday, 2), 'MMM d')})`,
    warmup: "3 rounds of: 10 shoulder pass-throughs, 10 PVC good mornings",
    wod: "5 Rounds for Time: 200m Row, 15 Wall Balls, 10 Burpees",
    notes: "Try to complete each round under 3 minutes."
  },
  {
    id: crypto.randomUUID(),
    day: `Tuesday (${format(addDays(saturday, 3), 'MMM d')})`,
    warmup: "2 rounds of: 10 banded pull-aparts, 5 inchworms",
    wod: "EMOM 15: Odd minutes – 10 Deadlifts, Even minutes – Rest",
    notes: "Focus on maintaining a neutral spine."
  },
  {
    id: crypto.randomUUID(),
    day: `Wednesday (${format(addDays(saturday, 4), 'MMM d')})`,
    warmup: "3 rounds of: 10 glute bridges, 10 scap push-ups",
    wod: "For Time: 800m Run, 50 Box Step-ups, 800m Run, 50 KB Swings",
    notes: "Pace your run to maintain effort for box step-ups."
  },
  {
    id: crypto.randomUUID(),
    day: `Thursday (${format(addDays(saturday, 5), 'MMM d')})`,
    warmup: "2 rounds of: 15 jumping jacks, 10 mountain climbers",
    wod: "AMRAP 20: 5 Power Cleans, 10 Push Press, 15 Box Jumps",
    notes: "Scale weights as needed to maintain form."
  },
  {
    id: crypto.randomUUID(),
    day: `Friday (${format(addDays(saturday, 6), 'MMM d')})`,
    warmup: "3 rounds of: 10 arm circles, 10 leg swings each side",
    wod: "For Time: 50 Wall Balls, 40 Cal Row, 30 Burpees",
    notes: "Break up the wall balls into manageable sets."
  },
  {
    id: crypto.randomUUID(),
    day: `Saturday (${format(addDays(saturday, 7), 'MMM d')})`,
    warmup: "2 rounds of: 200m jog, 10 air squats",
    wod: "5 Rounds: 10 Deadlifts, 15 Box Step-ups, 20 Double-Unders",
    notes: "Focus on breathing rhythm during double-unders."
  },
  {
    id: crypto.randomUUID(),
    day: `Sunday (${format(addDays(saturday, 8), 'MMM d')})`,
    warmup: "3 rounds of: 10 PVC overhead squats, 10 hip extensions",
    wod: "EMOM 18: Even minutes - 12 KB Swings, Odd minutes - 8 Burpees",
    notes: "Keep consistent pace throughout."
  },
  {
    id: crypto.randomUUID(),
    day: `Monday (${format(addDays(saturday, 9), 'MMM d')})`,
    warmup: "2 rounds of: 10 walking lunges, 10 push-ups",
    wod: "For Time: 100 Double-Unders, 80 Air Squats, 60 Sit-ups",
    notes: "Break up the double-unders as needed."
  },
  {
    id: crypto.randomUUID(),
    day: `Tuesday (${format(addDays(saturday, 10), 'MMM d')})`,
    warmup: "3 rounds of: 10 jumping jacks, 10 mountain climbers",
    wod: "AMRAP 15: 10 Thrusters, 15 Box Jumps, 20 Russian Twists",
    notes: "Maintain good form on thrusters."
  },
  {
    id: crypto.randomUUID(),
    day: `Wednesday (${format(addDays(saturday, 11), 'MMM d')})`,
    warmup: "2 rounds of: 15 arm circles, 10 air squats",
    wod: "5 Rounds: 400m Run, 15 Push-ups, 15 Goblet Squats",
    notes: "Pace the runs consistently."
  }
];