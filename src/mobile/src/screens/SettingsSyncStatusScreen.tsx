import { StyleSheet, Text, View } from "react-native";
import { seededConflictTasks, seededLocalizationOptions, seededRoleNavigationRules } from "../mobileSeedData";
import type { MobileSession, OfflineQueueEntry, SyncSummary } from "../mobileTypes";

interface SettingsSyncStatusScreenProps {
  queue: OfflineQueueEntry[];
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

export function SettingsSyncStatusScreen({ queue, session, syncSummary }: SettingsSyncStatusScreenProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Settings / Sync Status / Language</Text>
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
          <Text style={styles.summaryValue}>{session.languageCode}</Text>
          <Text style={styles.summaryLabel}>Language</Text>
        </View>
      </View>
      <Text style={styles.copy}>{`Last sync: ${syncSummary.lastSyncLabel}`}</Text>
      <View style={styles.deviceCard}>
        <Text style={styles.queueTitle}>Device and language</Text>
        <Text style={styles.copy}>{`Device binding: ${session.deviceBindingStatus}`}</Text>
        <View style={styles.languageRow}>
          {seededLocalizationOptions.map((option) => (
            <Text key={option.code} style={[styles.languageChip, option.status === "Active" && styles.languageActive]}>
              {`${option.label} / ${option.status}`}
            </Text>
          ))}
        </View>
      </View>
      <View style={styles.deviceCard}>
        <Text style={styles.queueTitle}>Role-aware navigation</Text>
        {seededRoleNavigationRules
          .filter((rule) => session.roles.includes(rule.role))
          .map((rule) => (
            <Text key={rule.role} style={styles.audit}>{`${rule.role}: default ${rule.defaultTab}, ${rule.primaryTabs.length} mobile tabs`}</Text>
          ))}
      </View>
      {queue.map((entry) => (
        <View key={entry.id} style={styles.queueCard}>
          <View>
            <Text style={styles.queueTitle}>{entry.documentRef}</Text>
            <Text style={styles.copy}>{`${entry.module} - ${entry.actionLabel}`}</Text>
          </View>
          <Text style={[styles.status, statusStyle(entry.status)]}>{entry.status}</Text>
          <Text style={styles.audit}>{`${entry.queuedOnLabel} / ${entry.auditLabel}`}</Text>
        </View>
      ))}
      <Text style={styles.subhead}>Conflict resolution</Text>
      {seededConflictTasks.map((conflict) => (
        <View key={conflict.id} style={styles.queueCard}>
          <View>
            <Text style={styles.queueTitle}>{conflict.documentRef}</Text>
            <Text style={styles.copy}>{`Local: ${conflict.localChangeLabel}`}</Text>
            <Text style={styles.copy}>{`Server: ${conflict.serverChangeLabel}`}</Text>
          </View>
          <Text style={[styles.status, statusStyle(conflict.status)]}>{conflict.status}</Text>
          <Text style={styles.audit}>{conflict.recommendedAction}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  audit: {
    color: "#5c6f68",
    fontSize: 12
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
  languageActive: {
    backgroundColor: "#17463a",
    color: "#ffffff"
  },
  languageChip: {
    backgroundColor: "#edf2ef",
    borderRadius: 999,
    color: "#17463a",
    fontSize: 12,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  languageRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
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
  subhead: {
    color: "#10251f",
    fontSize: 16,
    fontWeight: "900"
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
