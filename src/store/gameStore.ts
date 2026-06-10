import { create } from "zustand";
import { persist } from "zustand/middleware";
import { questions } from "@/data/questions";
import {
  ROUND1_BOTE_PER_CORRECT,
  applyScoreDelta,
  getDuelQuestionPoints,
  getRound2Points,
  transferPoints,
} from "@/engine/scoring";
import {
  ROUND1_MAX_QUESTIONS_PER_PLAYER,
  getRound1QuestionCount,
} from "@/engine/round1";
import {
  checkRound3End,
  createInitialPlayers,
  createRound1State,
  createRound2State,
  jumpToRound,
  transitionAfterRound3,
  transitionAfterTiebreaker,
  transitionToFinished,
  transitionToRound2,
  transitionToRound3,
  transitionToRound5,
  transitionToRound6,
  transitionToTiebreaker,
} from "@/engine/transitions";
import { shuffle } from "@/lib/utils";
import type {
  GamePhase,
  GameState,
  Round1State,
  Round2State,
  Round3State,
  Round4State,
  Round5State,
  Round6State,
  TiebreakerState,
} from "@/types/game";
import { ROUND5_WIN_STEP } from "@/types/game";

interface GameActions {
  startGame: (names: string[]) => void;
  resetGame: () => void;
  jumpToRound: (round: 1 | 2 | 3 | 4 | 5 | 6) => void;

  // Round 1
  startTimer: () => void;
  pauseTimer: () => void;
  tickTimer: () => void;
  round1Correct: () => void;
  round1Wrong: () => void;
  round1NextPlayer: () => void;
  round1ContinueFromSummary: () => void;
  endRound1: () => void;

  // Round 2
  round2StartPlaying: () => void;
  initRound2Player: () => void;
  round2SelectAnswer: (answerId: string) => void;
  round2ConfirmMatch: (correct: boolean) => void;
  round2NextPlayer: () => void;
  endRound2: () => void;

  // Round 3
  round3StartPlaying: () => void;
  round3SetChallenged: (id: string) => void;
  round3SetTopic: (topicId: string) => void;
  round3Correct: () => void;
  round3Wrong: () => void;
  round3ContinueAfterDuel: () => void;
  endRound3: () => void;

  // Tiebreaker
  tiebreakerSetWinner: (winnerId: string) => void;

  // Round 4
  round4StartPlaying: () => void;
  round4Correct: () => void;
  round4Wrong: () => void;
  round4NextQuestion: () => void;

  // Round 5
  round5Correct: () => void;
  round5Wrong: () => void;
  round5NextQuestion: () => void;

  // Round 6
  round6StartTimer: () => void;
  round6PauseTimer: () => void;
  round6TickTimer: () => void;
  round6Correct: () => void;
  round6Wrong: () => void;
  round6NextTopic: () => void;
  round6Finish: () => void;
  round6ContinueFromSummary: () => void;
}

type GameStore = GameState & GameActions;

const initialState: GameState = {
  phase: "setup",
  players: [],
  boteGlobal: 0,
  currentRound: 1,
  roundState: createRound1State(questions.config),
  winnerId: null,
};

function isRound1(s: GameState["roundState"]): s is Round1State {
  return "timerSeconds" in s && "playersCompleted" in s;
}

function isRound2(s: GameState["roundState"]): s is Round2State {
  return "subPhase" in s && "visibleAnswerIds" in s;
}

function isRound3(s: GameState["roundState"]): s is Round3State {
  return "challengerQueue" in s;
}

function isRound4(s: GameState["roundState"]): s is Round4State {
  return "teamACorrect" in s && "teamBCorrect" in s;
}

function isRound5(s: GameState["roundState"]): s is Round5State {
  return "stepIndexA" in s;
}

function isRound6(s: GameState["roundState"]): s is Round6State {
  return "completedTopicIds" in s && "boteEarned" in s;
}

function isTiebreaker(s: GameState["roundState"]): s is TiebreakerState {
  return "tiedPlayerIds" in s;
}

function advanceRound1Question(
  rs: Round1State,
  playerOrder: number,
): Round1State {
  const maxQ =
    getRound1QuestionCount(playerOrder) || ROUND1_MAX_QUESTIONS_PER_PLAYER;
  const answered = rs.questionsAnswered + 1;
  const completed = answered >= maxQ;
  return {
    ...rs,
    questionsAnswered: answered,
    questionIndex: Math.min(answered, maxQ - 1),
    timerRunning: completed ? false : true,
    subPhase: completed ? "playerSummary" : rs.subPhase,
    playersCompleted: completed
      ? rs.playersCompleted.map((done, i) =>
          i === rs.currentPlayerIndex ? true : done,
        )
      : rs.playersCompleted,
  };
}

