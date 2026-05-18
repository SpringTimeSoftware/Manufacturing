import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import type { MobilePhotoEvidence, MobileRuntimeContext, MobileScanResult, MobileScanSource } from "../mobileTypes";
import { MobileActionNotice, MobileBadge, MobileButton, MobileCard, MobileField, MobileListItem } from "../ui/mobileComponents";

interface DeviceUtilitiesScreenProps {
  onCaptureEvidence: (input: {
    sourceModule: string;
    sourceDocumentType: string;
    sourceDocumentId?: number | null;
    sourceDocumentNo?: string | null;
    evidenceType: string;
    fileName: string;
    contentType: string;
  }) => Promise<MobilePhotoEvidence>;
  onResolveScan: (scanValue: string, scanSource: MobileScanSource, scanContext: string) => Promise<MobileScanResult>;
  runtime: MobileRuntimeContext | null;
}

export function DeviceUtilitiesScreen({ onCaptureEvidence, onResolveScan, runtime }: DeviceUtilitiesScreenProps) {
  const [scanValue, setScanValue] = useState("");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resolveHardwareScan = async (source: MobileScanSource) => {
    setErrorMessage(null);
    try {
      const result = await onResolveScan(scanValue, source, "DeviceUtility");
      setActionMessage(`${source} scan recorded as ${result.resolutionStatus}.`);
      if (result.resolutionStatus !== "Resolved") {
        setErrorMessage(result.validationMessage ?? "Scan did not resolve.");
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Scan failed.");
    }
  };

  const recordEvidenceMetadata = async () => {
    setErrorMessage(null);
    try {
      const evidence = await onCaptureEvidence({
        sourceModule: "Mobile",
        sourceDocumentType: "DeviceUtility",
        sourceDocumentNo: "MOBILE-EVIDENCE",
        evidenceType: "DevicePhoto",
        fileName: "mobile-device-evidence.jpg",
        contentType: "image/jpeg"
      });
      setActionMessage(`Evidence metadata stored as ${evidence.uploadStatus}.`);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Evidence metadata could not be stored.");
    }
  };

  return (
    <View style={styles.stack}>
      <MobileCard
        action={<MobileBadge label={runtime?.device.trustStatus ?? "Pending"} tone={runtime?.device.isTrusted ? "success" : "warn"} />}
        subtitle="Scanner, camera, attachment, and offline capabilities are persisted on the device registration."
        title="Barcode / QR / Camera Utilities"
      >
        <MobileActionNotice message={actionMessage} tone="info" />
        <MobileActionNotice message={errorMessage} tone="danger" />
        {runtime?.disabledReasons.map((reason) => (
          <MobileActionNotice key={reason} message={reason} tone="warn" />
        ))}
        <MobileListItem>
          <View style={styles.row}>
            <View style={styles.flex}>
              <Text style={styles.itemTitle}>Device trust</Text>
              <Text style={styles.copy}>Revoked devices cannot sync or post; untrusted devices cannot post stock, quality, dispatch, or POD.</Text>
            </View>
            <MobileBadge label={runtime?.device.status ?? "Unknown"} tone={runtime?.canPostStock ? "success" : "warn"} />
          </View>
          <MobileField label="Device code" value={runtime?.device.deviceCode ?? "Not registered"} />
          <MobileField label="Scanner" value={runtime?.device.scannerCapability ?? "Unknown"} />
          <MobileField label="Camera" value={runtime?.device.cameraCapability ?? "Unknown"} />
        </MobileListItem>
        <TextInput accessibilityLabel="Device utility barcode" onChangeText={setScanValue} placeholder="Scan value" style={styles.input} value={scanValue} />
        <View style={styles.buttonRow}>
          <MobileButton disabled={!scanValue.trim()} label="Hardware scan" onPress={() => void resolveHardwareScan("Hardware")} tone="success" />
          <MobileButton disabled={!scanValue.trim()} label="Manual entry fallback" onPress={() => void resolveHardwareScan("Manual")} tone="warn" />
          <MobileButton
            disabled={!scanValue.trim() || runtime?.device.cameraCapability !== "Available"}
            disabledReason="Camera barcode scanning requires a runtime camera adapter and permission grant."
            label="Camera scan"
            onPress={() => void resolveHardwareScan("Camera")}
            tone="info"
          />
        </View>
      </MobileCard>

      <MobileCard title="Photo evidence" subtitle="Binary upload is explicit; metadata-only evidence is stored as pending upload, not fake success.">
        <MobileButton
          disabled={runtime?.device.isRevoked}
          disabledReason="Revoked devices cannot capture or sync evidence."
          label="Record pending photo evidence metadata"
          onPress={() => void recordEvidenceMetadata()}
          tone="warn"
        />
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
  row: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10
  },
  stack: {
    gap: 16
  }
});
