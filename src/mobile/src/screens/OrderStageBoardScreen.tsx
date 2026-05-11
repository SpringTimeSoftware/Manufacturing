import { StyleSheet, Text, View } from "react-native";
import { seededOrderSnapshots, seededStageBoardColumns } from "../mobileSeedData";
import { MobileBadge, MobileCard, MobileField, MobileListItem, MobileSectionTitle } from "../ui/mobileComponents";

function riskTone(riskStatus: "OnTrack" | "AtRisk" | "Late") {
  if (riskStatus === "Late") {
    return "danger";
  }

  if (riskStatus === "AtRisk") {
    return "warn";
  }

  return "success";
}

export function OrderStageBoardScreen() {
  return (
    <View style={styles.stack}>
      <MobileCard
        action={<MobileBadge label="Order health" tone="info" />}
        subtitle="Compact order health cards mirror the web delivery dashboard without carrying the dense table to mobile."
        title="Order Snapshot"
      >
        {seededOrderSnapshots.map((order) => (
          <MobileListItem key={order.id}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.itemTitle}>{order.orderNo}</Text>
                <Text style={styles.copy}>{`${order.customerName} / ${order.promisedLabel}`}</Text>
              </View>
              <MobileBadge label={order.riskStatus} tone={riskTone(order.riskStatus)} />
            </View>
            <View style={styles.fieldGrid}>
              <MobileField label="Completion" value={`${order.completionPercent}%`} />
              <MobileField label="Dispatch ready" value={`${order.dispatchReadinessPercent}%`} />
              <MobileField label="Primary blocker" value={order.blockerLabel} />
            </View>
          </MobileListItem>
        ))}
      </MobileCard>

      <MobileCard
        action={<MobileBadge label="Stage review" tone="warn" />}
        subtitle="Stage columns are compressed into stacked cards for plant-head and manager review."
        title="Stage Wise Mobile Board"
      >
        {seededStageBoardColumns.map((column) => (
          <View key={column.id} style={styles.stageColumn}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.stageTitle}>{column.stageLabel}</Text>
                <Text style={styles.copy}>{column.countLabel}</Text>
              </View>
              <MobileBadge label={column.countLabel} tone={column.tone} />
            </View>
            {column.cards.map((card) => (
              <MobileListItem key={card.id}>
                <View style={styles.row}>
                  <View style={styles.flex}>
                    <Text style={styles.itemTitle}>{card.documentNo}</Text>
                    <Text style={styles.copy}>{card.customerName}</Text>
                  </View>
                  <MobileBadge label={card.statusLabel} tone={column.tone} />
                </View>
                <MobileSectionTitle>{card.blockerLabel}</MobileSectionTitle>
                <Text style={styles.audit}>{`${card.daysInStage} days in stage / owner ${card.ownerRole}`}</Text>
              </MobileListItem>
            ))}
          </View>
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
  copy: {
    color: "#5c6f68",
    lineHeight: 20
  },
  fieldGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
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
  },
  stageColumn: {
    backgroundColor: "#f8fbff",
    borderColor: "#d7e3dd",
    borderRadius: 22,
    borderWidth: 1,
    gap: 10,
    padding: 12
  },
  stageTitle: {
    color: "#10251f",
    fontSize: 18,
    fontWeight: "900"
  }
});
