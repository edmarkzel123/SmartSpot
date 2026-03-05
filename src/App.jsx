import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import AdminLogin from "./pages/adminlogin";
import ParkingDashboard from "./pages/ParkingDashboard";
import { clearSession, createSession, getSession } from "./utils/auth";

function App() {
  const [session, setSession] = useState(() => {
    try { return getSession(); } catch { return null; }
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

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={session ? <Navigate to="/dashboard" /> : <AdminLogin onLoginSuccess={handleLoginSuccess} />}
        />
        <Route
          path="/dashboard"
          element={session ? <ParkingDashboard onLogout={handleLogout} /> : <Navigate to="/" />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;