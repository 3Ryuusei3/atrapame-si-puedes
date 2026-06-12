import { cn } from "@/lib/utils";

interface TvQuestionBarProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "metallic";
  showQuestionMarks?: boolean;
  subtitle?: string;
  subtitleClassName?: string;
}

export function TvQuestionBar({
  children,
  className,
  variant = "default",
  showQuestionMarks = true,
  subtitle,
  subtitleClassName,
}: TvQuestionBarProps) {
  return (
    <div className={cn("relative w-full", className)}>
      {showQuestionMarks && (
        <>
          <span className="tv-question-mark tv-question-mark-left" aria-hidden>
            ?
          </span>
          <span className="tv-question-mark tv-question-mark-right" aria-hidden>
            ?
          </span>
        </>
      )}
      <div
        className={cn(
          "tv-question-bar relative px-6 py-4 text-center md:px-10 md:py-5",
          variant === "default" && "tv-question-bar-default",
          variant === "metallic" && "tv-question-bar-metallic",
        )}
      >
        {subtitle && (
          <p
            className={cn(
              "mb-1 text-xs font-bold tracking-widest uppercase",
              subtitleClassName ?? "text-[#0066aa]",
            )}
          >
            {subtitle}
          </p>
        )}
        <p className="text-lg leading-snug font-bold text-black md:text-2xl">
          {children}
        </p>
      </div>
    </div>
  );
}
