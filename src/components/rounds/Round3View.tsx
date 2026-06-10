import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MartialButton } from "@/components/shared/MartialButton";
import { PlayerTurnSummary } from "@/components/shared/PlayerTurnSummary";
import { QuestionCard } from "@/components/shared/QuestionCard";
import { PresenterControls } from "@/components/shared/PresenterControls";
import { RoundSummary } from "@/components/shared/RoundSummary";
import { ScoreDeltaFloater } from "@/components/shared/ScoreDeltaFloater";
import { questions } from "@/data/questions";
import { findLowestScoringPlayers, getDuelQuestionPoints } from "@/engine/scoring";
import { formatScore } from "@/lib/utils";
import { useGameStore } from "@/store/gameStore";
import type { Round3State } from "@/types/game";

const POINT_ANIM_MS = 800;

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
    return (
      <div className="relative flex flex-1 flex-col gap-6">
        {pointAnim && (
          <ScoreDeltaFloater
            challengerName={challenger.name}
            challengedName={challenged.name}
            challengerDelta={pointAnim.challengerDelta}
            challengedDelta={pointAnim.challengedDelta}
          />
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-muted-foreground text-sm">Duelo en curso</p>
            <p className="text-xl font-bold">
              {challenger.name} vs {challenged.name}
            </p>
            {selectedTopic && (
              <p className="text-muted-foreground text-sm">{selectedTopic.name}</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="gold">Duelo {roundState.duelIndex + 1}/5</Badge>
            <Badge variant="outline">
              Pregunta {roundState.questionIndex + 1}/5 — {pointsAtStake} pts
            </Badge>
          </div>
        </div>

        <QuestionCard
          question={currentQ.text}
          subtitle={`Pregunta ${roundState.questionIndex + 1}`}
          answer={currentQ.answer}
          showAnswer={showAnswer}
        />

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
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="flex flex-wrap items-center gap-3">
        <Badge variant="gold">Duelo {roundState.duelIndex + 1}/5</Badge>
        <Badge variant="outline">Elige retado y tema</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Retador</CardTitle>
          </CardHeader>
          <CardContent>
            {challenger && (
              <MartialButton
                label={`J${challenger.order} — ${challenger.name}`}
                sublabel={`${challenger.score} pts`}
                selected
                disabled
                onClick={() => {}}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Retado</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {activePlayers
              .filter((p) => p.id !== roundState.challengerId)
              .map((p) => (
                <MartialButton
                  key={p.id}
                  label={`J${p.order} — ${p.name}`}
                  sublabel={`${p.score} pts`}
                  selected={roundState.challengedId === p.id}
                  onClick={() => {
                    round3SetChallenged(p.id);
                    setShowAnswer(false);
                  }}
                />
              ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Tema</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {availableTopics.map((t) => (
            <MartialButton
              key={t.id}
              label={t.name}
              selected={roundState.selectedTopicId === t.id}
              onClick={() => {
                round3SetTopic(t.id);
                setShowAnswer(false);
              }}
            />
          ))}
        </CardContent>
      </Card>

      {roundState.challengedId && roundState.selectedTopicId && (
        <p className="text-primary text-center text-sm">
          Retado y tema elegidos — cargando duelo…
        </p>
      )}
    </div>
  );
}
