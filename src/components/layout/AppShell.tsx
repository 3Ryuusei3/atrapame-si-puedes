import { RoundHeader } from "./RoundHeader";
import { Scoreboard } from "./Scoreboard";
import { Round1View } from "@/components/rounds/Round1View";
import { Round2View } from "@/components/rounds/Round2View";
import { Round3View } from "@/components/rounds/Round3View";
import { Round4View } from "@/components/rounds/Round4View";
import { Round5View } from "@/components/rounds/Round5View";
import { Round6View } from "@/components/rounds/Round6View";
import { TiebreakerRPS } from "@/components/rounds/TiebreakerRPS";
import { FinalScreen } from "@/components/rounds/FinalScreen";
import { useGameStore } from "@/store/gameStore";
import { useGameTimer } from "@/hooks/useTimer";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import type { GamePhase } from "@/types/game";

function RoundView() {
  const phase = useGameStore((s) => s.phase);

  switch (phase) {
    case "round1":
      return <Round1View />;
    case "round2":
      return <Round2View />;
    case "round3":
      return <Round3View />;
    case "round4":
      return <Round4View />;
    case "round5":
      return <Round5View />;
    case "round6":
      return <Round6View />;
    case "tiebreaker":
      return <TiebreakerRPS />;
    case "finished":
      return <FinalScreen />;
    default:
      return null;
  }
}

function showScoreboardForPhase(phase: GamePhase): boolean {
  return phase !== "round4" && phase !== "round5" && phase !== "round6";
}

export function AppShell() {
  useGameTimer();
  useKeyboardShortcuts();

  const phase = useGameStore((s) => s.phase);
  const showScoreboard = showScoreboardForPhase(phase);

  return (
    <div className="flex min-h-screen flex-col">
      <RoundHeader />
      <div className="flex flex-1 gap-4 p-4 lg:p-6">
        <main className="flex min-h-0 flex-1 flex-col gap-4">
          <RoundView />
        </main>
        {showScoreboard && (
          <aside className="hidden w-72 shrink-0 lg:block xl:w-80">
            <Scoreboard />
          </aside>
        )}
      </div>
      {showScoreboard && (
        <div className="px-4 pb-4 lg:hidden">
          <Scoreboard />
        </div>
      )}
    </div>
  );
}
