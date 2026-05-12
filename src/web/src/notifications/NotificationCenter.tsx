import { useNavigate } from "react-router-dom";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import { getLinkedRecordActionState } from "./linkedRecordActions";
import { useNotifications } from "./NotificationProvider";

interface NotificationCenterProps {
  compact?: boolean;
}

export function NotificationCenter({ compact = false }: NotificationCenterProps) {
  const navigate = useNavigate();
  const { isLoading, loadError, markAllAsRead, markAsRead, notifications, unreadCount } = useNotifications();

  if (loadError) {
    return (
      <EmptyState
        description="Live notification data is not available right now. No alerts are shown until the live inbox is verified."
        hint={loadError}
        title="Notification inbox unavailable"
      />
    );
  }

  if (isLoading) {
    return (
      <EmptyState
        description="Live notification data is being loaded for the current workspace."
        title="Loading notifications"
      />
    );
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        description="Current alerts have been acknowledged and the inbox is clear."
        hint="Fresh alerts appear here when planning, quality, or platform events need attention."
        title="No notifications pending"
      />
    );
  }

  return (
    <div aria-live="polite" className="notification-panel">
      {!compact ? (
        <div className="ui-filter-bar">
          <div className="ui-filter-bar__content">
            <Badge tone={unreadCount > 0 ? "warn" : "success"}>{`${unreadCount} unread`}</Badge>
          </div>
          <div className="ui-filter-bar__actions">
            <Button
              disabled={unreadCount === 0}
              title={unreadCount === 0 ? "No unread notifications are available." : undefined}
              variant="secondary"
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          </div>
        </div>
      ) : null}
      {notifications.map((notification) => {
        const linkedAction = getLinkedRecordActionState(notification, notification.actionLabel ?? "Open linked record");

        return (
          <article className="notification-item" key={notification.id}>
            <div className="notification-item__meta">
              <Badge tone={notification.severity}>{notification.module}</Badge>
              <span>{new Date(notification.createdAt).toLocaleString("en-IN")}</span>
            </div>
            <strong>{notification.title}</strong>
            <p>{notification.body}</p>
            <div className="context-chip-row">
              {!notification.isRead ? (
                <Button variant="quiet" onClick={() => markAsRead(notification.id)}>
                  Mark read
                </Button>
              ) : null}
              {!linkedAction.hidden ? (
                <span className="linked-record-action">
                  <Button
                    disabled={linkedAction.disabled}
                    title={linkedAction.reason}
                    variant="primary"
                    onClick={() => {
                      if (!linkedAction.path) {
                        return;
                      }

                      markAsRead(notification.id);
                      navigate(linkedAction.path);
                    }}
                  >
                    {linkedAction.label}
                  </Button>
                  {linkedAction.disabled && linkedAction.reason ? <small>{linkedAction.reason}</small> : null}
                </span>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
