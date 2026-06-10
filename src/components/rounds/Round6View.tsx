import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerTurnSummary } from "@/components/shared/PlayerTurnSummary";
import { PresenterControls } from "@/components/shared/PresenterControls";
import { QuestionCard } from "@/components/shared/QuestionCard";
import { Timer } from "@/components/shared/Timer";
import { questions } from "@/data/questions";
import { cn, formatScore } from "@/lib/utils";
import { useGameStore } from "@/store/gameStore";
import type { Round6State } from "@/types/game";

export function Round6View() {
  const players = useGameStore((s) => s.players);
  const roundState = useGameStore((s) => s.roundState) as Round6State;
  const round6StartTimer = useGameStore((s) => s.round6StartTimer);
  const round6PauseTimer = useGameStore((s) => s.round6PauseTimer);
  const round6Correct = useGameStore((s) => s.round6Correct);
  const round6Wrong = useGameStore((s) => s.round6Wrong);
  const round6NextTopic = useGameStore((s) => s.round6NextTopic);
  const round6Finish = useGameStore((s) => s.round6Finish);
  const round6ContinueFromSummary = useGameStore(
    (s) => s.round6ContinueFromSummary,
  );

  const [currentRevealed, setCurrentRevealed] = useState(false);

  const player = players.find((p) => p.id === roundState.playerId);
  const topics = questions.round6.topics;
  const currentTopic = topics[roundState.currentTopicIndex];
  const currentCompleted =
    currentTopic &&
    roundState.completedTopicIds.includes(currentTopic.id);

  useEffect(() => {
    setCurrentRevealed(false);
  }, [roundState.currentTopicIndex]);

  const handleReveal = () => {
    if (!currentRevealed) round6PauseTimer();
    setCurrentRevealed(!currentRevealed);
  };

  const resetReveal = () => setCurrentRevealed(false);

  const correctCount = roundState.completedTopicIds.length;
  const wrongCount = roundState.failureCount;

  if (roundState.subPhase === "summary") {
    return (
      <PlayerTurnSummary
        title={questions.round6.name ?? "El Minuto Final"}
        playerLabel={player?.name ?? "—"}
        stats={[
          {
            label: "Aciertos",
            value: String(correctCount),
          },
          {
            label: "Fallos",
            value: String(wrongCount),
          },
          {
            label: "Bote ganado",
            value: `${formatScore(roundState.boteEarned)} pts`,
            highlight: true,
          },
        ]}
        results={topics.map((topic) => {
          const completed = roundState.completedTopicIds.includes(topic.id);

          return {
            id: topic.id,
            label: topic.name,
            status: completed ? ("correct" as const) : ("wrong" as const),
          };
        })}
        onContinue={round6ContinueFromSummary}
        continueLabel="Ver ganador"
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm">Ganador de la final</p>
          <p className="text-2xl font-bold">{player?.name}</p>
        </div>
        <Badge variant="gold" className="text-lg">
          Bote ganado: {roundState.boteEarned} pts
        </Badge>
      </div>

      <div className="flex flex-col items-center gap-4">
        <Timer
          seconds={roundState.timerSeconds}
          running={roundState.timerRunning}
        />
        <Button
          size="lg"
          onClick={
            roundState.timerRunning ? round6PauseTimer : round6StartTimer
          }
        >
          {roundState.timerRunning
            ? "Parar tiempo (Espacio)"
            : "Iniciar temporizador"}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {topics.map((topic, index) => {
          const completed = roundState.completedTopicIds.includes(topic.id);
          const failed = roundState.failedTopicIds.includes(topic.id);
          const isCurrent =
            index === roundState.currentTopicIndex && !completed;

          return (
            <Card
              key={topic.id}
              className={cn(
                "text-center transition-all",
                completed && "border-emerald-500/50 bg-emerald-500/10",
                failed && !completed && "border-destructive/50 bg-destructive/10",
                isCurrent && "ring-primary ring-2",
              )}
            >
              <CardHeader className="p-4">
                <CardTitle className="flex flex-col items-center gap-1 text-base">
                  <span>{topic.name}</span>
                  {completed && (
                    <span className="text-emerald-400 text-sm">✓</span>
                  )}
                  {failed && !completed && (
                    <span className="text-destructive text-sm">✗</span>
                  )}
                </CardTitle>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {currentTopic && !currentCompleted && (
        <QuestionCard
          question={currentTopic.question.text}
          subtitle={currentTopic.name}
          answer={currentTopic.question.answer}
          showAnswer={currentRevealed}
        />
      )}

      {roundState.timerStarted && currentTopic && !currentCompleted && (
        <PresenterControls
          onReveal={handleReveal}
          revealed={currentRevealed}
          revealLabel={`Revelar — ${currentTopic.name}`}
          onCorrect={() => {
            round6Correct();
            resetReveal();
          }}
          onWrong={() => {
            round6Wrong();
            resetReveal();
          }}
          onNext={() => {
            round6NextTopic();
            resetReveal();
          }}
          showNext
          nextLabel="Siguiente tema (sin revelar)"
          correctLabel="Acierto (A)"
          wrongLabel="Fallo (F)"
        />
      )}

      <Button variant="secondary" onClick={round6Finish}>
        Finalizar ronda del bote
      </Button>
    </div>
  );
}
