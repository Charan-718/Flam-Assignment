import { useState } from "react";
import type { StudyPack } from "../types/result";
import { FlashcardDeck } from "./FlashcardDeck";
import { QuizView } from "./QuizView";

type ResultViewProps = {
  pack: StudyPack;
  onRefine: (instruction: string) => void;
  refining: boolean;
};

type Tab = "cards" | "quiz";

export function ResultView({ pack, onRefine, refining }: ResultViewProps) {
  const [tab, setTab] = useState<Tab>("cards");
  const [instruction, setInstruction] = useState("");

  return (
    <div className="result">
      <header className="result__head">
        <p className="eyebrow">Study pack</p>
        <h2>{pack.topic}</h2>
        <p>{pack.summary}</p>
        <p className="muted">
          {pack.cards.length} cards · {pack.quiz.length} quiz questions
        </p>
      </header>

      <div className="tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "cards"}
          className={tab === "cards" ? "tab tab--active" : "tab"}
          onClick={() => setTab("cards")}
        >
          Flashcards
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "quiz"}
          className={tab === "quiz" ? "tab tab--active" : "tab"}
          onClick={() => setTab("quiz")}
        >
          Quiz
        </button>
      </div>

      {tab === "cards" ? (
        <FlashcardDeck cards={pack.cards} />
      ) : (
        <QuizView key={pack.topic + pack.quiz.map((q) => q.id).join()} questions={pack.quiz} />
      )}

      <form
        className="refine"
        onSubmit={(event) => {
          event.preventDefault();
          if (!instruction.trim() || refining) return;
          onRefine(instruction.trim());
          setInstruction("");
        }}
      >
        <label htmlFor="refine">Refine this pack</label>
        <div className="refine__row">
          <input
            id="refine"
            value={instruction}
            onChange={(event) => setInstruction(event.target.value)}
            placeholder="e.g. make the quiz harder, add a card on ATP"
            disabled={refining}
          />
          <button className="btn" type="submit" disabled={refining || !instruction.trim()}>
            {refining ? "Updating…" : "Apply"}
          </button>
        </div>
      </form>
    </div>
  );
}
