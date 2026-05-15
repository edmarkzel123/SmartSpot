import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardCard from "../components/DashboardCard";
import StatusIndicator from "../components/StatusIndicator";
import {
  parkingData as fallbackData,
  metrics as fallbackMetrics,
  slotStatus as fallbackSlots,
  sensorStatus,           
  notifications as fallbackNotifications,
} from "../data/parkingData";
import "../styles/dashboard.css";
import { getAccessToken, API_BASE } from "../utils/auth";

function ParkingDashboard({ onLogout, settings }) {
  const navigate = useNavigate();
  const emptyAreaForm = {
    name: "",
    level: "",
    total_slots: "",
    available_slots: "",
    direction_hint: "",
    status: "open",
    display_order: "",
  };
  const [parkingData, setParkingData] = useState(fallbackData);
  const [metrics, setMetrics] = useState(fallbackMetrics);
  const [slotStatus, setSlotStatus] = useState(fallbackSlots);
  const [notifications, setNotifications] = useState(fallbackNotifications);
  const [parkingAreas, setParkingAreas] = useState([]);
  const [areaForm, setAreaForm] = useState(emptyAreaForm);
  const [editingAreaId, setEditingAreaId] = useState(null);
  const [apiError, setApiError] = useState("");
  const [apiSuccess, setApiSuccess] = useState("");

  useEffect(() => {
    const token = getAccessToken();

    async function fetchDashboard() {
      try {
        const res = await fetch(`${API_BASE}/dashboard/summary/`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const json = await res.json();

        if (!res.ok || !json.success) {
          setApiError("Could not load live data.");
          return;
        }

        const d = json.data;

        // Update parking summary
        setParkingData(prev => ({
          ...prev,
          totalSlots: d.total_slots,
          availableSlots: d.available_slots,
          occupiedSlots: d.occupied_slots,
          mallName: d.mall_name,
          locationName: d.location_name,
        }));

        // Update metrics cards
        setMetrics([
          { id: "total", title: "Total Slots", value: d.total_slots, subtitle: "Across all covered levels" },
          { id: "occupied", title: "Occupied", value: d.occupied_slots, subtitle: "Vehicles currently parked", status: "Occupied" },
          { id: "available", title: "Available", value: d.available_slots, subtitle: "Ready for incoming drivers", status: "Available" },
          { id: "occupancy", title: "Occupancy Rate", value: `${d.occupancy_rate}%`, subtitle: "Current fill level" },
        ]);

        // Map parking areas to slot status table
        setSlotStatus(
          d.areas.map(area => ({
            id: area.id,
            slotId: area.name,
            level: area.level,
            status: area.available_slots > 0 ? "Available" : "Occupied",
            plateNumber: `${area.available_slots}/${area.total_slots} free`,
          }))
        );
        setParkingAreas(d.areas);

        // Map recent activity to notifications
        setNotifications(
          d.recent_activity.map(a => ({
            id: a.id,
            message: a.message,
            type: a.activity_type,
          }))
        );

        setApiError("");
      } catch {
        setApiError("Live data unavailable — showing last known state.");
      }
    }

    fetchDashboard();
    const interval = setInterval(fetchDashboard, (settings?.refreshInterval || 30) * 1000);
    return () => clearInterval(interval);
  }, [settings?.refreshInterval]);
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
    () => parkingData.totalSlots
      ? Math.round((parkingData.occupiedSlots / parkingData.totalSlots) * 100)
      : 0,
    [parkingData.occupiedSlots, parkingData.totalSlots]
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

  function handleAreaChange(event) {
    const { name, value } = event.target;
    setAreaForm((prev) => ({ ...prev, [name]: value }));
    setApiError("");
    setApiSuccess("");
  }

  function resetAreaForm() {
    setAreaForm(emptyAreaForm);
    setEditingAreaId(null);
  }

  function toAreaPayload() {
    return {
      ...areaForm,
      total_slots: Number(areaForm.total_slots),
      available_slots: Number(areaForm.available_slots),
      display_order: Number(areaForm.display_order || 0),
    };
  }

  function validateAreaForm() {
    if (!areaForm.name.trim()) return "Area name is required.";
    if (!areaForm.level.trim()) return "Level is required.";
    if (!areaForm.direction_hint.trim()) return "Direction hint is required.";
    const totalSlots = Number(areaForm.total_slots);
    const availableSlots = Number(areaForm.available_slots);
    if (!Number.isInteger(totalSlots) || totalSlots < 1) return "Total slots must be at least 1.";
    if (!Number.isInteger(availableSlots) || availableSlots < 0) return "Available slots must be 0 or higher.";
    if (availableSlots > totalSlots) return "Available slots cannot exceed total slots.";
    return "";
  }

  async function refreshDashboardNow() {
    const token = getAccessToken();
    const res = await fetch(`${API_BASE}/dashboard/summary/`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || "Could not refresh dashboard data.");
    }
    const d = json.data;
    setParkingData(prev => ({
      ...prev,
      totalSlots: d.total_slots,
      availableSlots: d.available_slots,
      occupiedSlots: d.occupied_slots,
      mallName: d.mall_name,
      locationName: d.location_name,
    }));
    setMetrics([
      { id: "total", title: "Total Slots", value: d.total_slots, subtitle: "Across all covered levels" },
      { id: "occupied", title: "Occupied", value: d.occupied_slots, subtitle: "Vehicles currently parked", status: "Occupied" },
      { id: "available", title: "Available", value: d.available_slots, subtitle: "Ready for incoming drivers", status: "Available" },
      { id: "occupancy", title: "Occupancy Rate", value: `${d.occupancy_rate}%`, subtitle: "Current fill level" },
    ]);
    setSlotStatus(
      d.areas.map(area => ({
        id: area.id,
        slotId: area.name,
        level: area.level,
        status: area.available_slots > 0 ? "Available" : "Occupied",
        plateNumber: `${area.available_slots}/${area.total_slots} free`,
      }))
    );
    setParkingAreas(d.areas);
    setNotifications(
      d.recent_activity.map(a => ({
        id: a.id,
        message: a.message,
        type: a.activity_type,
      }))
    );
  }

  async function handleAreaSubmit(event) {
    event.preventDefault();
    const validationError = validateAreaForm();
    if (validationError) {
      setApiError(validationError);
      setApiSuccess("");
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setApiError("Unauthorized. Log in first so the API can receive your token.");
      setApiSuccess("");
      return;
    }

    try {
      const url = editingAreaId
        ? `${API_BASE}/parking-areas/${editingAreaId}/`
        : `${API_BASE}/parking-areas/`;
      const res = await fetch(url, {
        method: editingAreaId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(toAreaPayload()),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "API rejected the parking area data.");
      }

      setApiSuccess(json.message);
      setApiError("");
      resetAreaForm();
      await refreshDashboardNow();
    } catch (error) {
      setApiError(error.message || "Could not save parking area.");
      setApiSuccess("");
    }
  }

  function handleEditArea(area) {
    setEditingAreaId(area.id);
    setAreaForm({
      name: area.name,
      level: area.level,
      total_slots: String(area.total_slots),
      available_slots: String(area.available_slots),
      direction_hint: area.direction_hint,
      status: area.status,
      display_order: String(area.display_order ?? 0),
    });
    setApiError("");
    setApiSuccess("");
  }

  async function handleDeleteArea(areaId) {
    const token = getAccessToken();
    if (!token) {
      setApiError("Unauthorized. Log in first so the API can receive your token.");
      setApiSuccess("");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/parking-areas/${areaId}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || "Could not delete parking area.");
      }
      setApiSuccess(json.message);
      setApiError("");
      if (editingAreaId === areaId) resetAreaForm();
      await refreshDashboardNow();
    } catch (error) {
      setApiError(error.message || "Could not delete parking area.");
      setApiSuccess("");
    }
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

        {apiError && (
          <div className="alert-banner" role="alert" style={{ background: "#555" }}>
            ⚠ {apiError}
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

        <section className="data-flow-section" aria-label="Parking Area API Data Flow">
          <h2>Parking Area Data Flow</h2>
          <p className="data-flow-copy">
            Create, update, and delete parking areas through the Django REST API.
          </p>

          {apiSuccess && <div className="success-banner" role="status">{apiSuccess}</div>}
          {apiError && <div className="alert-banner" role="alert">{apiError}</div>}

          <form className="area-form" onSubmit={handleAreaSubmit}>
            <input
              name="name"
              value={areaForm.name}
              onChange={handleAreaChange}
              placeholder="Area name"
            />
            <input
              name="level"
              value={areaForm.level}
              onChange={handleAreaChange}
              placeholder="Level"
            />
            <input
              name="total_slots"
              type="number"
              min="1"
              value={areaForm.total_slots}
              onChange={handleAreaChange}
              placeholder="Total slots"
            />
            <input
              name="available_slots"
              type="number"
              min="0"
              value={areaForm.available_slots}
              onChange={handleAreaChange}
              placeholder="Available slots"
            />
            <input
              name="display_order"
              type="number"
              min="0"
              value={areaForm.display_order}
              onChange={handleAreaChange}
              placeholder="Display order"
            />
            <select name="status" value={areaForm.status} onChange={handleAreaChange}>
              <option value="open">Open</option>
              <option value="limited">Limited</option>
              <option value="full">Full</option>
            </select>
            <textarea
              name="direction_hint"
              value={areaForm.direction_hint}
              onChange={handleAreaChange}
              placeholder="Direction hint"
              rows="3"
            />
            <div className="area-form-actions">
              <button type="submit" className="save-button">
                {editingAreaId ? "Update Area" : "Create Area"}
              </button>
              {editingAreaId ? (
                <button type="button" className="reset-button" onClick={resetAreaForm}>
                  Cancel Edit
                </button>
              ) : null}
            </div>
          </form>

          <div className="area-list">
            {parkingAreas.length === 0 ? (
              <p className="no-alerts">No parking areas returned by the API.</p>
            ) : (
              parkingAreas.map((area) => (
                <article key={area.id} className="area-row">
                  <div>
                    <strong>{area.name}</strong>
                    <span>{area.level} | {area.available_slots}/{area.total_slots} free | {area.status}</span>
                  </div>
                  <div className="area-row-actions">
                    <button type="button" onClick={() => handleEditArea(area)}>
                      Edit
                    </button>
                    <button type="button" className="delete-button" onClick={() => handleDeleteArea(area.id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
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
