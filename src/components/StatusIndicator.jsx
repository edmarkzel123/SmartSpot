function StatusIndicator({ label, value, tone = "neutral" }) {
  return (
    <article className={`status-indicator ${tone}`} role="status" aria-live="polite">
      <p className="status-indicator-label">{label}</p>
      <p className="status-indicator-value">{value}</p>
    </article>
  );
}

export default StatusIndicator;
