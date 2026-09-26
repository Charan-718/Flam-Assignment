import { useId } from "react";

type PromptInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  submitLabel?: string;
};

const SUGGESTIONS = [
  { label: "Photosynthesis", text: "Photosynthesis for high school biology: light-dependent reactions, Calvin cycle, chloroplast structure, ATP and NADPH production, and overall equation." },
  { label: "Cellular Energy", text: "Cellular respiration and ATP synthesis: glycolysis, Krebs cycle, electron transport chain, mitochondria structure, and aerobic vs anaerobic differences." },
  { label: "World War II", text: "World War II turning points: Battle of Midway, Stalingrad, D-Day Normandy invasion, key Allied vs Axis powers, and postwar geopolitical impact." },
];

export function PromptInput({
  value,
  onChange,
  onSubmit,
  disabled,
  submitLabel = "Build study pack",
}: PromptInputProps) {
  const id = useId();

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <form
      className="prompt-card"
      onSubmit={(event) => {
        event.preventDefault();
        if (!disabled && value.trim()) onSubmit();
      }}
    >
      <div className="prompt-header">
        <div className="prompt-header__title-group">
          <span className="badge badge--accent">
            <i className="fa-solid fa-pen-to-square"></i> Input Desk
          </span>
          <label className="prompt-header__title" htmlFor={id}>
            Notes or Topic
          </label>
        </div>
        {wordCount > 0 ? (
          <span className="prompt-header__counter">{wordCount} words</span>
        ) : null}
      </div>

      <p className="prompt-subtitle">
        Paste lecture notes, study guides, or a topic to generate interactive cards and a quiz.
      </p>

      <div className="suggestions">
        <span className="suggestions__label">
          <i className="fa-solid fa-bolt"></i> Quick Prompts:
        </span>
        <div className="suggestions__chips">
          {SUGGESTIONS.map((s) => (
            <button
              key={s.label}
              type="button"
              className="chip"
              disabled={disabled}
              onClick={() => onChange(s.text)}
              title={s.text}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="prompt-field-wrap">
        <textarea
          id={id}
          className="prompt-field"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Paste lecture notes, concepts, or raw facts here..."
          rows={6}
          disabled={disabled}
        />
      </div>

      <div className="prompt-footer">
        <button
          className="btn btn--primary btn--full"
          type="submit"
          disabled={disabled || !value.trim()}
        >
          {disabled ? (
            <span className="btn__loading-text">
              <span className="btn-spinner" aria-hidden="true" />
              Generating Study Pack…
            </span>
          ) : (
            <span>
              {submitLabel} <i className="fa-solid fa-arrow-right"></i>
            </span>
          )}
        </button>
        <p className="prompt-security-note">
          <i className="fa-solid fa-lock"></i> Structured JSON only · Zero chat transcripts · Groq LLM
        </p>
      </div>
    </form>
  );
}
