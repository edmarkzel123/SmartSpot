const AUTH_KEYS = {
  session: "smartspot_admin_session",
  attempts: "smartspot_auth_attempts",
  accessToken: "smartspot_access_token",
  refreshToken: "smartspot_refresh_token",
};

const SESSION_DURATION_MS = 30 * 60 * 1000;
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MS = 60 * 1000;

export const API_BASE = "http://127.0.0.1:8000/api";

// ── Storage helpers ──────────────────────────────────────────────────────────
function safeJsonParse(value, fallback) {
  try { return JSON.parse(value) ?? fallback; } catch { return fallback; }
}
function safeGetStorage(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function safeSetStorage(key, value) {
  try { localStorage.setItem(key, value); } catch {
    // Storage can be unavailable in private browsing or locked-down previews.
  }
}
function safeRemoveStorage(key) {
  try { localStorage.removeItem(key); } catch {
    // Clearing storage is best-effort for the same browser restrictions.
  }
}

// ── Lockout logic ────────────────────────────────────────────────────────────
function getAttempts() {
  const raw = safeGetStorage(AUTH_KEYS.attempts);
  const parsed = safeJsonParse(raw, { count: 0, lockedUntil: 0 });
  return {
    count: Number.isFinite(parsed.count) ? parsed.count : 0,
    lockedUntil: Number.isFinite(parsed.lockedUntil) ? parsed.lockedUntil : 0,
  };
}
function saveAttempts(next) {
  safeSetStorage(AUTH_KEYS.attempts, JSON.stringify(next));
}
export function getLockoutRemainingMs() {
  return Math.max(0, getAttempts().lockedUntil - Date.now());
}
function registerFailedAttempt() {
  const attempts = getAttempts();
  const nextCount = attempts.count + 1;
  if (nextCount >= LOCKOUT_THRESHOLD) {
    saveAttempts({ count: 0, lockedUntil: Date.now() + LOCKOUT_DURATION_MS });
    return;
  }
  saveAttempts({ count: nextCount, lockedUntil: 0 });
}
function clearAttempts() {
  saveAttempts({ count: 0, lockedUntil: 0 });
}

// ── JWT Token helpers ────────────────────────────────────────────────────────
export function saveTokens(access, refresh) {
  safeSetStorage(AUTH_KEYS.accessToken, access);
  safeSetStorage(AUTH_KEYS.refreshToken, refresh);
}
export function getAccessToken() {
  return safeGetStorage(AUTH_KEYS.accessToken);
}
export function clearTokens() {
  safeRemoveStorage(AUTH_KEYS.accessToken);
  safeRemoveStorage(AUTH_KEYS.refreshToken);
}

// ── Login via Django JWT API ─────────────────────────────────────────────────
export async function verifyAdminCredentials(username, password) {
  if (getLockoutRemainingMs() > 0) {
    return { ok: false, reason: "locked" };
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      registerFailedAttempt();
      return { ok: false, reason: "invalid" };
    }

    const { access, refresh } = json.data;
    saveTokens(access, refresh);
    clearAttempts();
    return { ok: true };

  } catch {
    return { ok: false, reason: "network" };
  }
}

// ── Session ──────────────────────────────────────────────────────────────────
function createToken() {
  return globalThis.crypto?.randomUUID?.() ?? `session-${Date.now()}`;
}
export function createSession() {
  const session = {
    token: createToken(),
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };
  safeSetStorage(AUTH_KEYS.session, JSON.stringify(session));
  return session;
}
export function getSession() {
  const raw = safeGetStorage(AUTH_KEYS.session);
  const session = safeJsonParse(raw, null);
  if (!session?.expiresAt) return null;
  if (Date.now() >= session.expiresAt) { clearSession(); return null; }
  return session;
}
export function clearSession() {
  safeRemoveStorage(AUTH_KEYS.session);
  clearTokens();
}

export const adminDemoAccess = {
  username: "admin@smartspot.local",
  passwordHint: "Enter your secure admin password",
};
