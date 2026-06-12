import { cn } from "@/lib/utils";

interface TvScoreBoxProps {
  value: string | number;
  label?: string;
  size?: "md" | "lg" | "xl";
  className?: string;
}

export function TvScoreBox({
  value,
  label,
  size = "lg",
  className,
}: TvScoreBoxProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-start justify-center gap-1",
        className,
      )}
    >
      {label && (
        <span className="text-xs font-semibold tracking-wide text-white/70 uppercase">
          {label}
        </span>
      )}
      <div
        className={cn(
          "tv-score-box tabular-nums mx-auto",
          size === "md" && "min-w-[4.5rem] px-4 py-2 text-2xl",
          size === "lg" && "min-w-[5.5rem] px-5 py-2.5 text-3xl",
          size === "xl" && "min-w-[7rem] px-6 py-3 text-4xl",
        )}
      >
        {value}
      </div>
    </div>
  );
}
