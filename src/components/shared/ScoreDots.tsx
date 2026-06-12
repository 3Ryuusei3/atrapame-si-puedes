import { cn } from "@/lib/utils";
import {
  gameGreenFill,
  gameYellowFill,
} from "@/lib/gameColors";

interface ScoreDotsProps {
  correct: number;
  target: number;
  active?: boolean;
  label?: string;
  className?: string;
}

export function ScoreDots({
  correct,
  target,
  active = false,
  label,
  className,
}: ScoreDotsProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      {label && (
        <p className="text-sm font-bold text-white/70">{label}</p>
      )}
      <div className="flex items-center gap-3">
        {Array.from({ length: target }, (_, i) => {
          const scored = i < correct;
          const isNext = active && i === correct && correct < target;

          return (
            <div
              key={i}
              className={cn(
                "flex size-14 items-center justify-center rounded-full border-2 text-lg font-black transition-all md:size-16 md:text-xl",
                scored && gameGreenFill,
                isNext && gameYellowFill,
                !scored &&
                  !isNext &&
                  "border-[#00AEEF]/50 bg-white/90 text-black/70",
              )}
            >
              {i + 1}
            </div>
          );
        })}
      </div>
    </div>
  );
}
