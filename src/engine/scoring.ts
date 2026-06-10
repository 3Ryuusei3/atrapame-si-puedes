import type { GameConfig } from "@/types/questions";
import type { Player } from "@/types/game";

export const ROUND1_BOTE_PER_CORRECT = 50;

export function getRound2Points(
  questionStep: number,
  config: GameConfig,
): number {
  const index = Math.min(Math.max(questionStep - 1, 0), 4);
  return config.round2Points[index];
}

/** Puntos por pregunta dentro del duelo: P1=10, P2=20, P3=30… */
export function getDuelQuestionPoints(questionIndex: number): number {
  return (questionIndex + 1) * 10;
}

export function cloneBoteToPlayers(
  players: Player[],
  boteGlobal: number,
): Player[] {
  return players.map((p) => ({ ...p, score: boteGlobal }));
}

export function applyScoreDelta(
  players: Player[],
  playerId: string,
  delta: number,
): Player[] {
  return players.map((p) =>
    p.id === playerId ? { ...p, score: Math.max(0, p.score + delta) } : p,
  );
}

export function transferPoints(
  players: Player[],
  fromId: string,
  toId: string,
  amount: number,
): Player[] {
  let updated = applyScoreDelta(players, fromId, -amount);
  updated = applyScoreDelta(updated, toId, amount);
  return updated;
}

export function findLowestScoringPlayers(players: Player[]): Player[] {
  const active = players.filter((p) => p.isActive);
  if (active.length === 0) return [];
  const minScore = Math.min(...active.map((p) => p.score));
  return active.filter((p) => p.score === minScore);
}

export function getPlayersByScoreRank(players: Player[]): Player[] {
  return [...players]
    .filter((p) => p.isActive)
    .sort((a, b) => b.score - a.score || a.order - b.order);
}

export function getChallengerQueue(players: Player[]): string[] {
  return getPlayersByScoreRank(players).map((p) => p.id);
}
