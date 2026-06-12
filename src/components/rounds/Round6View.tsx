import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ActiveTurnSpotlight } from "@/components/shared/ActiveTurnSpotlight";
import { ConfettiBurst } from "@/components/shared/ConfettiBurst";
import { PlayerTurnSummary } from "@/components/shared/PlayerTurnSummary";
import { PoopRain } from "@/components/shared/PoopRain";
import { PresenterControls } from "@/components/shared/PresenterControls";
import { QuestionCard } from "@/components/shared/QuestionCard";
import { Timer } from "@/components/shared/Timer";
import { TvGameLayout } from "@/components/tv/TvGameLayout";
import { TvTopicBar, TvTopicPill } from "@/components/tv/TvTopicBar";
import { questions } from "@/data/questions";
import { cn } from "@/lib/utils";
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

  const [currentRevealed, setCurrentRevealed] = useState(false);

  const player = players.find((p) => p.id === roundState.playerId);
  const topics = questions.round6.topics;
  const currentTopic = topics[roundState.currentTopicIndex];
  const currentCompleted =
    currentTopic && roundState.completedTopicIds.includes(currentTopic.id);
  const maxSeconds = questions.config.round6TimerSeconds;

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
    const wonBote = roundState.boteEarned > 0;

    return (
      <div className="relative flex h-full min-h-0 flex-col">
        {wonBote ? <ConfettiBurst /> : <PoopRain />}
        <PlayerTurnSummary
          title={questions.round6.name ?? "RESUMEN"}
          player={player}
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
          ]}
          results={topics.map((topic) => {
            const completed = roundState.completedTopicIds.includes(topic.id);

            return {
              id: topic.id,
              label: topic.name,
              status: completed ? ("correct" as const) : ("wrong" as const),
            };
          })}
        />
      </div>
    );
  }

  const getTopicState = (
    topicId: string,
    index: number,
  ): "idle" | "active" | "completed" | "failed" => {
    if (roundState.completedTopicIds.includes(topicId)) return "completed";
    if (
      roundState.timerStarted &&
      index === roundState.currentTopicIndex &&
      !currentCompleted
    ) {
      return "active";
    }
    if (
      roundState.failedTopicIds.includes(topicId) &&
      !roundState.completedTopicIds.includes(topicId)
    ) {
      return "failed";
    }
    return "idle";
  };

  return (
    <TvGameLayout
      stageClassName="justify-between gap-4 px-4 py-4"
      footer={
        <>
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
          <div className="px-4 pb-3">
            <Button
              variant="secondary"
              onClick={round6Finish}
              className={cn(
                "w-full border-white/20 bg-black/40 text-white/70 hover:bg-black/60",
              )}
            >
              Finalizar ronda del bote
            </Button>
          </div>
        </>
      }
    >
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6">
        <ActiveTurnSpotlight player={player} showLabel={false} />

        <div className="flex flex-col items-center gap-3">
          <Timer
            seconds={roundState.timerSeconds}
            running={roundState.timerRunning}
            maxSeconds={maxSeconds}
          />
          <Button
            size="lg"
            onClick={
              roundState.timerRunning ? round6PauseTimer : round6StartTimer
            }
            className="border-3 border-[#FFD700] bg-[#FFD700] font-black text-black hover:bg-[#ffe033]"
          >
            {roundState.timerRunning ? "Parar (Espacio)" : "Iniciar timer"}
          </Button>
        </div>

        <TvTopicBar>
          {topics.map((topic, index) => (
            <TvTopicPill
              key={topic.id}
              name={topic.name}
              state={getTopicState(topic.id, index)}
            />
          ))}
        </TvTopicBar>
      </div>

      <div className="mx-auto w-full shrink-0">
        {currentTopic && !currentCompleted && roundState.timerStarted && (
          <QuestionCard
            question={currentTopic.question.text}
            subtitle={currentTopic.name}
            answer={currentTopic.question.answer}
            showAnswer={currentRevealed}
          />
        )}
        {!roundState.timerStarted && (
          <p className="text-center text-sm font-semibold text-white/50">
            Inicia el temporizador para comenzar
          </p>
        )}
      </div>
    </TvGameLayout>
  );
}
