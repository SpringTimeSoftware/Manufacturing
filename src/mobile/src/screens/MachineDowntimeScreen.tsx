import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { seededMachineTasks } from "../mobileSeedData";
import type { MachineTask, MobileTone } from "../mobileTypes";
import {
  MobileActionNotice,
  MobileBadge,
  MobileButton,
  MobileCard,
  MobileField,
  MobileListItem
} from "../ui/mobileComponents";

function machineTone(status: MachineTask["status"]): MobileTone {
  if (status === "Running") {
    return "success";
  }

  if (status === "Down") {
    return "danger";
  }

  return "warn";
}

export function MachineDowntimeScreen() {
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const queueAction = (label: string, machine: MachineTask) => () => setActionMessage(`${label} queued for ${machine.machineLabel}.`);

  return (
    <View style={styles.stack}>
      <MobileCard title="Downtime Log" subtitle="Log machine stop, reason, photo reference, and escalation while offline.">
        <MobileActionNotice message={actionMessage} tone="warn" />
        {seededMachineTasks.filter((machine) => machine.status === "Down").map((machine) => (
          <MobileListItem key={machine.id}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.title}>{machine.machineLabel}</Text>
                <Text style={styles.copy}>{`${machine.activeJobCard} / ${machine.reasonCode}`}</Text>
              </View>
              <MobileBadge label={machine.status} tone={machineTone(machine.status)} />
            </View>
            <TextInput accessibilityLabel="Downtime remarks" multiline placeholder="Add downtime reason, photo ref, and escalation note" style={styles.notes} />
            <MobileButton label="Queue downtime log" onPress={queueAction("Downtime log", machine)} tone="danger" />
          </MobileListItem>
        ))}
      </MobileCard>

      <MobileCard title="Machine Status Update" subtitle="Change run/idle/down and assign operator with explicit status vocabulary.">
        {seededMachineTasks.map((machine) => (
          <MobileListItem key={machine.id}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.title}>{machine.machineLabel}</Text>
                <Text style={styles.copy}>{machine.escalationLabel}</Text>
              </View>
              <MobileBadge label={machine.status} tone={machineTone(machine.status)} />
            </View>
            <MobileField label="Active job card" value={machine.activeJobCard} />
            <View style={styles.buttonRow}>
              <MobileButton label="Run" onPress={queueAction("Run status", machine)} tone="success" />
              <MobileButton label="Idle" onPress={queueAction("Idle status", machine)} tone="warn" />
              <MobileButton label="Down" onPress={queueAction("Down status", machine)} tone="danger" />
            </View>
          </MobileListItem>
        ))}
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
