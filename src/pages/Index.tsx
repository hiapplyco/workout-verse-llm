import { useState, useRef } from "react";
import WorkoutCard from "@/components/WorkoutCard";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";
import { toast } from "sonner";

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
  const [weeklyPrompt, setWeeklyPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

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
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: speechText }
      });

      if (error) throw error;

      if (data?.audioContent && audioRef.current) {
        audioRef.current.src = `data:audio/mp3;base64,${data.audioContent}`;
        await audioRef.current.play();
      }
    } catch (error) {
      console.error("Error calling text-to-speech:", error);
    }
  };

  const generateWeeklyWorkouts = async () => {
    if (!weeklyPrompt.trim()) {
      toast.error("Please enter how you'd like to customize the weekly workouts");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-weekly-workouts', {
        body: { weeklyPrompt }
      });

      if (error) throw error;

      if (Array.isArray(data) && data.length === 5) {
        setWorkouts(data);
        setWeeklyPrompt("");
        toast.success("Weekly workout plan generated successfully!");
      } else {
        throw new Error('Invalid response format from generate-weekly-workouts');
      }
    } catch (error) {
      console.error('Error generating weekly workouts:', error);
      toast.error("Failed to generate weekly workouts. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b-2 border-primary bg-card px-6 py-4">
        <h1 className="text-2xl font-black uppercase tracking-tight text-primary">Best App of Their Day</h1>
      </nav>

      <main className="container py-8">
        <div className="mb-8 space-y-4">
          <h2 className="text-3xl font-black uppercase tracking-tight text-primary">Weekly Workout Plan</h2>
          
          <div className="flex gap-4">
            <Input
              placeholder="How would you like to customize this week's workouts?"
              value={weeklyPrompt}
              onChange={(e) => setWeeklyPrompt(e.target.value)}
              className="border-2 border-accent bg-card font-medium text-white"
            />
            <Button
              onClick={generateWeeklyWorkouts}
              disabled={isGenerating}
              className="border-2 border-primary bg-card font-bold uppercase tracking-tight text-primary transition-colors hover:bg-primary hover:text-white disabled:opacity-50"
            >
              <Wand2 className="mr-2 h-4 w-4" />
              {isGenerating ? "Generating..." : "Generate Week"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workouts.map((workout, index) => (
            <WorkoutCard
              key={index}
              workout={workout}
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