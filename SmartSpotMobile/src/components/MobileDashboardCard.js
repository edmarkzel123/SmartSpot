import { StyleSheet, Text, View } from "react-native";
import MobileStatusBadge from "./MobileStatusBadge";
import { palette } from "../theme/palette";

export default function MobileDashboardCard({ title, value, subtitle, status }) {
  const tone = status ? status.toLowerCase() : "muted";

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.value}>{value}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {status ? <MobileStatusBadge label={status} tone={tone} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.panel,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 10,
    shadowColor: palette.shadow,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 22,
    elevation: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: palette.textMuted,
  },
  value: {
    fontSize: 28,
    fontWeight: "800",
    color: palette.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: palette.textMuted,
  },
});
