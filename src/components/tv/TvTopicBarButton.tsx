import { cn } from "@/lib/utils";

interface TvTopicBarButtonProps {
  label: string;
  sublabel?: string;
  selected?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}

export function TvTopicBarButton({
  label,
  sublabel,
  selected = false,
  disabled = false,
  onClick,
  className,
}: TvTopicBarButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "tv-topic-bar flex w-full items-center justify-center rounded-xl border-3 border-[#00AEEF] bg-white px-4 py-3 text-center font-black tracking-wide text-black uppercase transition-all",
        "hover:bg-[#e8f7ff] disabled:cursor-default disabled:opacity-60",
        selected &&
          "border-[#FFD700] bg-[#FFD700] text-black ring-2 ring-[#FFD700] shadow-[0_0_16px_rgba(255,215,0,0.5)]",
        className,
      )}
    >
      <span className="min-w-0 flex-1">
        <span className="block text-base md:text-lg">{label}</span>
        {sublabel && (
          <span
            className={cn(
              "mt-0.5 block text-xs font-semibold normal-case",
              selected ? "text-black/70" : "text-[#0066aa]",
            )}
          >
            {sublabel}
          </span>
        )}
      </span>
    </button>
  );
}
