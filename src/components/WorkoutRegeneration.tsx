import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
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

  const handleRegenerate = async () => {
    if (!userPrompt.trim()) {
      toast.error("Please enter how you'd like to modify the workout");
      return;
    }

    console.log('Starting workout regeneration for:', workout.day);
    console.log('User prompt:', userPrompt);
    
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

      console.log('Received response from regenerate-workout:', data);

      if (error) {
        console.error('Error from regenerate-workout:', error);
        throw error;
      }

      if (data && typeof data === 'object') {
        console.log('Updating workout with new data:', data);
        
        // Update each field individually and log the changes
        if (data.warmUp) {
          console.log('Updating warmUp from:', workout.warmUp, 'to:', data.warmUp);
          onChange("warmUp", data.warmUp);
        }
        if (data.wod) {
          console.log('Updating wod from:', workout.wod, 'to:', data.wod);
          onChange("wod", data.wod);
        }
        if (data.notes) {
          console.log('Updating notes from:', workout.notes, 'to:', data.notes);
          onChange("notes", data.notes);
        }
        
        // Store the workout update in workout_history
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          console.log('Saving workout history for user:', user.id);
          const { error: historyError } = await supabase
            .from('workout_history')
            .insert({
              workout_id: workout.id,
              user_id: user.id,
              prompt: userPrompt,
              previous_wod: workout.wod,
              new_wod: data.wod
            });

          if (historyError) {
            console.error('Error saving workout history:', historyError);
          } else {
            console.log('Successfully saved workout history');
          }
        }

        setUserPrompt("");
        toast.success(`${workout.day}'s workout updated successfully!`);
      } else {
        console.error('Invalid response format from regenerate-workout:', data);
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