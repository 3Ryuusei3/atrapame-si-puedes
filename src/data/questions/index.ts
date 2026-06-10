import type { AllQuestions, DataFileEntry } from "@/types/questions";
import config from "./config.json";
import rawData from "./data.json";
import { logValidationErrors, validateQuestions } from "@/engine/validateQuestions";

function parseDataFile(entries: DataFileEntry[]): Omit<AllQuestions, "config"> {
  const find = <T extends DataFileEntry["round"]>(round: T) => {
    const entry = entries.find((e) => e.round === round);
    if (!entry) throw new Error(`Falta ronda ${round} en data.json`);
    return entry;
  };

  return {
    round1: find(1) as AllQuestions["round1"],
    round2: find(2) as AllQuestions["round2"],
    round3: find(3) as AllQuestions["round3"],
    round4: find(4) as AllQuestions["round4"],
    round5: find(5) as AllQuestions["round5"],
    round6: find(6) as AllQuestions["round6"],
  };
}

export const questions: AllQuestions = {
  ...parseDataFile(rawData as DataFileEntry[]),
  config: config as AllQuestions["config"],
};

const validationErrors = validateQuestions(questions);
logValidationErrors(validationErrors);

export { validationErrors };
