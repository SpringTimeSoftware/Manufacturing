import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { seededDeviceUtilities, seededMediaUploads } from "../mobileSeedData";
import { MobileActionNotice, MobileBadge, MobileButton, MobileCard, MobileListItem } from "../ui/mobileComponents";

function capabilityTone(status: "Available" | "NeedsPermission" | "OfflineQueued" | "Unavailable") {
  if (status === "Available") {
    return "success";
  }

  if (status === "Unavailable") {
    return "danger";
  }

  return status === "NeedsPermission" ? "warn" : "info";
}

export function DeviceUtilitiesScreen() {
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const runUtility = (label: string) => () => setActionMessage(`${label} captured in the device queue.`);

  return (
    <View style={styles.stack}>
      <MobileCard
        action={<MobileBadge label="Device ready" tone="info" />}
        subtitle="Scanner, camera, attachment, and voice capture availability is shown with clear device-state handling."
        title="Barcode / QR / Camera Utilities"
      >
        <MobileActionNotice message={actionMessage} tone="info" />
        {seededDeviceUtilities.map((utility) => (
          <MobileListItem key={utility.id}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.itemTitle}>{utility.utilityName}</Text>
                <Text style={styles.copy}>{utility.lastUsedLabel}</Text>
              </View>
              <MobileBadge label={utility.capabilityStatus} tone={capabilityTone(utility.capabilityStatus)} />
            </View>
            <MobileButton
              disabled={utility.capabilityStatus === "NeedsPermission" || utility.capabilityStatus === "Unavailable"}
              disabledReason={utility.capabilityStatus === "NeedsPermission" ? "Camera permission must be granted by the native device adapter." : "This device capability is not available."}
              label={utility.actionLabel}
              onPress={runUtility(utility.utilityName)}
              tone={utility.tone}
            />
          </MobileListItem>
        ))}
      </MobileCard>

      <MobileCard title="Reusable attachment queue" subtitle="The same capture model feeds handover, dispatch, QC, inventory, and production evidence.">
        {seededMediaUploads.map((upload) => (
          <MobileListItem key={upload.id}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.itemTitle}>{upload.sourceDocument}</Text>
                <Text style={styles.copy}>{`${upload.captureType} / ${upload.fileLabel}`}</Text>
              </View>
              <MobileBadge label={upload.status} tone={upload.status === "Failed" ? "danger" : "info"} />
            </View>
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
