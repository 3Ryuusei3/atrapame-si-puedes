import { questions } from "@/data/questions";
import type { Round1Set } from "@/types/questions";

export const ROUND1_MAX_QUESTIONS_PER_PLAYER = 7;

export function getRound1Set(playerOrder: number): Round1Set | undefined {
  return questions.round1.sets.find((s) => s.playerOrder === playerOrder);
}

export function getRound1QuestionCount(playerOrder: number): number {
  return getRound1Set(playerOrder)?.questions.length ?? 0;
}
