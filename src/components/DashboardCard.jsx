import React from "react";

function DashboardCard({ title, value }) {
  return (
    <section className="card">
      <h3>{title}</h3>
      <p>{value}</p>
    </section>
  );
}

export default DashboardCard;