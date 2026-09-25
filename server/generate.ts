export const STUDY_PACK_SHAPE = `{
  "topic": "short title",
  "summary": "2-3 sentences on what this pack covers",
  "cards": [
    {
      "id": "c1",
      "question": "prompt shown on the front of a flashcard",
      "answer": "concise answer for the back",
      "hint": "optional short cue"
    }
  ],
  "quiz": [
    {
      "id": "q1",
      "question": "multiple-choice question",
      "options": ["A", "B", "C", "D"],
      "correctIndex": 0,
      "explanation": "why the correct option is right"
    }
  ]
}`;

export function buildSystemPrompt(): string {
  return [
    "You convert notes or a topic into a JSON study pack.",
    "Return ONLY valid JSON matching this exact shape. No markdown fences, no commentary.",
    STUDY_PACK_SHAPE,
    "Rules:",
    "- Produce 6 to 10 flashcards and 5 to 8 quiz questions unless the source is very short.",
    "- Quiz options must be plausible distractors. Exactly one option is correct; correctIndex is its 0-based index.",
    "- Stay faithful to the user's notes. If they are thin, keep content high-level and say so in summary.",
    "- Every card needs a non-empty question and answer. Every quiz item needs at least two options.",
    "- Do not wrap the JSON in backticks.",
  ].join("\n");
}

export function buildUserPrompt(input: string): string {
  return `Create a study pack from this material:\n\n${input.trim()}`;
}

export function buildRefinePrompt(instruction: string, previousJson: string): string {
  return [
    "Here is the current study pack as JSON.",
    "Apply the user's instruction and return a FULL replacement pack in the same shape.",
    "Keep IDs stable when a card or question is only edited, not replaced.",
    "",
    `Instruction:\n${instruction.trim()}`,
    "",
    `Current pack:\n${previousJson}`,
  ].join("\n");
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
