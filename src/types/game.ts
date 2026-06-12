export type GamePhase =
  | "setup"
  | "round1"
  | "round2"
  | "round3"
  | "round4"
  | "round5"
  | "round6"
  | "tiebreaker"
  | "finished";

export type PlayerOrder = 1 | 2 | 3 | 4 | 5;

export type PlayerAvatarId =
  | "amarillo"
  | "rojo"
  | "azul"
  | "verde"
  | "morado";

export interface Player {
  id: string;
  name: string;
  avatarId: PlayerAvatarId;
  score: number;
  isActive: boolean;
  order: PlayerOrder;
}

export interface Round1State {
  subPhase: "playing" | "playerSummary";
  currentPlayerIndex: number;
  timerSeconds: number;
  timerRunning: boolean;
  questionIndex: number;
  questionsAnswered: number;
  playersCompleted: boolean[];
  timerStarted: boolean;
  turnCorrect: number;
  turnWrong: number;
}

export type Round2Mode = "matching" | "songs";

export interface Round2State {
  subPhase: "intro" | "playing";
  mode: Round2Mode;
  currentPlayerIndex: number;
  questionStep: number;
  visibleAnswerIds: string[];
  shuffledAnswerIds: string[];
  matchedQuestionIds: string[];
  selectedAnswerId: string | null;
}

export interface Round3DuelStartScores {
  challenger: number;
  challenged: number;
}

export type Round3DuelQuestionResult = "correct" | "wrong";

export interface Round3State {
  subPhase: "intro" | "selecting" | "dueling" | "duelSummary" | "finalSummary";
  duelIndex: number;
  challengerId: string | null;
  challengedId: string | null;
  selectedTopicId: string | null;
  questionIndex: number;
  /** Resultado del retado por pregunta del duelo actual (acierto/fallo). */
  duelQuestionResults: Round3DuelQuestionResult[];
  usedTopicIds: string[];
  challengerQueue: string[];
  duelStartScores: Round3DuelStartScores | null;
}

export type TeamId = "A" | "B";

export interface Round4State {
  subPhase: "preview" | "playing" | "summary";
  teamACorrect: number;
  teamBCorrect: number;
  activeTeam: TeamId;
  questionIndex: number;
  teamAPlayerIds: [string, string];
  teamBPlayerIds: [string, string];
  winningTeam: TeamId | null;
}

/** Escalón actual por jugador: 0 = inicio (debajo del 1), 5 = meta. */
export interface Round5State {
  subPhase: "playing" | "summary";
  finalistAId: string;
  finalistBId: string;
  stepIndexA: number;
  stepIndexB: number;
  activePlayerId: string;
  questionIndex: number;
  winnerPlayerId: string | null;
}

export interface Round6State {
  subPhase: "playing" | "summary";
  playerId: string;
  timerSeconds: number;
  timerRunning: boolean;
  timerStarted: boolean;
  completedTopicIds: string[];
  /** Temas fallados en el intento actual; se limpia al volver a ellos en el bucle. */
  failedTopicIds: string[];
  failureCount: number;
  currentTopicIndex: number;
  boteEarned: number;
}

export type RPSChoice = "rock" | "paper" | "scissors";

export interface TiebreakerState {
  tiedPlayerIds: string[];
  winnerId: string | null;
}

export type RoundState =
  | Round1State
  | Round2State
  | Round3State
  | Round4State
  | Round5State
  | Round6State
  | TiebreakerState;

export interface GameState {
  phase: GamePhase;
  players: Player[];
  boteGlobal: number;
  currentRound: 1 | 2 | 3 | 4 | 5 | 6;
  roundState: RoundState;
  winnerId: string | null;
}

export const DEFAULT_PLAYER_NAMES = [
  "Jugador 1",
  "Jugador 2",
  "Jugador 3",
  "Jugador 4",
  "Jugador 5",
] as const;

/** Recorrido completo: 0-1-2-3-4-5-4-3-2-1-0 (11 posiciones). */
export const ROUND5_LADDER_PATH = [0, 1, 2, 3, 4, 5, 4, 3, 2, 1, 0] as const;
export const ROUND5_WIN_STEP = 5;

/** Índice en ROUND5_LADDER_PATH para el jugador A (izquierda) o B (derecha). */
export function getRound5PositionIndex(
  side: "A" | "B",
  step: number,
): number {
  return side === "A" ? step : ROUND5_LADDER_PATH.length - 1 - step;
}
