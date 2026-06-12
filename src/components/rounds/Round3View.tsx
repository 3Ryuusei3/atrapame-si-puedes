import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { PlayerTurnSummary } from "@/components/shared/PlayerTurnSummary";
import { PresenterControls } from "@/components/shared/PresenterControls";
import { QuestionCard } from "@/components/shared/QuestionCard";
import { RoundSummary } from "@/components/shared/RoundSummary";
import { Round3ChallengedButton } from "@/components/rounds/Round3ChallengedButton";
import { Round3ChallengerBanner } from "@/components/rounds/Round3ChallengerBanner";
import { Round3DuelPlayerPanel } from "@/components/rounds/Round3DuelPlayerPanel";
import { TvDuelPoints } from "@/components/tv/TvDuelPoints";
import { TvGameLayout } from "@/components/tv/TvGameLayout";
import { TvTopicBarButton } from "@/components/tv/TvTopicBarButton";
import { questions } from "@/data/questions";
import { findLowestScoringPlayers, getDuelQuestionPoints } from "@/engine/scoring";
import { resolveAvatarId } from "@/data/playerAvatars";
import { formatScore } from "@/lib/utils";
import { useGameStore } from "@/store/gameStore";
import type { Round3State } from "@/types/game";

const POINT_ANIM_MS = 1200;

type PointAnim = {
  challengerDelta: number;
  challengedDelta: number;
};

