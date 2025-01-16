import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WorkoutSpeechProps {
  workout: {
    day: string;
    warmUp: string;
    wod: string;
    notes: string;
  };
}

export const WorkoutSpeech = ({ workout }: WorkoutSpeechProps) => {
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);

  const handleSpeak = async () => {
    setIsGeneratingVoice(true);
    try {
      const formatForSpeech = (text: string) => {
        return text
          .replace(/\//g, ' or ')
          .replace(/-/g, ' to ')
          .replace(/\n/g, '. ')
          .replace(/\s+/g, ' ')
          .trim();
      };

      const speechText = `Today is ${workout.day}. For warm up: ${formatForSpeech(workout.warmUp)}. Workout of the day: ${formatForSpeech(workout.wod)}. ${workout.notes ? `Important notes: ${formatForSpeech(workout.notes)}.` : ''}`;

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

  return (
    <Button 
      onClick={handleSpeak}
      disabled={isGeneratingVoice}
      className="w-full border-2 border-accent bg-card font-bold uppercase tracking-tight text-accent transition-colors hover:bg-accent hover:text-white disabled:opacity-50"
    >
      <Volume2 className="mr-2 h-4 w-4" />
      {isGeneratingVoice ? "Generating..." : "Speak Workout"}
    </Button>
  );
};