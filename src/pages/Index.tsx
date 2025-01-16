import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WorkoutCard from "@/components/WorkoutCard";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Wand2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { initialWorkouts } from "@/data/initialWorkouts";

type Workout = {
  id: string;
  day: string;
  warmup: string;
  wod: string;
  notes: string;
};

const Index = () => {
  const navigate = useNavigate();
  const [workouts, setWorkouts] = useState<Workout[]>(initialWorkouts);
  const [weeklyPrompt, setWeeklyPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        navigate("/auth");
        return;
      }

      const { data: existingWorkouts, error: fetchError } = await supabase
        .from('workouts')
        .select('id, day, warmup, wod, notes')
        .eq('user_id', user.id);

      if (fetchError) {
        console.error('Error fetching workouts:', fetchError);
        toast.error('Failed to fetch workouts');
        return;
      }

      if (!existingWorkouts?.length) {
        console.log('No existing workouts found, inserting initial workouts');
        const workoutsToInsert = initialWorkouts.map(workout => ({
          ...workout,
          user_id: user.id,
        }));

        const { error: insertError } = await supabase
          .from('workouts')
          .insert(workoutsToInsert);

        if (insertError) {
          console.error('Error inserting initial workouts:', insertError);
          toast.error('Failed to initialize workouts');
          return;
        }

        toast.success('Initial workouts created successfully!');
      } else {
        console.log('Existing workouts found:', existingWorkouts);
        setWorkouts(existingWorkouts as Workout[]);
      }
    };

    checkUser();
  }, [navigate]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Error signing out");
    } else {
      navigate("/auth");
    }
  };

  const handleChange = async (index: number, key: string, value: string) => {
    const newWorkouts = [...workouts];
    newWorkouts[index] = { ...newWorkouts[index], [key]: value };
    setWorkouts(newWorkouts);

    const { error } = await supabase
      .from('workouts')
      .update({ [key]: value })
      .eq('id', workouts[index].id);

    if (error) {
      console.error('Error updating workout:', error);
      toast.error('Failed to save workout changes');
    }
  };

  const handleSpeakPlan = async (workout: Workout) => {
    const speechText = `
      Today is ${workout.day}.
      Warm Up: ${workout.warmup}.
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
        // Update workouts in Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const workoutsToUpdate = data.map(workout => ({
          ...workout,
          user_id: user.id,
        }));

        const { error: updateError } = await supabase
          .from('workouts')
          .upsert(workoutsToUpdate, { onConflict: 'id' });

        if (updateError) throw updateError;

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
      <nav className="border-b-2 border-primary bg-card px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-black uppercase tracking-tight text-primary">
          Best App of Their Day
        </h1>
        <Button
          variant="outline"
          onClick={handleSignOut}
          className="border-2 border-primary font-medium"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </nav>

      <main className="container py-8">
        <div className="mb-8 space-y-4">
          <h2 className="text-3xl font-black uppercase tracking-tight text-primary">
            Weekly Workout Plan
          </h2>
          
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
              key={workout.id}
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