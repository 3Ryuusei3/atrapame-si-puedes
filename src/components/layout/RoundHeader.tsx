import { questions } from "@/data/questions";
import { getPhaseLabel } from "@/engine/transitions";
import { useGameStore } from "@/store/gameStore";
import { PresenterOptionsMenu } from "./PresenterOptionsMenu";

export function RoundHeader() {
  const phase = useGameStore((s) => s.phase);
  const currentRound = useGameStore((s) => s.currentRound);

  return (
    <header className="flex items-center justify-between border-b border-[#00AEEF]/30 bg-[#061a4a] px-4 py-2 md:px-6 md:py-3">
      <div className="flex min-w-0 items-center gap-3 md:gap-4">
        <img
          src="/logo.png"
          alt={questions.config.showName}
          className="size-12 shrink-0 rounded-md object-cover md:size-14"
        />
        <p className="truncate text-xs font-semibold tracking-wider text-white/60 uppercase md:text-sm">
          {getPhaseLabel(phase)}
        </p>
      </div>
      <div className="flex items-center gap-3">
        {phase !== "setup" && phase !== "finished" && (
          <span className="rounded-lg border-3 border-[#FFD700] bg-[#FFD700]/15 px-4 py-1.5 text-sm font-black text-[#FFD700]">
            RONDA {currentRound}
          </span>
        )}
        <PresenterOptionsMenu />
      </div>
    </header>
  );
}