function getAutoChallenger(rs: Round3State): string | null {
  return rs.challengerQueue[rs.duelIndex] ?? null;
}

function tryEnterRound3Dueling(
  rs: Round3State,
  players: GameState["players"],
): Round3State {
  if (!rs.challengerId || !rs.challengedId || !rs.selectedTopicId) {
    if (rs.subPhase === "dueling") {
      return { ...rs, subPhase: "selecting", duelStartScores: null };
    }
    return rs;
  }
  const challenger = players.find((p) => p.id === rs.challengerId);
  const challenged = players.find((p) => p.id === rs.challengedId);
  if (!challenger || !challenged) return rs;
  return {
    ...rs,
    subPhase: "dueling",
    questionIndex: 0,
    duelStartScores: {
      challenger: challenger.score,
      challenged: challenged.score,
    },
  };
}

function finishRound3Duel(rs: Round3State): Round3State {
  return { ...rs, subPhase: "duelSummary" };
}

function round6AllTopicsCompleted(rs: Round6State): boolean {
  return rs.completedTopicIds.length >= questions.round6.topics.length;
}

function getNextRound6TopicIndex(rs: Round6State): number {
  const items = questions.round6.topics;
  for (let i = 1; i <= items.length; i++) {
    const idx = (rs.currentTopicIndex + i) % items.length;
    if (!rs.completedTopicIds.includes(items[idx].id)) {
      return idx;
    }
  }
  return rs.currentTopicIndex;
}

function clearFailedMarkerForTopic(
  failedTopicIds: string[],
  topicId: string | undefined,
): string[] {
  if (!topicId) return failedTopicIds;
  return failedTopicIds.filter((id) => id !== topicId);
}

function finishRound6IfComplete(rs: Round6State): Round6State {
  if (!round6AllTopicsCompleted(rs)) return rs;
  return {
    ...rs,
    timerRunning: false,
    subPhase: "summary",
  };
}

function resumeRound6Timer(rs: Round6State): Round6State {
  if (rs.subPhase !== "playing" || !rs.timerStarted) return rs;
  return { ...rs, timerRunning: true };
}

function round6FailCurrentTopic(rs: Round6State, topicId: string): Round6State {
  const failedTopicIds = rs.failedTopicIds.includes(topicId)
    ? rs.failedTopicIds
    : [...rs.failedTopicIds, topicId];
  const nextIdx = getNextRound6TopicIndex(rs);
  const nextTopicId = questions.round6.topics[nextIdx]?.id;

  return resumeRound6Timer(
    finishRound6IfComplete({
      ...rs,
      failureCount: rs.failureCount + 1,
      failedTopicIds: clearFailedMarkerForTopic(failedTopicIds, nextTopicId),
      currentTopicIndex: nextIdx,
    }),
  );
}

