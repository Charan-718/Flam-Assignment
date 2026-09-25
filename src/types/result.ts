export type Flashcard = {
  id: string;
  question: string;
  answer: string;
  hint?: string;
};

export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type StudyPack = {
  topic: string;
  summary: string;
  cards: Flashcard[];
  quiz: QuizQuestion[];
};

export type AppErrorKind =
  | "malformed"
  | "wrong_shape"
  | "empty"
  | "timeout"
  | "failed"
  | "stale";

export type AppError = {
  kind: AppErrorKind;
  message: string;
  detail?: string;
};

export type AppStatus = "idle" | "loading" | "error" | "ready";
