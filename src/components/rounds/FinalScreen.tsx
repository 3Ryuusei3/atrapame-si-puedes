import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatScore } from "@/lib/utils";
import { useGameStore } from "@/store/gameStore";

export function FinalScreen() {
  const navigate = useNavigate();
  const players = useGameStore((s) => s.players);
  const winnerId = useGameStore((s) => s.winnerId);
  const boteGlobal = useGameStore((s) => s.boteGlobal);
  const resetGame = useGameStore((s) => s.resetGame);

  const winner = players.find((p) => p.id === winnerId);

  const handleNewGame = () => {
    resetGame();
    navigate("/");
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 py-12">
      <div className="text-center">
        <p className="text-primary mb-2 text-sm uppercase tracking-[0.3em]">
          Ganador
        </p>
        <h2 className="text-5xl font-bold md:text-7xl">
          {winner?.name ?? "—"}
        </h2>
        {winner && (
          <p className="text-muted-foreground mt-2 text-lg">
            Jugador {winner.order}
          </p>
        )}
        {boteGlobal > 0 && (
          <p className="text-primary mt-4 text-2xl font-bold">
            Bote final: {formatScore(boteGlobal)} pts
          </p>
        )}
      </div>

      <Card className="border-primary/30 w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Clasificación final</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="flex flex-col gap-2">
            {[...players]
              .sort((a, b) => b.score - a.score)
              .map((p, i) => (
                <li
                  key={p.id}
                  className={`flex justify-between rounded-lg px-3 py-2 ${
                    p.id === winnerId ? "bg-primary/20" : "bg-secondary/30"
                  }`}
                >
                  <span>
                    {i + 1}. {p.name}
                  </span>
                  {!p.isActive && p.id !== winnerId && (
                    <span className="text-muted-foreground text-sm">
                      eliminado
                    </span>
                  )}
                  {p.id === winnerId && (
                    <span className="text-primary font-semibold">Campeón</span>
                  )}
                </li>
              ))}
          </ul>
        </CardContent>
      </Card>

      <Button size="lg" onClick={handleNewGame}>
        Nueva partida
      </Button>
    </div>
  );
}
