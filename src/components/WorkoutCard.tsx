import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar, Download } from "lucide-react";
import { WorkoutSpeech } from "./WorkoutSpeech";
import { WorkoutRegeneration } from "./WorkoutRegeneration";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WorkoutCardProps {
  workout: {
    id: string;  // Added id property
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

      // Create a calendar event
      const event = {
        'summary': `Workout for ${workout.day}`,
        'description': `Warm Up:\n${workout.warmUp}\n\nWOD:\n${workout.wod}\n\nNotes:\n${workout.notes}`,
        'start': {
          'dateTime': new Date().toISOString(),
          'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        'end': {
          'dateTime': new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(), // 1 hour duration
          'timeZone': Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };

      const { data, error } = await supabase.from('calendar_exports').insert({
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
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-black uppercase tracking-tight text-primary">
            {workout.day}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportToCalendar}
            className="flex items-center gap-2 border-primary text-primary hover:bg-primary hover:text-white"
          >
            <Calendar className="h-4 w-4" />
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="space-y-2 rounded bg-[#F5EFE0] p-4">
          <label className="text-sm font-bold uppercase tracking-tight text-secondary">
            Warm-up
          </label>
          <Textarea
            value={workout.warmUp}
            onChange={(e) => onChange("warmUp", e.target.value)}
            className="min-h-[80px] resize-y border-2 border-accent bg-card font-medium text-white"
          />
        </div>

        <div className="space-y-2 rounded bg-[#F5EFE0] p-4">
          <label className="text-sm font-bold uppercase tracking-tight text-secondary">
            WOD
          </label>
          <Textarea
            value={workout.wod}
            onChange={(e) => onChange("wod", e.target.value)}
            className="min-h-[100px] resize-y border-2 border-accent bg-card font-medium text-white"
          />
        </div>

        <div className="space-y-2 rounded bg-[#F5EFE0] p-4">
          <label className="text-sm font-bold uppercase tracking-tight text-secondary">
            Notes
          </label>
          <Textarea
            value={workout.notes}
            onChange={(e) => onChange("notes", e.target.value)}
            className="min-h-[60px] resize-y border-2 border-accent bg-card font-medium text-white"
          />
        </div>

        <WorkoutSpeech workout={workout} />
        <WorkoutRegeneration workout={workout} onChange={onChange} />
      </CardContent>
    </Card>
  );
};

export default WorkoutCard;