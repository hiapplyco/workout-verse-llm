import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wand2 } from "lucide-react";

interface WeeklyPromptFormProps {
  weeklyPrompt: string;
  isGenerating: boolean;
  onPromptChange: (value: string) => void;
  onGenerate: () => void;
}

export const WeeklyPromptForm = ({
  weeklyPrompt,
  isGenerating,
  onPromptChange,
  onGenerate,
}: WeeklyPromptFormProps) => {
  return (
    <div className="mb-8 space-y-4">
      <h2 className="text-3xl font-black uppercase tracking-tight text-primary">
        Weekly Workout Plan
      </h2>
      <div className="space-y-2">
        <div className="flex gap-4">
          <Input
            placeholder="Customize your workouts..."
            value={weeklyPrompt}
            onChange={(e) => onPromptChange(e.target.value)}
            className="border-2 border-accent bg-card font-medium text-white"
          />
          <Button
            onClick={onGenerate}
            disabled={isGenerating}
            className="border-2 border-primary bg-card font-bold uppercase tracking-tight text-primary transition-colors hover:bg-primary hover:text-white disabled:opacity-50"
          >
            <Wand2 className="mr-2 h-4 w-4" />
            {isGenerating ? "Generating..." : "Generate Week"}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Describe your fitness goals, preferences, or limitations to personalize your weekly workout plan
        </p>
      </div>
    </div>
  );
};