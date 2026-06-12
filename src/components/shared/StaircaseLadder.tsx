import { ROUND5_LADDER_PATH, getRound5PositionIndex } from "@/types/game";
import { PlayerAvatar } from "@/components/shared/PlayerAvatar";
import { cn } from "@/lib/utils";
import type { PlayerAvatarId } from "@/types/game";
import {
  gameGreenLadderPlat,
  gameGreenLadderStep,
  gameYellowToken,
  gameYellowTokenWinner,
  gameYellowWinPlat,
  gameYellowWinStep,
} from "@/lib/gameColors";

const STEP_LIFT_PX = 52;
const STEP_SIZE = "7rem";
const STEP_GAP = "0.75rem";

interface StaircaseLadderProps {
  stepIndexA: number;
  stepIndexB: number;
  nameA: string;
  nameB: string;
  activePlayerId: string;
  playerAId: string;
  playerBId: string;
  avatarIdA: PlayerAvatarId;
  avatarIdB: PlayerAvatarId;
  winnerPlayerId?: string | null;
}

function isAchievedByA(
  index: number,
  value: number,
  stepIndexA: number,
): boolean {
  return index >= 1 && index <= 5 && value > 0 && value <= stepIndexA;
}

function isAchievedByB(
  index: number,
  value: number,
  stepIndexB: number,
): boolean {
  if (value <= 0 || value > stepIndexB) return false;
  if (index === 5) return stepIndexB >= 5;
  return index >= 6 && index <= 9;
}

export function StaircaseLadder({
  stepIndexA,
  stepIndexB,
  nameA,
  nameB,
  activePlayerId,
  playerAId,
  playerBId,
  avatarIdA,
  avatarIdB,
  winnerPlayerId = null,
}: StaircaseLadderProps) {
  const posA = getRound5PositionIndex("A", stepIndexA);
  const posB = getRound5PositionIndex("B", stepIndexB);

  return (
    <div className="w-full overflow-x-auto py-4">
      <div
        className="mx-auto flex min-h-[320px] flex-1 items-end justify-center gap-x-3 px-2"
        style={{
          minWidth: `calc(${ROUND5_LADDER_PATH.length} * ${STEP_SIZE} + ${ROUND5_LADDER_PATH.length - 1} * ${STEP_GAP})`,
        }}
      >
        {ROUND5_LADDER_PATH.map((value, index) => {
          const height = value;
          const isStart = value === 0;
          const playerAHere = posA === index;
          const playerBHere = posB === index;
          const isWinStep = value === 5 && winnerPlayerId !== null;
          const achieved =
            isAchievedByA(index, value, stepIndexA) ||
            isAchievedByB(index, value, stepIndexB);

          const occupant =
            !isStart && playerAHere
              ? {
                  name: nameA,
                  avatarId: avatarIdA,
                  playerId: playerAId,
                }
              : !isStart && playerBHere
                ? {
                    name: nameB,
                    avatarId: avatarIdB,
                    playerId: playerBId,
                  }
                : null;

          const showStartA = isStart && playerAHere && stepIndexA === 0;
          const showStartB = isStart && playerBHere && stepIndexB === 0;

          return (
            <div
              key={index}
              className="flex shrink-0 flex-col items-center justify-end"
              style={{
                width: STEP_SIZE,
                paddingBottom: height * STEP_LIFT_PX,
              }}
            >
              {showStartA && (
                <LadderPlayerMarker
                  name={nameA}
                  avatarId={avatarIdA}
                  active={activePlayerId === playerAId}
                  isWinner={winnerPlayerId === playerAId}
                  className="translate-x-1 translate-y-3"
                />
              )}
              {showStartB && (
                <LadderPlayerMarker
                  name={nameB}
                  avatarId={avatarIdB}
                  active={activePlayerId === playerBId}
                  isWinner={winnerPlayerId === playerBId}
                  className="-translate-x-1 translate-y-3"
                />
              )}

              {!isStart && (
                <div className="relative flex w-full flex-col items-center">
                  <div
                    className={cn(
                      "flex aspect-square w-full items-center justify-center rounded-md border-3 shadow-md",
                      occupant && "overflow-visible bg-transparent p-0",
                      isWinStep
                        ? occupant
                          ? "border-accent bg-transparent"
                          : gameYellowWinStep
                        : achieved
                          ? occupant
                            ? "border-emerald-400 bg-transparent"
                            : gameGreenLadderStep
                          : "border-[#00AEEF]/40 bg-[#0a1e4a]/80",
                    )}
                  >
                    {occupant ? (
                      <LadderPlayerMarker
                        name={occupant.name}
                        avatarId={occupant.avatarId}
                        active={activePlayerId === occupant.playerId}
                        isWinner={winnerPlayerId === occupant.playerId}
                      />
                    ) : (
                      <span
                        className={cn(
                          "font-mono text-3xl font-black",
                          !achieved && !isWinStep && "text-white/60",
                        )}
                      >
                        {value}
                      </span>
                    )}
                  </div>
                  <div
                    className={cn(
                      "mt-1.5 h-2.5 w-[110%] rounded-b-sm",
                      isWinStep
                        ? gameYellowWinPlat
                        : achieved
                          ? gameGreenLadderPlat
                          : "bg-[#00AEEF]/20",
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function LadderPlayerMarker({
  name,
  avatarId,
  active,
  isWinner = false,
  className,
}: {
  name: string;
  avatarId: PlayerAvatarId;
  active: boolean;
  isWinner?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mb-1 flex max-w-[5.5rem] flex-col items-center gap-1.5",
        isWinner && "scale-110",
        className,
      )}
      title={name}
    >
      <PlayerAvatar
        avatarId={avatarId}
        size="lg"
        className={cn(
          isWinner && "border-accent shadow-[0_0_16px_rgba(255,215,0,0.7)]",
          active && !isWinner && "border-accent",
        )}
      />
      <span
        className={cn(
          "w-full rounded-md border-2 px-1 py-0.5 text-center text-[10px] leading-tight font-bold uppercase break-words",
          isWinner
            ? gameYellowTokenWinner
            : active
              ? gameYellowToken
              : "border-[#00AEEF] bg-white/90 text-black",
        )}
      >
        {name}
      </span>
    </div>
  );
}
