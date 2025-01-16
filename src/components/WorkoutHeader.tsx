import { Button } from "@/components/ui/button";
import { CardTitle } from "@/components/ui/card";
import { Calendar, Download } from "lucide-react";

interface WorkoutHeaderProps {
  day: string;
  onExport: () => void;
}

export const WorkoutHeader = ({ day, onExport }: WorkoutHeaderProps) => (
  <div className="flex items-center justify-between">
    <CardTitle className="text-xl font-black uppercase tracking-tight text-primary">
      {day}
    </CardTitle>
    <Button
      variant="outline"
      size="sm"
      onClick={onExport}
      className="flex items-center gap-2 border-primary text-primary hover:bg-primary hover:text-white"
    >
      <Calendar className="h-4 w-4" />
      <Download className="h-4 w-4" />
    </Button>
  </div>
);