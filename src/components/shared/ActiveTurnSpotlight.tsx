import { resolveAvatarId } from "@/data/playerAvatars";
import { PlayerAvatar } from "@/components/shared/PlayerAvatar";
import { cn, formatPlayerName } from "@/lib/utils";
import type { Player } from "@/types/game";

interface ActiveTurnSpotlightProps {
  player?: Player;
  name?: string;
  label?: string;
  showLabel?: boolean;
  className?: string;
  compact?: boolean;
}

/** Avatar grande centrado para indicar el jugador en turno. */
export function ActiveTurnSpotlight({
  player,
  name,
  label = "Turno de",
  showLabel = true,
  className,
  compact = false,
}: ActiveTurnSpotlightProps) {
  const displayName = formatPlayerName(player?.name ?? name ?? "");
  if (!displayName) return null;

  const avatarId = player ? resolveAvatarId(player) : undefined;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 px-4",
        className,
      )}
    >
      {avatarId && (
        <PlayerAvatar
          avatarId={avatarId}
          size={compact ? "xl" : "hero"}
          className={cn(
            "border-accent shadow-[0_0_24px_rgba(255,215,0,0.45)]",
            !compact && "md:size-40",
          )}
        />
      )}
      {showLabel && (
        <p className="text-xs font-bold tracking-[0.2em] text-[#FFD700] uppercase">
          {label}
        </p>
      )}
      <p
        className={cn(
          "max-w-full text-center font-black text-white uppercase",
          compact ? "text-lg" : "text-2xl md:text-3xl",
        )}
      >
        {displayName}
      </p>
    </div>
  );
}
