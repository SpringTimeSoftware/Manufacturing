import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import type { MobileRuntimeContext, MobileSession, OfflineQueueEntry, SyncSummary } from "../mobileTypes";
import { MobileActionNotice, MobileButton } from "../ui/mobileComponents";

interface SettingsSyncStatusScreenProps {
  onSync: () => Promise<OfflineQueueEntry[]>;
  queue: OfflineQueueEntry[];
  runtime: MobileRuntimeContext | null;
  session: MobileSession;
  syncSummary: SyncSummary;
}

function statusStyle(status: OfflineQueueEntry["status"]) {
  if (status === "Failed" || status === "Conflict" || status === "Rejected") {
    return styles.statusDanger;
  }

  if (status === "Synced") {
    return styles.statusSuccess;
  }

  return styles.statusWarn;
}

export function SettingsSyncStatusScreen({ onSync, queue, runtime, session, syncSummary }: SettingsSyncStatusScreenProps) {
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const runSync = async () => {
    setSyncMessage(null);
    setSyncError(null);
    try {
      const result = await onSync();
      setSyncMessage(`${result.length} operation(s) were processed by the live sync API.`);
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : "Sync failed.");
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Settings / Sync Status / Device Trust</Text>
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{syncSummary.pendingCount}</Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{syncSummary.failedCount}</Text>
          <Text style={styles.summaryLabel}>Failed</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{syncSummary.conflictCount ?? 0}</Text>
          <Text style={styles.summaryLabel}>Conflict</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{session.languageCode}</Text>
          <Text style={styles.summaryLabel}>Language</Text>
        </View>
      </View>
      <Text style={styles.copy}>{`Last sync: ${syncSummary.lastSyncLabel}`}</Text>
      <MobileActionNotice message={syncMessage} tone="success" />
      <MobileActionNotice message={syncError} tone="danger" />
      <MobileButton disabled={runtime?.device.isRevoked} disabledReason="Revoked devices cannot sync queued work." label="Sync queued operations" onPress={() => void runSync()} tone="success" />
      <View style={styles.deviceCard}>
        <Text style={styles.queueTitle}>Device registration</Text>
        <Text style={styles.copy}>{`Device: ${runtime?.device.deviceCode ?? session.deviceCode ?? "not registered"}`}</Text>
        <Text style={styles.copy}>{`Trust: ${runtime?.device.trustStatus ?? session.deviceBindingStatus}`}</Text>
        <Text style={styles.copy}>{`Offline capability: ${runtime?.device.offlineCapability ? "Enabled" : "Disabled"}`}</Text>
        <Text style={styles.copy}>{`Scanner: ${runtime?.device.scannerCapability ?? "Unknown"}`}</Text>
        <Text style={styles.copy}>{`Camera: ${runtime?.device.cameraCapability ?? "Unknown"}`}</Text>
        {runtime?.disabledReasons.map((reason) => (
          <Text key={reason} style={styles.audit}>{reason}</Text>
        ))}
      </View>
      {queue.length === 0 ? <Text style={styles.copy}>No offline operations are queued for this device.</Text> : null}
      {queue.map((entry) => (
        <View key={entry.id} style={styles.queueCard}>
          <View>
            <Text style={styles.queueTitle}>{entry.documentRef}</Text>
            <Text style={styles.copy}>{`${entry.module} - ${entry.actionLabel}`}</Text>
          </View>
          <Text style={[styles.status, statusStyle(entry.status)]}>{entry.status}</Text>
          <Text style={styles.audit}>{`${entry.queuedOnLabel} / ${entry.auditLabel}`}</Text>
          {entry.failureReason ? <Text style={styles.audit}>{entry.failureReason}</Text> : null}
          {entry.conflictReason ? <Text style={styles.audit}>{entry.conflictReason}</Text> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  audit: {
    color: "#8e2c18",
    fontSize: 12,
    fontWeight: "700"
  },
  card: {
    backgroundColor: "#fffaf2",
    borderRadius: 28,
    gap: 14,
    padding: 18
  },
  copy: {
    color: "#5c6f68",
    lineHeight: 20
  },
  deviceCard: {
    backgroundColor: "#ffffff",
    borderColor: "#d8c6ac",
    borderRadius: 22,
    borderWidth: 1,
    gap: 8,
    padding: 16
  },
  queueCard: {
    backgroundColor: "#ffffff",
    borderColor: "#d8c6ac",
    borderRadius: 22,
    borderWidth: 1,
    gap: 8,
    padding: 16
  },
  queueTitle: {
    color: "#10251f",
    fontSize: 17,
    fontWeight: "900"
  },
  status: {
    alignSelf: "flex-start",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  statusDanger: {
    backgroundColor: "#fde7df",
    color: "#8e2c18"
  },
  statusSuccess: {
    backgroundColor: "#e8f2ee",
    color: "#17463a"
  },
  statusWarn: {
    backgroundColor: "#fff0c2",
    color: "#7a4a00"
  },
  summaryCard: {
    backgroundColor: "#f8efe0",
    borderRadius: 18,
    flex: 1,
    padding: 12
  },
  summaryLabel: {
    color: "#5c6f68",
    fontSize: 12,
    fontWeight: "700"
  },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  summaryValue: {
    color: "#10251f",
    fontSize: 20,
    fontWeight: "900"
  },
  title: {
    color: "#10251f",
    fontSize: 22,
    fontWeight: "900"
  }
});
