import { Textarea } from "@/components/ui/textarea";

interface WorkoutSectionProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minHeight?: string;
}

export const WorkoutSection = ({ label, value, onChange, minHeight = "80px" }: WorkoutSectionProps) => (
  <div className="space-y-2 rounded bg-card p-4 border-[3px] border-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
    <label className="text-sm font-bold uppercase tracking-tight text-secondary">
      {label}
    </label>
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`min-h-[${minHeight}] resize-y bg-background font-medium text-foreground border-2 border-primary shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
    />
  </div>
);