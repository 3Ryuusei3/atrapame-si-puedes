import { useEffect } from "react";
import { useGameStore } from "@/store/gameStore";

export function useGameTimer() {
  const phase = useGameStore((s) => s.phase);
  const round1Running = useGameStore((s) => {
    const rs = s.roundState;
    return phase === "round1" && "timerRunning" in rs ? rs.timerRunning : false;
  });
  const round6Running = useGameStore((s) => {
    const rs = s.roundState;
    return phase === "round6" && "timerRunning" in rs ? rs.timerRunning : false;
  });
  const tickTimer = useGameStore((s) => s.tickTimer);
  const round6TickTimer = useGameStore((s) => s.round6TickTimer);

  useEffect(() => {
    if (phase === "round1" && round1Running) {
      const id = setInterval(tickTimer, 1000);
      return () => clearInterval(id);
    }
    if (phase === "round6" && round6Running) {
      const id = setInterval(round6TickTimer, 1000);
      return () => clearInterval(id);
    }
  }, [phase, round1Running, round6Running, tickTimer, round6TickTimer]);
}
