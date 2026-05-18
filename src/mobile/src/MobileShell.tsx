import { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { MobileRuntimeHandlers } from "../App";
import { canWorkOffline, summarizeQueue } from "./offlineQueue";
import type {
  MobileContext,
  MobileRuntimeContext,
  MobileSession,
  MobileTab,
  MobileTask,
  OfflineQueueEntry,
  SyncSummary
} from "./mobileTypes";
import { ContextSwitchScreen } from "./screens/ContextSwitchScreen";
import { DeviceUtilitiesScreen } from "./screens/DeviceUtilitiesScreen";
import { DispatchProofScreen } from "./screens/DispatchProofScreen";
import { HomeDashboardScreen } from "./screens/HomeDashboardScreen";
import { InventoryMovementScreen } from "./screens/InventoryMovementScreen";
import { MaterialScanScreen } from "./screens/MaterialScanScreen";
import { QualityCaptureScreen } from "./screens/QualityCaptureScreen";
import { SettingsSyncStatusScreen } from "./screens/SettingsSyncStatusScreen";
import { ServiceFieldScreen } from "./screens/ServiceFieldScreen";

interface MobileShellProps extends MobileRuntimeHandlers {
  activeContext: MobileContext;
  contexts: MobileContext[];
  onContextChange: (context: MobileContext) => void;
  queue: OfflineQueueEntry[];
  runtime: MobileRuntimeContext | null;
  session: MobileSession;
  syncSummary: SyncSummary;
  tasks: MobileTask[];
}

const tabs: Array<{ id: MobileTab; label: string }> = [
  { id: "home", label: "Home" },
  { id: "materials", label: "Material" },
  { id: "stock", label: "Stock" },
  { id: "quality", label: "Quality" },
  { id: "dispatch", label: "Dispatch" },
  { id: "service", label: "Service" },
  { id: "device", label: "Device" },
  { id: "sync", label: "Sync" },
  { id: "context", label: "Context" }
];

export function MobileShell({
  activeContext,
  contexts,
  onCaptureEvidence,
  onContextChange,
  onQueueOperation,
  onResolveScan,
  onSync,
  queue,
  runtime,
  session,
  syncSummary,
  tasks
}: MobileShellProps) {
  const [tab, setTab] = useState<MobileTab>("home");
  const queueSummary = summarizeQueue(queue);
  const disabledReason = runtime?.device.disabledReason ?? runtime?.disabledReasons[0] ?? null;

  const currentScreen =
    tab === "home" ? (
      <HomeDashboardScreen onNavigate={setTab} queue={queue} runtime={runtime} session={session} tasks={tasks} />
    ) : tab === "materials" ? (
      <MaterialScanScreen activeContext={activeContext} onQueueOperation={onQueueOperation} onResolveScan={onResolveScan} runtime={runtime} tasks={tasks} />
    ) : tab === "stock" ? (
      <InventoryMovementScreen activeContext={activeContext} onQueueOperation={onQueueOperation} onResolveScan={onResolveScan} runtime={runtime} tasks={tasks} />
    ) : tab === "quality" ? (
      <QualityCaptureScreen onCaptureEvidence={onCaptureEvidence} onQueueOperation={onQueueOperation} onResolveScan={onResolveScan} runtime={runtime} tasks={tasks} />
    ) : tab === "dispatch" ? (
      <DispatchProofScreen onCaptureEvidence={onCaptureEvidence} onQueueOperation={onQueueOperation} onResolveScan={onResolveScan} runtime={runtime} tasks={tasks} />
    ) : tab === "service" ? (
      <ServiceFieldScreen onCaptureEvidence={onCaptureEvidence} onQueueOperation={onQueueOperation} onResolveScan={onResolveScan} runtime={runtime} tasks={tasks} />
    ) : tab === "device" ? (
      <DeviceUtilitiesScreen onCaptureEvidence={onCaptureEvidence} onResolveScan={onResolveScan} runtime={runtime} />
    ) : tab === "sync" ? (
      <SettingsSyncStatusScreen onSync={onSync} queue={queue} runtime={runtime} session={session} syncSummary={syncSummary} />
    ) : (
      <ContextSwitchScreen activeContext={activeContext} contexts={contexts} onContextChange={onContextChange} />
    );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Mobile execution</Text>
          <Text style={styles.title}>{session.displayName}</Text>
          <Text style={styles.muted}>{`${activeContext.companyName} / ${activeContext.branchName}`}</Text>
          <View style={styles.badgeRow}>
            <Text style={styles.badge}>{runtime?.device.trustStatus ?? session.deviceBindingStatus}</Text>
            <Text style={styles.badge}>{canWorkOffline(queue) && runtime?.canWorkOffline ? "Offline queue ready" : "Sync review"}</Text>
            <Text style={styles.badge}>{`${queueSummary.pending} pending`}</Text>
            <Text style={styles.badge}>{runtime?.onlineMode ?? "Live API pending"}</Text>
          </View>
          {disabledReason ? <Text style={styles.warning}>{disabledReason}</Text> : null}
        </View>

        <ScrollView contentContainerStyle={styles.tabRow} horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((entry) => {
            const isActive = tab === entry.id;

            return (
              <TouchableOpacity accessibilityRole="button" key={entry.id} onPress={() => setTab(entry.id)} style={[styles.tab, isActive && styles.activeTab]}>
                <Text style={[styles.tabText, isActive && styles.activeTabText]}>{entry.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {currentScreen}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  activeTab: {
    backgroundColor: "#17463a"
  },
  activeTabText: {
    color: "#ffffff"
  },
  badge: {
    backgroundColor: "#e8f2ee",
    borderRadius: 999,
    color: "#17463a",
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12
  },
  eyebrow: {
    color: "#5c6f68",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    textTransform: "uppercase"
  },
  header: {
    backgroundColor: "#f8efe0",
    borderRadius: 28,
    padding: 20
  },
  muted: {
    color: "#5c6f68",
    fontSize: 14,
    marginTop: 4
  },
  page: {
    gap: 18,
    padding: 18
  },
  safe: {
    backgroundColor: "#fbf7ef",
    flex: 1
  },
  tab: {
    backgroundColor: "#d7e3dd",
    borderRadius: 18,
    minWidth: 92,
    padding: 14
  },
  tabRow: {
    flexDirection: "row",
    gap: 10
  },
  tabText: {
    color: "#10251f",
    fontWeight: "800",
    textAlign: "center"
  },
  title: {
    color: "#10251f",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 6,
    textTransform: "capitalize"
  },
  warning: {
    color: "#7a3b14",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 10
  }
});
