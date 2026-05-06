import { StyleSheet, Text, View } from "react-native";
import { seededMediaUploads, seededShiftHandovers } from "../mobileSeedData";
import { MobileBadge, MobileButton, MobileCard, MobileField, MobileListItem, MobileSectionTitle } from "../ui/mobileComponents";

function handoverTone(status: "Draft" | "Queued" | "Synced" | "Conflict") {
  if (status === "Conflict") {
    return "danger";
  }

  if (status === "Synced") {
    return "success";
  }

  return status === "Queued" ? "warn" : "info";
}

function mediaTone(status: "Ready" | "Queued" | "Synced" | "Failed" | "Conflict") {
  if (status === "Failed" || status === "Conflict") {
    return "danger";
  }

  if (status === "Synced") {
    return "success";
  }

  return status === "Queued" ? "warn" : "info";
}

export function ShiftHandoverMediaScreen() {
  return (
    <View style={styles.stack}>
      <MobileCard
        action={<MobileBadge label="Offline first" tone="warn" />}
        subtitle="Capture unresolved issues, shift summary, and media proof without forcing web administration onto the phone."
        title="Shift Handover / Notes / Photos"
      >
        {seededShiftHandovers.map((handover) => (
          <MobileListItem key={handover.id}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.itemTitle}>{handover.shiftLabel}</Text>
                <Text style={styles.copy}>{handover.summary}</Text>
              </View>
              <MobileBadge label={handover.status} tone={handoverTone(handover.status)} />
            </View>
            <View style={styles.fieldGrid}>
              <MobileField label="Supervisor" value={handover.supervisorName} />
              <MobileField label="Pending" value={handover.pendingIssueLabel} />
              <MobileField label="Media" value={`${handover.mediaCount} files`} />
              <MobileField label="Next owner" value={handover.nextOwner} />
            </View>
            <View style={styles.buttonRow}>
              <MobileButton label="Queue handover" tone="warn" />
              <MobileButton label="Add note" tone="neutral" />
            </View>
          </MobileListItem>
        ))}
      </MobileCard>

      <MobileCard title="Attachment capture" subtitle="Photo, voice, and file proof reuse the same offline queue vocabulary as production, QC, and dispatch.">
        <MobileSectionTitle>Ready media actions</MobileSectionTitle>
        {seededMediaUploads.map((upload) => (
          <MobileListItem key={upload.id}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.itemTitle}>{upload.fileLabel}</Text>
                <Text style={styles.copy}>{`${upload.sourceDocument} / ${upload.noteLabel}`}</Text>
              </View>
              <MobileBadge label={upload.captureType} tone="info" />
            </View>
            <View style={styles.row}>
              <MobileBadge label={upload.status} tone={mediaTone(upload.status)} />
              <Text style={styles.audit}>{upload.requiresNetwork ? "Network required for retry" : "Safe to queue offline"}</Text>
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
    flexWrap: "wrap",
    gap: 10
  },
  copy: {
    color: "#5c6f68",
    lineHeight: 20
  },
  fieldGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  flex: {
    flex: 1
  },
  itemTitle: {
    color: "#10251f",
    fontSize: 17,
    fontWeight: "900"
  },
  row: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10
  },
  stack: {
    gap: 16
  }
});
