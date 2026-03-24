/**
 * ParkingDashboardScreen.jsx — SmartSpot Parking App
 *
 * Navigation: Bottom tab bar — content split across clean separate pages.
 *
 * ADMIN TABS:  Home | Slots | Sensors | Alerts
 * USER TABS:   Home | Areas | Guidance | History
 *
 * No external nav library needed — fully self-contained.
 * Drop-in replacement. All props unchanged.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  activityHistory,
  entranceDisplay,
  metrics,
  notifications,
  parkingData,
  parkingGuidanceAreas,
  sensorStatus,
  slotStatus,
} from "../data/parkingData";

// ─── Design tokens ──────────────────────────────────────────────────────────

const C = {
  bg: "#1C1B2E",
  card: "#F7F5FF",
  cardInner: "#EDEAFF",
  cardBorder: "#DDD8FA",
  accent: "#7B6EF6",
  accentSoft: "#EAE7FF",
  accentDark: "#5548D9",
  teal: "#2DD4BF",
  tealSoft: "#E6FAF8",
  tealDark: "#0D9488",
  amber: "#F59E0B",
  amberSoft: "#FEF3C7",
  danger: "#E8436A",
  dangerSoft: "#FDE8EE",
  success: "#35C48E",
  successSoft: "#E6FAF1",
  text: "#1A1830",
  textMuted: "#7C7A9A",
  textLight: "#B8B5D8",
  divider: "#E8E4F8",
  white: "#FFFFFF",
  adminCard: "#11172B",
  adminCardBorder: "rgba(123,110,246,0.3)",
  adminText: "#E8E5FF",
  adminMuted: "#9B96CC",
  adminAccent: "#A89BFF",
  tabBar: "#13122A",
  tabBarBorder: "rgba(123,110,246,0.2)",
};

// ─── Reusable micro-components ───────────────────────────────────────────────

function Pill({ label, tone = "default" }) {
  const map = {
    online: { bg: C.successSoft, text: C.tealDark },
    available: { bg: C.successSoft, text: C.tealDark },
    occupied: { bg: C.dangerSoft, text: C.danger },
    warning: { bg: C.amberSoft, text: "#92400E" },
    offline: { bg: C.dangerSoft, text: C.danger },
    critical: { bg: C.dangerSoft, text: C.danger },
    stable: { bg: C.successSoft, text: C.tealDark },
    info: { bg: C.accentSoft, text: C.accentDark },
    default: { bg: C.cardInner, text: C.textMuted },
  };
  const s = map[tone.toLowerCase()] || map.default;
  return (
    <View style={[pl.wrap, { backgroundColor: s.bg }]}>
      <Text style={[pl.text, { color: s.text }]}>{label}</Text>
    </View>
  );
}
const pl = StyleSheet.create({
  wrap: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, alignSelf: "flex-start" },
  text: { fontSize: 12, fontWeight: "700" },
});

function Card({ title, subtitle, children, dark, style }) {
  return (
    <View style={[cd.card, dark && cd.dark, style]}>
      {title ? (
        <View style={cd.header}>
          <Text style={[cd.title, dark && cd.titleDark]}>{title}</Text>
          {subtitle ? <Text style={[cd.sub, dark && cd.subDark]}>{subtitle}</Text> : null}
        </View>
      ) : null}
      {children}
    </View>
  );
}
const cd = StyleSheet.create({
  card: { backgroundColor: C.card, borderRadius: 28, padding: 20, gap: 14, borderWidth: 1, borderColor: C.cardBorder },
  dark: { backgroundColor: C.adminCard, borderColor: C.adminCardBorder },
  header: { gap: 3 },
  title: { fontSize: 17, fontWeight: "800", color: C.text, letterSpacing: -0.2 },
  titleDark: { color: C.adminText },
  sub: { fontSize: 13, color: C.textMuted },
  subDark: { color: C.adminMuted },
});

function Row({ label, value, dark }) {
  return (
    <View style={rw.wrap}>
      <Text style={[rw.label, dark && rw.labelDark]}>{label}</Text>
      <Text style={[rw.value, dark && rw.valueDark]}>{value}</Text>
    </View>
  );
}
const rw = StyleSheet.create({
  wrap: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: C.divider },
  label: { fontSize: 14, color: C.textMuted, flex: 1 },
  labelDark: { color: C.adminMuted },
  value: { fontSize: 14, fontWeight: "700", color: C.text, textAlign: "right" },
  valueDark: { color: C.adminText },
});

function FadeIn({ delay = 0, children }) {
  const op = useRef(new Animated.Value(0)).current;
  const ty = useRef(new Animated.Value(14)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(op, { toValue: 1, duration: 340, delay, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(ty, { toValue: 0, duration: 340, delay, easing: Easing.out(Easing.quad), useNativeDriver: true }),
    ]).start();
  }, []);
  return <Animated.View style={{ opacity: op, transform: [{ translateY: ty }] }}>{children}</Animated.View>;
}

function ActionBtn({ label, onPress, variant = "primary" }) {
  const styles = {
    primary: { bg: C.accent, text: C.white },
    ghost: { bg: C.accentSoft, text: C.accent },
    adminGhost: { bg: "rgba(168,155,255,0.15)", text: C.adminAccent },
    adminPrimary: { bg: C.accent, text: C.white },
    teal: { bg: C.tealSoft, text: C.tealDark },
  }[variant] || { bg: C.accent, text: C.white };
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [ab.btn, { backgroundColor: styles.bg }, pressed && { opacity: 0.8 }]}>
      <Text style={[ab.text, { color: styles.text }]}>{label}</Text>
    </Pressable>
  );
}
const ab = StyleSheet.create({
  btn: { flex: 1, borderRadius: 999, paddingVertical: 14, alignItems: "center" },
  text: { fontSize: 15, fontWeight: "700" },
});

function FilterChips({ options, active, onChange }) {
  return (
    <View style={fc.row}>
      {options.map((o) => (
        <Pressable key={o} onPress={() => onChange(o)} style={[fc.chip, active === o && fc.active]}>
          <Text style={[fc.text, active === o && fc.textActive]}>{o}</Text>
        </Pressable>
      ))}
    </View>
  );
}
const fc = StyleSheet.create({
  row: { flexDirection: "row", gap: 8 },
  chip: { flex: 1, borderRadius: 999, paddingVertical: 10, alignItems: "center", backgroundColor: C.cardInner, borderWidth: 1, borderColor: C.cardBorder },
  active: { backgroundColor: C.accent, borderColor: C.accentDark },
  text: { fontSize: 13, fontWeight: "700", color: C.textMuted },
  textActive: { color: C.white },
});

function MiniStatRow({ stats }) {
  return (
    <View style={ms.row}>
      {stats.map((s, i) => (
        <View key={i} style={[ms.chip, { backgroundColor: s.bg, borderColor: s.border }]}>
          <Text style={[ms.num, { color: s.color }]}>{s.value}</Text>
          <Text style={[ms.label, { color: s.color }]}>{s.label}</Text>
        </View>
      ))}
    </View>
  );
}
const ms = StyleSheet.create({
  row: { flexDirection: "row", gap: 10 },
  chip: { flex: 1, borderRadius: 22, padding: 14, alignItems: "center", gap: 3, borderWidth: 1 },
  num: { fontSize: 26, fontWeight: "900", letterSpacing: -0.5 },
  label: { fontSize: 11, fontWeight: "700" },
});

// ─── Tab Bar ─────────────────────────────────────────────────────────────────

const ADMIN_TABS = [
  { key: "home",    icon: "⌂",  label: "Home"    },
  { key: "slots",   icon: "P",  label: "Slots"   },
  { key: "sensors", icon: "◉",  label: "Sensors" },
  { key: "alerts",  icon: "🔔", label: "Alerts"  },
];

const USER_TABS = [
  { key: "home",     icon: "⌂", label: "Home"     },
  { key: "areas",    icon: "P", label: "Areas"    },
  { key: "guidance", icon: "→", label: "Guidance" },
  { key: "history",  icon: "◷", label: "History"  },
];

function TabBar({ tabs, active, onPress }) {
  return (
    <View style={tbar.bar}>
      {tabs.map((tab) => {
        const isActive = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            onPress={() => onPress(tab.key)}
            style={({ pressed }) => [tbar.tab, pressed && { opacity: 0.6 }]}
          >
            {isActive && <View style={tbar.indicator} />}
            <Text style={[tbar.icon, isActive && tbar.iconActive]}>{tab.icon}</Text>
            <Text style={[tbar.label, isActive && tbar.labelActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
const tbar = StyleSheet.create({
  bar: { flexDirection: "row", backgroundColor: C.tabBar, borderTopWidth: 1, borderTopColor: C.tabBarBorder, paddingBottom: 10, paddingTop: 10 },
  tab: { flex: 1, alignItems: "center", gap: 3, position: "relative" },
  indicator: { position: "absolute", top: -10, width: 28, height: 3, borderRadius: 999, backgroundColor: C.accent },
  icon: { fontSize: 18, color: C.adminMuted },
  iconActive: { color: C.accent },
  label: { fontSize: 10, fontWeight: "600", color: C.adminMuted, letterSpacing: 0.3 },
  labelActive: { color: C.accent },
});

// ═══════════════════════════════════════════
// ADMIN PAGES
// ═══════════════════════════════════════════

function AdminHome({ session, settings, onLogout, navigation, liveTime, occupancyRate }) {
  const name = session?.profile?.fullName || "Admin";
  return (
    <ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>

      {/* Hero */}
      <FadeIn delay={0}>
        <View style={s.adminHero}>
          <View style={s.glow1} />
          <View style={s.glow2} />
          <View style={s.heroTop}>
            <View>
              <Text style={s.adminEyebrow}>ADMIN COMMAND CENTER</Text>
              <Text style={s.adminTitle}>Parking{"\n"}Dashboard</Text>
            </View>
            <Pill label="Admin" tone="info" />
          </View>
          <Text style={s.adminWelcome}>Good to see you, {name}</Text>
          <Text style={s.adminMeta}>{parkingData.mallName} · {liveTime.toLocaleTimeString()}</Text>

          <View style={s.adminStatRow}>
            {[
              { value: `${occupancyRate}%`, label: "Occupied" },
              { value: parkingData.availableSlots, label: "Available" },
              { value: parkingData.dailyEntries, label: "Today" },
            ].map((st) => (
              <View key={st.label} style={s.adminStatChip}>
                <Text style={s.adminStatNum}>{st.value}</Text>
                <Text style={s.adminStatLabel}>{st.label}</Text>
              </View>
            ))}
          </View>

          <Text style={s.adminRefresh}>
            Supervisor: {settings?.supervisorName || "Jamie Cruz"} · Refresh: {settings?.refreshInterval || 30}s
          </Text>
          <View style={s.btnRow}>
            <ActionBtn label="Settings" variant="adminGhost" onPress={() => navigation?.navigate("SettingsPage")} />
            <ActionBtn label="Logout" variant="adminPrimary" onPress={onLogout} />
          </View>
        </View>
      </FadeIn>

      {/* Alert */}
      {occupancyRate >= (settings?.alertThreshold || 85) ? (
        <FadeIn delay={50}>
          <View style={s.alertBanner}>
            <View style={s.alertDot} />
            <View style={{ flex: 1 }}>
              <Text style={s.alertTitle}>Occupancy Alert</Text>
              <Text style={s.alertBody}>{occupancyRate}% exceeds threshold of {settings?.alertThreshold || 85}%.</Text>
            </View>
          </View>
        </FadeIn>
      ) : null}

      {/* Metrics */}
      <FadeIn delay={80}>
        <View style={s.metricsGrid}>
          {metrics.slice(0, 4).map((m) => (
            <View key={m.id} style={s.metricTile}>
              <Text style={s.metricVal}>{m.value}</Text>
              <Text style={s.metricTitle}>{m.title}</Text>
              {m.subtitle ? <Text style={s.metricSub}>{m.subtitle}</Text> : null}
            </View>
          ))}
        </View>
      </FadeIn>

      {/* Operations */}
      <FadeIn delay={100}>
        <Card title="Operations Summary" subtitle="Live operational snapshot" dark>
          <Row label="Current occupancy" value={`${occupancyRate}%`} dark />
          <Row label="Daily entries" value={`${parkingData.dailyEntries}`} dark />
          <Row label="Levels covered" value={`${parkingData.levelsCovered}`} dark />
          <Row label="Predicted peak" value={`${parkingData.predictedPeakOccupancy}`} dark />
          <Text style={s.snapshot}>Snapshot: {parkingData.lastUpdated}</Text>
        </Card>
      </FadeIn>
    </ScrollView>
  );
}

