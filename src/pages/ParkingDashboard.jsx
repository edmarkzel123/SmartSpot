import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardCard from "../components/DashboardCard";
import StatusIndicator from "../components/StatusIndicator";
import {
  parkingData,
  metrics,
  slotStatus,
  sensorStatus,
  notifications,
} from "../data/parkingData";
import "../styles/dashboard.css";

function ParkingDashboard({ onLogout, settings }) {
  const navigate = useNavigate();
  const [liveTime, setLiveTime] = useState(new Date());
  const [showHealthDetails, setShowHealthDetails] = useState(false);

  // Notification dismissal state
  const [dismissedIds, setDismissedIds] = useState([]);

  // Active filter for slot status
  const [slotFilter, setSlotFilter] = useState("All");

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
    const online = sensorStatus.filter((s) => s.health === "Online").length;
    const warning = sensorStatus.filter((s) => s.health === "Warning").length;
    const offline = sensorStatus.filter((s) => s.health === "Offline").length;
    return { online, warning, offline };
  }, []);

  const overallHealth = useMemo(() => {
    if (sensorSummary.offline > 0) return "critical";
    if (sensorSummary.warning > 0) return "warning";
    return "stable";
  }, [sensorSummary]);

  const activeNotifications = notifications.filter(
    (n) => !dismissedIds.includes(n.id)
  );

  const filteredSlots = slotFilter === "All"
    ? slotStatus
    : slotStatus.filter((s) => s.status === slotFilter);

  function handleDismiss(id) {
    setDismissedIds((prev) => [...prev, id]);
  }

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
          <p className="supervisor-badge">Supervisor: {settings?.supervisorName || "Jamie Cruz"}</p>
          <div className="header-btns">
            <button type="button" className="settings-button" onClick={() => navigate("/settings")}>
              ⚙ Settings
            </button>
            <button type="button" className="logout-button" onClick={onLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        {/* Occupancy Alert Banner — state-driven UI update */}
        {occupancyRate >= (settings?.alertThreshold || 85) && (
          <div className="alert-banner" role="alert">
            ⚠ Occupancy alert: {occupancyRate}% exceeds the {settings?.alertThreshold || 85}% threshold!
          </div>
        )}

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
          <p className="last-updated">System snapshot: {parkingData.lastUpdated}</p>
        </section>

        <section className="sensor-section" aria-label="Sensor Status">
          <h2>Sensor Health Monitor</h2>
          <div className="sensor-summary">
            <span>Online: {sensorSummary.online}</span>
            <span>Warning: {sensorSummary.warning}</span>
            <span>Offline: {sensorSummary.offline}</span>
          </div>
          <button
            type="button"
            className={`health-toggle ${showHealthDetails ? "active" : ""}`}
            onClick={() => setShowHealthDetails((prev) => !prev)}
          >
            {showHealthDetails ? "Hide details" : "Show details"}
          </button>

          {showHealthDetails && (
            <div className="health-indicators">
              <StatusIndicator label="Overall Status" value={overallHealth} tone={overallHealth} />
              <StatusIndicator label="Online Sensors" value={sensorSummary.online} tone="stable" />
              <StatusIndicator label="Sensors at Risk" value={sensorSummary.warning} tone="warning" />
              <StatusIndicator label="Offline Sensors" value={sensorSummary.offline} tone="critical" />
            </div>
          )}

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
          {/* Filter controls — state-driven UI update */}
          <div className="slot-filter">
            {["All", "Available", "Occupied"].map((f) => (
              <button
                key={f}
                type="button"
                className={`filter-btn ${slotFilter === f ? "active" : ""}`}
                onClick={() => setSlotFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <ul>
            {filteredSlots.map((slot) => (
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
          {activeNotifications.length === 0 ? (
            <p className="no-alerts">All clear — no active alerts.</p>
          ) : (
            <ul>
              {activeNotifications.map((item) => (
                <li key={item.id} className={`notification-item ${item.type}`}>
                  <span>{item.message}</span>
                  <button
                    type="button"
                    className="dismiss-btn"
                    onClick={() => handleDismiss(item.id)}
                    aria-label="Dismiss notification"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>

      <footer className="dashboard-footer">
        <p>SmartSpot Monitoring Core | Secure admin session active</p>
      </footer>
    </div>
  );
}

export default ParkingDashboard;