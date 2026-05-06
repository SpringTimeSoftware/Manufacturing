import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { MobileContext } from "../mobileTypes";

interface ContextSwitchScreenProps {
  activeContext: MobileContext;
  contexts: MobileContext[];
  onContextChange: (context: MobileContext) => void;
}

export function ContextSwitchScreen({ activeContext, contexts, onContextChange }: ContextSwitchScreenProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Company / Branch Select</Text>
      <Text style={styles.copy}>Switch the operating context before capturing execution actions. Existing queued actions keep their original audit context.</Text>
      {contexts.map((context) => {
        const isActive = context.companyId === activeContext.companyId && context.branchId === activeContext.branchId;

        return (
          <TouchableOpacity
            accessibilityRole="button"
            key={`${context.companyId}-${context.branchId}`}
            onPress={() => onContextChange(context)}
            style={[styles.contextButton, isActive && styles.contextButtonActive]}
          >
            <Text style={styles.contextTitle}>{context.branchName}</Text>
            <Text style={styles.contextMeta}>{`${context.companyName} / ${context.warehouseLabel}`}</Text>
            <Text style={styles.status}>{isActive ? "Active context" : "Tap to switch"}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fffaf2",
    borderRadius: 28,
    gap: 12,
    padding: 18
  },
  contextButton: {
    backgroundColor: "#ffffff",
    borderColor: "#d8c6ac",
    borderRadius: 22,
    borderWidth: 1,
    gap: 4,
    padding: 16
  },
  contextButtonActive: {
    borderColor: "#17463a",
    borderWidth: 2
  },
  contextMeta: {
    color: "#5c6f68",
    fontSize: 13
  },
  contextTitle: {
    color: "#10251f",
    fontSize: 18,
    fontWeight: "900"
  },
  copy: {
    color: "#5c6f68",
    lineHeight: 20
  },
  status: {
    color: "#17463a",
    fontWeight: "800",
    marginTop: 4
  },
  title: {
    color: "#10251f",
    fontSize: 22,
    fontWeight: "900"
  }
});
