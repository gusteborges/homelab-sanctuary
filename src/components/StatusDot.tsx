import { cn } from "@/lib/utils";

interface StatusDotProps {
  status: "online" | "offline" | "warning" | "running" | "stopped" | "degraded";
  className?: string;
}

const StatusDot = ({ status, className }: StatusDotProps) => {
  const statusClass = {
    online: "status-online",
    running: "status-online",
    offline: "status-offline",
    stopped: "status-offline",
    warning: "status-warning",
    degraded: "status-warning",
  }[status];

  return (
    <span className={cn("inline-block h-2.5 w-2.5 rounded-full", statusClass, className)} />
  );
};

export default StatusDot;
