import { cn } from "@/lib/utils";

interface TimerProps {
  seconds: number;
  running: boolean;
  className?: string;
}

export function Timer({ seconds, running, className }: TimerProps) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const display = `${mins}:${secs.toString().padStart(2, "0")}`;
  const urgent = seconds <= 10;

  return (
    <div
      className={cn(
        "font-mono text-6xl font-bold tabular-nums tracking-wider",
        urgent && "text-accent animate-pulse",
        running && !urgent && "text-primary",
        !running && "text-muted-foreground",
        className,
      )}
    >
      {display}
    </div>
  );
}
