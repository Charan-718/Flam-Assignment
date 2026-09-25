type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = "Turning notes into a pack" }: LoadingStateProps) {
  return (
    <div className="panel panel--loading" aria-live="polite" aria-busy="true">
      <div className="spinner" aria-hidden="true" />
      <div>
        <p className="eyebrow">Working</p>
        <h2>{label}</h2>
        <p className="muted">
          This can take a few seconds. If a newer request starts, this one will be ignored.
        </p>
      </div>
    </div>
  );
}
