import { StyleSheet, Text, View } from "react-native";
import { palette } from "../theme/palette";

const toneMap = {
  stable: { backgroundColor: palette.successSoft, color: palette.success },
  online: { backgroundColor: palette.successSoft, color: palette.success },
  available: { backgroundColor: palette.successSoft, color: palette.success },
  warning: { backgroundColor: palette.warningSoft, color: palette.warning },
  occupied: { backgroundColor: palette.warningSoft, color: palette.warning },
  critical: { backgroundColor: palette.dangerSoft, color: palette.danger },
  offline: { backgroundColor: palette.dangerSoft, color: palette.danger },
  info: { backgroundColor: palette.infoSoft, color: palette.info },
  muted: { backgroundColor: palette.panelMuted, color: palette.textMuted },
};

export default function MobileStatusBadge({ label, tone = "muted" }) {
  const colors = toneMap[tone] || toneMap.muted;

  return (
    <View style={[styles.badge, { backgroundColor: colors.backgroundColor }]}>
      <Text style={[styles.label, { color: colors.color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
});
