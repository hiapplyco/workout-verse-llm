import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { WorkoutSpeech } from "./WorkoutSpeech";
import { WorkoutRegeneration } from "./WorkoutRegeneration";

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

const WorkoutCard = ({ workout, onChange }: WorkoutCardProps) => {
  return (
    <Card className="relative w-full animate-fade-in border-2 border-primary bg-white">
      <CardHeader className="relative border-b-2 border-primary bg-card">
        <CardTitle className="text-xl font-black uppercase tracking-tight text-primary">
          {workout.day}
        </CardTitle>
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