import { Button } from "@/components/ui/button";

interface WorkoutPreviewProps {
  type: "warmup" | "wod" | "notes";
  content: string | null;
  onApply: (value: string) => void;
}

export const WorkoutPreview = ({ type, content, onApply }: WorkoutPreviewProps) => {
  if (content === null) return null;

  return (
    <div className="rounded border-2 border-primary bg-background p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase text-secondary">
          New {type.charAt(0).toUpperCase() + type.slice(1)}
        </h3>
        <div className="space-x-2">
          <Button
            variant="default"
            size="sm"
            onClick={() => onApply(content)}
            className="bg-primary text-white hover:bg-primary/90"
          >
            Apply Changes
          </Button>
        </div>
      </div>
      <p className="whitespace-pre-wrap font-medium text-black">{content}</p>
    </div>
  );
};