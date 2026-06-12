import { questions } from "@/data/questions";
import type { Player, Round4State, TeamId } from "@/types/game";

export function getRound4TeamScore(
  players: Player[],
  teamPlayerIds: readonly string[],
): number {
  return teamPlayerIds.reduce((sum, id) => {
    const player = players.find((p) => p.id === id);
    return sum + (player?.score ?? 0);
  }, 0);
}

/** Ganador cuando no se alcanza el objetivo de aciertos: más aciertos, luego más puntos. */
export function resolveRound4WinnerByTally(
  state: Pick<
    Round4State,
    "teamACorrect" | "teamBCorrect" | "teamAPlayerIds" | "teamBPlayerIds"
  >,
  players: Player[],
): TeamId {
  if (state.teamACorrect > state.teamBCorrect) return "A";
  if (state.teamBCorrect > state.teamACorrect) return "B";

  const scoreA = getRound4TeamScore(players, state.teamAPlayerIds);
  const scoreB = getRound4TeamScore(players, state.teamBPlayerIds);
  if (scoreA > scoreB) return "A";
  if (scoreB > scoreA) return "B";

  return "A";
}

export function areRound4QuestionsExhausted(questionIndex: number): boolean {
  return questionIndex >= questions.round4.questions.length;
}

export function finishRound4IfQuestionsExhausted(
  state: Round4State,
  players: Player[],
): Round4State | null {
  if (!areRound4QuestionsExhausted(state.questionIndex)) return null;

  return {
    ...state,
    subPhase: "summary",
    winningTeam: resolveRound4WinnerByTally(state, players),
  };
}
