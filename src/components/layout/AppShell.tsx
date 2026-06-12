import { RoundHeader } from "./RoundHeader";
import { Scoreboard } from "./Scoreboard";
import { Round1View } from "@/components/rounds/Round1View";
import { Round2View } from "@/components/rounds/Round2View";
import { Round3View } from "@/components/rounds/Round3View";
import { Round4View } from "@/components/rounds/Round4View";
import { Round5View } from "@/components/rounds/Round5View";
import { Round6View } from "@/components/rounds/Round6View";
import { TiebreakerRPS } from "@/components/rounds/TiebreakerRPS";
import { TvBackground } from "@/components/tv/TvBackground";
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
    case "finished":
      return <Round6View />;
    case "tiebreaker":
      return <TiebreakerRPS />;
    default:
      return null;
  }
}

function showScoreboardForPhase(phase: GamePhase): boolean {
  return phase !== "round4" && phase !== "round5" && phase !== "round6" && phase !== "finished";
}

export function AppShell() {
  useGameTimer();
  useKeyboardShortcuts();

  const phase = useGameStore((s) => s.phase);
  const showScoreboard = showScoreboardForPhase(phase);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <RoundHeader />
      <TvBackground variant="blue" className="min-h-0 flex-1">
        <div className="flex h-full min-h-0 gap-4 p-3 lg:p-4">
          <main className="flex h-full min-h-0 min-w-0 flex-1 flex-col">
            <RoundView />
          </main>
          {showScoreboard && (
            <aside className="hidden h-full min-h-0 w-64 shrink-0 lg:block xl:w-72">
              <Scoreboard />
            </aside>
          )}
        </div>
        {showScoreboard && (
          <div className="max-h-[40vh] shrink-0 overflow-auto px-3 pb-3 lg:hidden">
            <Scoreboard />
          </div>
        )}
      </TvBackground>
    </div>
  );
}
