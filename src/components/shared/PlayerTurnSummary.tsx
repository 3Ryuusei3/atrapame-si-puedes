import { Button } from "@/components/ui/button";
import { PlayerAvatar } from "@/components/shared/PlayerAvatar";
import { resolveAvatarId } from "@/data/playerAvatars";
import { cn } from "@/lib/utils";
import type { Player } from "@/types/game";
import {
  gameGreenSoft,
  gameGreenText,
  gameRedSoft,
  gameRedText,
} from "@/lib/gameColors";

export interface PlayerTurnSummaryStat {
  label: string;
  value: string;
  highlight?: boolean;
}

export interface PlayerTurnSummaryResult {
  id: string;
  label: string;
  status: "correct" | "wrong" | "pending";
}

interface PlayerTurnSummaryProps {
  title: string;
  playerLabel: string;
  player?: Player;
  stats: PlayerTurnSummaryStat[];
  results?: PlayerTurnSummaryResult[];
  onContinue?: () => void;
  continueLabel?: string;
}

export function PlayerTurnSummary({
  title,
  playerLabel,
  player,
  stats,
  results,
  onContinue,
  continueLabel,
}: PlayerTurnSummaryProps) {
  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center gap-6 overflow-y-auto px-4 py-6">
      <div className="text-center">
        <h2 className="text-3xl font-black text-[#FFD700] uppercase">{title}</h2>
        <div className="mt-2 flex items-center justify-center gap-3">
          {player && (
            <PlayerAvatar avatarId={resolveAvatarId(player)} size="lg" />
          )}
          <p className="text-xl font-bold text-white">{playerLabel}</p>
        </div>
      </div>

      <div className="w-full max-w-lg rounded-xl border-3 border-[#00AEEF]/50 bg-[#0a1e4a]/90 p-6 shadow-lg">
        <h3 className="mb-4 text-center text-sm font-black tracking-widest text-[#00AEEF] uppercase">
          Resumen del turno
        </h3>
        <div className="flex flex-col gap-2">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className={cn(
                "flex items-center justify-between rounded-lg border border-[#00AEEF]/20 bg-[#00AEEF]/10 px-4 py-3",
                stat.highlight && "border-[#FFD700]/40 bg-[#FFD700]/10",
              )}
            >
              <span className="font-semibold text-white/80">{stat.label}</span>
              <span
                className={cn(
                  "font-black tabular-nums",
                  stat.highlight ? "text-2xl text-[#FFD700]" : "text-white",
                )}
              >
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {results && results.length > 0 && (
        <div className="w-full max-w-lg rounded-xl border-3 border-[#00AEEF]/50 bg-[#0a1e4a]/90 p-6 shadow-lg">
          <h3 className="mb-4 text-center text-sm font-black tracking-widest text-[#00AEEF] uppercase">
            Temas
          </h3>
          <div className="flex flex-col gap-2">
            {results.map((result) => (
              <div
                key={result.id}
                className={cn(
                  "flex items-center justify-between rounded-lg px-4 py-3",
                  result.status === "correct" &&
                    cn("border", gameGreenSoft),
                  result.status === "wrong" &&
                    cn("border opacity-80", gameRedSoft),
                  result.status === "pending" &&
                    "bg-white/5 opacity-60",
                )}
              >
                <span className="text-sm font-bold text-white">{result.label}</span>
                <span className="text-sm font-black">
                  {result.status === "correct" && (
                    <span className={gameGreenText}>✓ Acierto</span>
                  )}
                  {result.status === "wrong" && (
                    <span className={gameRedText}>✗ Fallo</span>
                  )}
                  {result.status === "pending" && (
                    <span className="text-white/40">— Sin intentar</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {onContinue && (
        <Button
          size="lg"
          onClick={onContinue}
          className="border-3 border-[#FFD700] bg-[#FFD700] font-black text-black hover:bg-[#ffe033]"
        >
          {continueLabel ?? "Continuar"}
        </Button>
      )}
    </div>
  );
}
