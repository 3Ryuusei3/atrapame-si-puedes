import { Badge } from "@/components/ui/badge";
import { questions } from "@/data/questions";
import { getPhaseLabel } from "@/engine/transitions";
import { useGameStore } from "@/store/gameStore";
import { PresenterOptionsMenu } from "./PresenterOptionsMenu";

export function RoundHeader() {
  const phase = useGameStore((s) => s.phase);
  const currentRound = useGameStore((s) => s.currentRound);

  return (
    <header className="flex items-center justify-between border-b px-6 py-4">
      <div>
        <h1 className="text-primary text-2xl font-bold tracking-tight">
          {questions.config.showName}
        </h1>
        <p className="text-muted-foreground text-sm">{getPhaseLabel(phase)}</p>
      </div>
      <div className="flex items-center gap-3">
        {phase !== "setup" && phase !== "finished" && (
          <Badge variant="gold" className="px-4 py-1.5 text-base">
            Ronda {currentRound}
          </Badge>
        )}
        <PresenterOptionsMenu />
      </div>
    </header>
  );
}
