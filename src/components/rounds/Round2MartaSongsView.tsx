import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ActiveTurnSpotlight } from "@/components/shared/ActiveTurnSpotlight";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { MartaAudioPlayer } from "@/components/rounds/MartaAudioPlayer";
import { TvAnswerButton } from "@/components/tv/TvAnswerButton";
import { TvGameLayout } from "@/components/tv/TvGameLayout";
import { TvQuestionBar } from "@/components/tv/TvQuestionBar";
import { TvScoreBox } from "@/components/tv/TvScoreBox";
import {
  ROUND2_MARTA_ALBUMS,
  ROUND2_MARTA_SONGS,
} from "@/data/round2MartaSongs";
import { questions } from "@/data/questions";
import { useGameStore } from "@/store/gameStore";
import type { Player, Round2State } from "@/types/game";
import { formatScore } from "@/lib/utils";

const CORRECT_FEEDBACK_MS = 700;
const WRONG_FEEDBACK_MS = 900;

type MatchFeedback = {
  answerId: string;
  type: "correct" | "wrong";
};

interface Round2MartaSongsViewProps {
  roundState: Round2State;
  currentPlayer: Player;
  onNextPlayer: () => void;
  onEndRound: () => void;
}

export function Round2MartaSongsView({
  roundState,
  currentPlayer,
  onNextPlayer,
  onEndRound,
}: Round2MartaSongsViewProps) {
  const round2SelectAnswer = useGameStore((s) => s.round2SelectAnswer);
  const round2ConfirmMatch = useGameStore((s) => s.round2ConfirmMatch);

  const [confirmAction, setConfirmAction] = useState<"player" | "round" | null>(
    null,
  );
  const [feedback, setFeedback] = useState<MatchFeedback | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStartedPlayback, setHasStartedPlayback] = useState(false);

  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentSong = ROUND2_MARTA_SONGS[roundState.questionStep - 1];
  const visibleAlbums = ROUND2_MARTA_ALBUMS.filter((a) =>
    roundState.visibleAnswerIds.includes(a.id),
  ).sort(
    (a, b) =>
      roundState.shuffledAnswerIds.indexOf(a.id) -
      roundState.shuffledAnswerIds.indexOf(b.id),
  );

  const playerDone = roundState.questionStep > ROUND2_MARTA_SONGS.length;
  const questionPoints =
    questions.config.round2Points[Math.min(roundState.questionStep - 1, 4)];
  const canSelectAlbum = hasStartedPlayback && !feedback;
  const canConfirm =
    currentSong &&
    hasStartedPlayback &&
    roundState.selectedAnswerId &&
    !feedback;

  const handlePlaybackStateChange = useCallback(
    (state: { isPlaying: boolean; hasStarted: boolean }) => {
      setIsPlaying(state.isPlaying);
      setHasStartedPlayback(state.hasStarted);
    },
    [],
  );

  useEffect(() => {
    setFeedback(null);
    setIsPlaying(false);
    setHasStartedPlayback(false);
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
  }, [roundState.questionStep, roundState.currentPlayerIndex]);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const handleConfirm = useCallback(() => {
    if (
      !currentSong ||
      !roundState.selectedAnswerId ||
      feedback ||
      !hasStartedPlayback
    ) {
      return;
    }

    const album = ROUND2_MARTA_ALBUMS.find(
      (a) => a.id === roundState.selectedAnswerId,
    );
    const correct = album?.matchesSongId === currentSong.id;

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
    currentSong,
    roundState.selectedAnswerId,
    feedback,
    hasStartedPlayback,
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
                disabled={isPlaying || Boolean(feedback)}
                onClick={() => setConfirmAction("player")}
                className="border-white/30 bg-transparent text-white hover:bg-white/10"
              >
                Siguiente jugador
              </Button>
              <Button
                disabled={isPlaying || Boolean(feedback)}
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
              {visibleAlbums.map((album) => {
                const selected = roundState.selectedAnswerId === album.id;
                const answerFeedback =
                  feedback?.answerId === album.id ? feedback.type : null;

                return (
                  <TvAnswerButton
                    key={album.id}
                    selected={selected}
                    feedback={answerFeedback}
                    disabled={!canSelectAlbum}
                    onClick={() => {
                      if (!canSelectAlbum) return;
                      round2SelectAnswer(album.id);
                    }}
                  >
                    {album.text}
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
            {currentSong && !playerDone && (
              <div className="w-full space-y-3">
                <div className="flex items-end gap-3">
                  <TvScoreBox
                    value={formatScore(currentPlayer.score)}
                    size="lg"
                  />
                  <div className="tv-points-badge size-10 shrink-0">
                    {questionPoints}
                  </div>
                </div>

                <TvQuestionBar
                  subtitle={`Canción ${Math.min(roundState.questionStep, 5)}/5`}
                >
                  {currentSong.question}
                </TvQuestionBar>

                <MartaAudioPlayer
                  key={currentSong.id}
                  src={currentSong.audioSrc}
                  disabled={Boolean(feedback)}
                  onPlaybackStateChange={handlePlaybackStateChange}
                />
              </div>
            )}

            {playerDone && (
              <p className="text-center text-xl font-bold text-white/80">
                Turno de {currentPlayer.name} completado
              </p>
            )}
          </div>
        </div>
      </TvGameLayout>

      <ConfirmDialog
        open={confirmAction === "player"}
        onOpenChange={(o) => !o && setConfirmAction(null)}
        title="¿Pasar al siguiente jugador?"
        description={`Se abandonará el turno de ${currentPlayer.name}. ¿Continuar?`}
        confirmLabel="Siguiente jugador"
        onConfirm={onNextPlayer}
      />
      <ConfirmDialog
        open={confirmAction === "round"}
        onOpenChange={(o) => !o && setConfirmAction(null)}
        title="¿Cerrar Ronda 2?"
        description="Se pasará a la Ronda 3 (Duelos). ¿Estás seguro?"
        confirmLabel="Ir a Ronda 3"
        onConfirm={onEndRound}
      />
    </>
  );
}
