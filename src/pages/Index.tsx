import { useState, useRef } from "react";
import WorkoutCard from "@/components/WorkoutCard";

const initialWorkouts = [
  {
    day: "Monday",
    warmUp: "3 rounds of: 10 air squats, 10 sit-ups, 10 push-ups",
    wod: "For Time: 21-15-9 Thrusters (95/65 lb), Pull-Ups",
    notes: "Focus on keeping elbows high during thrusters."
  },
  {
    day: "Tuesday",
    warmUp: "2 rounds of: 200m run, 10 walking lunges",
    wod: "AMRAP 12: 10 Kettlebell Swings, 10 Box Jumps, 10 Push-Ups",
    notes: "Aim for consistent pacing."
  },
  {
    day: "Wednesday",
    warmUp: "3 rounds of: 10 shoulder pass-throughs, 10 PVC good mornings",
    wod: "5 Rounds for Time: 200m Row, 15 Wall Balls, 10 Burpees",
    notes: "Try to complete each round under 3 minutes."
  },
  {
    day: "Thursday",
    warmUp: "2 rounds of: 10 banded pull-aparts, 5 inchworms",
    wod: "EMOM 15: Odd minutes – 10 Deadlifts, Even minutes – Rest",
    notes: "Focus on maintaining a neutral spine."
  },
  {
    day: "Friday",
    warmUp: "3 rounds of: 10 glute bridges, 10 scap push-ups",
    wod: "For Time: 800m Run, 50 Box Step-ups, 800m Run, 50 KB Swings",
    notes: "Pace your run to maintain effort for box step-ups."
  }
];

const Index = () => {
  const [workouts, setWorkouts] = useState(initialWorkouts);
  const audioRef = useRef<HTMLAudioElement>(null);

  const callGeminiForNewPlan = async (currentWorkout: typeof initialWorkouts[0]) => {
    // Placeholder for Gemini API call
    return {
      ...currentWorkout,
      wod: `${currentWorkout.wod} (Gemini Generated!)`
    };
  };

  const callElevenLabsTTS = async (text: string) => {
    // Placeholder for ElevenLabs API call
    return "/placeholder-voice.mp3";
  };

  const handleRegenerate = async (index: number) => {
    const newWorkouts = [...workouts];
    const updatedWorkout = await callGeminiForNewPlan(newWorkouts[index]);
    newWorkouts[index] = updatedWorkout;
    setWorkouts(newWorkouts);
  };

  const handleChange = (index: number, key: string, value: string) => {
    const newWorkouts = [...workouts];
    newWorkouts[index] = { ...newWorkouts[index], [key]: value };
    setWorkouts(newWorkouts);
  };

  const handleSpeakPlan = async (workout: typeof initialWorkouts[0]) => {
    const speechText = `
      Today is ${workout.day}.
      Warm Up: ${workout.warmUp}.
      Workout Of the Day: ${workout.wod}.
      Notes: ${workout.notes}.
    `;

    try {
      const audioURL = await callElevenLabsTTS(speechText);
      if (audioRef.current) {
        audioRef.current.src = audioURL;
        audioRef.current.play();
      }
    } catch (error) {
      console.error("Error calling ElevenLabs TTS:", error);
    }
  };

  return (
    <div className="min-h-screen bg-card">
      <nav className="border-b-2 border-primary bg-card px-6 py-4">
        <h1 className="text-2xl font-black uppercase tracking-tight text-primary">Best App of Their Day</h1>
      </nav>

      <main className="container py-8">
        <h2 className="mb-8 text-3xl font-black uppercase tracking-tight text-primary">Weekly Workout Plan</h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workouts.map((workout, index) => (
            <WorkoutCard
              key={index}
              workout={workout}
              onRegenerate={() => handleRegenerate(index)}
              onChange={(key, value) => handleChange(index, key, value)}
              onSpeak={() => handleSpeakPlan(workout)}
            />
          ))}
        </div>

        <audio ref={audioRef} hidden />
      </main>
    </div>
  );
};

export default Index;