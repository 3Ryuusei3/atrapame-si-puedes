import { resolveAvatarId } from "@/data/playerAvatars";
import { PlayerAvatar } from "@/components/shared/PlayerAvatar";
import { TvNameBadge } from "@/components/tv/TvNameBadge";
import { TvScoreBox } from "@/components/tv/TvScoreBox";
import { gameGreenText, gameRedText } from "@/lib/gameColors";
import { cn, formatScore } from "@/lib/utils";
import type { Player } from "@/types/game";

interface Round3DuelPlayerPanelProps {
  player: Player;
  roleLabel: string;
  scoreDelta?: number;
}

export function Round3DuelPlayerPanel({
  player,
  roleLabel,
  scoreDelta = 0,
}: Round3DuelPlayerPanelProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-start px-2 py-4 lg:px-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-5">
        <div className="relative mx-auto w-full max-w-[12rem]">
          <TvScoreBox value={formatScore(player.score)} size="xl" />
          {scoreDelta !== 0 && (
            <span
              className={cn(
                "animate-score-delta-duel pointer-events-none absolute inset-0 z-10 flex items-center justify-center text-5xl font-black drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] md:text-6xl",
                scoreDelta > 0 ? gameGreenText : gameRedText,
              )}
            >
              {scoreDelta > 0 ? `+${scoreDelta}` : scoreDelta}
            </span>
          )}
        </div>

        <div className="text-center">
          <p className="mb-1 text-xs font-semibold tracking-widest text-white/50 uppercase">
            {roleLabel}
          </p>
          <TvNameBadge player={player} />
        </div>

        <PlayerAvatar
          avatarId={resolveAvatarId(player)}
          size="hero"
          className="shrink-0"
        />
      </div>
    </div>
  );
}
