import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const DEV_HOST = Platform.OS === "android" ? "10.0.2.2" : "127.0.0.1";
export const API_BASE = `http://${DEV_HOST}:8000/api`;

const KEYS = {
  accessToken: "smartspot_access_token",
  refreshToken: "smartspot_refresh_token",
};

export async function saveTokens(access, refresh) {
  await AsyncStorage.setItem(KEYS.accessToken, access);
  await AsyncStorage.setItem(KEYS.refreshToken, refresh);
}

export async function getAccessToken() {
  return await AsyncStorage.getItem(KEYS.accessToken);
}

export async function clearTokens() {
  await AsyncStorage.removeItem(KEYS.accessToken);
  await AsyncStorage.removeItem(KEYS.refreshToken);
}

export async function loginWithApi(username, password) {
  try {
    const res = await fetch(`${API_BASE}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const json = await res.json();

    if (!res.ok || !json.success) {
      return { ok: false, reason: "invalid" };
    }

    const { access, refresh, user } = json.data;
    await saveTokens(access, refresh);
    return { ok: true, user };

  } catch {
    return { ok: false, reason: "network" };
  }
}

export async function registerWithApi({ username, email, password, fullName }) {
  try {
    const res = await fetch(`${API_BASE}/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        email,
        password,
        full_name: fullName,
      }),
    });
    const json = await res.json();

    if (!res.ok || !json.success) {
      return { ok: false, reason: "invalid", message: json.message };
    }

    return { ok: true, user: json.data };

  } catch {
    return { ok: false, reason: "network" };
  }
}