function AdminSlots() {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? slotStatus : slotStatus.filter((s) => s.status === filter);
  const avail = slotStatus.filter((s) => s.status === "Available").length;
  const occ = slotStatus.filter((s) => s.status === "Occupied").length;

  return (
    <ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
      <FadeIn delay={0}>
        <MiniStatRow stats={[
          { value: avail, label: "Available", bg: C.successSoft, border: "#A7F3D0", color: C.tealDark },
          { value: occ, label: "Occupied", bg: C.dangerSoft, border: "#FCA5A5", color: C.danger },
          { value: slotStatus.length, label: "Total", bg: C.accentSoft, border: C.cardBorder, color: C.accent },
        ]} />
      </FadeIn>

      <FadeIn delay={60}>
        <Card title="Live Slot Availability" subtitle="Detailed vehicle and slot monitoring">
          <FilterChips options={["All", "Available", "Occupied"]} active={filter} onChange={setFilter} />
          {filtered.map((slot) => (
            <View key={slot.slotId} style={s.listItem}>
              <View style={[s.dot, { backgroundColor: slot.status === "Occupied" ? C.danger : C.success }]} />
              <View style={s.listBody}>
                <Text style={s.listTitle}>{slot.slotId}</Text>
                <Text style={s.listSub}>{slot.level} · {slot.plateNumber}</Text>
              </View>
              <Pill label={slot.status} tone={slot.status.toLowerCase()} />
            </View>
          ))}
        </Card>
      </FadeIn>
    </ScrollView>
  );
}

