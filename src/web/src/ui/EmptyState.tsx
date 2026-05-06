import type { ReactNode } from "react";
import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  hint?: ReactNode;
}

export function EmptyState({ actionLabel, description, hint, onAction, title }: EmptyStateProps) {
  return (
    <div className="ui-empty-state" role="status">
      <strong>{title}</strong>
      <p>{description}</p>
      {hint ? <div className="ui-empty-state__hint">{hint}</div> : null}
      {actionLabel && onAction ? (
        <Button onClick={onAction} variant="secondary">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
