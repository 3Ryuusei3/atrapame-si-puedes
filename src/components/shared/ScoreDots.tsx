import { cn } from "@/lib/utils";

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
        <p className="text-muted-foreground text-sm font-medium">{label}</p>
      )}
      <div className="flex items-center gap-3">
        {Array.from({ length: target }, (_, i) => {
          const lit = i < correct;
          return (
            <div
              key={i}
              className={cn(
                "flex size-12 items-center justify-center rounded-full border-2 text-lg font-bold transition-all",
                lit
                  ? "border-primary bg-primary text-primary-foreground shadow-[0_0_12px_rgba(212,168,83,0.5)]"
                  : "border-muted-foreground/30 bg-secondary/30 text-muted-foreground",
                active && lit && "scale-110",
              )}
            >
              {lit ? i + 1 : ""}
            </div>
          );
        })}
      </div>
    </div>
  );
}
