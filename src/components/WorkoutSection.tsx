import { Textarea } from "@/components/ui/textarea";

interface WorkoutSectionProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minHeight?: string;
}

export const WorkoutSection = ({ label, value, onChange, minHeight = "80px" }: WorkoutSectionProps) => (
  <div className="space-y-2 rounded bg-[#F5EFE0] p-4">
    <label className="text-sm font-bold uppercase tracking-tight text-secondary">
      {label}
    </label>
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`min-h-[${minHeight}] resize-y border-2 border-accent bg-card font-medium text-white`}
    />
  </div>
);