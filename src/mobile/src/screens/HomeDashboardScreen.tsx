import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import {
  seededActionCards,
  seededDashboardTiles,
  seededNotifications,
  seededRoleNavigationRules
} from "../mobileSeedData";
import type { MobileSession, MobileTab, OfflineQueueEntry } from "../mobileTypes";
import {
  MobileBadge,
  MobileCard,
  MobileListItem,
  MobileSectionTitle,
  MobileTile
} from "../ui/mobileComponents";

interface HomeDashboardScreenProps {
  onNavigate: (tab: MobileTab) => void;
  queue: OfflineQueueEntry[];
  session: MobileSession;
}

export function HomeDashboardScreen({ onNavigate, queue, session }: HomeDashboardScreenProps) {
  const firstRole = session.roles[0] ?? "MachineOperator";
  const failedCount = queue.filter((entry) => entry.status === "Failed" || entry.status === "Conflict").length;
  const roleRule = seededRoleNavigationRules.find((rule) => session.roles.includes(rule.role));
  const visibleActions = seededActionCards.filter((card) => !roleRule || roleRule.primaryTabs.includes(card.targetTab));

  return (
    <View style={styles.stack}>
      <MobileCard
        action={<MobileBadge label={firstRole} tone="info" />}
        subtitle="Role-specific action cards and summary tiles for the next shop-floor move."
        title="My Dashboard"
      >
        <View style={styles.tileGrid}>
          {seededDashboardTiles.map((tile) => (
            <MobileTile key={tile.id} hint={tile.hint} label={tile.label} tone={tile.tone} value={tile.value} />
          ))}
        </View>
        {roleRule ? <Text style={styles.audit}>{`Default mobile route for ${roleRule.role}: ${roleRule.defaultTab}`}</Text> : null}
        {failedCount > 0 ? <Text style={styles.warning}>{`${failedCount} offline item needs review before handover.`}</Text> : null}
      </MobileCard>

      <MobileCard title="Fast actions" subtitle="Large touch targets keep mobile focused on execution, not administration.">
        {visibleActions.map((card) => (
          <TouchableOpacity accessibilityRole="button" key={card.id} onPress={() => onNavigate(card.targetTab)} style={styles.actionCard}>
            <View style={styles.actionText}>
              <Text style={styles.actionTitle}>{card.title}</Text>
              <Text style={styles.copy}>{card.subtitle}</Text>
            </View>
            <MobileBadge label={card.roleHint} tone={card.tone} />
          </TouchableOpacity>
        ))}
      </MobileCard>

      <MobileCard title="Attention now" subtitle="Alerts and escalation messages stay visible without opening dense web dashboards.">
        <MobileSectionTitle>Latest inbox signals</MobileSectionTitle>
        {seededNotifications.slice(0, 2).map((notification) => (
          <MobileListItem key={notification.id}>
            <View style={styles.row}>
              <View style={styles.flex}>
                <Text style={styles.itemTitle}>{notification.title}</Text>
                <Text style={styles.copy}>{notification.body}</Text>
              </View>
              <MobileBadge label={notification.category} tone={notification.severity} />
            </View>
            <Text style={styles.audit}>{`${notification.documentRef} / ${notification.createdLabel}`}</Text>
          </MobileListItem>
        ))}
      </MobileCard>
    </View>
  );
}

const styles = StyleSheet.create({
  actionCard: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderColor: "#d8c6ac",
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    padding: 16
  },
  actionText: {
    flex: 1,
    gap: 4
  },
  actionTitle: {
    color: "#10251f",
    fontSize: 17,
    fontWeight: "900"
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
  flex: {
    flex: 1
  },
  itemTitle: {
    color: "#10251f",
    fontSize: 16,
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
  tileGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  warning: {
    color: "#8e2c18",
    fontWeight: "800"
  }
});
