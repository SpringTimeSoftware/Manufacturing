import type { PropsWithChildren } from "react";

type BadgeTone = "info" | "success" | "warn" | "danger" | "neutral";

interface BadgeProps {
  tone?: BadgeTone;
}

export function Badge({ children, tone = "neutral" }: PropsWithChildren<BadgeProps>) {
  return <span className={`ui-badge ui-badge--${tone}`}>{children}</span>;
}
