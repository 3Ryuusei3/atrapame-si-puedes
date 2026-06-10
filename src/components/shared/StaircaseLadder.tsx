import {
  ROUND5_LADDER_PATH,
  getRound5PositionIndex,
} from "@/types/game";
import { cn } from "@/lib/utils";

const STEP_LIFT_PX = 26;

interface StaircaseLadderProps {
  stepIndexA: number;
  stepIndexB: number;
  nameA: string;
  nameB: string;
  activePlayerId: string;
  playerAId: string;
  playerBId: string;
}

export function StaircaseLadder({
  stepIndexA,
  stepIndexB,
  nameA,
  nameB,
  activePlayerId,
  playerAId,
  playerBId,
}: StaircaseLadderProps) {
  const posA = getRound5PositionIndex("A", stepIndexA);
  const posB = getRound5PositionIndex("B", stepIndexB);

  return (
    <div className="w-full overflow-x-auto py-4">
      <div className="mx-auto flex min-h-[220px] min-w-[640px] max-w-5xl items-end justify-center px-2">
        {ROUND5_LADDER_PATH.map((value, index) => {
          const height = value;
          const isGoal = value === 5;
          const playerAHere = posA === index;
          const playerBHere = posB === index;

          return (
            <div
              key={index}
              className="flex flex-1 flex-col items-center justify-end"
              style={{ paddingBottom: height * STEP_LIFT_PX }}
            >
              <div className="mb-2 flex min-h-9 items-end justify-center">
                {playerAHere && (
                  <PlayerToken
                    name={nameA}
                    active={activePlayerId === playerAId}
                  />
                )}
                {playerBHere && (
                  <PlayerToken
                    name={nameB}
                    active={activePlayerId === playerBId}
                  />
                )}
              </div>

              <div
                className={cn(
                  "relative flex w-full max-w-[4.5rem] flex-col items-center",
                  index > 0 && "before:absolute before:bottom-full before:left-1/2 before:h-3 before:w-0.5 before:-translate-x-1/2 before:bg-muted-foreground/35",
                )}
              >
                <div
                  className={cn(
                    "flex w-full items-center justify-center rounded-sm border-2 font-mono font-bold shadow-md",
                    isGoal
                      ? "border-primary bg-primary text-primary-foreground h-10 text-lg shadow-[0_0_14px_rgba(212,168,83,0.4)]"
                      : value === 0
                        ? "border-muted-foreground/25 bg-secondary/60 text-muted-foreground h-7 text-sm"
                        : "border-muted-foreground/40 bg-secondary h-8 text-base",
                  )}
                >
                  {value}
                </div>
                <div
                  className={cn(
                    "mt-0.5 h-1.5 w-[110%] rounded-b-sm",
                    isGoal ? "bg-primary/70" : "bg-muted-foreground/30",
                  )}
                />
              </div>

              {isGoal && (
                <span className="text-primary mt-1 text-[10px] font-semibold uppercase tracking-wider">
                  Meta
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="text-muted-foreground mt-4 flex justify-between px-4 text-xs font-medium">
        <span>{nameA} ← desde 0</span>
        <span>Desde 0 → {nameB}</span>
      </div>
    </div>
  );
}

function PlayerToken({ name, active }: { name: string; active: boolean }) {
  return (
    <span
      className={cn(
        "max-w-[4.5rem] truncate rounded-full px-2 py-1 text-xs font-semibold",
        active
          ? "bg-primary text-primary-foreground ring-primary/60 ring-2"
          : "bg-secondary text-secondary-foreground",
      )}
      title={name}
    >
      {name.split(" ")[0]}
    </span>
  );
}
