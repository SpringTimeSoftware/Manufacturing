import { useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { seededRoleNavigationRules } from "./mobileSeedData";
import { canWorkOffline, summarizeQueue } from "./offlineQueue";
import type { MobileContext, MobileSession, MobileTab, OfflineQueueEntry, SyncSummary } from "./mobileTypes";
import { ContextSwitchScreen } from "./screens/ContextSwitchScreen";
import { DeviceUtilitiesScreen } from "./screens/DeviceUtilitiesScreen";
import { DispatchProofScreen } from "./screens/DispatchProofScreen";
import { ExecutionCaptureScreen } from "./screens/ExecutionCaptureScreen";
import { HomeDashboardScreen } from "./screens/HomeDashboardScreen";
import { InventoryMovementScreen } from "./screens/InventoryMovementScreen";
import { JobCardsScreen } from "./screens/JobCardsScreen";
import { MachineDowntimeScreen } from "./screens/MachineDowntimeScreen";
import { MaterialScanScreen } from "./screens/MaterialScanScreen";
import { NotificationsApprovalsScreen } from "./screens/NotificationsApprovalsScreen";
import { OrderStageBoardScreen } from "./screens/OrderStageBoardScreen";
import { ProductionReceiptReworkScreen } from "./screens/ProductionReceiptReworkScreen";
import { QualityCaptureScreen } from "./screens/QualityCaptureScreen";
import { SettingsSyncStatusScreen } from "./screens/SettingsSyncStatusScreen";
import { ShiftHandoverMediaScreen } from "./screens/ShiftHandoverMediaScreen";

interface MobileShellProps {
  activeContext: MobileContext;
  contexts: MobileContext[];
  onContextChange: (context: MobileContext) => void;
  queue: OfflineQueueEntry[];
  session: MobileSession;
  syncSummary: SyncSummary;
}

const tabs: Array<{ id: MobileTab; label: string }> = [
  { id: "home", label: "Home" },
  { id: "inbox", label: "Inbox" },
  { id: "jobs", label: "Jobs" },
  { id: "execute", label: "Execute" },
  { id: "materials", label: "Material" },
  { id: "stock", label: "Stock" },
  { id: "machine", label: "Machine" },
  { id: "quality", label: "Quality" },
  { id: "output", label: "Output" },
  { id: "handover", label: "Handover" },
  { id: "dispatch", label: "Dispatch" },
  { id: "orders", label: "Orders" },
  { id: "device", label: "Device" },
  { id: "sync", label: "Sync" },
  { id: "context", label: "Context" }
];

export function MobileShell({
  activeContext,
  contexts,
  onContextChange,
  queue,
  session,
  syncSummary
}: MobileShellProps) {
  const [tab, setTab] = useState<MobileTab>("home");
  const queueSummary = summarizeQueue(queue);
  const roleRule = seededRoleNavigationRules.find((rule) => session.roles.includes(rule.role));
  const visibleTabs = roleRule
    ? tabs.filter((entry) => roleRule.primaryTabs.includes(entry.id) || entry.id === "context")
    : tabs;

  const currentScreen =
    tab === "home" ? (
      <HomeDashboardScreen onNavigate={setTab} queue={queue} session={session} />
    ) : tab === "inbox" ? (
      <NotificationsApprovalsScreen />
    ) : tab === "jobs" ? (
      <JobCardsScreen />
    ) : tab === "execute" ? (
      <ExecutionCaptureScreen />
    ) : tab === "materials" ? (
      <MaterialScanScreen />
    ) : tab === "stock" ? (
      <InventoryMovementScreen />
    ) : tab === "machine" ? (
      <MachineDowntimeScreen />
    ) : tab === "quality" ? (
      <QualityCaptureScreen />
    ) : tab === "output" ? (
      <ProductionReceiptReworkScreen />
    ) : tab === "handover" ? (
      <ShiftHandoverMediaScreen />
    ) : tab === "dispatch" ? (
      <DispatchProofScreen />
    ) : tab === "orders" ? (
      <OrderStageBoardScreen />
    ) : tab === "device" ? (
      <DeviceUtilitiesScreen />
    ) : tab === "sync" ? (
      <SettingsSyncStatusScreen queue={queue} session={session} syncSummary={syncSummary} />
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
            <Text style={styles.badge}>{session.deviceBindingStatus}</Text>
            <Text style={styles.badge}>{canWorkOffline(queue) ? "Offline ready" : "Sync review"}</Text>
            <Text style={styles.badge}>{`${queueSummary.pending} pending`}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.tabRow} horizontal showsHorizontalScrollIndicator={false}>
          {visibleTabs.map((entry) => {
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
  }
});
