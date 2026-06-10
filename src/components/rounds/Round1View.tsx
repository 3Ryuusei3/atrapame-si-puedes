import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlayerTurnSummary } from "@/components/shared/PlayerTurnSummary";
import { QuestionCard } from "@/components/shared/QuestionCard";
import { PresenterControls } from "@/components/shared/PresenterControls";
import { Timer } from "@/components/shared/Timer";
import {
  getRound1QuestionCount,
  getRound1Set,
} from "@/engine/round1";
import { ROUND1_BOTE_PER_CORRECT } from "@/engine/scoring";
import { formatScore } from "@/lib/utils";
import { useGameStore } from "@/store/gameStore";
import type { Round1State } from "@/types/game";

export function Round1View() {
  const players = useGameStore((s) => s.players);
  const roundState = useGameStore((s) => s.roundState) as Round1State;
  const boteGlobal = useGameStore((s) => s.boteGlobal);
  const startTimer = useGameStore((s) => s.startTimer);
  const pauseTimer = useGameStore((s) => s.pauseTimer);
  const round1Correct = useGameStore((s) => s.round1Correct);
  const round1Wrong = useGameStore((s) => s.round1Wrong);
  const round1ContinueFromSummary = useGameStore(
    (s) => s.round1ContinueFromSummary,
  );

  const [showAnswer, setShowAnswer] = useState(false);

  const currentPlayer = players[roundState.currentPlayerIndex];
  const playerSet = currentPlayer ? getRound1Set(currentPlayer.order) : undefined;
  const questionCount = currentPlayer
    ? getRound1QuestionCount(currentPlayer.order)
    : 0;
  const q = playerSet?.questions[roundState.questionIndex];
  const showQuestion = roundState.timerStarted;
  const isLastPlayer = roundState.currentPlayerIndex >= 4;
  const turnBote = roundState.turnCorrect * ROUND1_BOTE_PER_CORRECT;

  const handleReveal = () => {
    if (!showAnswer) pauseTimer();
    setShowAnswer(!showAnswer);
  };

  const handleCorrect = () => {
    round1Correct();
    setShowAnswer(false);
  };

  const handleWrong = () => {
    round1Wrong();
    setShowAnswer(false);
  };

  if (roundState.subPhase === "playerSummary") {
    return (
      <PlayerTurnSummary
        title="Fin del turno"
        playerLabel={`J${currentPlayer?.order} — ${currentPlayer?.name}`}
        stats={[
          {
            label: "Aciertos",
            value: String(roundState.turnCorrect),
          },
          {
            label: "Fallos",
            value: String(roundState.turnWrong),
          },
          {
            label: "Preguntas respondidas",
            value: `${roundState.questionsAnswered}/${questionCount}`,
          },
          {
            label: "Puntos al bote en este turno",
            value: `${formatScore(turnBote)} pts`,
          },
          {
            label: "Bote global",
            value: `${formatScore(boteGlobal)} pts`,
            highlight: true,
          },
        ]}
        onContinue={round1ContinueFromSummary}
        continueLabel={
          isLastPlayer ? "Siguiente ronda → Ronda 2" : "Siguiente jugador"
        }
      />
    );
  }

  if (!playerSet) {
    return (
      <p className="text-muted-foreground">
        No hay cadena de preguntas para este jugador.
      </p>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-sm">Jugador activo</p>
          <p className="text-2xl font-bold">
            J{currentPlayer?.order} — {currentPlayer?.name}
          </p>
        </div>
        <Badge variant="gold" className="text-base">
          Bote: {boteGlobal} pts
        </Badge>
      </div>

      <div className="flex flex-col items-center gap-4 py-4">
        <Timer
          seconds={roundState.timerSeconds}
          running={roundState.timerRunning}
        />
        <Button
          size="lg"
          onClick={roundState.timerRunning ? pauseTimer : startTimer}
        >
          {roundState.timerRunning ? "Pausar (Espacio)" : "Iniciar timer"}
        </Button>
      </div>

      {!showQuestion && (
        <p className="text-muted-foreground py-12 text-center text-lg">
          Pulsa «Iniciar timer» para mostrar la pregunta
        </p>
      )}

      {showQuestion && q && (
        <QuestionCard
          question={q.text}
          subtitle={`Pregunta ${roundState.questionIndex + 1}/${questionCount}`}
          answer={q.answer}
          showAnswer={showAnswer}
        />
      )}

      {showQuestion && (
        <PresenterControls
          onReveal={handleReveal}
          revealed={showAnswer}
          onCorrect={handleCorrect}
          onWrong={handleWrong}
          showNext={false}
          disabled={!roundState.timerStarted}
          correctLabel="Acierto (A)"
          wrongLabel="Fallo (F)"
        />
      )}
    </div>
  );
}
