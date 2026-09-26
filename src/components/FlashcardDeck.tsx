import { useEffect, useState } from "react";
import type { Flashcard } from "../types/result";

type FlashcardDeckProps = {
  cards: Flashcard[];
};

export function FlashcardDeck({ cards }: FlashcardDeckProps) {
  const [order, setOrder] = useState(() => cards.map((_, i) => i));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setOrder(cards.map((_, i) => i));
    setIndex(0);
    setFlipped(false);
  }, [cards]);

  const go = (next: number) => {
    const wrapped = (next + cards.length) % cards.length;
    setIndex(wrapped);
    setFlipped(false);
  };

  const shuffle = () => {
    const next = [...order];
    for (let i = next.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    setOrder(next);
    setIndex(0);
    setFlipped(false);
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "TEXTAREA" || target.tagName === "INPUT")) return;
      if (event.key === "ArrowRight") go(index + 1);
      if (event.key === "ArrowLeft") go(index - 1);
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        setFlipped((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, cards.length]);

  const card = cards[order[index]];
  const progressPercent = Math.round(((index + 1) / cards.length) * 100);

  if (!card) {
    return <p className="muted">No flashcards in this pack.</p>;
  }

  return (
    <section className="deck" aria-label="Flashcards">
      <div className="deck__header">
        <div className="deck__progress-info">
          <span className="deck__counter">
            Card <strong>{index + 1}</strong> of {cards.length}
          </span>
          <div className="deck__progress-bar">
            <div className="deck__progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
        <button className="btn btn--ghost btn--sm" type="button" onClick={shuffle} title="Randomize card order">
          🔀 Shuffle
        </button>
      </div>

      <button
        type="button"
        className={`card ${flipped ? "card--flipped" : ""}`}
        onClick={() => setFlipped((value) => !value)}
        aria-pressed={flipped}
      >
        <span className="card__face card__face--front">
          <div className="card__top-badge">
            <span className="eyebrow">Question · Card {index + 1}</span>
            {card.hint ? <span className="card__hint-pill">💡 Hint available</span> : null}
          </div>
          <span className="card__text">{card.question}</span>
          {card.hint ? <span className="card__hint">Hint: {card.hint}</span> : null}
          <div className="card__cue">
            <span>Tap card or press <kbd>Space</kbd> to reveal answer</span>
            <span className="card__flip-icon">↻</span>
          </div>
        </span>
        <span className="card__face card__face--back">
          <div className="card__top-badge">
            <span className="eyebrow">Answer</span>
            <span className="card__revealed-pill">✓ Revealed</span>
          </div>
          <span className="card__text card__text--answer">{card.answer}</span>
          <div className="card__cue">
            <span>Tap or press <kbd>Space</kbd> to return to question</span>
          </div>
        </span>
      </button>

      <div className="deck__controls">
        <button
          className="btn btn--secondary"
          type="button"
          onClick={() => go(index - 1)}
          title="Previous card (Left Arrow)"
        >
          ← Prev
        </button>
        <div className="deck__shortcuts">
          <span>Use <kbd>←</kbd> <kbd>→</kbd> arrows & <kbd>Space</kbd> to flip</span>
        </div>
        <button
          className="btn btn--secondary"
          type="button"
          onClick={() => go(index + 1)}
          title="Next card (Right Arrow)"
        >
          Next →
        </button>
      </div>
    </section>
  );
}
