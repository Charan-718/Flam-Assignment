export function EmptyState() {
  return (
    <div className="panel panel--empty">
      <div className="panel--empty__header">
        <span className="badge badge--brand">
          <i className="fa-solid fa-hourglass-start"></i> Waiting for Input
        </span>
        <h2>Your cards and quiz will land here</h2>
        <p>
          Paste lecture notes or a topic above and click <strong>Build study pack</strong>. This section will turn into an interactive flip deck and a scored quiz — never a raw chat log.
        </p>
      </div>
      <ul className="feature-list">
        <li>
          <i className="fa-solid fa-circle-check"></i>
          <span><strong>Defensive Validation:</strong> Malformed JSON, empty replies, and timeouts stay safely in an error state without crashing.</span>
        </li>
        <li>
          <i className="fa-solid fa-circle-check"></i>
          <span><strong>Stale Guard:</strong> Slower older responses can never overwrite a newer pack.</span>
        </li>
        <li>
          <i className="fa-solid fa-circle-check"></i>
          <span><strong>Retest Loop:</strong> Missed quiz items can be re-tested immediately without unnecessary model calls.</span>
        </li>
      </ul>
    </div>
  );
}
