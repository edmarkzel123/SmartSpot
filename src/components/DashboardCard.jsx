function DashboardCard({ title, value, subtitle, status }) {
  return (
    <article className="dashboard-card">
      <h3>{title}</h3>
      <p className="card-value">{value}</p>
      {subtitle ? <p className="card-subtitle">{subtitle}</p> : null}
      {status ? <span className={`status-pill ${status.toLowerCase()}`}>{status}</span> : null}
    </article>
  );
}

export default DashboardCard;
