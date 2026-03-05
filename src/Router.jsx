import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import App from "./App";
import AdminLogin from "./pages/AdminLogin";
import ParkingDashboard from "./pages/ParkingDashboard";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<App page="login" />} />
        <Route path="/dashboard" element={<App page="dashboard" />} />
      </Routes>
    </BrowserRouter>
  );
}
