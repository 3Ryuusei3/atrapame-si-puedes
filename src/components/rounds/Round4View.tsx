import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlayerAvatar } from "@/components/shared/PlayerAvatar";
import { RoundSummary } from "@/components/shared/RoundSummary";
import { ScoreDots } from "@/components/shared/ScoreDots";
import { TvAnswerButton } from "@/components/tv/TvAnswerButton";
import { TvGameLayout } from "@/components/tv/TvGameLayout";
import { TvNameBadge } from "@/components/tv/TvNameBadge";
import { TvQuestionBar } from "@/components/tv/TvQuestionBar";
import { questions } from "@/data/questions";
import { resolveAvatarId } from "@/data/playerAvatars";
import { gameGreenText } from "@/lib/gameColors";
import { cn, shuffle } from "@/lib/utils";
import { useGameStore } from "@/store/gameStore";
import type { Player, Round4State } from "@/types/game";

const FEEDBACK_MS = 2000;

type OptionSelection = {
  optionId: string;
  correct: boolean;
};

export function Round4View() {
  const players = useGameStore((s) => s.players);
  const roundState = useGameStore((s) => s.roundState) as Round4State;
  const round4StartPlaying = useGameStore((s) => s.round4StartPlaying);
  const round4Correct = useGameStore((s) => s.round4Correct);
  const round4Wrong = useGameStore((s) => s.round4Wrong);
  const round4NextQuestion = useGameStore((s) => s.round4NextQuestion);
  const round4ContinueFromSummary = useGameStore(
    (s) => s.round4ContinueFromSummary,
  );

  const [selection, setSelection] = useState<OptionSelection | null>(null);
  const [showTeamPoint, setShowTeamPoint] = useState(false);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const q = questions.round4.questions[roundState.questionIndex];
  const target = questions.config.round4TargetCorrect;
  const maxQuestions = questions.round4.questions.length;
  const canGoNext = roundState.questionIndex < maxQuestions - 1;

  const shuffledOptions = useMemo(
    () => (q ? shuffle(q.options) : []),
    [q],
  );

  const teamANames = roundState.teamAPlayerIds
    .map((id) => players.find((p) => p.id === id)?.name)
    .join(" + ");
  const teamBNames = roundState.teamBPlayerIds
    .map((id) => players.find((p) => p.id === id)?.name)
    .join(" + ");

  const isLocked = Boolean(selection);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setSelection(null);
    setShowTeamPoint(false);
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  }, [roundState.questionIndex, roundState.activeTeam]);

  const handleOptionClick = (optionId: string, correct: boolean) => {
    if (isLocked || !q) return;

    setSelection({ optionId, correct });
    if (correct) setShowTeamPoint(true);

    feedbackTimerRef.current = setTimeout(() => {
      if (correct) round4Correct();
      else round4Wrong();
      setSelection(null);
      setShowTeamPoint(false);
      feedbackTimerRef.current = null;
    }, FEEDBACK_MS);
  };

  if (roundState.subPhase === "preview") {
    return (
      <TvGameLayout stageClassName="items-center justify-center gap-8 px-4 py-8">
        <h2 className="text-3xl font-black text-[#FFD700] uppercase">
          Ronda 4 — Parejas
        </h2>
        <p className="max-w-lg text-center text-sm font-semibold text-white/70">
          Formación: 1º+3º vs 2º+4º por puntuación. Gana la pareja que llegue a{" "}
          {target} aciertos.
        </p>
        <div className="grid w-full max-w-2xl gap-6 md:grid-cols-2">
          <div className="rounded-xl border-3 border-[#00AEEF] bg-[#0a1e4a]/80 p-8 text-center">
            <p className="mb-2 text-xs font-semibold text-white/50 uppercase">
              Pareja A
            </p>
            <p className="text-xl font-black text-white">{teamANames}</p>
          </div>
          <div className="rounded-xl border-3 border-[#FFD700] bg-[#0a1e4a]/80 p-8 text-center">
            <p className="mb-2 text-xs font-semibold text-white/50 uppercase">
              Pareja B
            </p>
            <p className="text-xl font-black text-white">{teamBNames}</p>
          </div>
        </div>
        <Button
          size="lg"
          onClick={round4StartPlaying}
          className="border-3 border-[#FFD700] bg-[#FFD700] font-black text-black hover:bg-[#ffe033]"
        >
          Comenzar ronda
        </Button>
      </TvGameLayout>
    );
  }

  if (roundState.subPhase === "summary" && roundState.winningTeam) {
    const winnerNames =
      roundState.winningTeam === "A" ? teamANames : teamBNames;
    const loserIds =
      roundState.winningTeam === "A"
        ? roundState.teamBPlayerIds
        : roundState.teamAPlayerIds;
    const winnerScore =
      roundState.winningTeam === "A"
        ? roundState.teamACorrect
        : roundState.teamBCorrect;
    const loserScore =
      roundState.winningTeam === "A"
        ? roundState.teamBCorrect
        : roundState.teamACorrect;
    const reachedTarget = winnerScore >= target;

    return (
      <RoundSummary
        title="Fin de la Ronda 4"
        subtitle={
          reachedTarget
            ? `Ganadora: Pareja ${roundState.winningTeam} (${winnerNames}) con ${winnerScore} aciertos. La otra pareja queda eliminada (${loserScore}/${target}).`
            : `Ninguna pareja llegó a ${target} aciertos. Gana la Pareja ${roundState.winningTeam} (${winnerNames}) con ${winnerScore} aciertos frente a ${loserScore}.`
        }
        players={players}
        showPositions
        highlightPlayerIds={[...loserIds]}
        highlightLabel="Eliminado"
        onContinue={round4ContinueFromSummary}
        continueLabel="Comenzar final — Ronda 5"
      />
    );
  }

  const activeTeamName =
    roundState.activeTeam === "A" ? teamANames : teamBNames;

  const teamADisplayCorrect =
    roundState.teamACorrect +
    (showTeamPoint && roundState.activeTeam === "A" ? 1 : 0);
  const teamBDisplayCorrect =
    roundState.teamBCorrect +
    (showTeamPoint && roundState.activeTeam === "B" ? 1 : 0);

  return (
    <TvGameLayout
      stageClassName="justify-between gap-6 px-4 py-4"
      footer={
        <div className="tv-presenter-dock border-t border-white/10 bg-black/50 px-4 py-3 backdrop-blur-sm">
          <p className="mb-2 text-center text-[10px] font-semibold tracking-widest text-white/40 uppercase">
            Controles del presentador
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              variant="outline"
              size="lg"
              disabled={!canGoNext || isLocked}
              onClick={round4NextQuestion}
              className="border-white/30 bg-transparent text-white hover:bg-white/10"
            >
              Siguiente pregunta
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid w-full max-w-4xl shrink-0 gap-6 self-center md:grid-cols-2">
        <div className="relative">
          <ScoreDots
            label="Pareja A"
            correct={teamADisplayCorrect}
            target={target}
            active={roundState.activeTeam === "A"}
          />
          <TeamPlayerAvatars
            playerIds={roundState.teamAPlayerIds}
            players={players}
            active={roundState.activeTeam === "A"}
          />
          {showTeamPoint && roundState.activeTeam === "A" && (
            <span className={cn("animate-score-delta pointer-events-none absolute top-6 right-0 text-4xl font-black", gameGreenText)}>
              +1
            </span>
          )}
        </div>
        <div className="relative">
          <ScoreDots
            label="Pareja B"
            correct={teamBDisplayCorrect}
            target={target}
            active={roundState.activeTeam === "B"}
          />
          <TeamPlayerAvatars
            playerIds={roundState.teamBPlayerIds}
            players={players}
            active={roundState.activeTeam === "B"}
          />
          {showTeamPoint && roundState.activeTeam === "B" && (
            <span className={cn("animate-score-delta pointer-events-none absolute top-6 right-0 text-4xl font-black", gameGreenText)}>
              +1
            </span>
          )}
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-end gap-4">
        <TvNameBadge name={activeTeamName} className="self-center" />

        {q && (
          <div className="w-full space-y-4">
            <TvQuestionBar>{q.text}</TvQuestionBar>
            <div className="grid gap-3 md:grid-cols-2">
              {shuffledOptions.map((opt) => {
                const isSelected = selection?.optionId === opt.id;
                const showGreen = isSelected && selection.correct;
                const showRed = isSelected && selection && !selection.correct;

                return (
                  <TvAnswerButton
                    key={opt.id}
                    variant="black"
                    disabled={isLocked}
                    feedback={
                      showGreen ? "correct" : showRed ? "wrong" : null
                    }
                    onClick={() => handleOptionClick(opt.id, opt.isCorrect)}
                    className="text-center md:py-5 md:text-xl"
                  >
                    {opt.text}
                  </TvAnswerButton>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </TvGameLayout>
  );
}

function TeamPlayerAvatars({
  playerIds,
  players,
  active,
}: {
  playerIds: string[];
  players: Player[];
  active: boolean;
}) {
  return (
    <div className="mt-4 flex items-start justify-center gap-6">
      {playerIds.map((id) => {
        const player = players.find((p) => p.id === id);
        if (!player) return null;

        return (
          <div
            key={id}
            className={cn(
              "flex flex-col items-center gap-2",
              !active && "opacity-75",
            )}
          >
            <PlayerAvatar
              avatarId={resolveAvatarId(player)}
              size="hero"
              className={cn(
                "!size-24 md:!size-28",
                active && "border-accent shadow-[0_0_20px_rgba(255,215,0,0.55)]",
              )}
            />
            <span
              className={cn(
                "max-w-[7rem] text-center text-xs leading-tight font-bold text-white uppercase",
                active && "text-[#FFD700]",
              )}
            >
              {player.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
