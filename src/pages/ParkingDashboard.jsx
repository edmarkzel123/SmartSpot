import { useEffect, useMemo, useState } from "react";
import DashboardCard from "../components/DashboardCard";
import {
  parkingData,
  metrics,
  slotStatus,
  sensorStatus,
  notifications
} from "../data/parkingData";
import "../styles/dashboard.css";

function ParkingDashboard({ onLogout }) {
  const [liveTime, setLiveTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      setLiveTime(new Date());
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  const occupancyRate = useMemo(
    () => Math.round((parkingData.occupiedSlots / parkingData.totalSlots) * 100),
    []
  );

  const sensorSummary = useMemo(() => {
    const online = sensorStatus.filter((sensor) => sensor.health === "Online").length;
    const warning = sensorStatus.filter((sensor) => sensor.health === "Warning").length;
    const offline = sensorStatus.filter((sensor) => sensor.health === "Offline").length;
    return { online, warning, offline };
  }, []);

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-label">Mall Admin Command Center</p>
          <h1>SmartSpot Dashboard</h1>
          <p>
            {parkingData.mallName} | {parkingData.locationName}
          </p>
        </div>

        <div className="header-actions">
          <p className="live-time">Live Time: {liveTime.toLocaleTimeString()}</p>
          <button type="button" className="logout-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <section className="metrics" aria-label="Parking Metrics">
          {metrics.map((metric) => (
            <DashboardCard
              key={metric.id}
              title={metric.title}
              value={metric.value}
              subtitle={metric.subtitle}
              status={metric.status}
            />
          ))}
        </section>

        <section className="summary-section" aria-label="System Summary">
          <h2>Operations Summary</h2>
          <div className="summary-grid">
            <p><strong>Current occupancy rate:</strong> {occupancyRate}%</p>
            <p><strong>Daily entries:</strong> {parkingData.dailyEntries}</p>
            <p><strong>Levels covered:</strong> {parkingData.levelsCovered}</p>
            <p><strong>Predicted peak:</strong> {parkingData.predictedPeakOccupancy}</p>
          </div>
          <p className="last-updated">System snapshot timestamp: {parkingData.lastUpdated}</p>
        </section>

        <section className="sensor-section" aria-label="Sensor Status">
          <h2>Sensor Health Monitor</h2>
          <div className="sensor-summary">
            <span>Online: {sensorSummary.online}</span>
            <span>Warning: {sensorSummary.warning}</span>
            <span>Offline: {sensorSummary.offline}</span>
          </div>
          <ul>
            {sensorStatus.map((sensor) => (
              <li key={sensor.id} className="sensor-item">
                <div>
                  <p>{sensor.id}</p>
                  <small>{sensor.zone}</small>
                </div>
                <div>
                  <span className={`sensor-health ${sensor.health.toLowerCase()}`}>{sensor.health}</span>
                  <small>{sensor.latencyMs ? `${sensor.latencyMs} ms` : "No signal"}</small>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="slot-status" aria-label="Slot Monitoring">
          <h2>Live Slot Availability</h2>
          <ul>
            {slotStatus.map((slot) => (
              <li key={slot.slotId} className="slot-item">
                <span>
                  {slot.slotId} ({slot.level}) | Plate: {slot.plateNumber}
                </span>
                <span className={slot.status.toLowerCase()}>{slot.status}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="notification-section" aria-label="System Notifications">
          <h2>Incident and Alert Feed</h2>
          <ul>
            {notifications.map((item) => (
              <li key={item.id} className={`notification-item ${item.type}`}>
                {item.message}
              </li>
            ))}
          </ul>
        </section>

        
      </main>

      <footer className="dashboard-footer">
        <p>SmartSpot Monitoring Core | Secure admin session active</p>
      </footer>
    </div>
  );
}

export default ParkingDashboard;
