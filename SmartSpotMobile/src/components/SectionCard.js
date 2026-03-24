import { StyleSheet, Text, View } from "react-native";
import { palette } from "../theme/palette";

export default function SectionCard({ title, subtitle, children }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.panel,
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: palette.border,
    gap: 14,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    color: palette.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 19,
    color: palette.textMuted,
  },
});