function round6CompleteCurrentTopic(rs: Round6State, topicId: string): Round6State {
  const withCorrect: Round6State = {
    ...rs,
    completedTopicIds: [...rs.completedTopicIds, topicId],
    failedTopicIds: rs.failedTopicIds.filter((id) => id !== topicId),
    boteEarned: rs.boteEarned + questions.config.round6BotePerTopic,
  };

  if (round6AllTopicsCompleted(withCorrect)) {
    return finishRound6IfComplete(withCorrect);
  }

  const nextIdx = getNextRound6TopicIndex(withCorrect);
  const nextTopicId = questions.round6.topics[nextIdx]?.id;

  return resumeRound6Timer({
    ...withCorrect,
    currentTopicIndex: nextIdx,
    failedTopicIds: clearFailedMarkerForTopic(withCorrect.failedTopicIds, nextTopicId),
  });
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      startGame: (names) => {
        set({
          phase: "round1",
          players: createInitialPlayers(names),
          boteGlobal: 0,
          currentRound: 1,
          roundState: createRound1State(questions.config),
          winnerId: null,
        });
      },

      resetGame: () => {
        set({
          ...initialState,
          roundState: createRound1State(questions.config),
        });
      },

      jumpToRound: (round) => {
        const state = get();
        if (state.phase === "setup") return;
        set(jumpToRound(state, round, questions.config));
      },

      startTimer: () => {
        const { roundState, phase } = get();
        if (phase !== "round1" || !isRound1(roundState)) return;
        set({
          roundState: {
            ...roundState,
            timerRunning: true,
            timerStarted: true,
          },
        });
      },

      pauseTimer: () => {
        const { roundState, phase } = get();
        if (phase !== "round1" || !isRound1(roundState)) return;
        set({
          roundState: { ...roundState, timerRunning: false },
        });
      },

      tickTimer: () => {
        const { roundState, phase } = get();
        if (phase !== "round1" || !isRound1(roundState) || !roundState.timerRunning)
          return;
        if (roundState.timerSeconds <= 1) {
          const completed = [...roundState.playersCompleted];
          completed[roundState.currentPlayerIndex] = true;
          set({
            roundState: {
              ...roundState,
              timerSeconds: 0,
              timerRunning: false,
              playersCompleted: completed,
              subPhase: "playerSummary",
            },
          });
          return;
        }
        set({
          roundState: {
            ...roundState,
            timerSeconds: roundState.timerSeconds - 1,
          },
        });
      },

      round1Correct: () => {
        const { roundState, phase, players } = get();
        if (phase !== "round1" || !isRound1(roundState)) return;
        if (roundState.subPhase !== "playing") return;
        const player = players[roundState.currentPlayerIndex];
        if (
          !player ||
          roundState.questionsAnswered >= getRound1QuestionCount(player.order)
        )
          return;
        set((state) => ({
          boteGlobal: state.boteGlobal + ROUND1_BOTE_PER_CORRECT,
          roundState: {
            ...advanceRound1Question(roundState, player.order),
            turnCorrect: roundState.turnCorrect + 1,
          },
        }));
      },

      round1Wrong: () => {
        const { roundState, phase, players } = get();
        if (phase !== "round1" || !isRound1(roundState)) return;
        if (roundState.subPhase !== "playing") return;
        const player = players[roundState.currentPlayerIndex];
        if (
          !player ||
          roundState.questionsAnswered >= getRound1QuestionCount(player.order)
        )
          return;
        set({
          roundState: {
            ...advanceRound1Question(roundState, player.order),
            turnWrong: roundState.turnWrong + 1,
          },
        });
      },

      round1NextPlayer: () => {
        const { roundState, phase } = get();
        if (phase !== "round1" || !isRound1(roundState)) return;
        const next = roundState.currentPlayerIndex + 1;
        if (next >= 5) return;
        const completed = [...roundState.playersCompleted];
        completed[roundState.currentPlayerIndex] = true;
        set({
          roundState: {
            ...roundState,
            subPhase: "playing",
            currentPlayerIndex: next,
            timerSeconds: questions.config.round1TimerSeconds,
            timerRunning: false,
            timerStarted: false,
            questionIndex: 0,
            questionsAnswered: 0,
            playersCompleted: completed,
            turnCorrect: 0,
            turnWrong: 0,
          },
        });
      },

      round1ContinueFromSummary: () => {
        const { roundState, phase } = get();
        if (phase !== "round1" || !isRound1(roundState)) return;
        if (roundState.subPhase !== "playerSummary") return;
        if (roundState.currentPlayerIndex >= 4) {
          set(transitionToRound2(get()));
          return;
        }
        get().round1NextPlayer();
      },

      endRound1: () => {
        set(transitionToRound2(get()));
      },

      round2StartPlaying: () => {
        const { roundState, phase } = get();
        if (phase !== "round2" || !isRound2(roundState)) return;
        set({
          roundState: { ...roundState, subPhase: "playing" },
        });
        get().initRound2Player();
      },

      initRound2Player: () => {
        const { roundState, phase, players } = get();
        if (phase !== "round2" || !isRound2(roundState)) return;
        const playerOrder = players[roundState.currentPlayerIndex]?.order ?? 1;
        const setData = questions.round2.sets.find(
          (s) => s.playerOrder === playerOrder,
        );
        if (!setData) return;
        set({
          roundState: {
            ...roundState,
            questionStep: 1,
            visibleAnswerIds: setData.answers.map((a) => a.id),
            shuffledAnswerIds: shuffle(setData.answers.map((a) => a.id)),
            matchedQuestionIds: [],
            selectedAnswerId: null,
          },
        });
      },

      round2SelectAnswer: (answerId) => {
        const { roundState, phase } = get();
        if (phase !== "round2" || !isRound2(roundState)) return;
        set({
          roundState: { ...roundState, selectedAnswerId: answerId },
        });
      },

      round2ConfirmMatch: (correct) => {
        const { roundState, phase, players } = get();
        if (phase !== "round2" || !isRound2(roundState)) return;
        const player = players[roundState.currentPlayerIndex];
        if (!player) return;

        const playerOrder = player.order;
        const setData = questions.round2.sets.find(
          (s) => s.playerOrder === playerOrder,
        );
        if (!setData) return;

        const currentQ = setData.questions[roundState.questionStep - 1];
        if (!currentQ || !roundState.selectedAnswerId) return;

        let newPlayers = players;
        let newVisible = [...roundState.visibleAnswerIds];
        let newMatched = [...roundState.matchedQuestionIds];
        let newStep = roundState.questionStep;

        if (correct) {
          const points = getRound2Points(roundState.questionStep, questions.config);
          newPlayers = applyScoreDelta(newPlayers, player.id, points);
          newVisible = newVisible.filter(
            (id) => id !== roundState.selectedAnswerId,
          );
          newMatched = [...newMatched, currentQ.id];
          newStep = roundState.questionStep + 1;
        } else {
          newStep = roundState.questionStep + 1;
        }

        set({
          players: newPlayers,
          roundState: {
            ...roundState,
            visibleAnswerIds: newVisible,
            matchedQuestionIds: newMatched,
            questionStep: newStep,
            selectedAnswerId: null,
          },
        });
      },

      round2NextPlayer: () => {
        const { roundState, phase } = get();
        if (phase !== "round2" || !isRound2(roundState)) return;
        const next = roundState.currentPlayerIndex + 1;
        if (next >= 5) return;
        set({
          roundState: {
            ...createRound2State(),
            subPhase: "playing",
            currentPlayerIndex: next,
          },
        });
        get().initRound2Player();
      },

      endRound2: () => {
        set(transitionToRound3(get()));
      },

      round3StartPlaying: () => {
        const { roundState, phase } = get();
        if (phase !== "round3" || !isRound3(roundState)) return;
        const challengerId = getAutoChallenger(roundState);
        set({
          roundState: {
            ...roundState,
            subPhase: "selecting",
            challengerId,
          },
        });
      },

      round3SetChallenged: (id) => {
        const { roundState, phase, players } = get();
        if (phase !== "round3" || !isRound3(roundState)) return;
        if (roundState.subPhase !== "selecting") return;
        set({
          roundState: tryEnterRound3Dueling(
            { ...roundState, challengedId: id },
            players,
          ),
        });
      },

      round3SetTopic: (topicId) => {
        const { roundState, phase, players } = get();
        if (phase !== "round3" || !isRound3(roundState)) return;
        if (roundState.subPhase !== "selecting") return;
        set({
          roundState: tryEnterRound3Dueling(
            { ...roundState, selectedTopicId: topicId, questionIndex: 0 },
            players,
          ),
        });
      },

      round3Correct: () => {
        const { roundState, phase, players } = get();
        if (phase !== "round3" || !isRound3(roundState)) return;
        if (roundState.subPhase !== "dueling") return;
        if (!roundState.challengerId || !roundState.challengedId) return;
        const topic = questions.round3.topics.find(
          (t) => t.id === roundState.selectedTopicId,
        );
        if (!topic) return;
        const pts = getDuelQuestionPoints(roundState.questionIndex);
        const isLast = roundState.questionIndex >= topic.questions.length - 1;
        const newPlayers = transferPoints(
          players,
          roundState.challengerId,
          roundState.challengedId,
          pts,
        );
        set({
          players: newPlayers,
          roundState: isLast
            ? finishRound3Duel(roundState)
            : { ...roundState, questionIndex: roundState.questionIndex + 1 },
        });
      },

      round3Wrong: () => {
        const { roundState, phase, players } = get();
        if (phase !== "round3" || !isRound3(roundState)) return;
        if (roundState.subPhase !== "dueling") return;
        if (!roundState.challengerId || !roundState.challengedId) return;
        const topic = questions.round3.topics.find(
          (t) => t.id === roundState.selectedTopicId,
        );
        if (!topic) return;
        const pts = getDuelQuestionPoints(roundState.questionIndex);
        const isLast = roundState.questionIndex >= topic.questions.length - 1;
        const newPlayers = transferPoints(
          players,
          roundState.challengedId,
          roundState.challengerId,
          pts,
        );
        set({
          players: newPlayers,
          roundState: isLast
            ? finishRound3Duel(roundState)
            : { ...roundState, questionIndex: roundState.questionIndex + 1 },
        });
      },

      round3ContinueAfterDuel: () => {
        const { roundState, phase } = get();
        if (phase !== "round3" || !isRound3(roundState)) return;
        if (roundState.subPhase !== "duelSummary") return;

        const usedTopics = roundState.selectedTopicId
          ? [...roundState.usedTopicIds, roundState.selectedTopicId]
          : roundState.usedTopicIds;
        const newDuelIndex = roundState.duelIndex + 1;

        if (newDuelIndex >= 5) {
          set({
            roundState: {
              ...roundState,
              subPhase: "finalSummary",
              duelIndex: newDuelIndex,
              challengerId: null,
              challengedId: null,
              selectedTopicId: null,
              questionIndex: 0,
              usedTopicIds: usedTopics,
              duelStartScores: null,
            },
          });
          return;
        }

        const nextChallenger = roundState.challengerQueue[newDuelIndex] ?? null;
        set({
          roundState: {
            ...roundState,
            subPhase: "selecting",
            duelIndex: newDuelIndex,
            challengerId: nextChallenger,
            challengedId: null,
            selectedTopicId: null,
            questionIndex: 0,
            usedTopicIds: usedTopics,
            duelStartScores: null,
          },
        });
      },

      endRound3: () => {
        const state = get();
        const { needsTiebreaker, tiedPlayers } = checkRound3End(state);
        if (needsTiebreaker) {
          set(transitionToTiebreaker(tiedPlayers));
        } else {
          const loser = tiedPlayers[0];
          if (loser) set(transitionAfterRound3(state, loser.id));
        }
      },

      tiebreakerSetWinner: (winnerId) => {
        const state = get();
        if (!isTiebreaker(state.roundState)) return;
        const loser = state.roundState.tiedPlayerIds.find((id) => id !== winnerId);
        if (!loser) return;
        set(transitionAfterTiebreaker(state, loser));
      },

      round4StartPlaying: () => {
        const { roundState, phase } = get();
        if (phase !== "round4" || !isRound4(roundState)) return;
        set({
          roundState: { ...roundState, subPhase: "playing" },
        });
      },

      round4Correct: () => {
        const { roundState, phase } = get();
        if (phase !== "round4" || !isRound4(roundState)) return;
        const target = questions.config.round4TargetCorrect;
        const key =
          roundState.activeTeam === "A" ? "teamACorrect" : "teamBCorrect";
        const newCount = roundState[key] + 1;
        const newState: Round4State = {
          ...roundState,
          [key]: newCount,
          activeTeam: roundState.activeTeam === "A" ? "B" : "A",
          questionIndex: roundState.questionIndex + 1,
        };

        if (newCount >= target) {
          const loserIds =
            roundState.activeTeam === "A"
              ? roundState.teamBPlayerIds
              : roundState.teamAPlayerIds;
          set(transitionToRound5(get(), [...loserIds]));
        } else {
          set({ roundState: newState });
        }
      },

      round4Wrong: () => {
        const { roundState, phase } = get();
        if (phase !== "round4" || !isRound4(roundState)) return;
        set({
          roundState: {
            ...roundState,
            activeTeam: roundState.activeTeam === "A" ? "B" : "A",
            questionIndex: roundState.questionIndex + 1,
          },
        });
      },

      round4NextQuestion: () => {
        const { roundState, phase } = get();
        if (phase !== "round4" || !isRound4(roundState)) return;
        const maxQ = questions.round4.questions.length;
        set({
          roundState: {
            ...roundState,
            questionIndex: (roundState.questionIndex + 1) % maxQ,
          },
        });
      },

      round5Correct: () => {
        const { roundState, phase } = get();
        if (phase !== "round5" || !isRound5(roundState)) return;
        const isA = roundState.activePlayerId === roundState.finalistAId;
        const newStepA = isA
          ? roundState.stepIndexA + 1
          : roundState.stepIndexA;
        const newStepB = isA
          ? roundState.stepIndexB
          : roundState.stepIndexB + 1;

        const winnerStep = isA ? newStepA : newStepB;
        if (winnerStep >= ROUND5_WIN_STEP) {
          set(transitionToRound6(get(), roundState.activePlayerId, questions.config));
        } else {
          set({
            roundState: {
              ...roundState,
              stepIndexA: newStepA,
              stepIndexB: newStepB,
              activePlayerId: isA
                ? roundState.finalistBId
                : roundState.finalistAId,
              questionIndex: roundState.questionIndex + 1,
            },
          });
        }
      },

      round5Wrong: () => {
        const { roundState, phase } = get();
        if (phase !== "round5" || !isRound5(roundState)) return;
        set({
          roundState: {
            ...roundState,
            activePlayerId:
              roundState.activePlayerId === roundState.finalistAId
                ? roundState.finalistBId
                : roundState.finalistAId,
            questionIndex: roundState.questionIndex + 1,
          },
        });
      },

      round5NextQuestion: () => {
        const { roundState, phase } = get();
        if (phase !== "round5" || !isRound5(roundState)) return;
        const maxQ = questions.round5.questions.length;
        set({
          roundState: {
            ...roundState,
            questionIndex: (roundState.questionIndex + 1) % maxQ,
          },
        });
      },

      round6StartTimer: () => {
        const { roundState, phase } = get();
        if (phase !== "round6" || !isRound6(roundState)) return;
        set({
          roundState: {
            ...roundState,
            timerRunning: true,
            timerStarted: true,
          },
        });
      },

      round6PauseTimer: () => {
        const { roundState, phase } = get();
        if (phase !== "round6" || !isRound6(roundState)) return;
        set({
          roundState: { ...roundState, timerRunning: false },
        });
      },

      round6TickTimer: () => {
        const { roundState, phase } = get();
        if (phase !== "round6" || !isRound6(roundState) || !roundState.timerRunning)
          return;
        if (roundState.timerSeconds <= 1) {
          set({
            roundState: {
              ...roundState,
              timerSeconds: 0,
              timerRunning: false,
              subPhase: "summary",
            },
          });
          return;
        }
        set({
          roundState: {
            ...roundState,
            timerSeconds: roundState.timerSeconds - 1,
          },
        });
      },

      round6Correct: () => {
        const { roundState, phase } = get();
        if (phase !== "round6" || !isRound6(roundState)) return;
        if (roundState.subPhase !== "playing") return;
        const currentTopic = questions.round6.topics[roundState.currentTopicIndex];
        if (!currentTopic) return;
        if (roundState.completedTopicIds.includes(currentTopic.id)) return;

        set({
          roundState: round6CompleteCurrentTopic(roundState, currentTopic.id),
        });
      },

      round6Wrong: () => {
        const { roundState, phase } = get();
        if (phase !== "round6" || !isRound6(roundState)) return;
        if (roundState.subPhase !== "playing") return;
        const currentTopic = questions.round6.topics[roundState.currentTopicIndex];
        if (!currentTopic) return;
        if (roundState.completedTopicIds.includes(currentTopic.id)) return;

        set({
          roundState: round6FailCurrentTopic(roundState, currentTopic.id),
        });
      },

      round6NextTopic: () => {
        const { roundState, phase } = get();
        if (phase !== "round6" || !isRound6(roundState)) return;
        if (roundState.subPhase !== "playing") return;
        const currentTopic = questions.round6.topics[roundState.currentTopicIndex];
        if (!currentTopic) return;
        if (roundState.completedTopicIds.includes(currentTopic.id)) return;

        set({
          roundState: round6FailCurrentTopic(roundState, currentTopic.id),
        });
      },

      round6Finish: () => {
        const { roundState, phase } = get();
        if (phase !== "round6" || !isRound6(roundState)) return;
        set({
          roundState: {
            ...roundState,
            subPhase: "summary",
            timerRunning: false,
          },
        });
      },

      round6ContinueFromSummary: () => {
        const { roundState, phase } = get();
        if (phase !== "round6" || !isRound6(roundState)) return;
        if (roundState.subPhase !== "summary") return;
        set(transitionToFinished(roundState.playerId, roundState.boteEarned));
      },
    }),
    {
      name: "atrapame-game",
      partialize: (state) => ({
        phase: state.phase,
        players: state.players,
        boteGlobal: state.boteGlobal,
        currentRound: state.currentRound,
        roundState: state.roundState,
        winnerId: state.winnerId,
      }),
    },
  ),
);

export function usePhase(): GamePhase {
  return useGameStore((s) => s.phase);
}
