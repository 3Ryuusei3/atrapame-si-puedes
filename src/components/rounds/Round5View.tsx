import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PresenterControls } from "@/components/shared/PresenterControls";
import { QuestionCard } from "@/components/shared/QuestionCard";
import { StaircaseLadder } from "@/components/shared/StaircaseLadder";
import { TvGameLayout } from "@/components/tv/TvGameLayout";
import { TvNameBadge } from "@/components/tv/TvNameBadge";
import { resolveAvatarId } from "@/data/playerAvatars";
import { questions } from "@/data/questions";
import { useGameStore } from "@/store/gameStore";
import type { Round5State } from "@/types/game";

export function Round5View() {
  const players = useGameStore((s) => s.players);
  const roundState = useGameStore((s) => s.roundState) as Round5State;
  const round5Correct = useGameStore((s) => s.round5Correct);
  const round5Wrong = useGameStore((s) => s.round5Wrong);
  const round5ContinueFromSummary = useGameStore(
    (s) => s.round5ContinueFromSummary,
  );

  const [showAnswer, setShowAnswer] = useState(false);

  const finalistA = players.find((p) => p.id === roundState.finalistAId);
  const finalistB = players.find((p) => p.id === roundState.finalistBId);
  const winner = players.find((p) => p.id === roundState.winnerPlayerId);
  const q = questions.round5.questions[roundState.questionIndex];
  const isWon = roundState.subPhase === "summary" && Boolean(winner);

  return (
    <TvGameLayout
      stageClassName="justify-between gap-4 px-4 py-3"
      footer={
        isWon ? (
          <div className="flex justify-center px-4 py-3">
            <Button
              size="lg"
              onClick={round5ContinueFromSummary}
              className="border-3 border-[#FFD700] bg-[#FFD700] px-8 font-black text-black hover:bg-[#ffe033]"
            >
              Comenzar Ronda Final
            </Button>
          </div>
        ) : (
          <PresenterControls
            onReveal={() => setShowAnswer(!showAnswer)}
            revealed={showAnswer}
            onCorrect={() => {
              round5Correct();
              setShowAnswer(false);
            }}
            onWrong={() => {
              round5Wrong();
              setShowAnswer(false);
            }}
            showNext={false}
            correctLabel="Acierto"
            wrongLabel="Fallo"
          />
        )
      }
    >
      {isWon && (
        <div className="shrink-0 text-center">
          <p className="text-3xl font-black tracking-wide text-[#FFD700] uppercase">
            ¡{winner!.name} llega al peldaño 5!
          </p>
          <p className="mt-1 text-sm font-semibold text-white/70">
            Gana la final y jugará el bote en el minuto final.
          </p>
        </div>
      )}

      <div className="flex shrink-0 items-center justify-between px-2">
        <TvNameBadge
          player={finalistA}
          className={
            isWon && roundState.winnerPlayerId === roundState.finalistAId
              ? "ring-2 ring-[#FFD700]"
              : !isWon && roundState.activePlayerId === roundState.finalistAId
                ? "ring-2 ring-[#FFD700]"
                : "opacity-75"
          }
        />
        <TvNameBadge
          player={finalistB}
          className={
            isWon && roundState.winnerPlayerId === roundState.finalistBId
              ? "ring-2 ring-[#FFD700]"
              : !isWon && roundState.activePlayerId === roundState.finalistBId
                ? "ring-2 ring-[#FFD700]"
                : "opacity-75"
          }
        />
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-center">
        <StaircaseLadder
          stepIndexA={roundState.stepIndexA}
          stepIndexB={roundState.stepIndexB}
          nameA={finalistA?.name ?? "?"}
          nameB={finalistB?.name ?? "?"}
          activePlayerId={
            isWon ? roundState.winnerPlayerId! : roundState.activePlayerId
          }
          playerAId={roundState.finalistAId}
          playerBId={roundState.finalistBId}
          avatarIdA={finalistA ? resolveAvatarId(finalistA) : "amarillo"}
          avatarIdB={finalistB ? resolveAvatarId(finalistB) : "azul"}
          winnerPlayerId={isWon ? roundState.winnerPlayerId : null}
        />
      </div>

      {!isWon && (
        <div className="mx-auto w-full shrink-0 space-y-3">
          {q && (
            <QuestionCard
              question={q.text}
              answer={q.answer}
              showAnswer={showAnswer}
            />
          )}
        </div>
      )}
    </TvGameLayout>
  );
}
