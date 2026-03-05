import { useState } from "react";
import ParkingDashboard from "./pages/ParkingDashboard";
import AdminLogin from "./pages/AdminLogin";
import { clearSession, createSession, getSession } from "./utils/auth";
import { useNavigate } from "react-router-dom";

function App({ page }) {
  const navigate = useNavigate();

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
      navigate("/dashboard");
    } catch {
      setSession({ token: "fallback" });
      navigate("/dashboard");
    }
  }

  function handleLogout() {
    clearSession();
    setSession(null);
    navigate("/login");
  }

  if (!session || page === "login") {
    return <AdminLogin onLoginSuccess={handleLoginSuccess} />;
  }

  if (page === "dashboard") {
    return <ParkingDashboard onLogout={handleLogout} />;
  }

  return null;
}

export default App;
