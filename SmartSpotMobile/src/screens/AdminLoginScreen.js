import { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { palette } from "../theme/palette";

const demoAccess = {
  username: "admin@smartspot.local",
  password: "SmartSpot@2026",
};

export default function AdminLoginScreen({ navigation, onLoginSuccess }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timerId = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  const lockoutMs = Math.max(0, lockedUntil - currentTime);
  const lockoutSeconds = useMemo(() => Math.ceil(lockoutMs / 1000), [lockoutMs]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit() {
    if (lockoutMs > 0) {
      setError(`Too many attempts. Try again in ${lockoutSeconds}s.`);
      return;
    }

    setLoading(true);
    setError("");

    await new Promise((resolve) => setTimeout(resolve, 600));

    const valid =
      form.username.trim().toLowerCase() === demoAccess.username &&
      form.password === demoAccess.password;

    if (!valid) {
      const nextAttempts = attemptCount + 1;
      setAttemptCount(nextAttempts);
      setLoading(false);

      if (nextAttempts >= 5) {
        setAttemptCount(0);
        setLockedUntil(Date.now() + 60000);
        setError("Too many attempts. Account is temporarily locked.");
        return;
      }

      setError("Invalid admin credentials.");
      return;
    }

    setAttemptCount(0);
    setLoading(false);
    onLoginSuccess("admin", {
      fullName: "Parking Administrator",
      plateNumber: "Admin Access",
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: "padding", android: undefined })}
        style={styles.container}
      >
        <View style={styles.brandBlock}>
          <Text style={styles.brandLabel}>MALL PARKING OPERATIONS CONTROL PANEL</Text>
          <Text style={styles.brandTitle}>SmartSpot</Text>
          <Text style={styles.brandCopy}>
            Separate admin login for supervisors and control room personnel.
          </Text>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>AdminLogin</Text>
          <Text style={styles.panelCopy}>
            This screen is only for administrators. Users and guests should use the
            user login screen.
          </Text>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={(value) => handleChange("username", value)}
              placeholder={demoAccess.username}
              placeholderTextColor="#8C8B86"
              style={styles.input}
              value={form.username}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              onChangeText={(value) => handleChange("password", value)}
              placeholder="Enter your secure admin password"
              placeholderTextColor="#8C8B86"
              secureTextEntry
              style={styles.input}
              value={form.password}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable
            disabled={loading || lockoutMs > 0}
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.loginButton,
              (pressed || loading || lockoutMs > 0) && styles.loginButtonPressed,
            ]}
          >
            <Text style={styles.loginButtonText}>
              {loading ? "Verifying..." : "Login to Dashboard"}
            </Text>
          </Pressable>

          <View style={styles.demoCard}>
            <Text style={styles.demoTitle}>Demo Access</Text>
            <Text style={styles.demoText}>Username: {demoAccess.username}</Text>
            <Text style={styles.demoText}>Password: {demoAccess.password}</Text>
          </View>

          <Pressable
            onPress={() => navigation.navigate("UserLogin")}
            style={({ pressed }) => [
              styles.backButton,
              pressed && styles.loginButtonPressed,
            ]}
          >
            <Text style={styles.backButtonText}>Back to User Login</Text>
          </Pressable>

          <Text style={styles.footerText}>
            Session timeout 30 minutes, lockout after 5 failed attempts.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 24,
    gap: 22,
  },
  brandBlock: {
    gap: 8,
  },
  brandLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.3,
    color: palette.action,
  },
  brandTitle: {
    fontSize: 40,
    fontWeight: "900",
    color: palette.textPrimary,
  },
  brandCopy: {
    fontSize: 15,
    lineHeight: 22,
    color: palette.textMuted,
    maxWidth: 320,
  },
  panel: {
    backgroundColor: palette.panel,
    borderRadius: 30,
    padding: 22,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 16,
    shadowColor: palette.shadow,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 24,
    elevation: 3,
  },
  panelTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: palette.textPrimary,
  },
  panelCopy: {
    fontSize: 14,
    color: palette.textMuted,
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: palette.textPrimary,
  },
  input: {
    borderWidth: 1,
    borderColor: palette.border,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 15,
    fontSize: 16,
    backgroundColor: "#FFFBF6",
    color: palette.textPrimary,
  },
  errorText: {
    fontSize: 14,
    color: palette.danger,
    lineHeight: 20,
  },
  loginButton: {
    backgroundColor: palette.action,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
  },
  loginButtonPressed: {
    opacity: 0.82,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
  },
  backButton: {
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: "center",
    backgroundColor: palette.panelMuted,
  },
  backButtonText: {
    color: palette.textPrimary,
    fontSize: 15,
    fontWeight: "800",
  },
  demoCard: {
    borderRadius: 20,
    backgroundColor: palette.panelMuted,
    padding: 16,
    gap: 4,
  },
  demoTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: palette.textPrimary,
  },
  demoText: {
    fontSize: 13,
    color: palette.textMuted,
  },
  footerText: {
    fontSize: 12,
    lineHeight: 18,
    color: palette.textMuted,
  },
});
