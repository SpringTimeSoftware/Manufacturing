import type { PropsWithChildren, ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { MobileTone } from "../mobileTypes";

interface MobileCardProps extends PropsWithChildren {
  action?: ReactNode;
  subtitle?: string;
  title: string;
}

interface MobileBadgeProps {
  label: string;
  tone?: MobileTone;
}

interface MobileButtonProps {
  label: string;
  onPress?: () => void;
  tone?: MobileTone;
}

interface MobileTileProps {
  hint: string;
  label: string;
  tone?: MobileTone;
  value: string;
}

function toneStyle(tone: MobileTone = "neutral") {
  switch (tone) {
    case "success":
      return styles.success;
    case "warn":
      return styles.warn;
    case "danger":
      return styles.danger;
    case "info":
      return styles.info;
    default:
      return styles.neutral;
  }
}

function buttonToneStyle(tone: MobileTone = "info") {
  switch (tone) {
    case "success":
      return styles.buttonSuccess;
    case "warn":
      return styles.buttonWarn;
    case "danger":
      return styles.buttonDanger;
    case "neutral":
      return styles.buttonNeutral;
    default:
      return styles.buttonInfo;
  }
}

export function MobileBadge({ label, tone = "neutral" }: MobileBadgeProps) {
  return <Text style={[styles.badge, toneStyle(tone)]}>{label}</Text>;
}

export function MobileButton({ label, onPress, tone = "info" }: MobileButtonProps) {
  return (
    <TouchableOpacity accessibilityRole="button" onPress={onPress} style={[styles.button, buttonToneStyle(tone)]}>
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
}

export function MobileCard({ action, children, subtitle, title }: MobileCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleBlock}>
          <Text style={styles.cardTitle}>{title}</Text>
          {subtitle ? <Text style={styles.copy}>{subtitle}</Text> : null}
        </View>
        {action}
      </View>
      {children}
    </View>
  );
}

export function MobileTile({ hint, label, tone = "neutral", value }: MobileTileProps) {
  return (
    <View style={styles.tile}>
      <MobileBadge label={label} tone={tone} />
      <Text style={styles.tileValue}>{value}</Text>
      <Text style={styles.copy}>{hint}</Text>
    </View>
  );
}

export function MobileListItem({ children }: PropsWithChildren) {
  return <View style={styles.listItem}>{children}</View>;
}

export function MobileField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

export function MobileSectionTitle({ children }: PropsWithChildren) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: "900",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  button: {
    alignItems: "center",
    borderRadius: 18,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 13
  },
  buttonText: {
    color: "#10251f",
    fontSize: 15,
    fontWeight: "900"
  },
  buttonDanger: {
    backgroundColor: "#fde7df"
  },
  buttonInfo: {
    backgroundColor: "#dceef8"
  },
  buttonNeutral: {
    backgroundColor: "#edf2ef"
  },
  buttonSuccess: {
    backgroundColor: "#e8f2ee"
  },
  buttonWarn: {
    backgroundColor: "#fff0c2"
  },
  card: {
    backgroundColor: "#fffaf2",
    borderColor: "#eadcc7",
    borderRadius: 28,
    borderWidth: 1,
    gap: 14,
    padding: 18
  },
  cardHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between"
  },
  cardTitle: {
    color: "#10251f",
    fontSize: 22,
    fontWeight: "900"
  },
  cardTitleBlock: {
    flex: 1,
    gap: 6
  },
  copy: {
    color: "#5c6f68",
    fontSize: 14,
    lineHeight: 20
  },
  danger: {
    backgroundColor: "#fde7df",
    color: "#8e2c18"
  },
  field: {
    backgroundColor: "#f8efe0",
    borderRadius: 18,
    gap: 4,
    padding: 12
  },
  fieldLabel: {
    color: "#5c6f68",
    fontSize: 12,
    fontWeight: "700"
  },
  fieldValue: {
    color: "#10251f",
    fontSize: 15,
    fontWeight: "800"
  },
  info: {
    backgroundColor: "#dceef8",
    color: "#075985"
  },
  listItem: {
    backgroundColor: "#ffffff",
    borderColor: "#d8c6ac",
    borderRadius: 22,
    borderWidth: 1,
    gap: 10,
    padding: 16
  },
  neutral: {
    backgroundColor: "#edf2ef",
    color: "#17463a"
  },
  sectionTitle: {
    color: "#10251f",
    fontSize: 16,
    fontWeight: "900"
  },
  success: {
    backgroundColor: "#e8f2ee",
    color: "#17463a"
  },
  tile: {
    backgroundColor: "#ffffff",
    borderColor: "#d8c6ac",
    borderRadius: 22,
    borderWidth: 1,
    flex: 1,
    gap: 8,
    minWidth: 130,
    padding: 14
  },
  tileValue: {
    color: "#10251f",
    fontSize: 26,
    fontWeight: "900"
  },
  warn: {
    backgroundColor: "#fff0c2",
    color: "#7a4a00"
  }
});

export const mobileCommonStyles = styles;
