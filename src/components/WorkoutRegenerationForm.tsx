import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw } from "lucide-react";

interface WorkoutRegenerationFormProps {
  day: string;
  userPrompt: string;
  isRegenerating: boolean;
  onPromptChange: (value: string) => void;
  onRegenerate: () => void;
}

export const WorkoutRegenerationForm = ({
  day,
  userPrompt,
  isRegenerating,
  onPromptChange,
  onRegenerate,
}: WorkoutRegenerationFormProps) => {
  return (
    <div className="space-y-2">
      <Input
        placeholder={`How would you like to modify ${day}'s workout?`}
        value={userPrompt}
        onChange={(e) => onPromptChange(e.target.value)}
        className="border-2 border-accent bg-card font-medium text-white"
      />
      
      <Button 
        onClick={onRegenerate}
        disabled={isRegenerating}
        className="w-full border-2 border-primary bg-card font-bold uppercase tracking-tight text-primary transition-colors hover:bg-primary hover:text-white disabled:opacity-50"
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        {isRegenerating ? `Updating ${day}'s Workout...` : `Update ${day}'s Workout`}
      </Button>
    </div>
  );
};