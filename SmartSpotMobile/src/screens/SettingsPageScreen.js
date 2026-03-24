import { useEffect, useState } from "react";
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import SectionCard from "../components/SectionCard";
import MobileStatusBadge from "../components/MobileStatusBadge";
import { palette } from "../theme/palette";

export default function SettingsPageScreen({
  navigation,
  onLogout,
  onSave,
  session,
  settings,
}) {
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
    setErrors((prev) => ({ ...prev, [field]: "" }));
  }

  function validate() {
    const nextErrors = {};
    if (!form.supervisorName.trim()) {
      nextErrors.supervisorName = "Supervisor name is required.";
    }

    const threshold = Number(form.alertThreshold);
    if (Number.isNaN(threshold) || threshold < 1 || threshold > 100) {
      nextErrors.alertThreshold = "Threshold must be between 1 and 100.";
    }

    const interval = Number(form.refreshInterval);
    if (Number.isNaN(interval) || interval < 5 || interval > 300) {
      nextErrors.refreshInterval = "Refresh interval must be between 5 and 300 seconds.";
    }

    return nextErrors;
  }

  function handleSubmit() {
    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    onSave({
      ...form,
      alertThreshold: Number(form.alertThreshold),
      refreshInterval: Number(form.refreshInterval),
    });
    setSaved(true);
  }

  function handleReset() {
    setForm(settings);
    setErrors({});
    setSaved(false);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerCard}>
          <Text style={styles.headerLabel}>SYSTEM CONFIGURATION</Text>
          <Text style={styles.headerTitle}>SettingsPage</Text>
          <Text style={styles.headerText}>
            Mobile form adaptation of the SmartSpot operational settings screen.
          </Text>
          <MobileStatusBadge
            label={session?.mode === "guest" ? "Guest Access" : "Admin Access"}
            tone="info"
          />

          <View style={styles.headerActions}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>Back to Dashboard</Text>
            </Pressable>
            <Pressable
              onPress={onLogout}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>Logout</Text>
            </Pressable>
          </View>
        </View>

        {saved ? (
          <View style={styles.successBanner}>
            <Text style={styles.successTitle}>Settings saved successfully.</Text>
            <Text style={styles.successText}>
              Dashboard values update immediately after saving.
            </Text>
          </View>
        ) : null}

        <SectionCard
          title="Operational Settings"
          subtitle="Controlled inputs adapted for touch interaction"
        >
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Supervisor Name</Text>
            <TextInput
              onChangeText={(value) => handleChange("supervisorName", value)}
              placeholder="e.g. Jamie Cruz"
              placeholderTextColor="#8C8B86"
              style={styles.input}
              value={form.supervisorName}
            />
            {errors.supervisorName ? (
              <Text style={styles.errorText}>{errors.supervisorName}</Text>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Occupancy Alert Threshold (%)</Text>
            <TextInput
              keyboardType="numeric"
              onChangeText={(value) => handleChange("alertThreshold", value)}
              style={styles.input}
              value={String(form.alertThreshold)}
            />
            <Text style={styles.helperText}>
              Dashboard shows an alert when occupancy exceeds this threshold.
            </Text>
            {errors.alertThreshold ? (
              <Text style={styles.errorText}>{errors.alertThreshold}</Text>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Data Refresh Interval (seconds)</Text>
            <TextInput
              keyboardType="numeric"
              onChangeText={(value) => handleChange("refreshInterval", value)}
              style={styles.input}
              value={String(form.refreshInterval)}
            />
            {errors.refreshInterval ? (
              <Text style={styles.errorText}>{errors.refreshInterval}</Text>
            ) : null}
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchCopy}>
              <Text style={styles.label}>Enable System Notifications</Text>
              <Text style={styles.helperText}>
                Controls the mobile alert feed on the dashboard.
              </Text>
            </View>
            <Switch
              onValueChange={(value) => handleChange("notificationsEnabled", value)}
              thumbColor="#FFFFFF"
              trackColor={{ false: "#D2C7B5", true: "#4AA596" }}
              value={form.notificationsEnabled}
            />
          </View>

          <View style={styles.switchRow}>
            <View style={styles.switchCopy}>
              <Text style={styles.label}>Dark Mode Preference</Text>
              <Text style={styles.helperText}>
                Preserved from the web system as a user preference flag.
              </Text>
            </View>
            <Switch
              onValueChange={(value) => handleChange("darkMode", value)}
              thumbColor="#FFFFFF"
              trackColor={{ false: "#D2C7B5", true: "#4AA596" }}
              value={form.darkMode}
            />
          </View>

          <View style={styles.formActions}>
            <Pressable
              onPress={handleReset}
              style={({ pressed }) => [
                styles.secondaryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.secondaryButtonText}>Reset Changes</Text>
            </Pressable>
            <Pressable
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.buttonPressed,
              ]}
            >
              <Text style={styles.primaryButtonText}>Save Settings</Text>
            </Pressable>
          </View>
        </SectionCard>

        <SectionCard
          title="Live Preview"
          subtitle="Preview reflects the form state as you edit"
        >
          <View style={styles.previewRow}>
            <Text style={styles.previewKey}>Supervisor</Text>
            <Text style={styles.previewValue}>
              {form.supervisorName || "Not set"}
            </Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewKey}>Alert Threshold</Text>
            <Text style={styles.previewValue}>{form.alertThreshold}%</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewKey}>Refresh Interval</Text>
            <Text style={styles.previewValue}>{form.refreshInterval}s</Text>
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewKey}>Notifications</Text>
            <MobileStatusBadge
              label={form.notificationsEnabled ? "Enabled" : "Disabled"}
              tone={form.notificationsEnabled ? "online" : "muted"}
            />
          </View>
          <View style={styles.previewRow}>
            <Text style={styles.previewKey}>Dark Mode</Text>
            <MobileStatusBadge
              label={form.darkMode ? "On" : "Off"}
              tone={form.darkMode ? "info" : "muted"}
            />
          </View>
        </SectionCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: palette.background,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 36,
    gap: 16,
  },
  headerCard: {
    backgroundColor: palette.panel,
    borderRadius: 30,
    padding: 20,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 12,
  },
  headerLabel: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: palette.action,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "900",
    color: palette.textPrimary,
  },
  headerText: {
    fontSize: 14,
    lineHeight: 20,
    color: palette.textMuted,
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
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
  helperText: {
    fontSize: 12,
    lineHeight: 18,
    color: palette.textMuted,
  },
  errorText: {
    fontSize: 13,
    color: palette.danger,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
    paddingVertical: 6,
  },
  switchCopy: {
    flex: 1,
    gap: 4,
  },
  formActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: palette.action,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: palette.panelMuted,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: palette.textPrimary,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
  },
  buttonPressed: {
    opacity: 0.82,
  },
  successBanner: {
    borderRadius: 24,
    backgroundColor: palette.successSoft,
    borderWidth: 1,
    borderColor: "#B8E1C5",
    padding: 16,
    gap: 4,
  },
  successTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: palette.success,
  },
  successText: {
    fontSize: 13,
    lineHeight: 18,
    color: palette.textPrimary,
  },
  previewRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  previewKey: {
    flex: 1,
    fontSize: 14,
    color: palette.textMuted,
  },
  previewValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "700",
    color: palette.textPrimary,
  },
});
