import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WorkoutHeaderProps {
  day: string;
  onExport: () => void;
}

export const WorkoutHeader = ({ day, onExport }: WorkoutHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-xl font-bold text-primary">{day}</h2>
      <Button
        variant="ghost"
        size="icon"
        onClick={onExport}
        className="h-8 w-8 rounded-full"
      >
        <CalendarDays className="h-4 w-4" />
      </Button>
    </div>
  );
};