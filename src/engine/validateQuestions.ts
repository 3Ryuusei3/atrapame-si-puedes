import type { AllQuestions } from "@/types/questions";

export interface ValidationError {
  file: string;
  message: string;
}

export function validateQuestions(data: AllQuestions): ValidationError[] {
  const errors: ValidationError[] = [];

  if (data.round1.sets.length !== 5) {
    errors.push({
      file: "data.json",
      message: `Ronda 1: 5 sets (tiene ${data.round1.sets.length}).`,
    });
  }

  for (const set of data.round1.sets) {
    if (set.questions.length < 1 || set.questions.length > 7) {
      errors.push({
        file: "data.json",
        message: `Ronda 1 set J${set.playerOrder}: entre 1 y 7 preguntas (tiene ${set.questions.length}).`,
      });
    }
  }

  for (const set of data.round2.sets) {
    if (set.questions.length !== 5) {
      errors.push({
        file: "data.json",
        message: `Ronda 2 set J${set.playerOrder}: 5 preguntas (tiene ${set.questions.length}).`,
      });
    }
    if (set.answers.length !== 6) {
      errors.push({
        file: "data.json",
        message: `Ronda 2 set J${set.playerOrder}: 6 respuestas (tiene ${set.answers.length}).`,
      });
    }
    const decoys = set.answers.filter((a) => a.matchesQuestionId === null);
    if (decoys.length !== 1) {
      errors.push({
        file: "data.json",
        message: `Ronda 2 set J${set.playerOrder}: exactamente 1 señuelo.`,
      });
    }
  }

  if (data.round2.sets.length !== 5) {
    errors.push({
      file: "data.json",
      message: `Ronda 2: 5 sets (tiene ${data.round2.sets.length}).`,
    });
  }

  if (data.round3.topics.length < 5) {
    errors.push({
      file: "data.json",
      message: `Ronda 3: mínimo 5 temas (tiene ${data.round3.topics.length}).`,
    });
  }

  for (const q of data.round4.questions) {
    if (q.options.length !== 2) {
      errors.push({
        file: "data.json",
        message: `Ronda 4 pregunta ${q.id}: 2 opciones.`,
      });
    }
  }

  if (!data.round5.questions.length) {
    errors.push({
      file: "data.json",
      message: "Ronda 5: al menos 1 pregunta.",
    });
  }

  if (data.round6.topics.length !== 5) {
    errors.push({
      file: "data.json",
      message: `Ronda 6: exactamente 5 temas (tiene ${data.round6.topics.length}).`,
    });
  }

  for (const topic of data.round6.topics) {
    if (!topic.name) {
      errors.push({
        file: "data.json",
        message: `Ronda 6 tema ${topic.id}: falta nombre.`,
      });
    }
    if (!topic.question?.text || !topic.question?.answer) {
      errors.push({
        file: "data.json",
        message: `Ronda 6 tema ${topic.id}: falta pregunta o respuesta.`,
      });
    }
  }

  return errors;
}

export function logValidationErrors(errors: ValidationError[]): void {
  if (errors.length === 0) {
    console.info("[Atrápame] Preguntas validadas correctamente.");
    return;
  }
  console.warn("[Atrápame] Errores de validación:");
  for (const err of errors) {
    console.warn(`  - ${err.file}: ${err.message}`);
  }
}
