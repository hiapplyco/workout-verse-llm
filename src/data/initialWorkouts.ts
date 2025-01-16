import { Workout } from "@/types/workout";

export const initialWorkouts: Workout[] = [
  {
    id: "123e4567-e89b-12d3-a456-426614174001",
    day: "Monday",
    warmup: "3 rounds of: 10 air squats, 10 sit-ups, 10 push-ups",
    wod: "For Time: 21-15-9 Thrusters (95/65 lb), Pull-Ups",
    notes: "Focus on keeping elbows high during thrusters."
  },
  {
    id: "123e4567-e89b-12d3-a456-426614174002",
    day: "Tuesday",
    warmup: "5 min Jumping Rope\n3 rounds of: 10 lunges per leg, 10 arm circles",
    wod: "AMRAP in 20 minutes:\n15 KB Swings\n10 Box Jumps\n5 Burpees",
    notes: "Scale weight and box height as needed. Focus on form."
  },
  {
    id: "123e4567-e89b-12d3-a456-426614174003",
    day: "Wednesday",
    warmup: "3 rounds of: 10 shoulder pass-throughs, 10 PVC good mornings",
    wod: "5 Rounds for Time:\n200m Row\n15 Wall Balls\n10 Burpees",
    notes: "Try to complete each round under 3 minutes."
  },
  {
    id: "123e4567-e89b-12d3-a456-426614174004",
    day: "Thursday",
    warmup: "10 minute light jog\n2 rounds of: 10 hip openers, 10 ankle mobility",
    wod: "Every 2 Minutes for 20 Minutes:\n5 Power Cleans\n7 Front Squats\n9 Push Press",
    notes: "Choose a weight you can maintain for all 10 rounds."
  },
  {
    id: "123e4567-e89b-12d3-a456-426614174005",
    day: "Friday",
    warmup: "3 rounds of: 10 glute bridges, 10 scap push-ups",
    wod: "For Time:\n800m Run\n50 Box Step-ups\n800m Run\n50 KB Swings",
    notes: "Pace your run to maintain effort for box step-ups."
  }
];