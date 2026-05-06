import { StyleSheet, Text, TextInput, View } from "react-native";
import { seededMaterialTasks } from "../mobileSeedData";
import {
  MobileBadge,
  MobileButton,
  MobileCard,
  MobileField,
  MobileListItem
} from "../ui/mobileComponents";

export function MaterialScanScreen() {
  return (
    <View style={styles.stack}>
      <MobileCard title="Material Issue Scan" subtitle="Scan bin/barcode and issue material to work order or job card.">
        <TextInput accessibilityLabel="Issue barcode" placeholder="Scan or enter material barcode" style={styles.input} />
        {seededMaterialTasks.filter((task) => task.mode === "Issue").map((task) => (
          <MobileListItem key={task.id}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.title}>{task.itemLabel}</Text>
                <Text style={styles.copy}>{`${task.sourceBin} -> ${task.targetDocument}`}</Text>
              </View>
              <MobileBadge label={task.quantity} tone="info" />
            </View>
            <MobileField label="Scan" value={task.barcodeValue} />
            <MobileButton label="Queue issue" tone="success" />
          </MobileListItem>
        ))}
      </MobileCard>

      <MobileCard title="Material Return Scan" subtitle="Scan unused material and return it with quantity and audit context.">
        <TextInput accessibilityLabel="Return barcode" placeholder="Scan return barcode or bin label" style={styles.input} />
        {seededMaterialTasks.filter((task) => task.mode === "Return").map((task) => (
          <MobileListItem key={task.id}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.title}>{task.itemLabel}</Text>
                <Text style={styles.copy}>{`${task.sourceBin} -> ${task.targetDocument}`}</Text>
              </View>
              <MobileBadge label={task.status} tone="warn" />
            </View>
            <MobileField label="Quantity" value={task.quantity} />
            <MobileButton label="Queue return" tone="warn" />
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
  }
});
