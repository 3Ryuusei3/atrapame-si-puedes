import { resolveAvatarId } from "@/data/playerAvatars";
import { PlayerAvatar } from "@/components/shared/PlayerAvatar";
import { cn, formatPlayerName } from "@/lib/utils";
import type { Player, PlayerAvatarId } from "@/types/game";

interface TvNameBadgeProps {
  name?: string;
  avatarId?: PlayerAvatarId;
  player?: Player;
  className?: string;
  variant?: "light" | "dark" | "player";
  showAvatar?: boolean;
}

export function TvNameBadge({
  name,
  avatarId,
  player,
  className,
  variant = "player",
  showAvatar = false,
}: TvNameBadgeProps) {
  const displayName = formatPlayerName(player?.name ?? name ?? "—") || "—";
  const displayAvatarId =
    avatarId ?? (player ? resolveAvatarId(player) : undefined);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded px-2 py-1 text-sm font-black tracking-wider uppercase",
        variant === "light" &&
          "border-2 border-[#00AEEF] bg-white text-black shadow-sm",
        variant === "dark" &&
          "border border-white bg-black text-white shadow-sm",
        variant === "player" &&
          "border-2 border-[#CE93D8] bg-[#6A1B9A] text-white shadow-md",
        className,
      )}
    >
      {showAvatar && displayAvatarId && (
        <PlayerAvatar avatarId={displayAvatarId} size="sm" />
      )}
      <span>{displayName}</span>
    </span>
  );
}
