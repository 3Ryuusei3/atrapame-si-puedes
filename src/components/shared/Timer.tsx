import { TvCircularTimer } from "@/components/tv/TvCircularTimer";

interface TimerProps {
  seconds: number;
  running: boolean;
  maxSeconds?: number;
  className?: string;
  size?: "md" | "lg";
}

export function Timer({
  seconds,
  running,
  maxSeconds = 60,
  className,
  size = "lg",
}: TimerProps) {
  return (
    <TvCircularTimer
      seconds={seconds}
      maxSeconds={maxSeconds}
      running={running}
      size={size}
      className={className}
    />
  );
}
