import { useEffect } from "react";
import { useGameStore } from "@/store/gameStore";

export function useKeyboardShortcuts() {
  const phase = useGameStore((s) => s.phase);
  const round1Correct = useGameStore((s) => s.round1Correct);
  const round1Wrong = useGameStore((s) => s.round1Wrong);
  const pauseTimer = useGameStore((s) => s.pauseTimer);
  const startTimer = useGameStore((s) => s.startTimer);
  const round3Correct = useGameStore((s) => s.round3Correct);
  const round3Wrong = useGameStore((s) => s.round3Wrong);
  const round5Correct = useGameStore((s) => s.round5Correct);
  const round5Wrong = useGameStore((s) => s.round5Wrong);
  const round6Correct = useGameStore((s) => s.round6Correct);
  const round6Wrong = useGameStore((s) => s.round6Wrong);
  const round6StartTimer = useGameStore((s) => s.round6StartTimer);
  const round6PauseTimer = useGameStore((s) => s.round6PauseTimer);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const key = e.key.toLowerCase();

      if (key === "a") {
        if (phase === "round1") {
          const rs = useGameStore.getState().roundState;
          if ("subPhase" in rs && rs.subPhase === "playing") round1Correct();
        } else if (phase === "round3") {
          const rs = useGameStore.getState().roundState;
          if ("subPhase" in rs && rs.subPhase === "dueling") round3Correct();
        }
        else if (phase === "round5") round5Correct();
        else if (phase === "round6") {
          const rs = useGameStore.getState().roundState;
          if ("subPhase" in rs && rs.subPhase === "playing") round6Correct();
        }
      } else if (key === "f") {
        if (phase === "round1") {
          const rs = useGameStore.getState().roundState;
          if ("subPhase" in rs && rs.subPhase === "playing") round1Wrong();
        } else if (phase === "round3") {
          const rs = useGameStore.getState().roundState;
          if ("subPhase" in rs && rs.subPhase === "dueling") round3Wrong();
        }
        else if (phase === "round5") round5Wrong();
        else if (phase === "round6") {
          const rs = useGameStore.getState().roundState;
          if ("subPhase" in rs && rs.subPhase === "playing") round6Wrong();
        }
      } else if (key === " ") {
        e.preventDefault();
        if (phase === "round1") {
          const rs = useGameStore.getState().roundState;
          if ("timerRunning" in rs && "subPhase" in rs && rs.subPhase === "playing") {
            if (rs.timerRunning) pauseTimer();
            else startTimer();
          }
        } else if (phase === "round6") {
          const rs = useGameStore.getState().roundState;
          if ("timerRunning" in rs && "subPhase" in rs && rs.subPhase === "playing") {
            if (rs.timerRunning) round6PauseTimer();
            else round6StartTimer();
          }
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [
    phase,
    round1Correct,
    round1Wrong,
    pauseTimer,
    startTimer,
    round3Correct,
    round3Wrong,
    round5Correct,
    round5Wrong,
    round6Correct,
    round6Wrong,
    round6StartTimer,
    round6PauseTimer,
  ]);
}
