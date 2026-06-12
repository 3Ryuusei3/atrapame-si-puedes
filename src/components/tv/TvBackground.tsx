import { cn } from "@/lib/utils";

interface TvBackgroundProps {
  variant?: "blue" | "red";
  className?: string;
  children: React.ReactNode;
}

export function TvBackground({
  variant = "blue",
  className,
  children,
}: TvBackgroundProps) {
  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col overflow-hidden",
        variant === "blue" && "tv-bg-blue",
        variant === "red" && "tv-bg-red",
        className,
      )}
    >
      <div className="relative z-10 flex h-full min-h-0 flex-col">
        {children}
      </div>
    </div>
  );
}
