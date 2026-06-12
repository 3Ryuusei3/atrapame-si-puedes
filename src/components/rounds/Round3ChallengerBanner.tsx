import { resolveAvatarId } from "@/data/playerAvatars";
import { PlayerAvatar } from "@/components/shared/PlayerAvatar";
import { formatScore } from "@/lib/utils";
import type { Player } from "@/types/game";

interface Round3ChallengerBannerProps {
  player: Player;
}

export function Round3ChallengerBanner({ player }: Round3ChallengerBannerProps) {
  return (
    <div className="mx-auto flex max-w-xl items-center gap-4 rounded-xl border-3 border-[#FFD700]/50 bg-[#FFD700]/10 px-6 py-4">
      <PlayerAvatar
        avatarId={resolveAvatarId(player)}
        size="lg"
        className="shrink-0"
      />
      <div className="min-w-0 text-left">
        <p className="mb-1 text-xs font-semibold tracking-widest text-white/50 uppercase">
          Retando
        </p>
        <p className="text-xl font-black text-white">{player.name}</p>
        <p className="text-sm font-bold text-[#FFD700]">
          {formatScore(player.score)} pts
        </p>
      </div>
    </div>
  );
}
