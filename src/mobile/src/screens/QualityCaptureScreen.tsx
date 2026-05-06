import { StyleSheet, Text, TextInput, View } from "react-native";
import { seededNcrTasks, seededQualityTasks } from "../mobileSeedData";
import type { MobileTone, QualityTask } from "../mobileTypes";
import {
  MobileBadge,
  MobileButton,
  MobileCard,
  MobileField,
  MobileListItem
} from "../ui/mobileComponents";

function resultTone(result: QualityTask["result"]): MobileTone {
  if (result === "Pass") {
    return "success";
  }

  if (result === "Fail") {
    return "danger";
  }

  return "warn";
}

export function QualityCaptureScreen() {
  return (
    <View style={styles.stack}>
      <MobileCard title="QC Checkpoint Entry" subtitle="Pass/fail/measurement/photo capture for in-process and final checkpoints.">
        {seededQualityTasks.map((task) => (
          <MobileListItem key={task.id}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.title}>{task.inspectionNo}</Text>
                <Text style={styles.copy}>{`${task.checkpointLabel} / ${task.sourceDocument}`}</Text>
              </View>
              <MobileBadge label={task.result} tone={resultTone(task.result)} />
            </View>
            <MobileField label="Expected" value={task.expectedValue} />
            <TextInput accessibilityLabel={`${task.inspectionNo} actual value`} defaultValue={task.actualValue} style={styles.input} />
            <Text style={styles.audit}>{task.photoLabel}</Text>
            <View style={styles.buttonRow}>
              <MobileButton label="Pass" tone="success" />
              <MobileButton label="Fail" tone="danger" />
            </View>
          </MobileListItem>
        ))}
      </MobileCard>

      <MobileCard title="Rework / NCR Capture" subtitle="Create deviation, hold, and rework instruction without destructive resets.">
        {seededNcrTasks.map((task) => (
          <MobileListItem key={task.id}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.title}>{task.ncrNo}</Text>
                <Text style={styles.copy}>{`${task.sourceDocument} / ${task.instruction}`}</Text>
              </View>
              <MobileBadge label={task.disposition} tone="warn" />
            </View>
            <TextInput accessibilityLabel={`${task.ncrNo} instruction`} defaultValue={task.instruction} multiline style={styles.notes} />
            <MobileButton label="Queue NCR / rework capture" tone="warn" />
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
  }
});
