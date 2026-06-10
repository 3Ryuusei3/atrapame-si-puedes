import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { RoundSummary } from "@/components/shared/RoundSummary";
import { questions } from "@/data/questions";
import { useGameStore } from "@/store/gameStore";
import type { Round2State } from "@/types/game";
import { cn } from "@/lib/utils";

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
      setData
    ) {
      initRound2Player();
    }
  }, [
    roundState.subPhase,
    roundState.currentPlayerIndex,
    roundState.visibleAnswerIds.length,
    setData,
    initRound2Player,
  ]);

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

  if (!setData) {
    return (
      <p className="text-muted-foreground">
        No hay set de preguntas para este jugador.
      </p>
    );
  }

  const currentQuestion = setData.questions[roundState.questionStep - 1];
  const visibleAnswers = setData.answers
    .filter((a) => roundState.visibleAnswerIds.includes(a.id))
    .sort(
      (a, b) =>
        roundState.shuffledAnswerIds.indexOf(a.id) -
        roundState.shuffledAnswerIds.indexOf(b.id),
    );
  const canConfirm =
    currentQuestion && roundState.selectedAnswerId && !feedback;
  const playerDone = roundState.questionStep > 5;
  const isLocked = Boolean(feedback);

  const handleConfirm = () => {
    if (!currentQuestion || !roundState.selectedAnswerId || feedback) return;

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
  };

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div>
        <p className="text-muted-foreground text-sm">Jugador activo</p>
        <p className="text-2xl font-bold">
          J{currentPlayer?.order} — {currentPlayer?.name}
        </p>
        <Badge className="mt-2" variant="gold">
          Pregunta {Math.min(roundState.questionStep, 5)}/5 — Valor:{" "}
          {questions.config.round2Points[Math.min(roundState.questionStep - 1, 4)]}{" "}
          pts
        </Badge>
      </div>

      {currentQuestion && roundState.questionStep <= 5 && (
        <Card className="border-primary/30">
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-2 text-sm uppercase tracking-wider">
              Pregunta actual
            </p>
            <p className="text-2xl font-semibold">{currentQuestion.text}</p>
          </CardContent>
        </Card>
      )}

      <div>
        <h3 className="mb-3 font-semibold">
          Respuestas ({visibleAnswers.length} en pantalla)
        </h3>
        <div className="grid gap-2 md:grid-cols-2">
          {visibleAnswers.map((a) => {
            const selected = roundState.selectedAnswerId === a.id;
            const answerFeedback =
              feedback?.answerId === a.id ? feedback.type : null;

            return (
              <Card
                key={a.id}
                className={cn(
                  "py-3 transition-all duration-300",
                  !isLocked && "cursor-pointer hover:bg-secondary/50",
                  isLocked && "pointer-events-none",
                  selected &&
                    !answerFeedback &&
                    "ring-primary ring-2",
                  answerFeedback === "correct" &&
                    "border-emerald-500 bg-emerald-500/25 ring-2 ring-emerald-500",
                  answerFeedback === "wrong" &&
                    "border-destructive bg-destructive/25 ring-2 ring-destructive",
                )}
                onClick={() => {
                  if (isLocked) return;
                  round2SelectAnswer(a.id);
                }}
              >
                <CardContent className="px-4 py-0">{a.text}</CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="success"
          size="lg"
          disabled={!canConfirm}
          onClick={handleConfirm}
        >
          Confirmar emparejamiento
        </Button>
        <Button
          variant="secondary"
          disabled={isLocked}
          onClick={() => setConfirmAction("player")}
        >
          Siguiente jugador
        </Button>
        <Button disabled={isLocked} onClick={() => setConfirmAction("round")}>
          Cerrar Ronda 2
        </Button>
      </div>

      {playerDone && (
        <p className="text-primary text-center font-medium">
          ¡Jugador completado! Pasa al siguiente o cierra la ronda.
        </p>
      )}

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
    </div>
  );
}
