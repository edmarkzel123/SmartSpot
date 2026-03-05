import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/settings.css";

function SettingsPage({ onLogout, settings, onSave }) {
  const navigate = useNavigate();

  // Controlled form state initialized from current settings
  const [form, setForm] = useState({ ...settings });
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setSaved(false);
    // Clear error on change
    setErrors((prev) => ({ ...prev, [name]: "" }));
  }

  function validate() {
    const newErrors = {};
    if (!form.supervisorName.trim()) {
      newErrors.supervisorName = "Supervisor name is required.";
    }
    const threshold = Number(form.alertThreshold);
    if (isNaN(threshold) || threshold < 1 || threshold > 100) {
      newErrors.alertThreshold = "Threshold must be between 1 and 100.";
    }
    const interval = Number(form.refreshInterval);
    if (isNaN(interval) || interval < 5 || interval > 300) {
      newErrors.refreshInterval = "Refresh interval must be between 5 and 300 seconds.";
    }
    return newErrors;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave({
      ...form,
      alertThreshold: Number(form.alertThreshold),
      refreshInterval: Number(form.refreshInterval),
    });
    setSaved(true);
  }

  function handleReset() {
    setForm({ ...settings });
    setErrors({});
    setSaved(false);
  }

  return (
    <div className="settings-page">
      <header className="settings-header">
        <div>
          <p className="settings-label">System Configuration</p>
          <h1>SmartSpot Settings</h1>
        </div>
        <div className="header-actions">
          <button type="button" className="nav-button" onClick={() => navigate("/dashboard")}>
            ← Dashboard
          </button>
          <button type="button" className="logout-button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="settings-main">
        <section className="settings-card" aria-label="System Settings Form">
          <h2>Operational Settings</h2>
          <p className="settings-desc">
            Configure system parameters for SmartSpot parking operations. Changes take effect immediately upon saving.
          </p>

          {saved && (
            <div className="success-banner" role="status">
              ✓ Settings saved successfully!
            </div>
          )}

          <form onSubmit={handleSubmit} className="settings-form" noValidate>
            {/* Supervisor Info */}
            <fieldset className="form-fieldset">
              <legend>Personnel</legend>

              <div className="form-group">
                <label htmlFor="supervisorName">Supervisor Name</label>
                <input
                  id="supervisorName"
                  type="text"
                  name="supervisorName"
                  value={form.supervisorName}
                  onChange={handleChange}
                  placeholder="e.g. Jamie Cruz"
                  autoComplete="off"
                />
                {errors.supervisorName && (
                  <p className="field-error">{errors.supervisorName}</p>
                )}
              </div>
            </fieldset>

            {/* Alert Settings */}
            <fieldset className="form-fieldset">
              <legend>Alert Configuration</legend>

              <div className="form-group">
                <label htmlFor="alertThreshold">
                  Occupancy Alert Threshold (%)
                </label>
                <input
                  id="alertThreshold"
                  type="number"
                  name="alertThreshold"
                  value={form.alertThreshold}
                  onChange={handleChange}
                  min="1"
                  max="100"
                />
                <small className="field-hint">
                  Dashboard will show an alert when occupancy exceeds this value.
                </small>
                {errors.alertThreshold && (
                  <p className="field-error">{errors.alertThreshold}</p>
                )}
              </div>

              <div className="form-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    name="notificationsEnabled"
                    checked={form.notificationsEnabled}
                    onChange={handleChange}
                  />
                  <span>Enable System Notifications</span>
                </label>
                <small className="field-hint">
                  Toggle the incident and alert feed on the dashboard.
                </small>
              </div>
            </fieldset>

            {/* System Settings */}
            <fieldset className="form-fieldset">
              <legend>System</legend>

              <div className="form-group">
                <label htmlFor="refreshInterval">
                  Data Refresh Interval (seconds)
                </label>
                <input
                  id="refreshInterval"
                  type="number"
                  name="refreshInterval"
                  value={form.refreshInterval}
                  onChange={handleChange}
                  min="5"
                  max="300"
                />
                {errors.refreshInterval && (
                  <p className="field-error">{errors.refreshInterval}</p>
                )}
              </div>

              <div className="form-group">
                <label className="toggle-label">
                  <input
                    type="checkbox"
                    name="darkMode"
                    checked={form.darkMode}
                    onChange={handleChange}
                  />
                  <span>Dark Mode (UI Preference)</span>
                </label>
              </div>
            </fieldset>

            <div className="form-actions">
              <button type="button" className="reset-button" onClick={handleReset}>
                Reset Changes
              </button>
              <button type="submit" className="save-button">
                Save Settings
              </button>
            </div>
          </form>
        </section>

        {/* Live preview panel — visible state-driven UI update */}
        <section className="preview-card" aria-label="Settings Preview">
          <h2>Live Preview</h2>
          <p className="settings-desc">Changes reflect in real time as you type.</p>
          <ul className="preview-list">
            <li>
              <span className="preview-key">Supervisor</span>
              <span className="preview-val">{form.supervisorName || "—"}</span>
            </li>
            <li>
              <span className="preview-key">Alert Threshold</span>
              <span className="preview-val">{form.alertThreshold}%</span>
            </li>
            <li>
              <span className="preview-key">Refresh Interval</span>
              <span className="preview-val">{form.refreshInterval}s</span>
            </li>
            <li>
              <span className="preview-key">Notifications</span>
              <span className={`preview-badge ${form.notificationsEnabled ? "on" : "off"}`}>
                {form.notificationsEnabled ? "Enabled" : "Disabled"}
              </span>
            </li>
            <li>
              <span className="preview-key">Dark Mode</span>
              <span className={`preview-badge ${form.darkMode ? "on" : "off"}`}>
                {form.darkMode ? "On" : "Off"}
              </span>
            </li>
          </ul>
        </section>
      </main>

      <footer className="settings-footer">
        <p>SmartSpot Monitoring Core | Secure admin session active</p>
      </footer>
    </div>
  );
}

export default SettingsPage;