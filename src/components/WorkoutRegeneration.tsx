import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WorkoutRegenerationProps {
  workout: {
    id: string;
    day: string;
    warmUp: string;
    wod: string;
    notes: string;
  };
  onChange: (key: string, value: string) => void;
}

export const WorkoutRegeneration = ({ workout, onChange }: WorkoutRegenerationProps) => {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [userPrompt, setUserPrompt] = useState("");
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUserId();
  }, []);

  const handleRegenerate = async () => {
    if (!userPrompt.trim()) {
      toast.error("Please enter how you'd like to modify the workout");
      return;
    }

    if (!userId) {
      toast.error("Please sign in to update workouts");
      return;
    }

    setIsRegenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('regenerate-workout', {
        body: {
          warmUp: workout.warmUp,
          wod: workout.wod,
          notes: workout.notes,
          userPrompt: userPrompt,
          day: workout.day
        }
      });

      if (error) throw error;

      if (data && typeof data === 'object') {
        // Update each field individually to ensure state changes are triggered
        if (data.warmUp) onChange("warmUp", data.warmUp);
        if (data.wod) onChange("wod", data.wod);
        if (data.notes) onChange("notes", data.notes);
        
        // Store the workout update in workout_history
        const { error: historyError } = await supabase
          .from('workout_history')
          .insert({
            workout_id: workout.id,
            user_id: userId,
            prompt: userPrompt,
            previous_wod: workout.wod,
            new_wod: data.wod
          });

        if (historyError) {
          console.error('Error saving workout history:', historyError);
        }

        setUserPrompt("");
        toast.success(`${workout.day}'s workout updated successfully!`);
      } else {
        throw new Error('Invalid response format from regenerate-workout');
      }
    } catch (error) {
      console.error('Error regenerating workout:', error);
      toast.error(`Failed to update ${workout.day}'s workout. Please try again.`);
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="space-y-2">
      <Input
        placeholder={`How would you like to modify ${workout.day}'s workout?`}
        value={userPrompt}
        onChange={(e) => setUserPrompt(e.target.value)}
        className="border-2 border-accent bg-card font-medium text-white"
      />
      
      <Button 
        onClick={handleRegenerate}
        disabled={isRegenerating}
        className="w-full border-2 border-primary bg-card font-bold uppercase tracking-tight text-primary transition-colors hover:bg-primary hover:text-white disabled:opacity-50"
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        {isRegenerating ? `Updating ${workout.day}'s Workout...` : `Update ${workout.day}'s Workout`}
      </Button>
    </div>
  );
};