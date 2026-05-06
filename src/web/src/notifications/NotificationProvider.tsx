import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import type { NotificationItem } from "../api/contracts";
import { apiClient } from "../api/http";
import { readStoredSession } from "../auth/authStorage";

export const seededNotifications: NotificationItem[] = [
  {
    id: "notif-wo-risk",
    title: "Work order release still blocked",
    body: "WO-02642 is waiting on RM-SS-SHEET and routing step approval.",
    module: "Planning",
    category: "Approval",
    severity: "warn",
    createdAt: "2026-04-18T08:45:00Z",
    isRead: false,
    requiresAction: true,
    documentRef: "WO-02642",
    auditActionLabel: "Review re-release approval",
    statusLabel: "Escalated",
    actionLabel: "Open approvals",
    actionPath: "/platform/approvals"
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
    actionLabel: "Open approvals",
    actionPath: "/platform/approvals"
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
    actionPath: "/dashboards/stage-wise"
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
    body: "SO-2026-0194 is packed and waiting for dispatch approval before the vehicle gate closes.",
    module: "Dispatch",
    category: "Approval",
    severity: "warn",
    createdAt: "2026-04-18T06:25:00Z",
    isRead: false,
    requiresAction: true,
    documentRef: "PK-00419 / SO-2026-0194",
    auditActionLabel: "Approve dispatch release",
    statusLabel: "Pending",
    actionLabel: "Open approvals",
    actionPath: "/platform/approvals"
  }
];

interface NotificationValue {
  notifications: NotificationItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

interface NotificationProviderProps extends PropsWithChildren {
  initialNotifications?: NotificationItem[];
}

const NotificationContext = createContext<NotificationValue | undefined>(undefined);

function hasLiveSession() {
  const session = readStoredSession();
  return Boolean(session?.accessToken && !session.accessToken.startsWith("demo-"));
}

export function NotificationProvider({
  children,
  initialNotifications = seededNotifications
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState(initialNotifications);

  useEffect(() => {
    if (!hasLiveSession()) {
      return;
    }

    let isMounted = true;

    void apiClient.notifications
      .list()
      .then((items) => {
        if (isMounted) {
          setNotifications(items);
        }
      })
      .catch(() => {
        // Keep seeded notifications for degraded deployments or un-applied SQL packs.
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<NotificationValue>(
    () => ({
      notifications,
      unreadCount: notifications.filter((entry) => !entry.isRead).length,
      markAsRead: (id) => {
        setNotifications((current) =>
          current.map((entry) => (entry.id === id ? { ...entry, isRead: true } : entry))
        );

        if (hasLiveSession()) {
          void apiClient.notifications.markRead(id).catch(() => undefined);
        }
      },
      markAllAsRead: () => {
        setNotifications((current) => current.map((entry) => ({ ...entry, isRead: true })));

        if (hasLiveSession()) {
          void apiClient.notifications.markAllRead().catch(() => undefined);
        }
      }
    }),
    [notifications]
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
