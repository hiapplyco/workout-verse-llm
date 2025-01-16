import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Volume2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WorkoutCardProps {
  workout: {
    day: string;
    warmUp: string;
    wod: string;
    notes: string;
  };
  onChange: (key: string, value: string) => void;
  onSpeak: () => void;
}

const WorkoutCard = ({ workout, onChange, onSpeak }: WorkoutCardProps) => {
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [userPrompt, setUserPrompt] = useState("");

  const handleSpeak = async () => {
    setIsGeneratingVoice(true);
    try {
      const speechText = `Today is ${workout.day}. For warm up: ${workout.warmUp}. Workout of the day: ${workout.wod}. ${workout.notes ? `Important notes: ${workout.notes}.` : ''}`;

      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text: speechText }
      });

      if (error) throw error;

      if (data?.audioContent) {
        const audio = new Audio(`data:audio/mp3;base64,${data.audioContent}`);
        await audio.play();
      }
    } catch (error) {
      console.error('Error generating speech:', error);
      toast.error("Failed to generate speech. Please try again.");
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('regenerate-workout', {
        body: {
          warmUp: workout.warmUp,
          wod: workout.wod,
          notes: workout.notes,
          userPrompt: userPrompt
        }
      });

      if (error) throw error;

      if (data) {
        onChange("warmUp", data.warmUp);
        onChange("wod", data.wod);
        if (data.notes) onChange("notes", data.notes);
        setUserPrompt("");
        toast.success("Workout regenerated successfully!");
      }
    } catch (error) {
      console.error('Error regenerating workout:', error);
      toast.error("Failed to regenerate workout. Please try again.");
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Card className="relative w-full animate-fade-in border-2 border-primary bg-white">
      <CardHeader className="relative border-b-2 border-primary bg-card">
        <CardTitle className="text-xl font-black uppercase tracking-tight text-primary">
          {workout.day}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="space-y-2 rounded bg-[#F5EFE0] p-4">
          <label className="text-sm font-bold uppercase tracking-tight text-secondary">Warm-up</label>
          <Textarea
            value={workout.warmUp}
            onChange={(e) => onChange("warmUp", e.target.value)}
            className="min-h-[80px] resize-y border-2 border-accent bg-card font-medium text-white"
          />
        </div>

        <div className="space-y-2 rounded bg-[#F5EFE0] p-4">
          <label className="text-sm font-bold uppercase tracking-tight text-secondary">WOD</label>
          <Textarea
            value={workout.wod}
            onChange={(e) => onChange("wod", e.target.value)}
            className="min-h-[100px] resize-y border-2 border-accent bg-card font-medium text-white"
          />
        </div>

        <div className="space-y-2 rounded bg-[#F5EFE0] p-4">
          <label className="text-sm font-bold uppercase tracking-tight text-secondary">Notes</label>
          <Textarea
            value={workout.notes}
            onChange={(e) => onChange("notes", e.target.value)}
            className="min-h-[60px] resize-y border-2 border-accent bg-card font-medium text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button 
            onClick={handleSpeak}
            disabled={isGeneratingVoice}
            className="border-2 border-accent bg-card font-bold uppercase tracking-tight text-accent transition-colors hover:bg-accent hover:text-white disabled:opacity-50"
          >
            <Volume2 className="mr-2 h-4 w-4" />
            {isGeneratingVoice ? "Generating..." : "Speak Workout"}
          </Button>

          <Button 
            onClick={handleRegenerate}
            disabled={isRegenerating}
            className="border-2 border-primary bg-card font-bold uppercase tracking-tight text-primary transition-colors hover:bg-primary hover:text-white disabled:opacity-50"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {isRegenerating ? "Regenerating..." : "Regenerate"}
          </Button>
        </div>

        <Input
          placeholder="Describe how you'd like to modify this workout (optional)..."
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          className="border-2 border-accent bg-card font-medium text-white"
        />
      </CardContent>
    </Card>
  );
};

export default WorkoutCard;