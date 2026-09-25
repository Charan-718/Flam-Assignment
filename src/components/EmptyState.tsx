export function EmptyState() {
  return (
    <div className="panel panel--empty">
      <p className="eyebrow">Idle</p>
      <h2>Your cards and quiz land here</h2>
      <p>
        Paste notes on the left. After the model replies, this panel becomes a flip deck and a
        scored quiz — not a chat log.
      </p>
      <ul className="checklist">
        <li>Malformed JSON, empty replies, and timeouts stay in an error state</li>
        <li>A late response cannot overwrite a newer pack</li>
        <li>Missed quiz items can be retested without calling the model again</li>
      </ul>
    </div>
  );
}
