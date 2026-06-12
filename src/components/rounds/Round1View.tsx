import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AnswerRevealBox } from "@/components/shared/AnswerRevealBox";
import { ActiveTurnSpotlight } from "@/components/shared/ActiveTurnSpotlight";
import { PlayerTurnSummary } from "@/components/shared/PlayerTurnSummary";
import { PresenterControls } from "@/components/shared/PresenterControls";
import { Timer } from "@/components/shared/Timer";
import { TvGameLayout } from "@/components/tv/TvGameLayout";
import { TvQuestionBar } from "@/components/tv/TvQuestionBar";
import { TvScoreBox } from "@/components/tv/TvScoreBox";
import {
  getRound1QuestionCount,
  getRound1Set,
} from "@/engine/round1";
import { ROUND1_BOTE_PER_CORRECT } from "@/engine/scoring";
import { formatScore } from "@/lib/utils";
import { questions } from "@/data/questions";
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
  const maxSeconds = questions.config.round1TimerSeconds;

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
        player={currentPlayer}
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
      <p className="text-white/60">
        No hay cadena de preguntas para este jugador.
      </p>
    );
  }

  return (
    <TvGameLayout
      stageClassName="justify-between px-4 py-4"
      footer={
        showQuestion ? (
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
        ) : undefined
      }
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <ActiveTurnSpotlight
          player={currentPlayer}
          className="min-h-0 flex-1"
        />

        <div className="flex shrink-0 flex-col justify-end gap-6">
        {!showQuestion && (
          <div className="flex flex-col items-center gap-4">
            <Timer
              seconds={roundState.timerSeconds}
              running={roundState.timerRunning}
              maxSeconds={maxSeconds}
            />
            <Button
              size="lg"
              onClick={roundState.timerRunning ? pauseTimer : startTimer}
              className="border-3 border-[#FFD700] bg-[#FFD700] font-black text-black hover:bg-[#ffe033]"
            >
              {roundState.timerRunning ? "Pausar (Espacio)" : "Iniciar timer"}
            </Button>
            <p className="text-sm font-semibold text-white/50">
              Pulsa «Iniciar timer» para mostrar la pregunta
            </p>
          </div>
        )}

        {showQuestion && q && (
          <div className="relative mx-auto w-full max-w-4xl">
            <TvScoreBox
              value={formatScore(boteGlobal)}
              label="Bote"
              size="md"
              className="absolute top-0 right-0 z-10 items-end"
            />
            <div className="flex items-start gap-4 pr-28">
              <div className="shrink-0">
                <Timer
                  seconds={roundState.timerSeconds}
                  running={roundState.timerRunning}
                  maxSeconds={maxSeconds}
                />
              </div>
              <div className="min-w-0 flex-1">
                <TvQuestionBar
                  subtitle={`Pregunta ${roundState.questionIndex + 1}/${questionCount}`}
                >
                  {q.text}
                </TvQuestionBar>
                <AnswerRevealBox
                  answer={q.answer}
                  visible={showAnswer}
                  className="mt-3"
                />
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </TvGameLayout>
  );
}
