import { resolveAvatarId } from "@/data/playerAvatars";
import { PlayerAvatar } from "@/components/shared/PlayerAvatar";
import { TvScoreBox } from "@/components/tv/TvScoreBox";
import { ScoreDots } from "@/components/shared/ScoreDots";
import { questions } from "@/data/questions";
import { formatScore, cn } from "@/lib/utils";
import { useGameStore } from "@/store/gameStore";
import type { Round4State, Round5State, Round6State } from "@/types/game";

export function Scoreboard() {
  const phase = useGameStore((s) => s.phase);
  const players = useGameStore((s) => s.players);
  const boteGlobal = useGameStore((s) => s.boteGlobal);
  const roundState = useGameStore((s) => s.roundState);

  const isRound4 = phase === "round4" && "teamACorrect" in roundState;
  const isRound5 = phase === "round5" && "stepIndexA" in roundState;
  const isRound6 = phase === "round6" && "boteEarned" in roundState;
  const r4 = isRound4 ? (roundState as Round4State) : null;
  const r5 = isRound5 ? (roundState as Round5State) : null;
  const r6 = isRound6 ? (roundState as Round6State) : null;

  const getPlayer = (id: string) => players.find((p) => p.id === id);
  const rankedPlayers = [...players].sort(
    (a, b) => b.score - a.score || a.order - b.order,
  );
  const target4 = questions.config.round4TargetCorrect;

  const formatTeam = (ids: string[]) =>
    ids.map((id) => getPlayer(id)?.name ?? "?").join(" + ");

  return (
    <div className="flex h-full min-h-0 flex-col rounded-xl border-3 border-[#00AEEF]/50 bg-[#0a1e4a]/90 p-4 shadow-lg backdrop-blur-sm">
      <h2 className="mb-3 text-center text-sm font-black tracking-widest text-[#00AEEF] uppercase">
        Marcador
      </h2>

      <div className="flex flex-col gap-3">
        {phase === "round1" && (
          <div className="flex justify-center">
            <TvScoreBox
              value={formatScore(boteGlobal)}
              label="Bote global"
              size="lg"
            />
          </div>
        )}

        {isRound4 && r4 && r4.subPhase === "playing" && (
          <>
            <ScoreDots
              label={`Pareja A: ${formatTeam(r4.teamAPlayerIds)}`}
              correct={r4.teamACorrect}
              target={target4}
              active={r4.activeTeam === "A"}
            />
            <ScoreDots
              label={`Pareja B: ${formatTeam(r4.teamBPlayerIds)}`}
              correct={r4.teamBCorrect}
              target={target4}
              active={r4.activeTeam === "B"}
            />
            <div className="h-px bg-[#00AEEF]/30" />
          </>
        )}

        {isRound5 && r5 && (
          <>
            {[r5.finalistAId, r5.finalistBId].map((id) => {
              const player = getPlayer(id);
              if (!player) return null;
              const step =
                id === r5.finalistAId ? r5.stepIndexA : r5.stepIndexB;

              return (
                <div
                  key={id}
                  className="flex items-center justify-between gap-2 text-sm font-bold text-white"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <PlayerAvatar
                      avatarId={resolveAvatarId(player)}
                      size="sm"
                    />
                    <span className="truncate">{player.name}</span>
                  </div>
                  <span className="shrink-0 text-[#FFD700]">
                    Escalón {step === 0 ? "inicio" : step}
                  </span>
                </div>
              );
            })}
            <div className="h-px bg-[#00AEEF]/30" />
          </>
        )}

        {isRound6 && r6 && (
          <div className="flex justify-center">
            <TvScoreBox
              value={formatScore(r6.boteEarned)}
              label="Bote en juego"
              size="md"
            />
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          {rankedPlayers.map((p) => (
            <div
              key={p.id}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2",
                !p.isActive
                  ? "opacity-40 line-through"
                  : "bg-[#00AEEF]/10 border border-[#00AEEF]/20",
              )}
            >
              <div className="flex min-w-0 items-center gap-2">
                <PlayerAvatar avatarId={resolveAvatarId(p)} size="sm" />
                <span className="truncate text-sm font-bold text-white">
                  {p.name}
                </span>
              </div>
              {phase !== "round5" && phase !== "round6" && (
                <span className="font-black text-[#FFD700] tabular-nums">
                  {formatScore(p.score)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
