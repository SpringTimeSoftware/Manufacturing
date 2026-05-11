import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { seededDispatchProofTasks, seededMediaUploads } from "../mobileSeedData";
import { MobileActionNotice, MobileBadge, MobileButton, MobileCard, MobileField, MobileListItem } from "../ui/mobileComponents";

function statusTone(status: "Ready" | "Loading" | "ProofQueued" | "Synced") {
  if (status === "Synced") {
    return "success";
  }

  if (status === "ProofQueued") {
    return "warn";
  }

  return "info";
}

export function DispatchProofScreen() {
  const dispatchUploads = seededMediaUploads.filter((upload) => upload.sourceDocument.startsWith("SHIP-"));
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const queueScan = (shipmentNo: string) => () => setActionMessage(`Package scan queued for ${shipmentNo}.`);
  const retryProof = (fileLabel: string) => () => setActionMessage(`${fileLabel} queued for proof upload retry.`);

  return (
    <View style={styles.stack}>
      <MobileCard
        action={<MobileBadge label="Proof queue" tone="success" />}
        subtitle="Scan packed items, record vehicle and seal notes, then queue proof media when the dock network is unreliable."
        title="Dispatch Loading / Proof"
      >
        <MobileActionNotice message={actionMessage} tone="success" />
        {seededDispatchProofTasks.map((task) => {
          const remaining = Math.max(task.packedItems - task.scannedItems, 0);

          return (
            <MobileListItem key={task.id}>
              <View style={styles.row}>
                <View style={styles.flex}>
                  <Text style={styles.itemTitle}>{task.shipmentNo}</Text>
                  <Text style={styles.copy}>{task.customerName}</Text>
                </View>
                <MobileBadge label={task.status} tone={statusTone(task.status)} />
              </View>
              <View style={styles.progressRail}>
                <View style={[styles.progressFill, { width: `${Math.min((task.scannedItems / task.packedItems) * 100, 100)}%` }]} />
              </View>
              <Text style={styles.audit}>{`${task.scannedItems}/${task.packedItems} packages scanned, ${remaining} remaining`}</Text>
              <View style={styles.fieldGrid}>
                <MobileField label="Vehicle" value={task.vehicleRef} />
                <MobileField label="Seal" value={task.sealNo} />
                <MobileField label="Proof" value={task.proofLabel} />
              </View>
              <View style={styles.buttonRow}>
                <MobileButton label="Scan package" onPress={queueScan(task.shipmentNo)} tone="success" />
                <MobileButton disabled disabledReason="Camera proof capture requires the native camera permission adapter." label="Capture proof" tone="info" />
              </View>
            </MobileListItem>
          );
        })}
      </MobileCard>

      <MobileCard title="Dispatch media queue" subtitle="Proof attachments are retained as queue entries until server confirmation.">
        {dispatchUploads.map((upload) => (
          <MobileListItem key={upload.id}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.itemTitle}>{upload.fileLabel}</Text>
                <Text style={styles.copy}>{upload.noteLabel}</Text>
              </View>
              <MobileBadge label={upload.status} tone={upload.status === "Failed" ? "danger" : "warn"} />
            </View>
            <MobileButton label="Retry proof upload" onPress={retryProof(upload.fileLabel)} tone={upload.status === "Failed" ? "danger" : "info"} />
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
  progressFill: {
    backgroundColor: "#0ea5e9",
    borderRadius: 999,
    height: 10
  },
  progressRail: {
    backgroundColor: "#e8f2ee",
    borderRadius: 999,
    height: 10,
    overflow: "hidden"
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
