import { StyleSheet, Text, View } from "react-native";
import { seededApprovals, seededNotifications } from "../mobileSeedData";
import {
  MobileBadge,
  MobileButton,
  MobileCard,
  MobileListItem
} from "../ui/mobileComponents";

export function NotificationsApprovalsScreen() {
  return (
    <View style={styles.stack}>
      <MobileCard title="Notifications / Inbox" subtitle="Alerts, reminders, approvals, and escalation messages grouped for quick triage.">
        {seededNotifications.map((notification) => (
          <MobileListItem key={notification.id}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.title}>{notification.title}</Text>
                <Text style={styles.copy}>{notification.body}</Text>
              </View>
              <MobileBadge label={notification.category} tone={notification.severity} />
            </View>
            <Text style={styles.audit}>{`${notification.documentRef} / ${notification.createdLabel}`}</Text>
            <MobileButton label={notification.actionLabel} tone={notification.severity} />
          </MobileListItem>
        ))}
      </MobileCard>

      <MobileCard title="My Approvals" subtitle="Approve/reject quick actions use audit-friendly labels and keep remarks explicit.">
        {seededApprovals.map((approval) => (
          <MobileListItem key={approval.id}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.title}>{approval.referenceNo}</Text>
                <Text style={styles.copy}>{approval.summary}</Text>
              </View>
              <MobileBadge label={approval.priority} tone={approval.priority === "High" ? "danger" : "warn"} />
            </View>
            <Text style={styles.audit}>{`${approval.submittedBy} / ${approval.dueLabel} / ${approval.auditActionLabel}`}</Text>
            <View style={styles.buttonRow}>
              <MobileButton label="Approve" tone="success" />
              <MobileButton label="Reject" tone="danger" />
            </View>
          </MobileListItem>
        ))}
      </MobileCard>
    </View>
  );
}

const styles = StyleSheet.create({
  audit: {
    color: "#5c6f68",
    fontSize: 12,
    fontWeight: "700"
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10
  },
  copy: {
    color: "#5c6f68",
    lineHeight: 20
  },
  flex: {
    flex: 1
  },
  row: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10
  },
  stack: {
    gap: 16
  },
  title: {
    color: "#10251f",
    fontSize: 17,
    fontWeight: "900"
  }
});
