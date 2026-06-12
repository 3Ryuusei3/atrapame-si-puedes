import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ActiveTurnSpotlight } from "@/components/shared/ActiveTurnSpotlight";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { RoundSummary } from "@/components/shared/RoundSummary";
import { Round2MartaSongsView } from "@/components/rounds/Round2MartaSongsView";
import { TvAnswerButton } from "@/components/tv/TvAnswerButton";
import { TvGameLayout } from "@/components/tv/TvGameLayout";
import { TvQuestionBar } from "@/components/tv/TvQuestionBar";
import { TvScoreBox } from "@/components/tv/TvScoreBox";
import { questions } from "@/data/questions";
import { isMartaPlayer } from "@/engine/round2Marta";
import { useGameStore } from "@/store/gameStore";
import type { Round2State } from "@/types/game";
import { formatScore } from "@/lib/utils";

const CORRECT_FEEDBACK_MS = 700;
const WRONG_FEEDBACK_MS = 900;

type MatchFeedback = {
  answerId: string;
  type: "correct" | "wrong";
};

export function Round2View() {
  const players = useGameStore((s) => s.players);
  const boteGlobal = useGameStore((s) => s.boteGlobal);
  const roundState = useGameStore((s) => s.roundState) as Round2State;
  const round2StartPlaying = useGameStore((s) => s.round2StartPlaying);
  const initRound2Player = useGameStore((s) => s.initRound2Player);
  const round2SelectAnswer = useGameStore((s) => s.round2SelectAnswer);
  const round2ConfirmMatch = useGameStore((s) => s.round2ConfirmMatch);
  const round2NextPlayer = useGameStore((s) => s.round2NextPlayer);
  const endRound2 = useGameStore((s) => s.endRound2);

  const [confirmAction, setConfirmAction] = useState<"player" | "round" | null>(
    null,
  );
  const [feedback, setFeedback] = useState<MatchFeedback | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentPlayer = players[roundState.currentPlayerIndex];
  const setData = questions.round2.sets.find(
    (s) => s.playerOrder === currentPlayer?.order,
  );
  const isMartaTurn =
    roundState.subPhase === "playing" &&
    currentPlayer &&
    isMartaPlayer(currentPlayer.name);
  const isMatchingTurn =
    roundState.subPhase === "playing" && !isMartaTurn && Boolean(setData);
  const currentQuestion = setData?.questions[roundState.questionStep - 1];
  const canConfirm = Boolean(
    isMatchingTurn && currentQuestion && roundState.selectedAnswerId && !feedback,
  );

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setFeedback(null);
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  }, [roundState.currentPlayerIndex, roundState.questionStep]);

  useEffect(() => {
    if (
      roundState.subPhase === "playing" &&
      roundState.visibleAnswerIds.length === 0 &&
      (setData || (currentPlayer && isMartaPlayer(currentPlayer.name)))
    ) {
      initRound2Player();
    }
  }, [
    roundState.subPhase,
    roundState.mode,
    roundState.currentPlayerIndex,
    roundState.visibleAnswerIds.length,
    setData,
    currentPlayer,
    initRound2Player,
  ]);

  const handleConfirm = useCallback(() => {
    if (!setData || !currentQuestion || !roundState.selectedAnswerId || feedback) {
      return;
    }

    const answer = setData.answers.find(
      (a) => a.id === roundState.selectedAnswerId,
    );
    const correct = answer?.matchesQuestionId === currentQuestion.id;

    setFeedback({
      answerId: roundState.selectedAnswerId,
      type: correct ? "correct" : "wrong",
    });

    feedbackTimerRef.current = setTimeout(
      () => {
        round2ConfirmMatch(correct);
        setFeedback(null);
        feedbackTimerRef.current = null;
      },
      correct ? CORRECT_FEEDBACK_MS : WRONG_FEEDBACK_MS,
    );
  }, [
    currentQuestion,
    roundState.selectedAnswerId,
    feedback,
    setData,
    round2ConfirmMatch,
  ]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== "Enter") return;
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (!canConfirm) return;
      e.preventDefault();
      handleConfirm();
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [canConfirm, handleConfirm]);

  if (roundState.subPhase === "intro") {
    return (
      <RoundSummary
        title="Ronda 2 — Escalera Individual"
        subtitle="El bote se ha repartido equitativamente entre los jugadores"
        players={players}
        showTotal
        totalLabel="Bote total acumulado"
        totalValue={boteGlobal}
        onContinue={round2StartPlaying}
      />
    );
  }

  if (isMartaTurn && currentPlayer) {
    return (
      <Round2MartaSongsView
        roundState={roundState}
        currentPlayer={currentPlayer}
        onNextPlayer={round2NextPlayer}
        onEndRound={endRound2}
      />
    );
  }

  if (!setData) {
    return (
      <p className="text-white/60">
        No hay set de preguntas para este jugador.
      </p>
    );
  }

  const visibleAnswers = setData.answers
    .filter((a) => roundState.visibleAnswerIds.includes(a.id))
    .sort(
      (a, b) =>
        roundState.shuffledAnswerIds.indexOf(a.id) -
        roundState.shuffledAnswerIds.indexOf(b.id),
    );
  const playerDone = roundState.questionStep > 5;
  const isLocked = Boolean(feedback);
  const questionPoints =
    questions.config.round2Points[Math.min(roundState.questionStep - 1, 4)];

  return (
    <>
      <TvGameLayout
        stageClassName="px-2 py-3"
        footer={
          <div className="tv-presenter-dock border-t border-white/10 bg-black/50 px-4 py-3 backdrop-blur-sm">
            <p className="mb-2 text-center text-[10px] font-semibold tracking-widest text-white/40 uppercase">
              Controles del presentador
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                variant="success"
                size="lg"
                disabled={!canConfirm}
                onClick={handleConfirm}
              >
                Confirmar
              </Button>
              <Button
                variant="outline"
                disabled={isLocked}
                onClick={() => setConfirmAction("player")}
                className="border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                Siguiente jugador
              </Button>
              <Button
                disabled={isLocked}
                onClick={() => setConfirmAction("round")}
                className="border-[#00AEEF]/50 bg-[#0a1e4a] text-white"
              >
                Cerrar Ronda 2
              </Button>
            </div>
            {playerDone && (
              <p className="mt-2 text-center text-sm font-bold text-[#FFD700]">
                ¡Jugador completado! Pasa al siguiente o cierra la ronda.
              </p>
            )}
          </div>
        }
      >
        <div className="flex h-full min-h-0 flex-col gap-4">
          <div className="flex min-h-0 flex-1 gap-4">
            <div className="flex w-full max-w-xs shrink-0 flex-col gap-2 overflow-y-auto">
              {visibleAnswers.map((a) => {
                const selected = roundState.selectedAnswerId === a.id;
                const answerFeedback =
                  feedback?.answerId === a.id ? feedback.type : null;

                return (
                  <TvAnswerButton
                    key={a.id}
                    selected={selected}
                    feedback={answerFeedback}
                    disabled={isLocked}
                    onClick={() => {
                      if (isLocked) return;
                      round2SelectAnswer(a.id);
                    }}
                  >
                    {a.text}
                  </TvAnswerButton>
                );
              })}
            </div>
            <ActiveTurnSpotlight
              player={currentPlayer}
              className="min-h-0 flex-1 self-center"
            />
          </div>

          <div className="shrink-0">
            {currentQuestion && roundState.questionStep <= 5 && (
              <div className="w-full space-y-3">
                <div className="flex items-end gap-3">
                  <TvScoreBox
                    value={formatScore(currentPlayer?.score ?? 0)}
                    size="lg"
                  />
                  <div className="tv-points-badge size-10 shrink-0">
                    {questionPoints}
                  </div>
                </div>
                <TvQuestionBar
                  subtitle={`Pregunta ${Math.min(roundState.questionStep, 5)}/5`}
                >
                  {currentQuestion.text}
                </TvQuestionBar>
              </div>
            )}
          </div>
        </div>
      </TvGameLayout>

      <ConfirmDialog
        open={confirmAction === "player"}
        onOpenChange={(o) => !o && setConfirmAction(null)}
        title="¿Pasar al siguiente jugador?"
        description={`Se abandonará el turno de ${currentPlayer?.name}. ¿Continuar?`}
        confirmLabel="Siguiente jugador"
        onConfirm={round2NextPlayer}
      />
      <ConfirmDialog
        open={confirmAction === "round"}
        onOpenChange={(o) => !o && setConfirmAction(null)}
        title="¿Cerrar Ronda 2?"
        description="Se pasará a la Ronda 3 (Duelos). ¿Estás seguro?"
        confirmLabel="Ir a Ronda 3"
        onConfirm={endRound2}
      />
    </>
  );
}
