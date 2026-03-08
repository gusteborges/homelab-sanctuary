import { cn } from "@/lib/utils";

interface UsageBarProps {
  value: number;
  label: string;
  className?: string;
}

const UsageBar = ({ value, label, className }: UsageBarProps) => {
  const getColor = () => {
    if (value >= 90) return "bg-destructive";
    if (value >= 70) return "bg-warning";
    return "bg-primary";
  };

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-foreground">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", getColor())}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

export default UsageBar;
