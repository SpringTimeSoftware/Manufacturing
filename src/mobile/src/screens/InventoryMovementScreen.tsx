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

interface InventoryMovementScreenProps {
  activeContext: MobileContext;
  onQueueOperation: (input: QueueOfflineOperationInput) => Promise<OfflineQueueEntry>;
  onResolveScan: (scanValue: string, scanSource: MobileScanSource, scanContext: string) => Promise<MobileScanResult>;
  runtime: MobileRuntimeContext | null;
  tasks: MobileTask[];
}

export function InventoryMovementScreen({ activeContext, onQueueOperation, onResolveScan, runtime, tasks }: InventoryMovementScreenProps) {
  const [scanValue, setScanValue] = useState("");
  const [quantity, setQuantity] = useState("");
  const [scanResult, setScanResult] = useState<MobileScanResult | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inventoryTasks = tasks.filter((task) => task.module === "Inventory");

  const resolveInventoryScan = async () => {
    setErrorMessage(null);
    try {
      const result = await onResolveScan(scanValue, "Manual", "InventoryMovement");
      setScanResult(result);
      setActionMessage(result.resolutionStatus === "Resolved" ? `Resolved ${result.resolvedEntityType} ${result.resolvedEntityCode ?? ""}.` : null);
      if (result.resolutionStatus !== "Resolved") {
        setErrorMessage(result.validationMessage ?? "Inventory scan did not resolve.");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Inventory scan failed.");
    }
  };

  const queueMovement = async (operationType: "StockTransferDraft" | "CycleCountDraft") => {
    setErrorMessage(null);
    try {
      const operation = await onQueueOperation({
        operationType,
        sourceModule: "Inventory",
        documentRef: scanResult?.resolvedEntityCode ?? scanValue,
        actionLabel: operationType === "StockTransferDraft" ? "Queue stock transfer draft" : "Queue cycle count draft",
        idempotencyKey: `${operationType}-${Date.now()}`,
        payloadSnapshotJson: JSON.stringify({
          movementValidation: null,
          scanEventId: scanResult?.scanEventId,
          scanValue,
          quantity,
          context: activeContext
        })
      });
      setActionMessage(`${operation.actionLabel} recorded as ${operation.status}. Final posting will be server-validated during sync.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Movement could not be queued.");
    }
  };

  return (
    <View style={styles.stack}>
      <MobileCard title="Inventory movement" subtitle="Bin, lot, serial, and PCID requirements are resolved by the shared inventory service at sync time.">
        <MobileActionNotice message={actionMessage} tone="success" />
        <MobileActionNotice message={errorMessage} tone="danger" />
        {runtime?.device.disabledReason ? <MobileActionNotice message={runtime.device.disabledReason} tone="warn" /> : null}
        <TextInput accessibilityLabel="Inventory scan" onChangeText={setScanValue} placeholder="Scan or enter item/bin/lot/serial/PCID" style={styles.input} value={scanValue} />
        <TextInput accessibilityLabel="Movement quantity" keyboardType="numeric" onChangeText={setQuantity} placeholder="Quantity" style={styles.input} value={quantity} />
        <MobileButton disabled={!scanValue.trim()} label="Resolve inventory scan through live API" onPress={() => void resolveInventoryScan()} tone="info" />
        {scanResult ? (
          <MobileListItem>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.title}>{scanResult.resolvedEntityType ?? "Unresolved scan"}</Text>
                <Text style={styles.copy}>{scanResult.validationMessage ?? scanResult.resolvedEntityCode ?? scanResult.scanValue}</Text>
              </View>
              <MobileBadge label={scanResult.resolutionStatus} tone={scanResult.resolutionStatus === "Resolved" ? "success" : "warn"} />
            </View>
            <MobileField label="Manual source" value="Manual fallback, not camera scan" />
          </MobileListItem>
        ) : null}
        <MobileButton disabled={!runtime?.canWorkOffline || !scanResult || !quantity.trim()} label="Queue transfer draft" onPress={() => void queueMovement("StockTransferDraft")} tone="success" />
        <MobileButton disabled={!runtime?.canWorkOffline || !scanResult || !quantity.trim()} label="Queue cycle count draft" onPress={() => void queueMovement("CycleCountDraft")} tone="warn" />
      </MobileCard>

      <MobileCard title="Live inventory tasks" subtitle="No seeded count or putaway rows are shown in authenticated mode.">
        {inventoryTasks.length === 0 ? <Text style={styles.copy}>No live inventory movement tasks are assigned to this device scope.</Text> : null}
        {inventoryTasks.map((task) => (
          <MobileListItem key={task.id}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.title}>{task.title}</Text>
                <Text style={styles.copy}>{task.subtitle}</Text>
              </View>
              <MobileBadge label={task.status} tone={task.disabledReason ? "warn" : "success"} />
            </View>
            {task.disabledReason ? <Text style={styles.warning}>{task.disabledReason}</Text> : null}
          </MobileListItem>
        ))}
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
