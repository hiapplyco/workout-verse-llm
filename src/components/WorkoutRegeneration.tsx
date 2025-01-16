import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WorkoutRegenerationProps {
  workout: {
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

    setIsRegenerating(true);
    try {
      console.log('Sending regenerate request with:', {
        warmUp: workout.warmUp,
        wod: workout.wod,
        notes: workout.notes,
        userPrompt
      });

      const { data, error } = await supabase.functions.invoke('regenerate-workout', {
        body: {
          warmUp: workout.warmUp,
          wod: workout.wod,
          notes: workout.notes,
          userPrompt: userPrompt
        }
      });

      if (error) throw error;

      console.log('Received regenerated workout:', data);

      if (data && typeof data === 'object') {
        if (data.warmUp && data.warmUp !== workout.warmUp) {
          onChange("warmUp", data.warmUp);
        }
        if (data.wod && data.wod !== workout.wod) {
          onChange("wod", data.wod);
        }
        if (data.notes && data.notes !== workout.notes) {
          onChange("notes", data.notes);
        }
        setUserPrompt("");
        toast.success("Workout regenerated successfully!");
      } else {
        throw new Error('Invalid response format from regenerate-workout');
      }
    } catch (error) {
      console.error('Error regenerating workout:', error);
      toast.error("Failed to regenerate workout. Please try again.");
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="space-y-2">
      <Input
        placeholder="How would you like to modify this workout?"
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
        {isRegenerating ? "Regenerating..." : "Regenerate Workout"}
      </Button>
    </div>
  );
};