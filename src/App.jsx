import { useState } from "react";
import ParkingDashboard from "./pages/ParkingDashboard";
import AdminLogin from "./pages/AdminLogin";
import { clearSession, createSession, getSession } from "./utils/auth";

function App() {
  const [session, setSession] = useState(() => {
    try {
      return getSession();
    } catch {
      return null;
    }
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

  if (!session) {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  return <ParkingDashboard onLogout={handleLogout} />;
}

export default App;
