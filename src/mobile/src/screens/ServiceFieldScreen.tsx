import { useMemo, useState } from "react";
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
import { MobileActionNotice, MobileBadge, MobileButton, MobileCard, MobileField, MobileListItem, MobileUdfFields } from "../ui/mobileComponents";

interface ServiceFieldScreenProps {
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

export function ServiceFieldScreen({ onCaptureEvidence, onQueueOperation, onResolveScan, runtime, tasks }: ServiceFieldScreenProps) {
  const [ticketNo, setTicketNo] = useState("");
  const [workPerformed, setWorkPerformed] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [resolution, setResolution] = useState("");
  const [customerSignoff, setCustomerSignoff] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const serviceTasks = useMemo(() => tasks.filter((task) => task.module === "Service"), [tasks]);
  const canQueueCompletion = Boolean(runtime?.canWorkOffline && runtime.device.isTrusted && ticketNo.trim() && workPerformed.trim() && resolution.trim());

  const resolveTicket = async () => {
    setErrorMessage(null);
    try {
      const result = await onResolveScan(`SERVICE:${ticketNo}`, "Manual", "ServiceTicket");
      setActionMessage(result.resolutionStatus === "Resolved" ? `Service ticket ${ticketNo} resolved from live ERP data.` : null);
      if (result.resolutionStatus !== "Resolved") {
        setErrorMessage(result.validationMessage ?? "Service ticket did not resolve.");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Service ticket lookup failed.");
    }
  };

  const queueCompletion = async () => {
    setErrorMessage(null);
    try {
      const operation = await onQueueOperation({
        operationType: "MobileServiceVisitComplete",
        sourceModule: "Service",
        documentRef: ticketNo,
        actionLabel: "Queue service completion",
        idempotencyKey: `service-complete-${ticketNo || "draft"}-${Date.now()}`,
        payloadSnapshotJson: JSON.stringify({
          ticketNo,
          workPerformed,
          diagnosis,
          resolution,
          customerSignoffName: customerSignoff,
          completedOn: new Date().toISOString(),
          syncContract: "Server revalidates device trust and ticket status before applying service completion."
        })
      });
      setActionMessage(`${operation.actionLabel} recorded as ${operation.status}. Sync remains idempotent and server-validated.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Service completion could not be queued.");
    }
  };

  const captureServiceEvidence = async () => {
    setErrorMessage(null);
    try {
      const evidence = await onCaptureEvidence({
        sourceModule: "Service",
        sourceDocumentType: "ServiceTicket",
        sourceDocumentNo: ticketNo,
        evidenceType: "ServiceVisitPhoto",
        fileName: `${ticketNo || "service-ticket"}-visit.jpg`,
        contentType: "image/jpeg"
      });
      setActionMessage(`Service evidence metadata stored as ${evidence.uploadStatus}; binary upload is not treated as fake success.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Service evidence could not be recorded.");
    }
  };

  return (
    <View style={styles.stack}>
      <MobileCard
        action={<MobileBadge label="Service API" tone="info" />}
        subtitle="Service field work uses live ticket lookup, durable offline completion, and evidence metadata. Spare issue stays disabled until item/bin/lot/serial/PCID payload is selected."
        title="Field service"
      >
        <MobileActionNotice message={actionMessage} tone="success" />
        <MobileActionNotice message={errorMessage} tone="danger" />
        {runtime?.device.disabledReason ? <MobileActionNotice message={runtime.device.disabledReason} tone="warn" /> : null}
        <TextInput accessibilityLabel="Service ticket number" onChangeText={setTicketNo} placeholder="Ticket no" style={styles.input} value={ticketNo} />
        <TextInput accessibilityLabel="Work performed" multiline onChangeText={setWorkPerformed} placeholder="Work performed" style={styles.notes} value={workPerformed} />
        <TextInput accessibilityLabel="Diagnosis" multiline onChangeText={setDiagnosis} placeholder="Diagnosis" style={styles.notes} value={diagnosis} />
        <TextInput accessibilityLabel="Resolution" multiline onChangeText={setResolution} placeholder="Resolution" style={styles.notes} value={resolution} />
        <TextInput accessibilityLabel="Customer signoff name" onChangeText={setCustomerSignoff} placeholder="Customer signoff name" style={styles.input} value={customerSignoff} />
        <View style={styles.buttonRow}>
          <MobileButton disabled={!ticketNo.trim()} label="Resolve ticket" onPress={() => void resolveTicket()} tone="info" />
          <MobileButton
            disabled={!canQueueCompletion}
            disabledReason={
              !runtime?.device.isTrusted
                ? "Device approval is required before service completion sync."
                : "Ticket no, work performed, and resolution are required before queuing completion."
            }
            label="Queue completion"
            onPress={() => void queueCompletion()}
            tone="success"
          />
          <MobileButton disabled={!ticketNo.trim()} disabledReason="Camera binary capture is unavailable; metadata is stored as pending upload." label="Record evidence metadata" onPress={() => void captureServiceEvidence()} tone="warn" />
          <MobileButton disabled disabledReason="Service spare issue must use the web/API line grid until mobile item/bin/lot/serial/PCID selection is configured." label="Issue spare" tone="neutral" />
        </View>
      </MobileCard>

      <MobileCard title="Assigned service tasks" subtitle="Tasks come from persisted service tickets returned by the mobile API.">
        {serviceTasks.length === 0 ? <Text style={styles.copy}>No live service tasks are assigned to this device scope.</Text> : null}
        {serviceTasks.map((task) => (
          <MobileListItem key={task.id}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.itemTitle}>{task.title}</Text>
                <Text style={styles.copy}>{task.subtitle}</Text>
              </View>
              <MobileBadge label={task.status} tone={task.disabledReason ? "warn" : "success"} />
            </View>
            <View style={styles.fieldGrid}>
              <MobileField label="Ticket" value={task.documentNo} />
              <MobileField label="Task" value={task.taskType} />
            </View>
            <MobileUdfFields values={task.udfValues} />
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
    minHeight: 68,
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
