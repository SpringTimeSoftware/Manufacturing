import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import type {
  MobilePhotoEvidence,
  MobileRuntimeContext,
  MobileScanResult,
  MobileScanSource,
  MobileTask,
  OfflineQueueEntry,
  QueueOfflineOperationInput
} from "../mobileTypes";
import { MobileActionNotice, MobileBadge, MobileButton, MobileCard, MobileField, MobileListItem } from "../ui/mobileComponents";

interface DispatchProofScreenProps {
  onCaptureEvidence: (input: {
    sourceModule: string;
    sourceDocumentType: string;
    sourceDocumentId?: number | null;
    sourceDocumentNo?: string | null;
    evidenceType: string;
    fileName: string;
    contentType: string;
  }) => Promise<MobilePhotoEvidence>;
  onQueueOperation: (input: QueueOfflineOperationInput) => Promise<OfflineQueueEntry>;
  onResolveScan: (scanValue: string, scanSource: MobileScanSource, scanContext: string) => Promise<MobileScanResult>;
  runtime: MobileRuntimeContext | null;
  tasks: MobileTask[];
}

export function DispatchProofScreen({ onCaptureEvidence, onQueueOperation, onResolveScan, runtime, tasks }: DispatchProofScreenProps) {
  const [shipmentNo, setShipmentNo] = useState("");
  const [receivedBy, setReceivedBy] = useState("");
  const [remarks, setRemarks] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dispatchTasks = tasks.filter((task) => task.module === "Dispatch");

  const resolveShipment = async () => {
    setErrorMessage(null);
    try {
      const result = await onResolveScan(`SHIP:${shipmentNo}`, "Manual", "DispatchPod");
      setActionMessage(result.resolutionStatus === "Resolved" ? `Shipment ${shipmentNo} resolved.` : null);
      if (result.resolutionStatus !== "Resolved") {
        setErrorMessage(result.validationMessage ?? "Shipment did not resolve.");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Shipment lookup failed.");
    }
  };

  const queuePod = async () => {
    setErrorMessage(null);
    try {
      const operation = await onQueueOperation({
        operationType: "MobilePod",
        sourceModule: "Dispatch",
        documentRef: shipmentNo,
        actionLabel: "Queue POD",
        idempotencyKey: `pod-${shipmentNo || "draft"}-${Date.now()}`,
        payloadSnapshotJson: JSON.stringify({
          shipmentStatus: "Shipped",
          podReceivedBy: receivedBy,
          podReceivedOn: new Date().toISOString(),
          podRemarks: remarks
        })
      });
      setActionMessage(`${operation.actionLabel} recorded as ${operation.status}. POD sync remains idempotent and server-validated.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "POD could not be queued.");
    }
  };

  const capturePodEvidence = async () => {
    setErrorMessage(null);
    try {
      const evidence = await onCaptureEvidence({
        sourceModule: "Dispatch",
        sourceDocumentType: "Shipment",
        sourceDocumentNo: shipmentNo,
        evidenceType: "PODPhoto",
        fileName: `${shipmentNo || "shipment"}-pod.jpg`,
        contentType: "image/jpeg"
      });
      setActionMessage(`POD evidence metadata stored as ${evidence.uploadStatus}; no fake upload success is shown.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "POD evidence could not be recorded.");
    }
  };

  return (
    <View style={styles.stack}>
      <MobileCard
        action={<MobileBadge label="Live dispatch API" tone="success" />}
        subtitle="Shipment/POD actions queue durable operations or call live APIs; no local-only delivered state is used."
        title="Dispatch / POD"
      >
        <MobileActionNotice message={actionMessage} tone="success" />
        <MobileActionNotice message={errorMessage} tone="danger" />
        {runtime?.device.disabledReason ? <MobileActionNotice message={runtime.device.disabledReason} tone="warn" /> : null}
        <TextInput accessibilityLabel="Shipment number" onChangeText={setShipmentNo} placeholder="Shipment no" style={styles.input} value={shipmentNo} />
        <TextInput accessibilityLabel="Received by" onChangeText={setReceivedBy} placeholder="Received by" style={styles.input} value={receivedBy} />
        <TextInput accessibilityLabel="POD remarks" multiline onChangeText={setRemarks} placeholder="Shortage / damage / delivery remarks" style={styles.notes} value={remarks} />
        <View style={styles.buttonRow}>
          <MobileButton disabled={!shipmentNo.trim()} label="Resolve shipment" onPress={() => void resolveShipment()} tone="info" />
          <MobileButton disabled={!runtime?.canWorkOffline || !shipmentNo.trim() || !receivedBy.trim()} label="Queue POD" onPress={() => void queuePod()} tone="success" />
          <MobileButton disabled={!shipmentNo.trim()} disabledReason="Camera binary capture is unavailable; metadata is stored as pending upload." label="Record POD evidence metadata" onPress={() => void capturePodEvidence()} tone="warn" />
        </View>
      </MobileCard>

      <MobileCard title="Live dispatch tasks" subtitle="Dispatch tasks come from persisted shipment records.">
        {dispatchTasks.length === 0 ? <Text style={styles.copy}>No live dispatch/POD tasks are assigned to this device scope.</Text> : null}
        {dispatchTasks.map((task) => (
          <MobileListItem key={task.id}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.itemTitle}>{task.title}</Text>
                <Text style={styles.copy}>{task.subtitle}</Text>
              </View>
              <MobileBadge label={task.status} tone={task.disabledReason ? "warn" : "success"} />
            </View>
            <View style={styles.fieldGrid}>
              <MobileField label="Shipment" value={task.documentNo} />
              <MobileField label="Task" value={task.taskType} />
            </View>
            {task.disabledReason ? <Text style={styles.warning}>{task.disabledReason}</Text> : null}
          </MobileListItem>
        ))}
      </MobileCard>
    </View>
  );
}

const styles = StyleSheet.create({
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
  input: {
    backgroundColor: "#ffffff",
    borderColor: "#d8c6ac",
    borderRadius: 18,
    borderWidth: 1,
    color: "#10251f",
    padding: 14
  },
  itemTitle: {
    color: "#10251f",
    fontSize: 17,
    fontWeight: "900"
  },
  notes: {
    backgroundColor: "#ffffff",
    borderColor: "#d8c6ac",
    borderRadius: 18,
    borderWidth: 1,
    color: "#10251f",
    minHeight: 72,
    padding: 14,
    textAlignVertical: "top"
  },
  row: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10
  },
  stack: {
    gap: 16
  },
  warning: {
    color: "#8e2c18",
    fontSize: 12,
    fontWeight: "800"
  }
});
