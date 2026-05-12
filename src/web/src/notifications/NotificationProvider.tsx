import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import type { NotificationItem } from "../api/contracts";
import { apiClient } from "../api/http";
import { useAuth } from "../auth/AuthContext";

export const seededNotifications: NotificationItem[] = [
  {
    id: "notif-wo-risk",
    title: "Work order release still blocked",
    body: "WO-2026-044 is waiting on RM-SS-SHEET and routing step approval.",
    module: "Planning",
    category: "Approval",
    severity: "warn",
    createdAt: "2026-04-18T08:45:00Z",
    isRead: false,
    requiresAction: true,
    documentRef: "WO-2026-044",
    auditActionLabel: "Review re-release approval",
    statusLabel: "Escalated",
    actionLabel: "Open approval",
    actionPath: "/platform/approvals?approval=approval-wo-release"
  },
  {
    id: "notif-bom-approval",
    title: "BOM revision R4 needs engineering approval",
    body: "FG-OZ-50 revision R4 is ready for release after QA note updates.",
    module: "Engineering",
    category: "Approval",
    severity: "info",
    createdAt: "2026-04-18T08:10:00Z",
    isRead: false,
    requiresAction: true,
    documentRef: "BOM-FG-OZ-50 / R4",
    auditActionLabel: "Approve BOM revision",
    statusLabel: "Pending",
    actionLabel: "Open approval",
    actionPath: "/platform/approvals?approval=approval-bom-r4"
  },
  {
    id: "notif-qc",
    title: "QC hold requires supervisor review",
    body: "Final inspection for SO-2026-0189 is waiting on leak-test evidence.",
    module: "Quality",
    category: "Alert",
    severity: "danger",
    createdAt: "2026-04-18T07:10:00Z",
    isRead: false,
    requiresAction: true,
    documentRef: "SO-2026-0189",
    auditActionLabel: "Review QC hold",
    actionLabel: "Open stage board",
    actionDisabledReason: "Stage-board deep links for this sales order are not enabled. Open Stage Wise and search SO-2026-0189."
  },
  {
    id: "notif-translation",
    title: "Translation bundle synced",
    body: "Updated `production.receipt.received` for `en-IN` and `hi-IN`.",
    module: "Platform",
    category: "System",
    severity: "info",
    createdAt: "2026-04-17T18:20:00Z",
    isRead: true,
    documentRef: "Language bundle / production",
    auditActionLabel: "Review localization sync"
  },
  {
    id: "notif-dispatch-approval",
    title: "Dispatch release approval is due before loading",
    body: "PACK-2026-0042 is packed and waiting for dispatch approval before the vehicle gate closes.",
    module: "Dispatch",
    category: "Approval",
    severity: "warn",
    createdAt: "2026-04-18T06:25:00Z",
    isRead: false,
    requiresAction: true,
    documentRef: "PACK-2026-0042 / SO-2026-0189",
    auditActionLabel: "Approve dispatch release",
    statusLabel: "Pending",
    actionLabel: "Open approval",
    actionPath: "/platform/approvals?approval=approval-dispatch-release"
  }
];

const seededNotificationKeys = new Set(seededNotifications.map((item) => `${item.id}:${item.title}:${item.documentRef ?? ""}`));

function isSeededNotificationRow(item: NotificationItem) {
  return seededNotificationKeys.has(`${item.id}:${item.title}:${item.documentRef ?? ""}`);
}

interface NotificationValue {
  isLiveSession: boolean;
  isLoading: boolean;
  loadError: string | null;
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

interface NotificationProviderProps extends PropsWithChildren {
  initialNotifications?: NotificationItem[];
}

const NotificationContext = createContext<NotificationValue | undefined>(undefined);

export function NotificationProvider({
  children,
  initialNotifications = seededNotifications
}: NotificationProviderProps) {
  const { session, status } = useAuth();
  const isLiveSession = Boolean(
    status === "authenticated" &&
      session?.accessToken &&
      !session.accessToken.startsWith("demo-")
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    isLiveSession ? [] : initialNotifications
  );
  const [isLoading, setLoading] = useState(isLiveSession);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "restoring") {
      setLoading(true);
      setLoadError(null);
      return;
    }

    if (!isLiveSession) {
      setNotifications(initialNotifications);
      setLoading(false);
      setLoadError(null);
      return;
    }

    let isMounted = true;

    setNotifications([]);
    setLoading(true);
    setLoadError(null);

    void apiClient.notifications
      .list()
      .then((items) => {
        if (isMounted) {
          if (items.some(isSeededNotificationRow)) {
            setNotifications([]);
            setLoading(false);
            setLoadError("The notification service returned non-live operating alerts. They are hidden until verified live notification data is available.");
            return;
          }

          setNotifications(items);
          setLoading(false);
          setLoadError(null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setNotifications([]);
          setLoading(false);
          setLoadError("Live notifications could not be loaded. Retry after the notification service is available.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [initialNotifications, isLiveSession, status]);

  const value = useMemo<NotificationValue>(
    () => ({
      isLiveSession,
      isLoading,
      loadError,
      notifications,
      unreadCount: notifications.filter((entry) => !entry.isRead).length,
      markAsRead: (id) => {
        setNotifications((current) =>
          current.map((entry) => (entry.id === id ? { ...entry, isRead: true } : entry))
        );

        if (isLiveSession) {
          void apiClient.notifications.markRead(id).catch(() => {
            setNotifications((current) =>
              current.map((entry) => (entry.id === id ? { ...entry, isRead: false } : entry))
            );
            setLoadError("Notification acknowledgement could not be recorded. Retry after the notification service is available.");
          });
        }
      },
      markAllAsRead: () => {
        const unreadIds = notifications.filter((entry) => !entry.isRead).map((entry) => entry.id);
        setNotifications((current) => current.map((entry) => ({ ...entry, isRead: true })));

        if (isLiveSession) {
          void apiClient.notifications.markAllRead().catch(() => {
            setNotifications((current) =>
              current.map((entry) => (unreadIds.includes(entry.id) ? { ...entry, isRead: false } : entry))
            );
            setLoadError("Notification acknowledgements could not be recorded. Retry after the notification service is available.");
          });
        }
      }
    }),
    [isLiveSession, isLoading, loadError, notifications]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider.");
  }

  return context;
}
