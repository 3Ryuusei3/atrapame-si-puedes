import { Button } from "@/components/ui/button";
import { PlayerAvatar } from "@/components/shared/PlayerAvatar";
import { resolveAvatarId } from "@/data/playerAvatars";
import { cn, formatScore } from "@/lib/utils";
import type { Player } from "@/types/game";

interface RoundSummaryProps {
  title: string;
  subtitle?: string;
  players: Player[];
  showPositions?: boolean;
  showTotal?: boolean;
  totalLabel?: string;
  totalValue?: number;
  highlightPlayerId?: string;
  highlightPlayerIds?: string[];
  highlightLabel?: string;
  onContinue: () => void;
  continueLabel?: string;
}

export function RoundSummary({
  title,
  subtitle,
  players,
  showPositions = false,
  showTotal = false,
  totalLabel = "Puntuación total",
  totalValue = 0,
  highlightPlayerId,
  highlightPlayerIds,
  highlightLabel = "Eliminado",
  onContinue,
  continueLabel = "Comenzar ronda",
}: RoundSummaryProps) {
  const highlightedIds = highlightPlayerIds ?? (
    highlightPlayerId ? [highlightPlayerId] : []
  );

  const ranked = [...players]
    .filter((p) => p.isActive)
    .sort((a, b) => b.score - a.score || a.order - b.order);

  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center gap-6 overflow-y-auto px-4 py-6">
      <div className="text-center">
        <h2 className="text-3xl font-black text-[#FFD700] uppercase">{title}</h2>
        {subtitle && (
          <p className="mt-2 text-sm font-semibold text-white/70">{subtitle}</p>
        )}
      </div>

      <div className="w-full max-w-lg rounded-xl border-3 border-[#00AEEF]/50 bg-[#0a1e4a]/90 p-6 shadow-lg">
        <h3 className="mb-4 text-center text-sm font-black tracking-widest text-[#00AEEF] uppercase">
          Resumen de puntuaciones
        </h3>
        <div className="flex flex-col gap-2">
          {ranked.map((p, i) => (
            <div
              key={p.id}
              className={cn(
                "flex items-center justify-between rounded-lg border border-[#00AEEF]/20 bg-[#00AEEF]/10 px-4 py-3",
                highlightedIds.includes(p.id) &&
                  "border-red-500/50 bg-red-500/15",
              )}
            >
              <div className="flex items-center gap-3">
                {showPositions && (
                  <span className="w-8 font-black text-[#FFD700]">{i + 1}º</span>
                )}
                <PlayerAvatar avatarId={resolveAvatarId(p)} size="sm" />
                <span className="font-bold text-white">
                  J{p.order} — {p.name}
                </span>
                {highlightedIds.includes(p.id) && (
                  <span className="rounded bg-red-500 px-2 py-0.5 text-xs font-black text-white uppercase">
                    {highlightLabel}
                  </span>
                )}
              </div>
              <span className="font-black text-[#FFD700] tabular-nums">
                {formatScore(p.score)} pts
              </span>
            </div>
          ))}
          {showTotal && (
            <div className="mt-2 flex items-center justify-between rounded-lg border-3 border-[#FFD700]/40 bg-[#FFD700]/10 px-4 py-3">
              <span className="font-bold text-white">{totalLabel}</span>
              <span className="text-xl font-black text-[#FFD700]">
                {formatScore(totalValue)} pts
              </span>
            </div>
          )}
        </div>
      </div>

      <Button
        size="lg"
        onClick={onContinue}
        className="border-3 border-[#FFD700] bg-[#FFD700] font-black text-black hover:bg-[#ffe033]"
      >
        {continueLabel}
      </Button>
    </div>
  );
}