export function Round3View() {
  const players = useGameStore((s) => s.players);
  const roundState = useGameStore((s) => s.roundState) as Round3State;
  const round3StartPlaying = useGameStore((s) => s.round3StartPlaying);
  const round3SetChallenged = useGameStore((s) => s.round3SetChallenged);
  const round3SetTopic = useGameStore((s) => s.round3SetTopic);
  const round3ConfirmDuel = useGameStore((s) => s.round3ConfirmDuel);
  const round3Correct = useGameStore((s) => s.round3Correct);
  const round3Wrong = useGameStore((s) => s.round3Wrong);
  const round3ContinueAfterDuel = useGameStore((s) => s.round3ContinueAfterDuel);
  const endRound3 = useGameStore((s) => s.endRound3);

  const [showAnswer, setShowAnswer] = useState(false);
  const [pointAnim, setPointAnim] = useState<PointAnim | null>(null);
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const challenger = players.find((p) => p.id === roundState.challengerId);
  const challenged = players.find((p) => p.id === roundState.challengedId);
  const availableTopics = questions.round3.topics.filter(
    (t) => !roundState.usedTopicIds.includes(t.id),
  );
  const selectedTopic = questions.round3.topics.find(
    (t) => t.id === roundState.selectedTopicId,
  );
  const currentQ = selectedTopic?.questions[roundState.questionIndex];
  const activePlayers = players.filter((p) => p.isActive);
  const isLocked = Boolean(pointAnim);
  const pointsAtStake = getDuelQuestionPoints(roundState.questionIndex);
  const isLastDuel = roundState.duelIndex >= 4;
  const canConfirmDuel =
    roundState.subPhase === "selecting" &&
    Boolean(roundState.challengedId && roundState.selectedTopicId);
  const selectedChallenged = players.find((p) => p.id === roundState.challengedId);
  const selectedTopicPreview = questions.round3.topics.find(
    (t) => t.id === roundState.selectedTopicId,
  );

  const runWithPointAnim = (
    challengerDelta: number,
    challengedDelta: number,
    action: () => void,
  ) => {
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    setPointAnim({ challengerDelta, challengedDelta });
    animTimerRef.current = setTimeout(() => {
      action();
      setPointAnim(null);
      setShowAnswer(false);
      animTimerRef.current = null;
    }, POINT_ANIM_MS);
  };

  if (roundState.subPhase === "intro") {
    return (
      <RoundSummary
        title="Ronda 3 — Duelos"
        subtitle="Orden de retadores: de mayor a menor puntuación"
        players={players}
        showPositions
        onContinue={round3StartPlaying}
      />
    );
  }

  if (roundState.subPhase === "finalSummary") {
    const loser = findLowestScoringPlayers(players)[0];
    return (
      <RoundSummary
        title="Fin de la Ronda 3"
        subtitle={
          loser
            ? `${loser.name} queda eliminado por tener la menor puntuación`
            : "Clasificación final de la ronda"
        }
        players={players}
        showPositions
        highlightPlayerId={loser?.id}
        highlightLabel="Eliminado"
        onContinue={endRound3}
        continueLabel="Continuar → Ronda 4"
      />
    );
  }

  if (roundState.subPhase === "duelSummary" && challenger && challenged) {
    const start = roundState.duelStartScores;
    const challengerDelta = start
      ? challenger.score - start.challenger
      : 0;
    const challengedDelta = start ? challenged.score - start.challenged : 0;

    return (
      <PlayerTurnSummary
        title={`Fin del duelo ${roundState.duelIndex + 1}/5`}
        playerLabel={`${challenger.name} vs ${challenged.name}`}
        stats={[
          {
            label: challenger.name,
            value: `${challengerDelta >= 0 ? "+" : ""}${formatScore(challengerDelta)} pts`,
          },
          {
            label: challenged.name,
            value: `${challengedDelta >= 0 ? "+" : ""}${formatScore(challengedDelta)} pts`,
          },
          {
            label: "Puntuación actual",
            value: `${formatScore(challenger.score)} / ${formatScore(challenged.score)}`,
            highlight: true,
          },
        ]}
        onContinue={round3ContinueAfterDuel}
        continueLabel={
          isLastDuel ? "Ver resumen final" : "Siguiente duelo"
        }
      />
    );
  }

  if (roundState.subPhase === "dueling" && challenger && challenged && currentQ) {
    const duelQuestionResults = roundState.duelQuestionResults ?? [];

    return (
      <div className="relative flex h-full min-h-0 flex-col">
        <TvGameLayout
          stageClassName="justify-between gap-4 px-2 py-3 lg:px-4"
          footer={
            <PresenterControls
              onReveal={() => setShowAnswer(!showAnswer)}
              revealed={showAnswer}
              onCorrect={() => {
                if (isLocked) return;
                const pts = pointsAtStake;
                runWithPointAnim(-pts, pts, round3Correct);
              }}
              onWrong={() => {
                if (isLocked) return;
                const pts = pointsAtStake;
                runWithPointAnim(pts, -pts, round3Wrong);
              }}
              showNext={false}
              disabled={isLocked}
              correctLabel="Retado acierta (A)"
              wrongLabel="Retado falla (F)"
            />
          }
        >
          <div className="relative flex min-h-[30vh] flex-1 items-stretch">
            <Round3DuelPlayerPanel
              player={challenger}
              roleLabel="Retando"
              scoreDelta={
                pointAnim && pointAnim.challengerDelta !== 0
                  ? pointAnim.challengerDelta
                  : 0
              }
            />

            <div className="tv-duel-divider shrink-0 self-stretch" />

            <Round3DuelPlayerPanel
              player={challenged}
              roleLabel="Retado"
              scoreDelta={
                pointAnim && pointAnim.challengedDelta !== 0
                  ? pointAnim.challengedDelta
                  : 0
              }
            />

            <div className="pointer-events-none absolute top-1/2 right-2 z-10 hidden -translate-y-1/2 lg:block lg:right-4">
              <TvDuelPoints
                questionResults={duelQuestionResults}
                currentIndex={roundState.questionIndex}
              />
            </div>
          </div>

          <div className="mx-auto w-full max-w-4xl shrink-0 px-2">
            <QuestionCard
              question={currentQ.text}
              subtitle={`${selectedTopic?.name} — Pregunta ${roundState.questionIndex + 1} (${pointsAtStake} pts)`}
              answer={currentQ.answer}
              showAnswer={showAnswer}
            />
          </div>
        </TvGameLayout>
      </div>
    );
  }

  return (
    <TvGameLayout
      stageClassName="justify-between gap-4 px-4 py-4"
      footer={
        <div className="tv-presenter-dock border-t border-white/10 bg-black/50 px-4 py-3 backdrop-blur-sm">
          <p className="mb-2 text-center text-[10px] font-semibold tracking-widest text-white/40 uppercase">
            Controles del presentador
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              variant="success"
              size="lg"
              disabled={!canConfirmDuel}
              onClick={round3ConfirmDuel}
            >
              Confirmar duelo
            </Button>
          </div>
          {canConfirmDuel && selectedChallenged && selectedTopicPreview && (
            <p className="mt-2 text-center text-sm font-bold text-[#FFD700]">
              {selectedChallenged.name} · {selectedTopicPreview.name}
            </p>
          )}
        </div>
      }
    >
      <div className="shrink-0 space-y-3 text-center">
        <p className="text-sm font-black tracking-widest text-[#FFD700] uppercase">
          Duelo {roundState.duelIndex + 1}/5
        </p>
        {challenger && <Round3ChallengerBanner player={challenger} />}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 gap-3 overflow-y-auto md:gap-4">
        <div className="space-y-2">
          <p className="text-center text-xs font-semibold tracking-widest text-white/50 uppercase md:text-left">
            Retado
          </p>
          {activePlayers
            .filter((p) => p.id !== roundState.challengerId)
            .map((p) => (
              <Round3ChallengedButton
                key={p.id}
                label={p.name}
                avatarId={resolveAvatarId(p)}
                sublabel={`${formatScore(p.score)} pts`}
                selected={roundState.challengedId === p.id}
                onClick={() => {
                  round3SetChallenged(p.id);
                  setShowAnswer(false);
                }}
              />
            ))}
        </div>

        <div className="space-y-2">
          <p className="text-center text-xs font-semibold tracking-widest text-white/50 uppercase md:text-left">
            Tema
          </p>
          {availableTopics.map((t) => (
            <TvTopicBarButton
              key={t.id}
              label={t.name}
              selected={roundState.selectedTopicId === t.id}
              onClick={() => {
                round3SetTopic(t.id);
                setShowAnswer(false);
              }}
            />
          ))}
        </div>
      </div>
    </TvGameLayout>
  );
}
