import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { MobileRuntimeContext, MobileSession, MobileTab, MobileTask, OfflineQueueEntry } from "../mobileTypes";
import { MobileBadge, MobileCard, MobileListItem, MobileSectionTitle, MobileTile, MobileUdfFields } from "../ui/mobileComponents";

interface HomeDashboardScreenProps {
  onNavigate: (tab: MobileTab) => void;
  queue: OfflineQueueEntry[];
  runtime: MobileRuntimeContext | null;
  session: MobileSession;
  tasks: MobileTask[];
}

const fastActions: Array<{ id: string; title: string; subtitle: string; targetTab: MobileTab; tone: "info" | "warn" | "success" }> = [
  { id: "scan", title: "Scan material", subtitle: "Resolve item, bin, lot, serial, or PCID against live ERP data.", targetTab: "materials", tone: "info" },
  { id: "stock", title: "Inventory move", subtitle: "Queue stock movement only with server-side tracking validation.", targetTab: "stock", tone: "success" },
  { id: "quality", title: "Quality capture", subtitle: "Record inspection/NCR drafts and evidence metadata.", targetTab: "quality", tone: "warn" },
  { id: "dispatch", title: "Dispatch/POD", subtitle: "Use shipment tasks and POD sync with idempotency.", targetTab: "dispatch", tone: "info" },
  { id: "service", title: "Field service", subtitle: "Resolve service tickets, queue visit completion, and record evidence metadata.", targetTab: "service", tone: "success" }
];

export function HomeDashboardScreen({ onNavigate, queue, runtime, session, tasks }: HomeDashboardScreenProps) {
  const firstRole = session.roles[0] ?? "MobileUser";
  const failedCount = queue.filter((entry) => entry.status === "Failed" || entry.status === "Conflict").length;
  const liveTaskCount = tasks.length;

  return (
    <View style={styles.stack}>
      <MobileCard
        action={<MobileBadge label={firstRole} tone="info" />}
        subtitle="Live mobile runtime status from the ERP API. No seeded task fallback is used after sign-in."
        title="My Dashboard"
      >
        <View style={styles.tileGrid}>
          <MobileTile hint="From mobile task API" label="Live tasks" tone="info" value={String(liveTaskCount)} />
          <MobileTile hint="Durable offline operation rows" label="Queued" tone="warn" value={String(queue.filter((entry) => entry.status === "Queued").length)} />
          <MobileTile hint="Open sync conflicts" label="Conflicts" tone={failedCount ? "danger" : "success"} value={String(failedCount)} />
          <MobileTile hint="Persisted device trust" label="Device" tone={runtime?.device.isTrusted ? "success" : "warn"} value={runtime?.device.trustStatus ?? "Pending"} />
        </View>
        {runtime?.disabledReasons.map((reason) => (
          <Text key={reason} style={styles.warning}>{reason}</Text>
        ))}
      </MobileCard>

      <MobileCard title="Fast actions" subtitle="Actions call live APIs or create durable offline operations with idempotency keys.">
        {fastActions.map((card) => (
          <TouchableOpacity accessibilityRole="button" key={card.id} onPress={() => onNavigate(card.targetTab)} style={styles.actionCard}>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>{card.title}</Text>
              <Text style={styles.copy}>{card.subtitle}</Text>
            </View>
            <MobileBadge label="Live" tone={card.tone} />
          </TouchableOpacity>
        ))}
      </MobileCard>

      <MobileCard title="Assigned live tasks" subtitle="Empty state means the API returned no tasks for this device scope.">
        <MobileSectionTitle>Current task feed</MobileSectionTitle>
        {tasks.length === 0 ? (
          <Text style={styles.audit}>No live mobile tasks are assigned in this company/branch/warehouse scope.</Text>
        ) : (
          tasks.slice(0, 5).map((task) => (
            <MobileListItem key={task.id}>
              <View style={styles.row}>
                <View style={styles.flex}>
                  <Text style={styles.itemTitle}>{task.title}</Text>
                  <Text style={styles.copy}>{task.subtitle}</Text>
                </View>
                <MobileBadge label={task.status} tone={task.disabledReason ? "warn" : "success"} />
              </View>
              <Text style={styles.audit}>{`${task.module} / ${task.documentNo}`}</Text>
              <MobileUdfFields values={task.udfValues} />
              {task.disabledReason ? <Text style={styles.warning}>{task.disabledReason}</Text> : null}
            </MobileListItem>
          ))
        )}
      </MobileCard>
    </View>
  );
}

const styles = StyleSheet.create({
  actionCard: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d8c6ac",
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    padding: 16
  },
  actionText: {
    flex: 1,
    gap: 4
  },
  actionTitle: {
    color: "#10251f",
    fontSize: 17,
    fontWeight: "900"
  },
  audit: {
    color: "#5c6f68",
    fontSize: 12,
    fontWeight: "700"
  },
  copy: {
    color: "#5c6f68",
    lineHeight: 20
  },
  flex: {
    flex: 1
  },
  itemTitle: {
    color: "#10251f",
    fontSize: 16,
    fontWeight: "900"
  },
  row: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10
  },
  stack: {
    gap: 16
  },
  tileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  warning: {
    color: "#8e2c18",
    fontWeight: "800"
  }
});
