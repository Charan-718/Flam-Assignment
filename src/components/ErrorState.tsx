import type { AppError } from "../types/result";

const KIND_LABEL: Record<AppError["kind"], string> = {
  malformed: "Malformed JSON",
  wrong_shape: "Wrong shape",
  empty: "Empty response",
  timeout: "Slow response",
  failed: "Request failed",
  stale: "Stale response ignored",
};

type ErrorStateProps = {
  error: AppError;
  onRetry: () => void;
  onReset: () => void;
};

export function ErrorState({ error, onRetry, onReset }: ErrorStateProps) {
  return (
    <div className="panel panel--error" role="alert">
      <div className="panel--error__top">
        <span className="badge badge--error">
          <i className="fa-solid fa-triangle-exclamation"></i> {KIND_LABEL[error.kind]}
        </span>
      </div>
      <h2>Nothing was applied to the desk</h2>
      <p>{error.message}</p>
      {error.detail ? <p className="muted">{error.detail}</p> : null}
      <div className="row">
        <button className="btn btn--primary" type="button" onClick={onRetry}>
          <i className="fa-solid fa-rotate-right"></i> Retry
        </button>
        <button className="btn btn--secondary" type="button" onClick={onReset}>
          <i className="fa-solid fa-xmark"></i> Clear
        </button>
      </div>
    </div>
  );
}
