import { cn } from "@/lib/utils";
import {
  gameGreenFill,
  gameRedFill,
  gameYellowFill,
} from "@/lib/gameColors";

interface TvTopicPillProps {
  name: string;
  state: "idle" | "active" | "completed" | "failed";
  onClick?: () => void;
  className?: string;
}

const STATE_COLORS = {
  idle: "bg-white text-black",
  active: gameYellowFill,
  completed: gameGreenFill,
  failed: gameRedFill,
};

export function TvTopicPill({
  name,
  state,
  onClick,
  className,
}: TvTopicPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={state !== "idle"}
      className={cn(
        "rounded-lg px-3 py-2 text-sm font-black tracking-wide uppercase transition-all",
        STATE_COLORS[state],
        state === "active" && "scale-105",
        className,
      )}
    >
      {name}
    </button>
  );
}

interface TvTopicBarProps {
  children: React.ReactNode;
  className?: string;
}

export function TvTopicBar({ children, className }: TvTopicBarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-2 rounded-full border-3 border-[#A5C8D6] bg-[#A5C8D6]/40 px-4 py-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface TvBoteDisplayProps {
  value: string;
  className?: string;
}

export function TvBoteDisplay({ value, className }: TvBoteDisplayProps) {
  return (
    <p
      className={cn(
        "text-4xl font-black italic text-white md:text-5xl",
        "[-webkit-text-stroke:2px_black] [text-shadow:2px_2px_0_#000,3px_3px_0_#000]",
        className,
      )}
    >
      {value}
    </p>
  );
}
