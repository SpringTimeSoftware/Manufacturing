import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import type {
  MobileContext,
  MobileRuntimeContext,
  MobileScanResult,
  MobileScanSource,
  MobileTask,
  OfflineQueueEntry,
  QueueOfflineOperationInput
} from "../mobileTypes";
import { MobileActionNotice, MobileBadge, MobileButton, MobileCard, MobileField, MobileListItem } from "../ui/mobileComponents";

interface MaterialScanScreenProps {
  activeContext: MobileContext;
  onQueueOperation: (input: QueueOfflineOperationInput) => Promise<OfflineQueueEntry>;
  onResolveScan: (scanValue: string, scanSource: MobileScanSource, scanContext: string) => Promise<MobileScanResult>;
  runtime: MobileRuntimeContext | null;
  tasks: MobileTask[];
}

export function MaterialScanScreen({ activeContext, onQueueOperation, onResolveScan, runtime, tasks }: MaterialScanScreenProps) {
  const [scanValue, setScanValue] = useState("");
  const [scanSource, setScanSource] = useState<MobileScanSource>("Manual");
  const [scanResult, setScanResult] = useState<MobileScanResult | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const materialTasks = tasks.filter((task) => task.module === "Production" || task.module === "Inventory");
  const deviceDisabledReason = runtime?.device.disabledReason ?? null;

  const resolveCurrentScan = async () => {
    setErrorMessage(null);
    try {
      const result = await onResolveScan(scanValue, scanSource, "MaterialIssue");
      setScanResult(result);
      setActionMessage(result.resolutionStatus === "Resolved" ? `Resolved ${result.resolvedEntityType} ${result.resolvedEntityCode ?? result.resolvedEntityId}.` : null);
      if (result.resolutionStatus !== "Resolved") {
        setErrorMessage(result.validationMessage ?? "Scan did not resolve to a live ERP record.");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Scan failed.");
    }
  };

  const queueDraft = async (operationType: "StockIssueDraft" | "StockReturnDraft") => {
    setErrorMessage(null);
    try {
      const operation = await onQueueOperation({
        operationType,
        sourceModule: "Inventory",
        documentRef: scanResult?.resolvedEntityCode ?? scanValue,
        actionLabel: operationType === "StockIssueDraft" ? "Queue issue draft" : "Queue return draft",
        idempotencyKey: `${operationType}-${Date.now()}`,
        payloadSnapshotJson: JSON.stringify({
          movementValidation: null,
          scanEventId: scanResult?.scanEventId,
          scanValue,
          scanSource,
          context: activeContext
        })
      });
      setActionMessage(`${operation.actionLabel} recorded as ${operation.status}. Sync will re-run server-side inventory validation before posting.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Offline operation could not be queued.");
    }
  };

  return (
    <View style={styles.stack}>
      <MobileCard title="Material scan" subtitle="Scan or manually enter a barcode; manual entry is never treated as camera evidence.">
        <MobileActionNotice message={actionMessage} tone="success" />
        <MobileActionNotice message={errorMessage} tone="danger" />
        {deviceDisabledReason ? <MobileActionNotice message={deviceDisabledReason} tone="warn" /> : null}
        <View style={styles.sourceRow}>
          {(["Manual", "Hardware", "Camera"] as MobileScanSource[]).map((source) => {
            const disabled = source === "Camera" && runtime?.device.cameraCapability !== "Available";
            return (
              <MobileButton
                disabled={disabled}
                key={source}
                label={disabled ? "Camera unavailable" : source}
                onPress={() => setScanSource(source)}
                tone={scanSource === source ? "success" : "neutral"}
              />
            );
          })}
        </View>
        <TextInput accessibilityLabel="Material barcode" onChangeText={setScanValue} placeholder="Scan item/bin/lot/serial/PCID barcode" style={styles.input} value={scanValue} />
        <MobileButton disabled={!scanValue.trim()} label="Resolve scan through live API" onPress={() => void resolveCurrentScan()} tone="info" />
        {scanResult ? (
          <MobileListItem>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.title}>{scanResult.resolvedEntityType ?? "Unresolved scan"}</Text>
                <Text style={styles.copy}>{scanResult.validationMessage ?? scanResult.resolvedEntityCode ?? scanResult.scanValue}</Text>
              </View>
              <MobileBadge label={scanResult.resolutionStatus} tone={scanResult.resolutionStatus === "Resolved" ? "success" : "warn"} />
            </View>
            <MobileField label="Scan source" value={scanResult.scanSource} />
          </MobileListItem>
        ) : null}
      </MobileCard>

      <MobileCard title="Material issue / return" subtitle="Posting requires trusted device status and server inventory validation during sync.">
        {materialTasks.length === 0 ? <Text style={styles.copy}>No live material issue or return tasks are assigned for this device scope.</Text> : null}
        {materialTasks.map((task) => (
          <MobileListItem key={task.id}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.title}>{task.title}</Text>
                <Text style={styles.copy}>{task.subtitle}</Text>
              </View>
              <MobileBadge label={task.status} tone={task.disabledReason ? "warn" : "info"} />
            </View>
            {task.disabledReason ? <Text style={styles.warning}>{task.disabledReason}</Text> : null}
          </MobileListItem>
        ))}
        <MobileButton disabled={!scanResult || scanResult.resolutionStatus !== "Resolved" || !runtime?.canWorkOffline} label="Queue issue draft" onPress={() => void queueDraft("StockIssueDraft")} tone="success" />
        <MobileButton disabled={!scanResult || scanResult.resolutionStatus !== "Resolved" || !runtime?.canWorkOffline} label="Queue return draft" onPress={() => void queueDraft("StockReturnDraft")} tone="warn" />
      </MobileCard>
    </View>
  );
}

const styles = StyleSheet.create({
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
  row: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10
  },
  sourceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
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
