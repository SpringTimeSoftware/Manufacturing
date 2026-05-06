import { StyleSheet, Text, TextInput, View } from "react-native";
import { seededNcrTasks, seededProductionOutputs } from "../mobileSeedData";
import {
  MobileBadge,
  MobileButton,
  MobileCard,
  MobileField,
  MobileListItem
} from "../ui/mobileComponents";

export function ProductionReceiptReworkScreen() {
  return (
    <View style={styles.stack}>
      <MobileCard title="Production Receipt" subtitle="Receive output with lot, serial, and catch-weight labels while offline-safe.">
        {seededProductionOutputs.map((output) => (
          <MobileListItem key={output.id}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.title}>{output.receiptNo}</Text>
                <Text style={styles.copy}>{`${output.workOrderNo} / ${output.jobCardNo}`}</Text>
              </View>
              <MobileBadge label={output.status} tone={output.status === "Queued" ? "info" : "warn"} />
            </View>
            <MobileField label="Item" value={output.itemLabel} />
            <View style={styles.fieldRow}>
              <MobileField label="Output" value={output.outputQty} />
              <MobileField label="Catch weight" value={output.catchWeightQty} />
            </View>
            <TextInput accessibilityLabel={`${output.receiptNo} lot serial`} defaultValue={output.lotSerialLabel} style={styles.input} />
            <MobileButton label="Queue output receipt" tone="success" />
          </MobileListItem>
        ))}
      </MobileCard>

      <MobileCard title="Rework / NCR Capture" subtitle="Create deviation, hold, and rework instruction linked to production output.">
        {seededNcrTasks.map((task) => (
          <MobileListItem key={task.id}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.title}>{task.ncrNo}</Text>
                <Text style={styles.copy}>{task.sourceDocument}</Text>
              </View>
              <MobileBadge label={task.disposition} tone="warn" />
            </View>
            <TextInput accessibilityLabel={`${task.ncrNo} rework instruction`} defaultValue={task.instruction} multiline style={styles.notes} />
            <MobileButton label="Queue rework instruction" tone="warn" />
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
  fieldRow: {
    flexDirection: "row",
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
