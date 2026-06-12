import type { Round3DuelQuestionResult } from "@/types/game";
import { cn } from "@/lib/utils";
import {
  gameGreenFill,
  gameRedFill,
  gameYellowFill,
} from "@/lib/gameColors";

interface TvDuelPointsProps {
  questionResults: Round3DuelQuestionResult[];
  currentIndex: number;
  className?: string;
}

const POINTS = [10, 20, 30, 40, 50];

export function TvDuelPoints({
  questionResults,
  currentIndex,
  className,
}: TvDuelPointsProps) {
  return (
    <div className={cn("flex flex-col gap-2.5", className)}>
      {POINTS.map((pts, i) => {
        const result = questionResults[i];
        const isCurrent = i === currentIndex && result === undefined;

        return (
          <div
            key={pts}
            className={cn(
              "flex size-14 items-center justify-center rounded-full border-2 text-lg font-black shadow-md md:size-16 md:text-xl",
              result === "correct" && gameGreenFill,
              result === "wrong" && gameRedFill,
              isCurrent && gameYellowFill,
              result === undefined &&
                !isCurrent &&
                "border-white/60 bg-gradient-to-b from-white to-gray-300 text-black",
            )}
          >
            {pts}
          </div>
        );
      })}
    </div>
  );
}
