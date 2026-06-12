import { getAvatarSrc } from "@/data/playerAvatars";
import { cn } from "@/lib/utils";
import type { PlayerAvatarId } from "@/types/game";

interface Round3ChallengedButtonProps {
  label: string;
  sublabel: string;
  avatarId: PlayerAvatarId;
  selected?: boolean;
  onClick: () => void;
}

export function Round3ChallengedButton({
  label,
  sublabel,
  avatarId,
  selected = false,
  onClick,
}: Round3ChallengedButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-stretch gap-2 text-left transition-all"
    >
      <div className="relative shrink-0 self-stretch">
        <div className="relative w-19 h-19 aspect-square overflow-hidden rounded-lg border-2 border-[#00AEEF]">
          <img
            src={getAvatarSrc(avatarId)}
            alt=""
            className="size-full object-cover object-center"
          />
        </div>
      </div>

      <div
        className={cn(
          "flex flex-1 justify-between items-center rounded-xl border-3 px-4 py-0 font-black tracking-wide text-black uppercase transition-all",
          selected
            ? "border-[#FFD700] bg-[#FFD700] text-black ring-2 ring-[#FFD700] shadow-[0_0_16px_rgba(255,215,0,0.5)]"
            : "border-[#00AEEF] bg-white group-hover:bg-[#e8f7ff]",
        )}
      >
        <span className="block text-base md:text-lg">{label}</span>
        <span
          className={cn(
            "mt-0.5 block text-xs font-semibold normal-case",
            selected ? "text-black/70" : "text-[#0066aa]",
          )}
        >
          {sublabel}
        </span>
      </div>
    </button>
  );
}
