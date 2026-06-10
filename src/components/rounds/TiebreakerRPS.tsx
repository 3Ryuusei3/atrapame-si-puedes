import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="flex flex-1 flex-col items-center justify-center gap-6">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Desempate — Piedra / Papel / Tijera</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <p className="text-muted-foreground text-center">
            Empate en último lugar. El presentador registra quién gana el
            minijuego y continúa a la Ronda 4.
          </p>
          <div className="flex flex-col gap-3">
            {tiedPlayers.map((p) => (
              <Button
                key={p.id}
                size="lg"
                variant="outline"
                onClick={() => tiebreakerSetWinner(p.id)}
              >
                Gana: J{p.order} — {p.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
