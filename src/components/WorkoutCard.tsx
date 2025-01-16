import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, Volume2 } from "lucide-react";

interface WorkoutCardProps {
  workout: {
    day: string;
    warmUp: string;
    wod: string;
    notes: string;
  };
  onRegenerate: () => void;
  onChange: (key: string, value: string) => void;
  onSpeak: () => void;
}

const WorkoutCard = ({ workout, onRegenerate, onChange, onSpeak }: WorkoutCardProps) => {
  return (
    <Card className="w-full animate-fade-in">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{workout.day}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Warm-up</label>
          <Textarea
            value={workout.warmUp}
            onChange={(e) => onChange("warmUp", e.target.value)}
            className="min-h-[80px] resize-y"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">WOD</label>
          <Textarea
            value={workout.wod}
            onChange={(e) => onChange("wod", e.target.value)}
            className="min-h-[100px] resize-y"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Notes</label>
          <Textarea
            value={workout.notes}
            onChange={(e) => onChange("notes", e.target.value)}
            className="min-h-[60px] resize-y"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={onRegenerate} className="flex-1" variant="default">
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate
          </Button>
          <Button onClick={onSpeak} className="flex-1" variant="secondary">
            <Volume2 className="mr-2 h-4 w-4" />
            Speak
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutCard;