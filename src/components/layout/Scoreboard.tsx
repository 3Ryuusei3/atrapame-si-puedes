import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScoreDots } from "@/components/shared/ScoreDots";
import { questions } from "@/data/questions";
import { formatScore } from "@/lib/utils";
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
  const target4 = questions.config.round4TargetCorrect;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Marcador</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {phase === "round1" && (
          <div className="bg-primary/10 rounded-lg p-4 text-center">
            <p className="text-muted-foreground text-xs uppercase tracking-wider">
              Bote Global
            </p>
            <p className="text-primary text-3xl font-bold">
              {formatScore(boteGlobal)}
            </p>
          </div>
        )}

        {isRound4 && r4 && r4.subPhase === "playing" && (
          <>
            <ScoreDots
              label={`Pareja A: ${r4.teamAPlayerIds.map((id) => getPlayer(id)?.name ?? "?").join(" + ")}`}
              correct={r4.teamACorrect}
              target={target4}
              active={r4.activeTeam === "A"}
            />
            <ScoreDots
              label={`Pareja B: ${r4.teamBPlayerIds.map((id) => getPlayer(id)?.name ?? "?").join(" + ")}`}
              correct={r4.teamBCorrect}
              target={target4}
              active={r4.activeTeam === "B"}
            />
            <Separator />
          </>
        )}

        {isRound5 && r5 && (
          <>
            <div className="flex justify-between text-sm">
              <span>{getPlayer(r5.finalistAId)?.name}</span>
              <span className="text-primary font-bold">
                Escalón {r5.stepIndexA === 0 ? "inicio" : r5.stepIndexA}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>{getPlayer(r5.finalistBId)?.name}</span>
              <span className="text-primary font-bold">
                Escalón {r5.stepIndexB === 0 ? "inicio" : r5.stepIndexB}
              </span>
            </div>
            <Separator />
          </>
        )}

        {isRound6 && r6 && (
          <div className="bg-primary/10 rounded-lg p-4 text-center">
            <p className="text-muted-foreground text-xs uppercase tracking-wider">
              Bote en juego
            </p>
            <p className="text-primary text-2xl font-bold">
              {formatScore(r6.boteEarned)} pts
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {r6.completedTopicIds.length}/5 temas acertados
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          {players.map((p) => (
            <div
              key={p.id}
              className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                !p.isActive ? "opacity-40 line-through" : "bg-secondary/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  J{p.order}
                </Badge>
                <span className="font-medium">{p.name}</span>
              </div>
              {phase !== "round5" && phase !== "round6" && (
                <span className="text-primary font-mono font-semibold">
                  {formatScore(p.score)}
                </span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
