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

interface QualityCaptureScreenProps {
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

export function QualityCaptureScreen({ onCaptureEvidence, onQueueOperation, onResolveScan, runtime, tasks }: QualityCaptureScreenProps) {
  const [documentNo, setDocumentNo] = useState("");
  const [actualValue, setActualValue] = useState("");
  const [notes, setNotes] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const qualityTasks = tasks.filter((task) => task.module === "Quality");

  const queueQualityDraft = async (result: "Pass" | "Fail") => {
    setErrorMessage(null);
    try {
      const operation = await onQueueOperation({
        operationType: result === "Pass" ? "QualityInspectionDraft" : "NcrDraft",
        sourceModule: "Quality",
        documentRef: documentNo || "quality-draft",
        actionLabel: result === "Pass" ? "Queue pass result" : "Queue fail/NCR draft",
        idempotencyKey: `quality-${result}-${Date.now()}`,
        payloadSnapshotJson: JSON.stringify({
          documentNo,
          actualValue,
          notes,
          result,
          reviewRequired: true
        })
      });
      setActionMessage(`${operation.actionLabel} recorded as ${operation.status}. Quality API validation runs during sync.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Quality draft could not be queued.");
    }
  };

  const resolveInspection = async () => {
    setErrorMessage(null);
    try {
      const result = await onResolveScan(`INSPECTION:${documentNo}`, "Manual", "QualityInspection");
      setActionMessage(result.resolutionStatus === "Resolved" ? `Inspection ${documentNo} resolved.` : null);
      if (result.resolutionStatus !== "Resolved") {
        setErrorMessage(result.validationMessage ?? "Inspection did not resolve.");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Inspection lookup failed.");
    }
  };

  const captureEvidence = async () => {
    setErrorMessage(null);
    try {
      const evidence = await onCaptureEvidence({
        sourceModule: "Quality",
        sourceDocumentType: "Inspection",
        sourceDocumentNo: documentNo,
        evidenceType: "InspectionPhoto",
        fileName: `${documentNo || "inspection"}-evidence.jpg`,
        contentType: "image/jpeg"
      });
      setActionMessage(`Evidence metadata stored as ${evidence.uploadStatus}; binary upload status is explicit.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Evidence could not be recorded.");
    }
  };

  return (
    <View style={styles.stack}>
      <MobileCard title="QC checkpoint entry" subtitle="Inspection and NCR records are queued with review/audit state; no local-only pass/fail success.">
        <MobileActionNotice message={actionMessage} tone="warn" />
        <MobileActionNotice message={errorMessage} tone="danger" />
        {runtime?.device.disabledReason ? <MobileActionNotice message={runtime.device.disabledReason} tone="warn" /> : null}
        <TextInput accessibilityLabel="Inspection number" onChangeText={setDocumentNo} placeholder="Inspection number" style={styles.input} value={documentNo} />
        <TextInput accessibilityLabel="Actual value" onChangeText={setActualValue} placeholder="Actual measured value" style={styles.input} value={actualValue} />
        <TextInput accessibilityLabel="Quality remarks" multiline onChangeText={setNotes} placeholder="Remarks / NCR context" style={styles.notes} value={notes} />
        <MobileButton disabled={!documentNo.trim()} label="Resolve inspection through live API" onPress={() => void resolveInspection()} tone="info" />
        <View style={styles.buttonRow}>
          <MobileButton disabled={!runtime?.canWorkOffline || !documentNo.trim()} label="Queue pass result" onPress={() => void queueQualityDraft("Pass")} tone="success" />
          <MobileButton disabled={!runtime?.canWorkOffline || !documentNo.trim()} label="Queue fail / NCR draft" onPress={() => void queueQualityDraft("Fail")} tone="danger" />
        </View>
        <MobileButton disabled={!documentNo.trim()} disabledReason="Camera binary capture is unavailable in this runtime; metadata is recorded as pending upload." label="Record evidence metadata" onPress={() => void captureEvidence()} tone="warn" />
      </MobileCard>

      <MobileCard title="Live quality tasks" subtitle="Tasks come from persisted inspection/NCR rows.">
        {qualityTasks.length === 0 ? <Text style={styles.copy}>No live quality tasks are assigned to this device scope.</Text> : null}
        {qualityTasks.map((task) => (
          <MobileListItem key={task.id}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.title}>{task.title}</Text>
                <Text style={styles.copy}>{task.subtitle}</Text>
              </View>
              <MobileBadge label={task.status} tone={task.disabledReason ? "warn" : "info"} />
            </View>
            <MobileField label="Source" value={task.documentNo} />
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
    gap: 10
  },
  copy: {
    color: "#5c6f68",
    lineHeight: 20
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
  title: {
    color: "#10251f",
    fontSize: 17,
    fontWeight: "900"
  },
  warning: {
    color: "#8e2c18",
    fontSize: 12,
    fontWeight: "800"
  }
});
