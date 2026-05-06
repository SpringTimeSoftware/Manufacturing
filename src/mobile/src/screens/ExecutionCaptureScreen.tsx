import { StyleSheet, Text, TextInput, View } from "react-native";
import { seededJobCards, seededQuantityPresets } from "../mobileSeedData";
import {
  MobileBadge,
  MobileButton,
  MobileCard,
  MobileField,
  MobileListItem
} from "../ui/mobileComponents";

export function ExecutionCaptureScreen() {
  const activeJob = seededJobCards[0];

  return (
    <View style={styles.stack}>
      <MobileCard title="Execution Action Sheet" subtitle="Start, pause, resume, and complete actions with explicit reasons.">
        <MobileListItem>
          <Text style={styles.title}>{`${activeJob.jobCardNo} / ${activeJob.operationName}`}</Text>
          <Text style={styles.copy}>{`${activeJob.machineLabel} / ${activeJob.status}`}</Text>
          <View style={styles.buttonGrid}>
            <MobileButton label="Start" tone="success" />
            <MobileButton label="Pause" tone="warn" />
            <MobileButton label="Resume" tone="info" />
            <MobileButton label="Complete" tone="success" />
          </View>
          <MobileField label="Reason" value="POWER_FLUCTUATION or OPERATOR_BREAK when pause/down is selected" />
        </MobileListItem>
      </MobileCard>

      <MobileCard title="Good / Reject / Scrap Entry" subtitle="Quantity posting remains offline-safe with notes and evidence labels.">
        {seededQuantityPresets.map((preset) => (
          <MobileListItem key={preset.id}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.title}>{preset.label}</Text>
                <Text style={styles.copy}>{`Reason: ${preset.reasonCode} / ${preset.evidenceLabel}`}</Text>
              </View>
              <MobileBadge label={preset.quantity} tone={preset.id === "qty-good" ? "success" : "warn"} />
            </View>
          </MobileListItem>
        ))}
        <TextInput accessibilityLabel="Quantity notes" multiline placeholder="Add operator note or photo reference" style={styles.input} />
        <MobileButton label="Queue quantity posting" tone="success" />
      </MobileCard>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonGrid: {
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
  }
});
