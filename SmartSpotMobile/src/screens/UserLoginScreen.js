/**
 * UserLoginScreen.jsx — SmartSpot Parking App
 *
 * SETUP INSTRUCTIONS:
 *   1. Install dependency:  npx expo install @react-native-async-storage/async-storage
 *   2. Replace your old screens/UserLoginScreen.jsx with this file
 *   3. Admin shortcut: email = admin@smartspot.local  |  password = SmartSpot@2026
 *
 * DESIGN LANGUAGE:
 *   Soft lavender + warm cream — inspired by modern wellness / productivity apps.
 *   Rounded pill inputs, stacked card layout, animated tab switcher.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "smartspot_accounts";

const ADMIN_CREDS = {
  email: "admin@smartspot.local",
  password: "SmartSpot@2026",
};

const COLORS = {
  bg: "#1C1B2E",           // deep indigo background
  card: "#F7F5FF",          // lavender-white card
  cardInner: "#EDEAFF",     // slightly deeper lavender surface
  accent: "#7B6EF6",        // violet accent
  accentSoft: "#EAE7FF",    // soft violet fill
  accentDark: "#5548D9",    // pressed state
  text: "#1A1830",          // near-black
  textMuted: "#7C7A9A",     // muted purple-grey
  textLight: "#B8B5D8",     // hint text
  inputBg: "#F0EEF9",       // input background
  inputBorder: "#D6D1F5",   // input border
  inputFocus: "#7B6EF6",    // focused border
  error: "#E8436A",         // error red-pink
  errorSoft: "#FDE8EE",     // error background
  success: "#35C48E",       // success green
  divider: "#E3DFF7",       // section divider
  white: "#FFFFFF",
  glow1: "#C5BBFF",         // decorative blob 1
  glow2: "#FFD9F0",         // decorative blob 2
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function validatePlate(plate) {
  if (!plate.trim()) return true; // optional
  return /^[A-Z0-9\- ]{3,10}$/i.test(plate.trim());
}

async function loadAccounts() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function saveAccounts(accounts) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FloatingBlobs() {
  return (
    <>
      <View style={blob.blob1} />
      <View style={blob.blob2} />
      <View style={blob.blob3} />
    </>
  );
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  error,
  hint,
}) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={field.wrapper}>
      <Text style={field.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textLight}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType || "default"}
        autoCapitalize={autoCapitalize || "none"}
        autoCorrect={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          field.input,
          focused && field.inputFocused,
          error && field.inputError,
        ]}
      />
      {error ? <Text style={field.errorText}>{error}</Text> : null}
      {hint && !error ? <Text style={field.hintText}>{hint}</Text> : null}
    </View>
  );
}

function PrimaryButton({ label, onPress, loading, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        btn.primary,
        (pressed || disabled) && btn.primaryPressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.white} size="small" />
      ) : (
        <Text style={btn.primaryText}>{label}</Text>
      )}
    </Pressable>
  );
}

function GhostButton({ label, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [btn.ghost, pressed && btn.ghostPressed]}
    >
      <Text style={btn.ghostText}>{label}</Text>
    </Pressable>
  );
}

// ─── Tab Indicator ────────────────────────────────────────────────────────────

function TabSwitcher({ activeTab, onSwitch }) {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: activeTab === "login" ? 0 : 1,
      duration: 240,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [activeTab]);

  const indicatorLeft = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["2%", "52%"],
  });

  return (
    <View style={tab.container}>
      <Animated.View style={[tab.indicator, { left: indicatorLeft }]} />
      <Pressable
        style={tab.btn}
        onPress={() => onSwitch("login")}
      >
        <Text style={[tab.label, activeTab === "login" && tab.labelActive]}>
          Sign In
        </Text>
      </Pressable>
      <Pressable
        style={tab.btn}
        onPress={() => onSwitch("register")}
      >
        <Text style={[tab.label, activeTab === "register" && tab.labelActive]}>
          Create Account
        </Text>
      </Pressable>
    </View>
  );
}

// ─── Login Form ───────────────────────────────────────────────────────────────

function LoginForm({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState("");

  function validate() {
    const e = {};
    if (!email.trim()) e.email = "Email is required.";
    else if (!validateEmail(email)) e.email = "Enter a valid email address.";
    if (!password) e.password = "Password is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleLogin() {
    setGlobalError("");
    if (!validate()) return;
    setLoading(true);

    // Simulate async check
    await new Promise((r) => setTimeout(r, 600));

    const normalizedEmail = email.trim().toLowerCase();

    // Admin check
    if (
      normalizedEmail === ADMIN_CREDS.email &&
      password === ADMIN_CREDS.password
    ) {
      setLoading(false);
      onLoginSuccess("admin", {
        fullName: "Parking Administrator",
        plateNumber: "Admin Access",
        email: ADMIN_CREDS.email,
      });
      return;
    }

    // Registered user check
    const accounts = await loadAccounts();
    const match = accounts.find(
      (a) =>
        a.email.toLowerCase() === normalizedEmail && a.password === password
    );

    setLoading(false);

    if (!match) {
      setGlobalError("Incorrect email or password. Please try again.");
      return;
    }

    onLoginSuccess("user", {
      fullName: match.fullName,
      plateNumber: match.plateNumber || "Not provided",
      email: match.email,
    });
  }

  return (
    <View style={styles.formBlock}>
      {globalError ? (
        <View style={styles.alertBox}>
          <Text style={styles.alertText}>{globalError}</Text>
        </View>
      ) : null}

      <InputField
        label="Email Address"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        keyboardType="email-address"
        error={errors.email}
      />
      <InputField
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Enter your password"
        secureTextEntry
        error={errors.password}
      />

      <PrimaryButton
        label="Sign In"
        onPress={handleLogin}
        loading={loading}
      />

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or</Text>
        <View style={styles.dividerLine} />
      </View>

      <GhostButton
        label="Continue as Guest"
        onPress={() =>
          onLoginSuccess("guest", {
            fullName: "Guest User",
            plateNumber: "Guest",
            email: null,
          })
        }
      />

      <View style={styles.adminHint}>
        <Text style={styles.adminHintText}>
          Admin? Use{" "}
          <Text style={styles.adminHintCode}>admin@smartspot.local</Text>
        </Text>
      </View>
    </View>
  );
}

// ─── Register Form ────────────────────────────────────────────────────────────

function RegisterForm({ onLoginSuccess }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    plateNumber: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate() {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required.";
    if (!form.email.trim()) e.email = "Email is required.";
    else if (!validateEmail(form.email)) e.email = "Enter a valid email.";
    if (!validatePlate(form.plateNumber))
      e.plateNumber = "Use format: ABC 1234 (letters and numbers only).";
    if (!form.password) e.password = "Password is required.";
    else if (form.password.length < 8)
      e.password = "Password must be at least 8 characters.";
    if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoading(true);

    await new Promise((r) => setTimeout(r, 700));

    const accounts = await loadAccounts();
    const exists = accounts.some(
      (a) => a.email.toLowerCase() === form.email.trim().toLowerCase()
    );

    if (exists) {
      setErrors((prev) => ({
        ...prev,
        email: "An account with this email already exists.",
      }));
      setLoading(false);
      return;
    }

    const newAccount = {
      id: Date.now().toString(),
      fullName: form.fullName.trim(),
      email: form.email.trim().toLowerCase(),
      plateNumber: form.plateNumber.trim().toUpperCase() || "Not provided",
      password: form.password,
      createdAt: new Date().toISOString(),
    };

    await saveAccounts([...accounts, newAccount]);
    setLoading(false);
    setSuccess(true);

    // Auto login after 1.2s
    setTimeout(() => {
      onLoginSuccess("user", {
        fullName: newAccount.fullName,
        plateNumber: newAccount.plateNumber,
        email: newAccount.email,
      });
    }, 1200);
  }

  if (success) {
    return (
      <View style={styles.successBlock}>
        <View style={styles.successIcon}>
          <Text style={styles.successIconText}>✓</Text>
        </View>
        <Text style={styles.successTitle}>Account Created!</Text>
        <Text style={styles.successSub}>Signing you in now…</Text>
      </View>
    );
  }

  return (
    <View style={styles.formBlock}>
      <InputField
        label="Full Name"
        value={form.fullName}
        onChangeText={(v) => update("fullName", v)}
        placeholder="e.g. Juan Dela Cruz"
        autoCapitalize="words"
        error={errors.fullName}
      />
      <InputField
        label="Email Address"
        value={form.email}
        onChangeText={(v) => update("email", v)}
        placeholder="you@example.com"
        keyboardType="email-address"
        error={errors.email}
      />
      <InputField
        label="Plate Number"
        value={form.plateNumber}
        onChangeText={(v) => update("plateNumber", v)}
        placeholder="e.g. ABC 1234  (optional)"
        autoCapitalize="characters"
        hint="Used to match your vehicle in the parking lot."
        error={errors.plateNumber}
      />
      <InputField
        label="Password"
        value={form.password}
        onChangeText={(v) => update("password", v)}
        placeholder="Minimum 8 characters"
        secureTextEntry
        hint="Use a mix of letters and numbers."
        error={errors.password}
      />
      <InputField
        label="Confirm Password"
        value={form.confirmPassword}
        onChangeText={(v) => update("confirmPassword", v)}
        placeholder="Re-enter your password"
        secureTextEntry
        error={errors.confirmPassword}
      />

      <PrimaryButton
        label="Create Account"
        onPress={handleRegister}
        loading={loading}
      />
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function UserLoginScreen({ onLoginSuccess }) {
  const [activeTab, setActiveTab] = useState("login");

  return (
    <SafeAreaView style={styles.safeArea}>
      <FloatingBlobs />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: "height" })}
        style={styles.flex}
        keyboardVerticalOffset={Platform.select({ ios: 0, android: 24 })}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Hero ── */}
          <View style={styles.hero}>
            <View style={styles.heroIconRing}>
              <View style={styles.heroIconDot} />
            </View>
            <Text style={styles.heroEyebrow}>SmartSpot Mobile</Text>
            <Text style={styles.heroTitle}>Find Parking,{"\n"}Instantly.</Text>
            <Text style={styles.heroSub}>
              Real-time slot availability for{"\n"}SM Mall of Asia Parking Complex
            </Text>

            {/* Live badge */}
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>128 slots open right now</Text>
            </View>
          </View>

          {/* ── Auth Card ── */}
          <View style={styles.card}>
            <TabSwitcher activeTab={activeTab} onSwitch={setActiveTab} />

            {activeTab === "login" ? (
              <LoginForm onLoginSuccess={onLoginSuccess} />
            ) : (
              <RegisterForm onLoginSuccess={onLoginSuccess} />
            )}
          </View>

          {/* ── Footer ── */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to SmartSpot's{" "}
              <Text style={styles.footerLink}>Terms of Use</Text> and{" "}
              <Text style={styles.footerLink}>Privacy Policy</Text>.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 36,
    gap: 24,
  },

  // Hero
  hero: {
    alignItems: "center",
    gap: 10,
    paddingBottom: 8,
  },
  heroIconRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: COLORS.glow1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  heroIconDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.accent,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    color: COLORS.glow1,
    textTransform: "uppercase",
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: "900",
    color: COLORS.white,
    textAlign: "center",
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  heroSub: {
    fontSize: 15,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 22,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(123, 110, 246, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(123, 110, 246, 0.35)",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 4,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.success,
  },
  liveBadgeText: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.glow1,
  },

  // Card
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 32,
    overflow: "hidden",
    paddingBottom: 8,
  },

  // Form content area
  formBlock: {
    padding: 20,
    gap: 14,
  },

  // Alert / error banner
  alertBox: {
    backgroundColor: COLORS.errorSoft,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  alertText: {
    fontSize: 14,
    color: COLORS.error,
    fontWeight: "600",
    lineHeight: 20,
  },

  // Divider
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginVertical: 2,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.divider,
  },
  dividerText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "600",
  },

  // Admin hint
  adminHint: {
    alignItems: "center",
    paddingTop: 4,
    paddingBottom: 8,
  },
  adminHintText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: "center",
    lineHeight: 18,
  },
  adminHintCode: {
    color: COLORS.accent,
    fontWeight: "700",
  },

  // Success state
  successBlock: {
    alignItems: "center",
    padding: 36,
    gap: 12,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#E5F9F1",
    alignItems: "center",
    justifyContent: "center",
  },
  successIconText: {
    fontSize: 28,
    color: COLORS.success,
    fontWeight: "900",
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.text,
  },
  successSub: {
    fontSize: 15,
    color: COLORS.textMuted,
  },

  // Footer
  footer: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 18,
  },
  footerLink: {
    color: COLORS.glow1,
    fontWeight: "600",
  },
});

