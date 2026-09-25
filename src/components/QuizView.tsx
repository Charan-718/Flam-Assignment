import { useEffect, useMemo, useState } from "react";
import type { QuizQuestion } from "../types/result";

type AnswerRecord = {
  choice: number;
  correct: boolean;
};

type QuizViewProps = {
  questions: QuizQuestion[];
};

export function QuizView({ questions }: QuizViewProps) {
  const [pool, setPool] = useState(questions);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerRecord>>({});
  const [finished, setFinished] = useState(false);
  const [retestRound, setRetestRound] = useState(0);

  useEffect(() => {
    setPool(questions);
    setIndex(0);
    setAnswers({});
    setFinished(false);
    setRetestRound(0);
  }, [questions]);

  const question = pool[index];
  const answered = question ? answers[question.id] : undefined;
  const answeredCount = Object.keys(answers).length;
  const correctCount = Object.values(answers).filter((item) => item.correct).length;

  const missed = useMemo(
    () => pool.filter((item) => answers[item.id] && !answers[item.id].correct),
    [answers, pool]
  );

  const resetWith = (nextPool: QuizQuestion[], round: number) => {
    setPool(nextPool);
    setIndex(0);
    setAnswers({});
    setFinished(false);
    setRetestRound(round);
  };

  if (pool.length === 0) {
    return <p className="muted">No quiz questions in this pack.</p>;
  }

  if (finished) {
    return (
      <section className="quiz" aria-label="Quiz results">
        <p className="eyebrow">{retestRound > 0 ? `Retest round ${retestRound}` : "Results"}</p>
        <h3>
          {correctCount} / {pool.length} correct
        </h3>
        <p className="muted">
          {missed.length === 0
            ? "Clean sweep. You can run the full quiz again anytime."
            : "Missed items stay on the desk until you retest them."}
        </p>

        {missed.length > 0 ? (
          <ul className="missed">
            {missed.map((item) => (
              <li key={item.id}>
                <strong>{item.question}</strong>
                <span>
                  You picked {item.options[answers[item.id].choice]}. Correct:{" "}
                  {item.options[item.correctIndex]}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="row">
          {missed.length > 0 ? (
            <button
              className="btn btn--primary"
              type="button"
              onClick={() => resetWith(missed, retestRound + 1)}
            >
              Retest missed
            </button>
          ) : null}
          <button className="btn" type="button" onClick={() => resetWith(questions, 0)}>
            Full quiz again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="quiz" aria-label="Quiz">
      <div className="deck__meta">
        <span>
          Question {index + 1} / {pool.length}
          {retestRound > 0 ? ` · retest ${retestRound}` : ""}
        </span>
        <span>
          {answeredCount} answered · {correctCount} correct
        </span>
      </div>

      <h3 className="quiz__prompt">{question.question}</h3>

      <div className="options" role="list">
        {question.options.map((option, optionIndex) => {
          const selected = answered?.choice === optionIndex;
          const reveal = Boolean(answered);
          const isCorrect = optionIndex === question.correctIndex;
          const className = [
            "option",
            selected ? "option--selected" : "",
            reveal && isCorrect ? "option--correct" : "",
            reveal && selected && !isCorrect ? "option--wrong" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={`${question.id}-${optionIndex}`}
              className={className}
              type="button"
              disabled={Boolean(answered)}
              onClick={() => {
                setAnswers((current) => ({
                  ...current,
                  [question.id]: {
                    choice: optionIndex,
                    correct: optionIndex === question.correctIndex,
                  },
                }));
              }}
            >
              <span className="option__letter">{String.fromCharCode(65 + optionIndex)}</span>
              <span>{option}</span>
            </button>
          );
        })}
      </div>

      {answered ? (
        <p className={`explain ${answered.correct ? "explain--ok" : "explain--no"}`}>
          {answered.correct ? "Correct. " : "Not quite. "}
          {question.explanation}
        </p>
      ) : null}

      <div className="row row--spread">
        <button
          className="btn"
          type="button"
          onClick={() => setIndex((value) => Math.max(0, value - 1))}
          disabled={index === 0}
        >
          Previous
        </button>
        {index === pool.length - 1 ? (
          <button
            className="btn btn--primary"
            type="button"
            onClick={() => setFinished(true)}
            disabled={answeredCount < pool.length}
          >
            See results
          </button>
        ) : (
          <button
            className="btn btn--primary"
            type="button"
            onClick={() => setIndex((value) => Math.min(pool.length - 1, value + 1))}
            disabled={!answered}
          >
            Next
          </button>
        )}
      </div>
    </section>
  );
}
