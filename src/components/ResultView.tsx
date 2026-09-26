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
    <div className="result-card">
      <header className="result-card__header">
        <div className="result-card__top">
          <span className="badge badge--accent">Active Study Pack</span>
          <div className="result-card__stats">
            <span className="stat-chip">🃏 {pack.cards.length} Flashcards</span>
            <span className="stat-chip">📝 {pack.quiz.length} Quiz Questions</span>
          </div>
        </div>
        <h2 className="result-card__title">{pack.topic}</h2>
        <p className="result-card__summary">{pack.summary}</p>
      </header>

      <div className="segmented-tabs" role="tablist" aria-label="Study modes">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "cards"}
          className={`segmented-tab ${tab === "cards" ? "segmented-tab--active" : ""}`}
          onClick={() => setTab("cards")}
        >
          <span className="tab-icon">🃏</span>
          <span>Flashcard Deck</span>
          <span className="tab-count">{pack.cards.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "quiz"}
          className={`segmented-tab ${tab === "quiz" ? "segmented-tab--active" : ""}`}
          onClick={() => setTab("quiz")}
        >
          <span className="tab-icon">📝</span>
          <span>Interactive Quiz</span>
          <span className="tab-count">{pack.quiz.length}</span>
        </button>
      </div>

      <div className="result-card__content">
        {tab === "cards" ? (
          <FlashcardDeck cards={pack.cards} />
        ) : (
          <QuizView key={pack.topic + pack.quiz.map((q) => q.id).join()} questions={pack.quiz} />
        )}
      </div>

      <div className="refine-card">
        <div className="refine-card__header">
          <div className="refine-card__title-group">
            <span className="refine-wand">✨</span>
            <label className="refine-card__title" htmlFor="refine">
              Refine with AI
            </label>
          </div>
          <span className="refine-card__hint">Edits existing pack in place</span>
        </div>
        <form
          className="refine-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!instruction.trim() || refining) return;
            onRefine(instruction.trim());
            setInstruction("");
          }}
        >
          <input
            id="refine"
            className="refine-input"
            value={instruction}
            onChange={(event) => setInstruction(event.target.value)}
            placeholder="e.g. Add 2 harder cards on enzyme kinetics, or make quiz question 3 tougher"
            disabled={refining}
          />
          <button
            className="btn btn--primary refine-btn"
            type="submit"
            disabled={refining || !instruction.trim()}
          >
            {refining ? "Updating…" : "Apply Update"}
          </button>
        </form>
      </div>
    </div>
  );
}
