import { useEffect, useMemo, useState } from "react";
import { adminDemoAccess, getLockoutRemainingMs, verifyAdminCredentials } from "../utils/auth";
import "../styles/login.css";

function AdminLogin({ onLoginSuccess }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [lockoutMs, setLockoutMs] = useState(getLockoutRemainingMs());

  useEffect(() => {
    const timerId = setInterval(() => {
      setLockoutMs(getLockoutRemainingMs());
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  const lockoutSeconds = useMemo(() => Math.ceil(lockoutMs / 1000), [lockoutMs]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (lockoutMs > 0) {
      setError(`Too many attempts. Try again in ${lockoutSeconds}s.`);
      return;
    }

    setLoading(true);
    setError("");

    const result = await verifyAdminCredentials(form.username, form.password);

    setLoading(false);

    if (!result.ok) {
      if (result.reason === "locked") {
        setError("Too many attempts. Account is temporarily locked.");
        setLockoutMs(getLockoutRemainingMs());
        return;
      }

      setError("Invalid admin credentials.");
      return;
    }

    onLoginSuccess();
  }

  return (
    <div className="login-page">
      <header className="login-header">
        <h1>SmartSpot</h1>
        <p>Mall Parking Operations Control Panel</p>
      </header>

      <main className="login-main">
        <section className="login-panel" aria-label="Admin Login Form">
          <h2>Sign In</h2>
          <p>Authorize Personel Only</p>
        

          <form onSubmit={handleSubmit} className="login-form">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="email"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder={adminDemoAccess.username}
              required
              autoComplete="username"
            />

            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder={adminDemoAccess.passwordHint}
              required
              minLength={8}
              autoComplete="current-password"
            />

            {error ? <p className="login-error">{error}</p> : null}

            <button type="submit" disabled={loading || lockoutMs > 0}>
              {loading ? "Verifying..." : "Login to Dashboard"}
            </button>
          </form>
        </section>
      </main>

      <footer className="login-footer">
        <p>SmartSpot Security: session timeout 30 minutes, lockout after 5 failed attempts.</p>
      </footer>
    </div>
  );
}

export default AdminLogin;
