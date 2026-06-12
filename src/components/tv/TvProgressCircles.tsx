import { cn } from "@/lib/utils";

interface TvProgressCirclesProps {
  current: number;
  total: number;
  className?: string;
}

export function TvProgressCircles({
  current,
  total,
  className,
}: TvProgressCirclesProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {Array.from({ length: total }, (_, i) => {
        const num = i + 1;
        const active = num === current;
        const done = num < current;

        return (
          <div
            key={num}
            className={cn(
              "flex size-9 items-center justify-center rounded-full border-3 text-sm font-black transition-all",
              active &&
                "border-[#00AEEF] bg-[#00AEEF] text-white shadow-[0_0_12px_rgba(0,174,239,0.6)]",
              done &&
                "border-[#00AEEF] bg-[#00AEEF]/30 text-white",
              !active &&
                !done &&
                "border-[#00AEEF] bg-white text-black",
            )}
          >
            {num}
          </div>
        );
      })}
    </div>
  );
}
