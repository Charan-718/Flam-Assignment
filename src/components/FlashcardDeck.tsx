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

  const card = cards[order[index]];
  const positionLabel = `${index + 1} / ${cards.length}`;

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

  if (!card) {
    return <p className="muted">No flashcards in this pack.</p>;
  }

  return (
    <section className="deck" aria-label="Flashcards">
      <div className="deck__meta">
        <span>{positionLabel}</span>
        <button className="btn btn--ghost" type="button" onClick={shuffle}>
          Shuffle
        </button>
      </div>

      <button
        type="button"
        className={`card ${flipped ? "card--flipped" : ""}`}
        onClick={() => setFlipped((value) => !value)}
        aria-pressed={flipped}
      >
        <span className="card__face card__face--front">
          <span className="eyebrow">Question</span>
          <span className="card__text">{card.question}</span>
          {card.hint ? <span className="card__hint">Hint: {card.hint}</span> : null}
          <span className="card__cue">Tap or press space to flip</span>
        </span>
        <span className="card__face card__face--back">
          <span className="eyebrow">Answer</span>
          <span className="card__text">{card.answer}</span>
        </span>
      </button>

      <div className="row row--spread">
        <button className="btn" type="button" onClick={() => go(index - 1)}>
          Previous
        </button>
        <button className="btn" type="button" onClick={() => go(index + 1)}>
          Next
        </button>
      </div>
    </section>
  );
}