function AdminSensors() {
  const [showDetails, setShowDetails] = useState(false);
  const summary = useMemo(() => ({
    online: sensorStatus.filter((s) => s.health === "Online").length,
    warning: sensorStatus.filter((s) => s.health === "Warning").length,
    offline: sensorStatus.filter((s) => s.health === "Offline").length,
  }), []);
  const health = summary.offline > 0 ? "critical" : summary.warning > 0 ? "warning" : "stable";

  return (
    <ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
      <FadeIn delay={0}>
        <MiniStatRow stats={[
          { value: summary.online, label: "Online", bg: C.successSoft, border: "#A7F3D0", color: C.tealDark },
          { value: summary.warning, label: "Warning", bg: C.amberSoft, border: "#FDE68A", color: "#92400E" },
          { value: summary.offline, label: "Offline", bg: C.dangerSoft, border: "#FCA5A5", color: C.danger },
        ]} />
      </FadeIn>

      <FadeIn delay={60}>
        <Card title="Sensor Health" subtitle="Device and zone status">
          <Pressable
            onPress={() => setShowDetails((p) => !p)}
            style={({ pressed }) => [s.expandBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={s.expandText}>{showDetails ? "Hide Summary" : "View Summary"}</Text>
          </Pressable>

          {showDetails ? (
            <View style={s.detailBox}>
              <Row label="Overall status" value={health} />
              <Row label="Sensors at risk" value={`${summary.warning}`} />
              <Row label="Offline sensors" value={`${summary.offline}`} />
            </View>
          ) : null}

          {sensorStatus.map((sensor) => (
            <View key={sensor.id} style={s.listItem}>
              <View style={s.listBody}>
                <Text style={s.listTitle}>{sensor.id}</Text>
                <Text style={s.listSub}>{sensor.zone}</Text>
              </View>
              <View style={s.listRight}>
                <Pill label={sensor.health} tone={{ Online: "online", Warning: "warning", Offline: "offline" }[sensor.health] || "default"} />
                <Text style={s.latency}>{sensor.latencyMs ? `${sensor.latencyMs} ms` : "No signal"}</Text>
              </View>
            </View>
          ))}
        </Card>
      </FadeIn>
    </ScrollView>
  );
}

function AdminAlerts({ settings }) {
  const [dismissedIds, setDismissedIds] = useState([]);
  const active = notifications.filter((n) => !dismissedIds.includes(n.id));

  return (
    <ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
      <FadeIn delay={0}>
        {settings?.notificationsEnabled ? (
          <Card title="Incident & Alert Feed" subtitle="Operational alerts for admin review">
            {active.length === 0 ? (
              <View style={s.empty}>
                <Text style={s.emptyText}>All clear — no active alerts.</Text>
              </View>
            ) : (
              active.map((item) => (
                <View key={item.id} style={s.notifCard}>
                  <Pill label={item.type} tone={item.type} />
                  <Text style={s.notifText}>{item.message}</Text>
                  <Pressable
                    onPress={() => setDismissedIds((p) => [...p, item.id])}
                    style={({ pressed }) => [s.dismissBtn, pressed && { opacity: 0.7 }]}
                  >
                    <Text style={s.dismissText}>Dismiss</Text>
                  </Pressable>
                </View>
              ))
            )}
          </Card>
        ) : (
          <Card title="Alert Feed" subtitle="Notifications are disabled">
            <View style={s.empty}>
              <Text style={s.emptyText}>Enable notifications in Settings to view the live alert feed.</Text>
            </View>
          </Card>
        )}
      </FadeIn>

      <FadeIn delay={80}>
        <Card title="Activity History" subtitle="Recent system updates">
          {activityHistory.map((e) => (
            <View key={e.id} style={s.histItem}>
              <View style={s.histTime}><Text style={s.histTimeText}>{e.time}</Text></View>
              <View style={s.histBody}><Text style={s.histMsg}>{e.message}</Text></View>
            </View>
          ))}
        </Card>
      </FadeIn>
    </ScrollView>
  );
}

// ═══════════════════════════════════════════
// USER PAGES
// ═══════════════════════════════════════════

function UserHome({ session, onLogout, liveTime, occupancyRate }) {
  const name = session?.profile?.fullName || "Guest User";
  const isGuest = session?.mode === "guest";
  const rec = parkingGuidanceAreas.find((a) => a.availableSlots > 0) || parkingGuidanceAreas[0];
  const hint = parkingData.availableSlots >= 100 ? "Plenty of spots available now." : "Parking is getting tighter.";

  return (
    <ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
      <FadeIn delay={0}>
        <View style={s.userHero}>
          <View style={s.heroTop}>
            <View>
              <Text style={s.userEyebrow}>SMARTSPOT</Text>
              <Text style={s.userHeroTitle}>Find Parking{"\n"}Faster</Text>
            </View>
            <Pill label={isGuest ? "Guest" : "User"} tone="info" />
          </View>
          <Text style={s.userWelcome}>Hello, {name} 👋</Text>
          <Text style={s.userHint}>{hint}</Text>

          <View style={s.availBlock}>
            <View style={s.availLeft}>
              <Text style={s.availNum}>{parkingData.availableSlots}</Text>
              <Text style={s.availLabel}>slots open now</Text>
              <Text style={s.availSub}>Best: {rec.label} · {rec.availableSlots} spaces</Text>
            </View>
            <View style={s.ring}>
              <Text style={s.ringNum}>{occupancyRate}%</Text>
              <Text style={s.ringLabel}>full</Text>
            </View>
          </View>

          <View style={s.btnRow}>
            <ActionBtn label="Refresh" variant="ghost" onPress={() => {}} />
            <ActionBtn label="Logout" variant="primary" onPress={onLogout} />
          </View>
        </View>
      </FadeIn>

      <FadeIn delay={60}>
        <View style={s.quickBar}>
          {[
            { label: "Vehicle", value: session?.profile?.plateNumber || "—" },
            { label: "Levels", value: `${parkingData.levelsCovered}` },
            { label: "Updated", value: liveTime.toLocaleTimeString() },
          ].map((item, i, arr) => (
            <View key={item.label} style={s.quickGroup}>
              <View style={s.quickItem}>
                <Text style={s.quickLabel}>{item.label}</Text>
                <Text style={s.quickValue}>{item.value}</Text>
              </View>
              {i < arr.length - 1 ? <View style={s.quickDivider} /> : null}
            </View>
          ))}
        </View>
      </FadeIn>

      <FadeIn delay={80}>
        <View style={s.entranceCard}>
          <Text style={s.entranceEyebrow}>ENTRANCE DISPLAY</Text>
          <Text style={s.entrancePrimary}>{entranceDisplay.primaryMessage}</Text>
          <Text style={s.entranceSub}>{entranceDisplay.secondaryMessage}</Text>
        </View>
      </FadeIn>
    </ScrollView>
  );
}

function UserAreas({ occupancyRate }) {
  return (
    <ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
      <FadeIn delay={0}>
        <MiniStatRow stats={[
          { value: parkingData.availableSlots, label: "Open", bg: "#1A2A1A", border: "#2D6A4F", color: "#6EE7B7" },
          { value: parkingData.occupiedSlots, label: "Taken", bg: C.dangerSoft, border: "#FCA5A5", color: C.danger },
          { value: `${occupancyRate}%`, label: "Full", bg: C.accentSoft, border: C.cardBorder, color: C.accent },
        ]} />
      </FadeIn>

      <FadeIn delay={60}>
        <Card title="Parking Areas" subtitle="Availability by zone right now">
          <View style={s.guidanceGrid}>
            {parkingGuidanceAreas.map((area) => {
              const isOpen = area.status === "Open";
              const isLimited = area.status === "Limited";
              return (
                <View
                  key={area.id}
                  style={[s.guideTile, isOpen && s.guideTileOpen, isLimited && s.guideTileLimited]}
                >
                  <Text style={[s.guideName, isOpen && s.guideNameOpen]}>{area.label}</Text>
                  <Text style={[s.guideNum, isOpen && s.guideNumOpen]}>{area.availableSlots}</Text>
                  <Text style={[s.guideCap, isOpen && s.guideCapOpen]}>slots open</Text>
                  <Pill
                    label={area.status}
                    tone={area.status === "Full" ? "occupied" : area.status === "Limited" ? "warning" : "online"}
                  />
                </View>
              );
            })}
          </View>
        </Card>
      </FadeIn>
    </ScrollView>
  );
}

function UserGuidance() {
  const rec = parkingGuidanceAreas.find((a) => a.availableSlots > 0) || parkingGuidanceAreas[0];
  const sorted = [...parkingGuidanceAreas].sort((a, b) => b.availableSlots - a.availableSlots);

  return (
    <ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
      <FadeIn delay={0}>
        <View style={s.recCard}>
          <Text style={s.recEyebrow}>RECOMMENDED NOW</Text>
          <Text style={s.recTitle}>{rec.label}</Text>
          <Text style={s.recText}>Head here first — {rec.availableSlots} spaces currently open.</Text>
          <Pill label={`${rec.availableSlots} open`} tone="online" />
        </View>
      </FadeIn>

      <FadeIn delay={60}>
        <Card title="All Areas Ranked" subtitle="Sorted by most available spaces">
          {sorted.map((area, i) => (
            <View key={area.id} style={s.listItem}>
              <View style={s.rankBadge}>
                <Text style={s.rankText}>#{i + 1}</Text>
              </View>
              <View style={s.listBody}>
                <Text style={s.listTitle}>{area.label}</Text>
                <Text style={s.listSub}>{area.availableSlots} slots available</Text>
              </View>
              <Pill
                label={area.status}
                tone={area.status === "Full" ? "occupied" : area.status === "Limited" ? "warning" : "online"}
              />
            </View>
          ))}
        </Card>
      </FadeIn>

      <FadeIn delay={100}>
        <View style={s.entranceCard}>
          <Text style={s.entranceEyebrow}>ENTRANCE DISPLAY</Text>
          <Text style={s.entrancePrimary}>{entranceDisplay.primaryMessage}</Text>
          <Text style={s.entranceSub}>{entranceDisplay.secondaryMessage}</Text>
        </View>
      </FadeIn>
    </ScrollView>
  );
}

function UserHistory() {
  return (
    <ScrollView contentContainerStyle={s.page} showsVerticalScrollIndicator={false}>
      <FadeIn delay={0}>
        <Card title="Recent Updates" subtitle="Latest parking activity">
          {activityHistory.slice(0, 5).map((e) => (
            <View key={e.id} style={s.histItem}>
              <View style={s.histTime}><Text style={s.histTimeText}>{e.time}</Text></View>
              <View style={s.histBody}><Text style={s.histMsg}>{e.message}</Text></View>
            </View>
          ))}
        </Card>
      </FadeIn>
      <FadeIn delay={80}>
        <Card title="Full History" subtitle="All recorded parking activity">
          {activityHistory.map((e) => (
            <View key={e.id} style={s.histItem}>
              <View style={s.histTime}><Text style={s.histTimeText}>{e.time}</Text></View>
              <View style={s.histBody}><Text style={s.histMsg}>{e.message}</Text></View>
            </View>
          ))}
        </Card>
      </FadeIn>
    </ScrollView>
  );
}

// ═══════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════

export default function ParkingDashboardScreen({ navigation, onLogout, session, settings }) {
  const isAdmin = session?.mode === "admin";
  const tabs = isAdmin ? ADMIN_TABS : USER_TABS;
  const [activeTab, setActiveTab] = useState("home");
  const [liveTime, setLiveTime] = useState(new Date());

  useEffect(() => {
    const ms = Math.max(5, Number(settings?.refreshInterval || 30)) * 1000;
    const id = setInterval(() => setLiveTime(new Date()), ms);
    return () => clearInterval(id);
  }, [settings?.refreshInterval]);

  const occupancyRate = Math.round(
    (parkingData.occupiedSlots / parkingData.totalSlots) * 100
  );

  function renderPage() {
    if (isAdmin) {
      if (activeTab === "home") return <AdminHome key="ah" session={session} settings={settings} onLogout={onLogout} navigation={navigation} liveTime={liveTime} occupancyRate={occupancyRate} />;
      if (activeTab === "slots") return <AdminSlots key="as" />;
      if (activeTab === "sensors") return <AdminSensors key="ase" />;
      if (activeTab === "alerts") return <AdminAlerts key="aal" settings={settings} />;
    } else {
      if (activeTab === "home") return <UserHome key="uh" session={session} onLogout={onLogout} liveTime={liveTime} occupancyRate={occupancyRate} />;
      if (activeTab === "areas") return <UserAreas key="ua" occupancyRate={occupancyRate} />;
      if (activeTab === "guidance") return <UserGuidance key="ug" />;
      if (activeTab === "history") return <UserHistory key="uhi" />;
    }
  }

  return (
    <SafeAreaView style={s.safe}>
      <View style={{ flex: 1 }}>{renderPage()}</View>
      <TabBar tabs={tabs} active={activeTab} onPress={setActiveTab} />
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  page: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 32, gap: 14 },

  // Admin hero
  adminHero: { backgroundColor: C.adminCard, borderRadius: 28, padding: 22, gap: 12, borderWidth: 1, borderColor: C.adminCardBorder, overflow: "hidden" },
  glow1: { position: "absolute", top: -50, right: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(123,110,246,0.12)" },
  glow2: { position: "absolute", bottom: -60, left: -40, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(45,212,191,0.07)" },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  adminEyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 2, color: C.adminAccent, marginBottom: 4 },
  adminTitle: { fontSize: 34, fontWeight: "900", color: C.white, lineHeight: 38, letterSpacing: -0.5 },
  adminWelcome: { fontSize: 16, fontWeight: "700", color: C.adminText },
  adminMeta: { fontSize: 13, color: C.adminMuted },
  adminStatRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  adminStatChip: { flex: 1, backgroundColor: "rgba(255,255,255,0.06)", borderRadius: 18, padding: 12, gap: 2, alignItems: "center", borderWidth: 1, borderColor: "rgba(168,155,255,0.15)" },
  adminStatNum: { fontSize: 22, fontWeight: "900", color: C.adminAccent, letterSpacing: -0.5 },
  adminStatLabel: { fontSize: 11, fontWeight: "600", color: C.adminMuted },
  adminRefresh: { fontSize: 12, color: C.adminMuted },

  // Alert
  alertBanner: { backgroundColor: "#2A1C10", borderRadius: 22, padding: 16, flexDirection: "row", alignItems: "flex-start", gap: 12, borderWidth: 1, borderColor: "#7A3D0A" },
  alertDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: C.amber, marginTop: 4 },
  alertTitle: { fontSize: 14, fontWeight: "800", color: C.amber, marginBottom: 2 },
  alertBody: { fontSize: 13, color: "#E2C070", lineHeight: 19 },

  // Metrics
  metricsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  metricTile: { width: "48%", backgroundColor: C.card, borderRadius: 22, padding: 16, gap: 3, borderWidth: 1, borderColor: C.cardBorder },
  metricVal: { fontSize: 26, fontWeight: "900", color: C.accent, letterSpacing: -0.5 },
  metricTitle: { fontSize: 13, fontWeight: "700", color: C.text },
  metricSub: { fontSize: 11, color: C.textMuted },
  snapshot: { fontSize: 11, color: C.adminMuted, marginTop: 2 },

  // User hero
  userHero: { backgroundColor: C.card, borderRadius: 28, padding: 22, gap: 10, borderWidth: 1, borderColor: C.cardBorder, overflow: "hidden" },
  userEyebrow: { fontSize: 11, fontWeight: "800", letterSpacing: 2, color: C.accent, marginBottom: 4 },
  userHeroTitle: { fontSize: 32, fontWeight: "900", color: C.text, lineHeight: 37, letterSpacing: -0.5 },
  userWelcome: { fontSize: 16, fontWeight: "700", color: C.text },
  userHint: { fontSize: 14, color: C.textMuted, lineHeight: 20 },
  availBlock: { flexDirection: "row", alignItems: "center", backgroundColor: C.bg, borderRadius: 22, padding: 18, gap: 12, marginTop: 4 },
  availLeft: { flex: 1, gap: 3 },
  availNum: { fontSize: 52, fontWeight: "900", color: C.white, lineHeight: 56, letterSpacing: -2 },
  availLabel: { fontSize: 14, fontWeight: "700", color: C.textLight },
  availSub: { fontSize: 12, color: C.textMuted, lineHeight: 18 },
  ring: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: C.accent, alignItems: "center", justifyContent: "center", gap: 1 },
  ringNum: { fontSize: 18, fontWeight: "900", color: C.white },
  ringLabel: { fontSize: 10, fontWeight: "600", color: C.textLight },

  // Quick bar
  quickBar: { backgroundColor: C.card, borderRadius: 22, padding: 16, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: C.cardBorder },
  quickGroup: { flex: 1, flexDirection: "row", alignItems: "center" },
  quickItem: { flex: 1, alignItems: "center", gap: 3 },
  quickLabel: { fontSize: 11, fontWeight: "600", color: C.textMuted },
  quickValue: { fontSize: 12, fontWeight: "800", color: C.text, textAlign: "center" },
  quickDivider: { width: 1, height: 36, backgroundColor: C.divider },

  // Entrance
  entranceCard: { backgroundColor: "#0D0D1A", borderRadius: 22, padding: 18, gap: 6, borderWidth: 1, borderColor: "rgba(123,110,246,0.25)" },
  entranceEyebrow: { fontSize: 10, fontWeight: "800", letterSpacing: 2, color: "#7BE8B4" },
  entrancePrimary: { fontSize: 28, fontWeight: "900", color: "#F0F975", lineHeight: 32, letterSpacing: -0.5 },
  entranceSub: { fontSize: 13, color: "#B8F5D8", lineHeight: 19 },

  // Recommend
  recCard: { backgroundColor: C.tealSoft, borderRadius: 26, padding: 20, gap: 8, borderWidth: 1, borderColor: "#A7F3D0" },
  recEyebrow: { fontSize: 10, fontWeight: "800", letterSpacing: 2, color: C.tealDark },
  recTitle: { fontSize: 28, fontWeight: "900", color: "#0D4A3A", letterSpacing: -0.5 },
  recText: { fontSize: 14, color: C.tealDark, lineHeight: 20 },

  // Guidance grid
  guidanceGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  guideTile: { width: "48%", borderRadius: 22, backgroundColor: C.cardInner, borderWidth: 1, borderColor: C.cardBorder, padding: 16, gap: 4 },
  guideTileOpen: { backgroundColor: C.tealSoft, borderColor: "#A7F3D0" },
  guideTileLimited: { backgroundColor: C.amberSoft, borderColor: "#FDE68A" },
  guideName: { fontSize: 13, fontWeight: "700", color: C.textMuted },
  guideNameOpen: { color: C.tealDark },
  guideNum: { fontSize: 32, fontWeight: "900", color: C.accent, letterSpacing: -1 },
  guideNumOpen: { color: C.tealDark },
  guideCap: { fontSize: 12, color: C.textMuted, marginBottom: 4 },
  guideCapOpen: { color: C.tealDark },

  // Rank badge
  rankBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.accentSoft, alignItems: "center", justifyContent: "center" },
  rankText: { fontSize: 12, fontWeight: "800", color: C.accent },

  // List items
  listItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: C.divider },
  listBody: { flex: 1, gap: 2 },
  listTitle: { fontSize: 14, fontWeight: "700", color: C.text },
  listSub: { fontSize: 12, color: C.textMuted },
  listRight: { alignItems: "flex-end", gap: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  latency: { fontSize: 11, color: C.textMuted },

  // History
  histItem: { flexDirection: "row", gap: 10, alignItems: "flex-start", paddingVertical: 6 },
  histTime: { backgroundColor: C.cardInner, borderRadius: 12, paddingVertical: 7, paddingHorizontal: 10, alignItems: "center", minWidth: 64 },
  histTimeText: { fontSize: 11, fontWeight: "700", color: C.textMuted },
  histBody: { flex: 1, borderBottomWidth: 1, borderBottomColor: C.divider, paddingBottom: 10, justifyContent: "center" },
  histMsg: { fontSize: 13, color: C.text, lineHeight: 19 },

  // Notifications
  notifCard: { backgroundColor: C.cardInner, borderRadius: 18, padding: 14, gap: 8, borderWidth: 1, borderColor: C.cardBorder },
  notifText: { fontSize: 14, color: C.text, lineHeight: 20 },
  dismissBtn: { alignSelf: "flex-start", backgroundColor: C.white, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1, borderColor: C.cardBorder },
  dismissText: { fontSize: 13, fontWeight: "700", color: C.textMuted },

  // Shared
  btnRow: { flexDirection: "row", gap: 10, marginTop: 4 },
  expandBtn: { borderRadius: 14, paddingVertical: 11, alignItems: "center", backgroundColor: C.accentSoft },
  expandText: { color: C.accent, fontSize: 14, fontWeight: "700" },
  detailBox: { backgroundColor: C.cardInner, borderRadius: 18, paddingHorizontal: 14, paddingTop: 4, paddingBottom: 4, borderWidth: 1, borderColor: C.cardBorder },
  empty: { backgroundColor: C.cardInner, borderRadius: 18, padding: 16, alignItems: "center" },
  emptyText: { fontSize: 14, color: C.textMuted, textAlign: "center", lineHeight: 20 },
});