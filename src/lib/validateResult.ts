import type { Flashcard, QuizQuestion, StudyPack } from "../types/result";

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function asId(value: unknown, fallback: string): string {
  if (isNonEmptyString(value)) return value.trim();
  return fallback;
}

function parseCard(raw: unknown, index: number): Flashcard | null {
  if (!raw || typeof raw !== "object") return null;
  const card = raw as Record<string, unknown>;
  if (!isNonEmptyString(card.question) || !isNonEmptyString(card.answer)) {
    return null;
  }
  const parsed: Flashcard = {
    id: asId(card.id, `c${index + 1}`),
    question: card.question.trim(),
    answer: card.answer.trim(),
  };
  if (isNonEmptyString(card.hint)) {
    parsed.hint = card.hint.trim();
  }
  return parsed;
}

function parseQuiz(raw: unknown, index: number): QuizQuestion | null {
  if (!raw || typeof raw !== "object") return null;
  const q = raw as Record<string, unknown>;
  if (!isNonEmptyString(q.question)) return null;
  if (!Array.isArray(q.options)) return null;

  const options = q.options
    .filter((opt): opt is string => typeof opt === "string")
    .map((opt) => opt.trim())
    .filter((opt) => opt.length > 0);

  if (options.length < 2) return null;

  const correctIndex = Number(q.correctIndex);
  if (!Number.isInteger(correctIndex) || correctIndex < 0 || correctIndex >= options.length) {
    return null;
  }

  const parsed: QuizQuestion = {
    id: asId(q.id, `q${index + 1}`),
    question: q.question.trim(),
    options,
    correctIndex,
    explanation: isNonEmptyString(q.explanation)
      ? q.explanation.trim()
      : "No explanation was provided.",
  };
  return parsed;
}

export function extractJsonText(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;

  if (candidate.startsWith("{") && candidate.endsWith("}")) {
    return candidate;
  }

  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end <= start) return null;
  return candidate.slice(start, end + 1);
}

export type ValidateOk = { ok: true; data: StudyPack };
export type ValidateFail = {
  ok: false;
  reason: "malformed" | "wrong_shape" | "empty";
  message: string;
};
export type ValidateResult = ValidateOk | ValidateFail;

export function validateResult(raw: unknown): ValidateResult {
  if (raw == null || (typeof raw === "string" && raw.trim() === "")) {
    return {
      ok: false,
      reason: "empty",
      message: "The model returned an empty response.",
    };
  }

  let parsed: unknown = raw;
  if (typeof raw === "string") {
    const jsonText = extractJsonText(raw);
    if (!jsonText) {
      return {
        ok: false,
        reason: "malformed",
        message: "Could not find a JSON object in the model output.",
      };
    }
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      return {
        ok: false,
        reason: "malformed",
        message: "The model output was not valid JSON.",
      };
    }
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return {
      ok: false,
      reason: "wrong_shape",
      message: "Expected a study pack object, not an array or primitive.",
    };
  }

  const pack = parsed as Record<string, unknown>;
  const cardsRaw = pack.cards;
  const quizRaw = pack.quiz;

  if (!Array.isArray(cardsRaw) || !Array.isArray(quizRaw)) {
    return {
      ok: false,
      reason: "wrong_shape",
      message: "A study pack needs both a cards array and a quiz array.",
    };
  }

  const cards = cardsRaw
    .map((item, i) => parseCard(item, i))
    .filter((item): item is Flashcard => item !== null);
  const quiz = quizRaw
    .map((item, i) => parseQuiz(item, i))
    .filter((item): item is QuizQuestion => item !== null);

  if (cards.length === 0 && quiz.length === 0) {
    return {
      ok: false,
      reason: "empty",
      message: "The pack had no usable flashcards or quiz questions.",
    };
  }

  if (cards.length === 0 || quiz.length === 0) {
    return {
      ok: false,
      reason: "wrong_shape",
      message:
        cards.length === 0
          ? "Flashcards were missing or unusable after validation."
          : "Quiz questions were missing or unusable after validation.",
    };
  }

  const topic = isNonEmptyString(pack.topic) ? pack.topic.trim() : "Untitled pack";
  const summary = isNonEmptyString(pack.summary)
    ? pack.summary.trim()
    : "No summary was provided.";

  return {
    ok: true,
    data: { topic, summary, cards, quiz },
  };
}
