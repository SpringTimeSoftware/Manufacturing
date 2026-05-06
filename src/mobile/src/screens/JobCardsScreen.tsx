import { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { seededJobCards, seededTimeline } from "../mobileSeedData";
import type { MobileJobCard, MobileTone } from "../mobileTypes";
import {
  MobileBadge,
  MobileButton,
  MobileCard,
  MobileField,
  MobileListItem,
  MobileSectionTitle
} from "../ui/mobileComponents";

function statusTone(status: MobileJobCard["status"]): MobileTone {
  if (status === "Running" || status === "Ready") {
    return "success";
  }

  if (status === "QC Hold") {
    return "danger";
  }

  return "warn";
}

export function JobCardsScreen() {
  const [selectedId, setSelectedId] = useState(seededJobCards[0]?.id ?? "");
  const selected = useMemo(
    () => seededJobCards.find((jobCard) => jobCard.id === selectedId) ?? seededJobCards[0],
    [selectedId]
  );

  return (
    <View style={styles.stack}>
      <MobileCard title="My Job Cards Queue" subtitle="Assigned and nearby job cards ready for action.">
        {seededJobCards.map((jobCard) => (
          <TouchableOpacity accessibilityRole="button" key={jobCard.id} onPress={() => setSelectedId(jobCard.id)} style={[styles.jobCard, selectedId === jobCard.id && styles.activeJob]}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.title}>{jobCard.jobCardNo}</Text>
                <Text style={styles.copy}>{`${jobCard.operationName} / ${jobCard.machineLabel}`}</Text>
              </View>
              <MobileBadge label={jobCard.status} tone={statusTone(jobCard.status)} />
            </View>
            <Text style={styles.audit}>{`${jobCard.workOrderNo} / ${jobCard.itemLabel} / ${jobCard.dueLabel}`}</Text>
          </TouchableOpacity>
        ))}
      </MobileCard>

      <MobileCard title="Job Card Detail" subtitle="Operation context, specs, attachments, and required quantity.">
        <View style={styles.fieldGrid}>
          <MobileField label="Job card" value={selected.jobCardNo} />
          <MobileField label="Machine" value={selected.machineLabel} />
          <MobileField label="Planned" value={`${selected.plannedQty} EA`} />
          <MobileField label="Done / Reject / Scrap" value={`${selected.completedGoodQty} / ${selected.completedRejectQty} / ${selected.completedScrapQty}`} />
        </View>
        <Text style={styles.copy}>{selected.specSummary}</Text>
        <MobileBadge label={`${selected.attachmentCount} attachments`} tone="info" />
        <MobileSectionTitle>Execution timeline</MobileSectionTitle>
        {seededTimeline.map((event) => (
          <MobileListItem key={event.id}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.title}>{event.title}</Text>
                <Text style={styles.copy}>{event.detail}</Text>
              </View>
              <MobileBadge label={event.timeLabel} tone={event.tone} />
            </View>
          </MobileListItem>
        ))}
        <MobileButton label="Open action sheet" tone="success" />
      </MobileCard>
    </View>
  );
}

const styles = StyleSheet.create({
  activeJob: {
    borderColor: "#17463a",
    borderWidth: 2
  },
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
  jobCard: {
    backgroundColor: "#ffffff",
    borderColor: "#d8c6ac",
    borderRadius: 22,
    borderWidth: 1,
    gap: 10,
    padding: 16
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
