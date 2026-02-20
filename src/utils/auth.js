const AUTH_KEYS = {
  session: "smartspot_admin_session",
  attempts: "smartspot_auth_attempts"
};

const SESSION_DURATION_MS = 30 * 60 * 1000;
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MS = 60 * 1000;

const ADMIN_ACCOUNTS = [
  {
    username: "admin@smartspot.local",
    passwordHash: "f7a4046dcdab6f402cde99c60706ffbba69dfcb57f53f76d2bde60b03f21ce38",
    role: "Super Admin"
  }
];

function safeJsonParse(value, fallback) {
  try {
    const parsed = JSON.parse(value);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function safeGetStorage(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSetStorage(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage failures so UI can still render.
  }
}

function safeRemoveStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch {
    // Ignore storage failures so UI can still render.
  }
}

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256(value) {
  if (!globalThis.crypto?.subtle) {
    return "";
  }

  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return toHex(digest);
}

function getAttempts() {
  const raw = safeGetStorage(AUTH_KEYS.attempts);
  const parsed = safeJsonParse(raw, { count: 0, lockedUntil: 0 });
  if (!parsed || typeof parsed !== "object") {
    return { count: 0, lockedUntil: 0 };
  }

  return {
    count: Number.isFinite(parsed.count) ? parsed.count : 0,
    lockedUntil: Number.isFinite(parsed.lockedUntil) ? parsed.lockedUntil : 0
  };
}

function saveAttempts(next) {
  safeSetStorage(AUTH_KEYS.attempts, JSON.stringify(next));
}

export function getLockoutRemainingMs() {
  const attempts = getAttempts();
  const remaining = attempts.lockedUntil - Date.now();
  return Math.max(0, remaining);
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

export async function verifyAdminCredentials(username, password) {
  if (getLockoutRemainingMs() > 0) {
    return { ok: false, reason: "locked" };
  }

  const normalizedUsername = username.trim().toLowerCase();
  const passwordHash = await sha256(password);

  const account = ADMIN_ACCOUNTS.find(
    (item) => item.username.toLowerCase() === normalizedUsername
  );

  const isValid = Boolean(account) && passwordHash === account.passwordHash;

  if (!isValid) {
    registerFailedAttempt();
    return { ok: false, reason: "invalid" };
  }

  clearAttempts();
  return { ok: true };
}

function createToken() {
  if (globalThis.crypto?.randomUUID) {
    return crypto.randomUUID();
  }

  return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function createSession() {
  const session = {
    token: createToken(),
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_DURATION_MS
  };

  safeSetStorage(AUTH_KEYS.session, JSON.stringify(session));
  return session;
}

export function getSession() {
  const raw = safeGetStorage(AUTH_KEYS.session);
  const session = safeJsonParse(raw, null);

  if (!session || !session.expiresAt) {
    return null;
  }

  if (Date.now() >= session.expiresAt) {
    clearSession();
    return null;
  }

  return session;
}

export function clearSession() {
  safeRemoveStorage(AUTH_KEYS.session);
}

export const adminDemoAccess = {
  username: ADMIN_ACCOUNTS[0].username,
  passwordHint: "Enter your secure admin password",
  demoPassword: "SmartSpot@2026"
};

export const adminAccounts = ADMIN_ACCOUNTS.map((item) => ({
  username: item.username,
  role: item.role
}));
