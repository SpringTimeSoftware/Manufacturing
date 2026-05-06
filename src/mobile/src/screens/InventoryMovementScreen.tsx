import { StyleSheet, Text, TextInput, View } from "react-native";
import { seededInventoryTasks } from "../mobileSeedData";
import type { InventoryMovementTask, MobileTone } from "../mobileTypes";
import {
  MobileBadge,
  MobileButton,
  MobileCard,
  MobileField,
  MobileListItem
} from "../ui/mobileComponents";

function statusTone(task: InventoryMovementTask): MobileTone {
  if (task.status === "Recount") {
    return "warn";
  }

  if (task.status === "Queued") {
    return "info";
  }

  return "success";
}

export function InventoryMovementScreen() {
  return (
    <View style={styles.stack}>
      <MobileCard title="Bin Transfer / Putaway" subtitle="Move stock between bins or warehouses with scan-first confirmation.">
        <TextInput accessibilityLabel="Transfer scan" placeholder="Scan item, bin, lot, or serial" style={styles.input} />
        {seededInventoryTasks.filter((task) => task.mode !== "CycleCount").map((task) => (
          <MobileListItem key={task.id}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.title}>{task.itemLabel}</Text>
                <Text style={styles.copy}>{`${task.fromLocation} -> ${task.toLocation}`}</Text>
              </View>
              <MobileBadge label={task.mode} tone={statusTone(task)} />
            </View>
            <MobileField label="Scan" value={task.scanValue} />
            <MobileField label="Quantity" value={task.quantity} />
            <MobileButton label={`Queue ${task.mode.toLowerCase()}`} tone="success" />
          </MobileListItem>
        ))}
      </MobileCard>

      <MobileCard title="Cycle Count" subtitle="Mobile counting and recount with explicit variance review.">
        {seededInventoryTasks.filter((task) => task.mode === "CycleCount").map((task) => (
          <MobileListItem key={task.id}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.title}>{task.itemLabel}</Text>
                <Text style={styles.copy}>{`${task.fromLocation} / ${task.toLocation}`}</Text>
              </View>
              <MobileBadge label={task.status} tone={statusTone(task)} />
            </View>
            <TextInput accessibilityLabel="Count quantity" defaultValue={task.quantity} style={styles.input} />
            <MobileButton label="Queue count" tone="warn" />
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
