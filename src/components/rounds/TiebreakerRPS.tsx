import { Button } from "@/components/ui/button";
import { PlayerAvatar } from "@/components/shared/PlayerAvatar";
import { resolveAvatarId } from "@/data/playerAvatars";
import { useGameStore } from "@/store/gameStore";
import type { TiebreakerState } from "@/types/game";

export function TiebreakerRPS() {
  const players = useGameStore((s) => s.players);
  const roundState = useGameStore((s) => s.roundState) as TiebreakerState;
  const tiebreakerSetWinner = useGameStore((s) => s.tiebreakerSetWinner);

  const tiedPlayers = players.filter((p) =>
    roundState.tiedPlayerIds.includes(p.id),
  );

  return (
    <div className="flex h-full min-h-0 flex-col items-center justify-center gap-6 overflow-y-auto px-4 py-8">
      <div className="w-full max-w-lg rounded-xl border-3 border-[#00AEEF]/50 bg-[#0a1e4a]/90 p-8 shadow-lg">
        <h2 className="mb-4 text-center text-2xl font-black text-[#FFD700] uppercase">
          Desempate — Piedra / Papel / Tijera
        </h2>
        <p className="mb-6 text-center text-sm font-semibold text-white/70">
          Empate en último lugar. El presentador registra quién gana el
          minijuego y continúa a la Ronda 4.
        </p>
        <div className="flex flex-col gap-3">
          {tiedPlayers.map((p) => (
            <Button
              key={p.id}
              size="lg"
              onClick={() => tiebreakerSetWinner(p.id)}
              className="h-auto border-3 border-[#00AEEF] bg-white py-3 font-black text-black hover:bg-[#e8f7ff]"
            >
              <span className="flex items-center justify-center gap-3">
                <PlayerAvatar avatarId={resolveAvatarId(p)} size="md" />
                Gana: J{p.order} — {p.name}
              </span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
