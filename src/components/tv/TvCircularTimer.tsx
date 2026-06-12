import { cn } from "@/lib/utils";

interface TvCircularTimerProps {
  seconds: number;
  maxSeconds: number;
  running?: boolean;
  size?: "md" | "lg";
  className?: string;
}

export function TvCircularTimer({
  seconds,
  maxSeconds,
  running = false,
  size = "lg",
  className,
}: TvCircularTimerProps) {
  const radius = size === "lg" ? 42 : 34;
  const stroke = 6;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = maxSeconds > 0 ? seconds / maxSeconds : 0;
  const dashOffset = circumference * (1 - progress);
  const urgent = seconds <= 10;

  return (
    <div
      className={cn(
        "tv-circular-timer relative flex shrink-0 items-center justify-center",
        size === "lg" && "size-24",
        size === "md" && "size-20",
        className,
      )}
    >
      <svg
        className="absolute inset-0 -rotate-90"
        viewBox={`0 0 ${radius * 2} ${radius * 2}`}
        aria-hidden
      >
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={stroke}
        />
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          stroke={urgent ? "#ff4444" : "#FFD700"}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className={cn(
            "transition-[stroke-dashoffset] duration-1000 ease-linear",
            running && "opacity-100",
            !running && "opacity-70",
          )}
        />
      </svg>
      <div
        className={cn(
          "relative flex size-[70%] items-center justify-center rounded-full bg-[#1a1a2e] font-bold text-white tabular-nums shadow-inner",
          size === "lg" && "text-2xl",
          size === "md" && "text-xl",
          urgent && running && "animate-pulse text-[#FFD700]",
        )}
      >
        {seconds}
      </div>
    </div>
  );
}
