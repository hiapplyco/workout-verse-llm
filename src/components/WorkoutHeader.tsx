import { useState, useEffect } from "react";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface WorkoutHeaderProps {
  day: string;
  onExport: () => void;
}

export const WorkoutHeader = ({ day, onExport }: WorkoutHeaderProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-xl font-bold text-primary">{day}</h2>
        <p className="text-sm text-gray-500">
          Current time: {format(currentTime, 'h:mm:ss a')}
        </p>
      </div>
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