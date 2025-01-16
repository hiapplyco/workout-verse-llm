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
    <Card className="relative w-full animate-fade-in border-2 border-primary bg-background">
      <CardHeader className="relative border-b-2 border-primary bg-card">
        <CardTitle className="text-xl font-black uppercase tracking-tight text-primary">
          {workout.day}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 p-6">
        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-tight text-secondary">Warm-up</label>
          <Textarea
            value={workout.warmUp}
            onChange={(e) => onChange("warmUp", e.target.value)}
            className="min-h-[80px] resize-y border-2 border-accent bg-card font-medium text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-tight text-secondary">WOD</label>
          <Textarea
            value={workout.wod}
            onChange={(e) => onChange("wod", e.target.value)}
            className="min-h-[100px] resize-y border-2 border-accent bg-card font-medium text-white"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-bold uppercase tracking-tight text-secondary">Notes</label>
          <Textarea
            value={workout.notes}
            onChange={(e) => onChange("notes", e.target.value)}
            className="min-h-[60px] resize-y border-2 border-accent bg-card font-medium text-white"
          />
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={onRegenerate} 
            className="flex-1 border-2 border-primary bg-background font-bold uppercase tracking-tight text-primary transition-colors hover:bg-primary hover:text-background"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Regenerate
          </Button>
          <Button 
            onClick={onSpeak} 
            className="flex-1 border-2 border-accent bg-background font-bold uppercase tracking-tight text-accent transition-colors hover:bg-accent hover:text-background"
          >
            <Volume2 className="mr-2 h-4 w-4" />
            Speak
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutCard;