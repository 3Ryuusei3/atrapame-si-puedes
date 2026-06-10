import type {
  GamePhase,
  GameState,
  Player,
  Round1State,
  Round2State,
  Round3State,
  Round4State,
  Round5State,
  Round6State,
  TiebreakerState,
} from "@/types/game";
import type { GameConfig } from "@/types/questions";
import {
  cloneBoteToPlayers,
  findLowestScoringPlayers,
  getChallengerQueue,
  getPlayersByScoreRank,
} from "./scoring";

export function createInitialPlayers(names: string[]): Player[] {
  return names.map((name, i) => ({
    id: `p${i + 1}`,
    name: name.trim() || `Jugador ${i + 1}`,
    score: 0,
    isActive: true,
    order: (i + 1) as Player["order"],
  }));
}

export function createRound1State(config: GameConfig): Round1State {
  return {
    subPhase: "playing",
    currentPlayerIndex: 0,
    timerSeconds: config.round1TimerSeconds,
    timerRunning: false,
    questionIndex: 0,
    playersCompleted: [false, false, false, false, false],
    timerStarted: false,
    turnCorrect: 0,
    turnWrong: 0,
    questionsAnswered: 0,
  };
}

export function createRound2State(): Round2State {
  return {
    subPhase: "intro",
    currentPlayerIndex: 0,
    questionStep: 1,
    visibleAnswerIds: [],
    shuffledAnswerIds: [],
    matchedQuestionIds: [],
    selectedAnswerId: null,
  };
}

export function createRound3State(players: Player[]): Round3State {
  const queue = getChallengerQueue(players);
  return {
    subPhase: "intro",
    duelIndex: 0,
    challengerId: null,
    challengedId: null,
    selectedTopicId: null,
    questionIndex: 0,
    usedTopicIds: [],
    challengerQueue: queue,
    duelStartScores: null,
  };
}

export function getRound4Teams(players: Player[]): {
  teamA: [string, string];
  teamB: [string, string];
} {
  const ranked = getPlayersByScoreRank(players);
  return {
    teamA: [ranked[0].id, ranked[2].id],
    teamB: [ranked[1].id, ranked[3].id],
  };
}

export function createRound4State(players: Player[]): Round4State {
  const teams = getRound4Teams(players);
  return {
    subPhase: "preview",
    teamACorrect: 0,
    teamBCorrect: 0,
    activeTeam: "A",
    questionIndex: 0,
    teamAPlayerIds: teams.teamA,
    teamBPlayerIds: teams.teamB,
  };
}

export function createRound5State(players: Player[]): Round5State {
  const ranked = getPlayersByScoreRank(players);
  return {
    finalistAId: ranked[0].id,
    finalistBId: ranked[1].id,
    stepIndexA: 0,
    stepIndexB: 0,
    activePlayerId: ranked[0].id,
    questionIndex: 0,
  };
}

export function createRound6State(
  winnerId: string,
  config: GameConfig,
): Round6State {
  return {
    subPhase: "playing",
    playerId: winnerId,
    timerSeconds: config.round6TimerSeconds,
    timerRunning: false,
    timerStarted: false,
    completedTopicIds: [],
    failedTopicIds: [],
    failureCount: 0,
    currentTopicIndex: 0,
    boteEarned: 0,
  };
}

export function createTiebreakerState(tiedPlayers: Player[]): TiebreakerState {
  return {
    tiedPlayerIds: tiedPlayers.map((p) => p.id),
    winnerId: null,
  };
}

export function transitionToRound2(state: GameState): Partial<GameState> {
  return {
    phase: "round2",
    currentRound: 2,
    players: cloneBoteToPlayers(state.players, state.boteGlobal),
    roundState: createRound2State(),
  };
}

export function transitionToRound3(state: GameState): Partial<GameState> {
  return {
    phase: "round3",
    currentRound: 3,
    roundState: createRound3State(state.players),
  };
}

export function checkRound3End(state: GameState): {
  needsTiebreaker: boolean;
  tiedPlayers: Player[];
} {
  const tiedPlayers = findLowestScoringPlayers(state.players);
  return {
    needsTiebreaker: tiedPlayers.length > 1,
    tiedPlayers,
  };
}

export function transitionAfterRound3(
  state: GameState,
  eliminatedPlayerId: string,
): Partial<GameState> {
  const players = state.players.map((p) =>
    p.id === eliminatedPlayerId ? { ...p, isActive: false } : p,
  );
  return {
    phase: "round4",
    currentRound: 4,
    players,
    roundState: createRound4State(players),
  };
}

export function transitionToTiebreaker(
  tiedPlayers: Player[],
): Partial<GameState> {
  return {
    phase: "tiebreaker",
    roundState: createTiebreakerState(tiedPlayers),
  };
}

export function transitionAfterTiebreaker(
  state: GameState,
  eliminatedPlayerId: string,
): Partial<GameState> {
  const players = state.players.map((p) =>
    p.id === eliminatedPlayerId ? { ...p, isActive: false } : p,
  );
  return {
    phase: "round4",
    currentRound: 4,
    players,
    roundState: createRound4State(players),
  };
}

export function transitionToRound5(
  state: GameState,
  eliminatedTeamPlayerIds: string[],
): Partial<GameState> {
  const players = state.players.map((p) =>
    eliminatedTeamPlayerIds.includes(p.id) ? { ...p, isActive: false } : p,
  );
  return {
    phase: "round5",
    currentRound: 5,
    players,
    roundState: createRound5State(players),
  };
}

export function transitionToRound6(
  _state: GameState,
  winnerId: string,
  config: GameConfig,
): Partial<GameState> {
  return {
    phase: "round6",
    currentRound: 6,
    winnerId,
    roundState: createRound6State(winnerId, config),
  };
}

export function transitionToFinished(
  winnerId: string,
  boteEarned: number,
): Partial<GameState> {
  return {
    phase: "finished",
    winnerId,
    boteGlobal: boteEarned,
  };
}

export function jumpToRound(
  state: GameState,
  round: 1 | 2 | 3 | 4 | 5 | 6,
  config: GameConfig,
): Partial<GameState> {
  switch (round) {
    case 1:
      return {
        phase: "round1",
        currentRound: 1,
        roundState: createRound1State(config),
      };
    case 2:
      return {
        phase: "round2",
        currentRound: 2,
        roundState: createRound2State(),
      };
    case 3:
      return {
        phase: "round3",
        currentRound: 3,
        roundState: createRound3State(state.players),
      };
    case 4:
      return {
        phase: "round4",
        currentRound: 4,
        roundState: createRound4State(state.players),
      };
    case 5:
      return {
        phase: "round5",
        currentRound: 5,
        roundState: createRound5State(state.players),
      };
    case 6: {
      const winner = getPlayersByScoreRank(state.players)[0];
      if (!winner) return {};
      return {
        phase: "round6",
        currentRound: 6,
        winnerId: winner.id,
        roundState: createRound6State(winner.id, config),
      };
    }
  }
}

export function getPhaseLabel(phase: GamePhase): string {
  const labels: Record<GamePhase, string> = {
    setup: "Configuración",
    round1: "Ronda 1 — Cooperativa",
    round2: "Ronda 2 — Escalera Individual",
    round3: "Ronda 3 — Duelos",
    round4: "Ronda 4 — Parejas",
    round5: "Ronda 5 — La Final",
    round6: "Ronda 6 — El Bote",
    tiebreaker: "Desempate — Piedra/Papel/Tijera",
    finished: "Ganador",
  };
  return labels[phase];
}