// Field styles (isolated for reuse)
const field = StyleSheet.create({
  wrapper: { gap: 6 },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.text,
    marginLeft: 2,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.text,
  },
  inputFocused: {
    borderColor: COLORS.inputFocus,
    backgroundColor: COLORS.white,
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: COLORS.errorSoft,
  },
  errorText: {
    fontSize: 12,
    color: COLORS.error,
    marginLeft: 4,
    fontWeight: "600",
  },
  hintText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginLeft: 4,
    lineHeight: 17,
  },
});

// Button styles
const btn = StyleSheet.create({
  primary: {
    backgroundColor: COLORS.accent,
    borderRadius: 999,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    marginTop: 4,
  },
  primaryPressed: {
    backgroundColor: COLORS.accentDark,
    opacity: 0.9,
  },
  primaryText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  ghost: {
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
    backgroundColor: COLORS.accentSoft,
  },
  ghostPressed: { opacity: 0.75 },
  ghostText: {
    color: COLORS.accent,
    fontSize: 15,
    fontWeight: "700",
  },
});

// Tab switcher styles
const tab = StyleSheet.create({
  container: {
    flexDirection: "row",
    margin: 12,
    marginBottom: 0,
    backgroundColor: COLORS.cardInner,
    borderRadius: 20,
    padding: 4,
    position: "relative",
    height: 52,
  },
  indicator: {
    position: "absolute",
    top: 4,
    width: "46%",
    height: 44,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    shadowColor: COLORS.accent,
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 3,
  },
  btn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textMuted,
  },
  labelActive: {
    color: COLORS.accent,
  },
});

// Decorative blob styles
const blob = StyleSheet.create({
  blob1: {
    position: "absolute",
    top: -60,
    right: -50,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(197, 187, 255, 0.15)",
  },
  blob2: {
    position: "absolute",
    top: 180,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(255, 217, 240, 0.10)",
  },
  blob3: {
    position: "absolute",
    bottom: 80,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(123, 110, 246, 0.09)",
  },
});