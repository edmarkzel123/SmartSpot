import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import AdminLogin from "./pages/adminlogin";
import ParkingDashboard from "./pages/ParkingDashboard";
import SettingsPage from "./pages/SettingsPage";
import { clearSession, createSession, getSession } from "./utils/auth";

function App() {
  const [session, setSession] = useState(() => {
    try { return getSession(); } catch { return null; }
  });

  // Global app settings state — shared across pages
  const [settings, setSettings] = useState({
    supervisorName: "Edmarkzel",
    alertThreshold: 85,
    refreshInterval: 30,
    notificationsEnabled: true,
    darkMode: false,
  });

  function handleLoginSuccess() {
    try {
      const nextSession = createSession();
      setSession(nextSession);
    } catch {
      setSession({ token: "fallback" });
    }
  }

  function handleLogout() {
    clearSession();
    setSession(null);
  }

  function handleSettingsSave(updatedSettings) {
    setSettings(updatedSettings);
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={session ? <Navigate to="/dashboard" /> : <AdminLogin onLoginSuccess={handleLoginSuccess} />}
        />
        <Route
          path="/dashboard"
          element={session ? <ParkingDashboard onLogout={handleLogout} settings={settings} /> : <Navigate to="/" />}
        />
        <Route
          path="/settings"
          element={session ? <SettingsPage onLogout={handleLogout} settings={settings} onSave={handleSettingsSave} /> : <Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;