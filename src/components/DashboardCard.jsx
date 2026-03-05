import React from "react";

function DashboardCard({ title, value, subtitle, status }) {
  return (
    <section className="dashboard-card card">
      <h3>{title}</h3>
      <p className="card-value">{value}</p>
      {subtitle && <p className="card-subtitle">{subtitle}</p>}
      {status && (
        <span className={`status-pill ${status.toLowerCase()}`}>{status}</span>
      )}
    </section>
  );
}

export default DashboardCard;