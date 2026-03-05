import React from "react";

function DashboardCard({ title, value }) {
  return (
    <section className="dashboard-card">
      <h3>{title}</h3>
      <p className="card-value">{value}</p>
    </section>
  );
}

export default DashboardCard;