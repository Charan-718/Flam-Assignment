import { useId } from "react";

type PromptInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  submitLabel?: string;
};

export function PromptInput({
  value,
  onChange,
  onSubmit,
  disabled,
  submitLabel = "Build study pack",
}: PromptInputProps) {
  const id = useId();

  return (
    <form
      className="prompt"
      onSubmit={(event) => {
        event.preventDefault();
        if (!disabled && value.trim()) onSubmit();
      }}
    >
      <label className="prompt__label" htmlFor={id}>
        Notes or a topic
      </label>
      <textarea
        id={id}
        className="prompt__field"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Paste lecture notes, a Wikipedia-style topic, or a messy list of facts. Example: photosynthesis for a 10th-grade quiz, including light and dark reactions."
        rows={7}
        disabled={disabled}
      />
      <div className="prompt__row">
        <p className="prompt__hint">
          Free-form text only. The model returns JSON; this app never shows a chat transcript.
        </p>
        <button className="btn btn--primary" type="submit" disabled={disabled || !value.trim()}>
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
