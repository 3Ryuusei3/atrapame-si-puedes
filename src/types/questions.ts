export interface OpenQuestion {
  id: string;
  text: string;
  answer: string;
}

export interface Round1Set {
  playerOrder: 1 | 2 | 3 | 4 | 5;
  questions: OpenQuestion[];
}

export interface Round1Questions {
  round: 1;
  sets: Round1Set[];
}

export interface Round2Question {
  id: string;
  text: string;
}

export interface Round2Answer {
  id: string;
  text: string;
  matchesQuestionId: string | null;
}

export interface Round2Set {
  playerOrder: 1 | 2 | 3 | 4 | 5;
  questions: Round2Question[];
  answers: Round2Answer[];
}

export interface Round2Questions {
  round: 2;
  sets: Round2Set[];
}

export interface Round3Question {
  id: string;
  text: string;
  answer: string;
}

export interface Round3Topic {
  id: string;
  name: string;
  questions: Round3Question[];
}

export interface Round3Questions {
  round: 3;
  topics: Round3Topic[];
}

export interface Round4Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Round4Question {
  id: string;
  text: string;
  options: Round4Option[];
}

export interface Round4Questions {
  round: 4;
  questions: Round4Question[];
}

export interface Round5Questions {
  round: 5;
  questions: OpenQuestion[];
}

export interface Round6Topic {
  id: string;
  name: string;
  question: OpenQuestion;
}

export interface Round6Questions {
  round: 6;
  name?: string;
  topics: Round6Topic[];
}

export interface GameConfig {
  showName: string;
  round1TimerSeconds: number;
  round4TargetCorrect: number;
  round5TargetCorrect: number;
  round2Points: [number, number, number, number, number];
  round6TimerSeconds: number;
  round6BotePerTopic: number;
}

export type AllQuestions = {
  round1: Round1Questions;
  round2: Round2Questions;
  round3: Round3Questions;
  round4: Round4Questions;
  round5: Round5Questions;
  round6: Round6Questions;
  config: GameConfig;
};

export type DataFileEntry =
  | Round1Questions
  | Round2Questions
  | Round3Questions
  | Round4Questions
  | Round5Questions
  | Round6Questions;
