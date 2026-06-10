import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScoreDots } from "@/components/shared/ScoreDots";
import { questions } from "@/data/questions";
import { useGameStore } from "@/store/gameStore";
import type { Round4State } from "@/types/game";
import { cn } from "@/lib/utils";

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

  const [selection, setSelection] = useState<OptionSelection | null>(null);
  const [showTeamPoint, setShowTeamPoint] = useState(false);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const q = questions.round4.questions[roundState.questionIndex];
  const target = questions.config.round4TargetCorrect;

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
      <div className="flex flex-1 flex-col items-center justify-center gap-8 py-8">
        <h2 className="text-primary text-3xl font-bold">Ronda 4 — Parejas</h2>
        <p className="text-muted-foreground text-center">
          Formación: 1º+3º vs 2º+4º por puntuación. Gana la pareja que llegue a{" "}
          {target} aciertos. Pulsa una opción para responder.
        </p>
        <div className="grid w-full max-w-2xl gap-6 md:grid-cols-2">
          <Card className="border-primary/30">
            <CardContent className="pt-8 text-center">
              <p className="text-muted-foreground mb-2 text-sm">Pareja A</p>
              <p className="text-2xl font-bold">{teamANames}</p>
            </CardContent>
          </Card>
          <Card className="border-accent/30">
            <CardContent className="pt-8 text-center">
              <p className="text-muted-foreground mb-2 text-sm">Pareja B</p>
              <p className="text-2xl font-bold">{teamBNames}</p>
            </CardContent>
          </Card>
        </div>
        <Button size="lg" onClick={round4StartPlaying}>
          Comenzar ronda
        </Button>
      </div>
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
    <div className="flex flex-1 flex-col gap-6">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative">
          <ScoreDots
            label={`Pareja A: ${teamANames}`}
            correct={teamADisplayCorrect}
            target={target}
            active={roundState.activeTeam === "A"}
          />
          {showTeamPoint && roundState.activeTeam === "A" && (
            <span className="animate-score-delta text-primary pointer-events-none absolute top-6 right-0 text-4xl font-bold">
              +1
            </span>
          )}
        </div>
        <div className="relative">
          <ScoreDots
            label={`Pareja B: ${teamBNames}`}
            correct={teamBDisplayCorrect}
            target={target}
            active={roundState.activeTeam === "B"}
          />
          {showTeamPoint && roundState.activeTeam === "B" && (
            <span className="animate-score-delta text-primary pointer-events-none absolute top-6 right-0 text-4xl font-bold">
              +1
            </span>
          )}
        </div>
      </div>

      <Badge variant="gold" className="w-fit text-base">
        Turno: {activeTeamName}
      </Badge>

      {q && (
        <Card>
          <CardContent className="pt-6">
            <p className="mb-6 text-2xl font-semibold">{q.text}</p>
            <div className="grid gap-3 md:grid-cols-2">
              {q.options.map((opt) => {
                const isSelected = selection?.optionId === opt.id;
                const showGreen = isSelected && selection.correct;
                const showRed = isSelected && selection && !selection.correct;

                return (
                  <Button
                    key={opt.id}
                    type="button"
                    variant="outline"
                    disabled={isLocked}
                    onClick={() => handleOptionClick(opt.id, opt.isCorrect)}
                    className={cn(
                      "h-auto min-h-16 justify-start px-4 py-4 text-left text-lg whitespace-normal transition-all duration-300",
                      showGreen &&
                        "border-emerald-500 bg-emerald-500/25 ring-2 ring-emerald-500 hover:bg-emerald-500/25",
                      showRed &&
                        "border-destructive bg-destructive/25 ring-2 ring-destructive hover:bg-destructive/25",
                    )}
                  >
                    {opt.text}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
