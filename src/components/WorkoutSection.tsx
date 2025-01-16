import { Textarea } from "@/components/ui/textarea";

interface WorkoutSectionProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minHeight?: string;
}

export const WorkoutSection = ({ label, value, onChange, minHeight = "80px" }: WorkoutSectionProps) => (
  <div className="space-y-2 rounded bg-card p-4 border-2 border-accent">
    <label className="text-sm font-bold uppercase tracking-tight text-secondary">
      {label}
    </label>
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`min-h-[${minHeight}] resize-y bg-background font-medium text-foreground`}
    />
  </div>
);