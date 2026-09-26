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
    const pct = Math.round((correctCount / pool.length) * 100);
    const isCleanSweep = missed.length === 0;

    return (
      <section className="quiz quiz--results" aria-label="Quiz results">
        <div className="results-hero">
          <div className={`results-hero__badge ${isCleanSweep ? "results-hero__badge--great" : "results-hero__badge--needs-work"}`}>
            <span className="results-hero__score">{correctCount}/{pool.length}</span>
            <span className="results-hero__pct">{pct}%</span>
          </div>
          <div className="results-hero__info">
            <span className="badge badge--accent">
              {retestRound > 0 ? `Retest Round ${retestRound}` : "Quiz Completed"}
            </span>
            <h3>
              {isCleanSweep ? "Clean Sweep! Perfect Score" : `${missed.length} Questions to Review`}
            </h3>
            <p className="muted">
              {isCleanSweep
                ? "You answered every question correctly in this deck."
                : "Review what you missed below. You can retest only these missed questions without starting over."}
            </p>
          </div>
        </div>

        {missed.length > 0 ? (
          <div className="review-section">
            <h4 className="review-section__title">Review Missed Answers</h4>
            <div className="missed-cards">
              {missed.map((item, i) => (
                <div key={item.id} className="missed-card">
                  <div className="missed-card__header">
                    <span className="missed-card__index">#{i + 1}</span>
                    <strong className="missed-card__question">{item.question}</strong>
                  </div>
                  <div className="missed-card__comparison">
                    <div className="pill-answer pill-answer--wrong">
                      <span className="pill-answer__tag">
                        <i className="fa-solid fa-xmark"></i> You picked
                      </span>
                      <span className="pill-answer__text">{item.options[answers[item.id].choice]}</span>
                    </div>
                    <div className="pill-answer pill-answer--correct">
                      <span className="pill-answer__tag">
                        <i className="fa-solid fa-check"></i> Correct
                      </span>
                      <span className="pill-answer__text">{item.options[item.correctIndex]}</span>
                    </div>
                  </div>
                  {item.explanation ? (
                    <div className="missed-card__explanation">
                      <span className="explanation-icon">
                        <i className="fa-solid fa-circle-info"></i>
                      </span>
                      <span>{item.explanation}</span>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="results-actions">
          {missed.length > 0 ? (
            <button
              className="btn btn--primary"
              type="button"
              onClick={() => resetWith(missed, retestRound + 1)}
            >
              <i className="fa-solid fa-rotate-right"></i> Retest missed ({missed.length})
            </button>
          ) : null}
          <button className="btn btn--secondary" type="button" onClick={() => resetWith(questions, 0)}>
            <i className="fa-solid fa-arrows-rotate"></i> Retake full quiz
          </button>
        </div>
      </section>
    );
  }

  const progressPercent = Math.round(((index + (answered ? 1 : 0)) / pool.length) * 100);

  return (
    <section className="quiz" aria-label="Quiz">
      <div className="quiz-topbar">
        <div className="quiz-progress-info">
          <span className="quiz-question-counter">
            Question <strong>{index + 1}</strong> of {pool.length}
            {retestRound > 0 ? ` (Retest ${retestRound})` : ""}
          </span>
          <span className="quiz-score-tracker">
            {answeredCount} answered · <strong>{correctCount}</strong> correct
          </span>
        </div>
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
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
              <span className="option__text">{option}</span>
              {reveal && isCorrect ? (
                <span className="option__status-icon">
                  <i className="fa-solid fa-check"></i>
                </span>
              ) : null}
              {reveal && selected && !isCorrect ? (
                <span className="option__status-icon">
                  <i className="fa-solid fa-xmark"></i>
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {answered ? (
        <div className={`explain ${answered.correct ? "explain--ok" : "explain--no"}`}>
          <span className="explain__indicator">
            {answered.correct ? (
              <span><i className="fa-solid fa-check"></i> Correct</span>
            ) : (
              <span><i className="fa-solid fa-xmark"></i> Incorrect</span>
            )}
          </span>
          <p className="explain__text">{question.explanation}</p>
        </div>
      ) : null}

      <div className="quiz-navigation">
        <button
          className="btn btn--secondary"
          type="button"
          onClick={() => setIndex((value) => Math.max(0, value - 1))}
          disabled={index === 0}
        >
          <i className="fa-solid fa-arrow-left"></i> Previous
        </button>
        {index === pool.length - 1 ? (
          <button
            className="btn btn--primary"
            type="button"
            onClick={() => setFinished(true)}
            disabled={answeredCount < pool.length}
          >
            See results ({correctCount}/{pool.length}) <i className="fa-solid fa-arrow-right"></i>
          </button>
        ) : (
          <button
            className="btn btn--primary"
            type="button"
            onClick={() => setIndex((value) => Math.min(pool.length - 1, value + 1))}
            disabled={!answered}
          >
            Next question <i className="fa-solid fa-arrow-right"></i>
          </button>
        )}
      </div>
    </section>
  );
}
