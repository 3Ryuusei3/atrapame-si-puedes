import { cn } from "@/lib/utils";
import { gameGreenFill, gameRedFill } from "@/lib/gameColors";

interface TvAnswerButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
  feedback?: "correct" | "wrong" | null;
  disabled?: boolean;
  variant?: "white" | "black" | "yellow";
  className?: string;
}

export function TvAnswerButton({
  children,
  onClick,
  selected = false,
  feedback = null,
  disabled = false,
  variant = "white",
  className,
}: TvAnswerButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "tv-answer-btn w-full rounded-xl border-3 px-4 py-3 text-left font-bold transition-all duration-300",
        variant === "white" &&
          "border-[#00AEEF] bg-white text-black hover:bg-[#e8f7ff]",
        variant === "black" &&
          "border-[#00AEEF] bg-black text-white hover:bg-[#1a1a1a]",
        variant === "yellow" &&
          "border-[#00AEEF] bg-[#FFD700] text-black hover:bg-[#ffe033]",
        selected &&
          !feedback &&
          "border-[#FFD700] bg-[#FFD700] text-black hover:bg-[#ffe033]",
        feedback === "correct" && gameGreenFill,
        feedback === "wrong" && gameRedFill,
        disabled && "pointer-events-none",
        disabled && !selected && !feedback && "opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}
