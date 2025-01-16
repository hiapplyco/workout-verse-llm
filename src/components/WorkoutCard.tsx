import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { WorkoutSpeech } from "./WorkoutSpeech";
import { WorkoutRegeneration } from "./WorkoutRegeneration";
import { WorkoutHeader } from "./WorkoutHeader";
import { WorkoutSection } from "./WorkoutSection";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WorkoutCardProps {
  workout: {
    id: string;
    day: string;
    warmUp: string;
    wod: string;
    notes: string;
  };
  onChange: (key: string, value: string) => void;
  onSpeak: () => void;
}

const WorkoutCard = ({ workout, onChange }: WorkoutCardProps) => {
  const handleExportToCalendar = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error("Please sign in to export workouts to calendar");
        return;
      }

      const event = {
        'summary': `Workout for ${workout.day}`,
        'description': `Warm Up:\n${workout.warmUp}\n\nWOD:\n${workout.wod}\n\nNotes:\n${workout.notes}`,
        'start': {
          'dateTime': new Date().toISOString(),
          'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        'end': {
          'dateTime': new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(),
          'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };

      const { error } = await supabase.from('calendar_exports').insert({
        user_id: session.user.id,
        workout_id: workout.id,
        calendar_event_id: JSON.stringify(event)
      });

      if (error) throw error;

      toast.success("Workout exported to calendar successfully!");
    } catch (error) {
      console.error('Error exporting to calendar:', error);
      toast.error("Failed to export workout to calendar");
    }
  };

  return (
    <Card className="relative w-full animate-fade-in border-2 border-primary bg-white">
      <CardHeader className="relative border-b-2 border-primary bg-card">
        <WorkoutHeader day={workout.day} onExport={handleExportToCalendar} />
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <WorkoutSection
          label="Warm-up"
          value={workout.warmUp}
          onChange={(value) => onChange("warmUp", value)}
        />
        <WorkoutSection
          label="WOD"
          value={workout.wod}
          onChange={(value) => onChange("wod", value)}
          minHeight="100px"
        />
        <WorkoutSection
          label="Notes"
          value={workout.notes}
          onChange={(value) => onChange("notes", value)}
          minHeight="60px"
        />
        <WorkoutSpeech workout={workout} />
        <WorkoutRegeneration workout={workout} onChange={onChange} />
      </CardContent>
    </Card>
  );
};

export default WorkoutCard;