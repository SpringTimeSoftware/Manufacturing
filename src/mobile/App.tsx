import { useCallback, useMemo, useState } from "react";
import {
  captureEvidence,
  getRuntimeContext,
  listMobileTasks,
  listOfflineOperations,
  queueOfflineOperation,
  resolveScan,
  syncOfflineOperations
} from "./src/mobileApi";
import { signInWithDeviceBinding } from "./src/mobileAuth";
import { summarizeQueue } from "./src/offlineQueue";
import type {
  MobileContext,
  MobilePhotoEvidence,
  MobileRuntimeContext,
  MobileScanResult,
  MobileScanSource,
  MobileSession,
  MobileTask,
  OfflineQueueEntry,
  QueueOfflineOperationInput
} from "./src/mobileTypes";
import { LoginScreen } from "./src/screens/LoginScreen";
import { MobileShell } from "./src/MobileShell";

export default function App() {
  const [session, setSession] = useState<MobileSession | null>(null);
  const [contexts, setContexts] = useState<MobileContext[]>([]);
  const [activeContext, setActiveContext] = useState<MobileContext | null>(null);
  const [runtime, setRuntime] = useState<MobileRuntimeContext | null>(null);
  const [queue, setQueue] = useState<OfflineQueueEntry[]>([]);
  const [tasks, setTasks] = useState<MobileTask[]>([]);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refreshRuntime = useCallback(
    async (deviceCode: string) => {
      const [runtimeContext, liveTasks, operations] = await Promise.all([
        getRuntimeContext(deviceCode),
        listMobileTasks(deviceCode),
        listOfflineOperations(deviceCode)
      ]);
      setRuntime(runtimeContext);
      setTasks(liveTasks);
      setQueue(operations);
    },
    []
  );

  const syncSummary = useMemo(() => {
    const summary = summarizeQueue(queue);
    return {
      lastSyncLabel: runtime?.lastSyncAt ? new Date(runtime.lastSyncAt).toLocaleString() : "Not synced in this session",
      pendingCount: summary.pending,
      failedCount: summary.failed,
      conflictCount: runtime?.conflictCount ?? queue.filter((entry) => entry.status === "Conflict").length
    };
  }, [queue, runtime]);

  if (!session || !activeContext) {
    return (
      <LoginScreen
        errorMessage={loginError}
        isSubmitting={isSubmitting}
        onSubmit={async (credentials) => {
          setIsSubmitting(true);
          setLoginError(null);
          try {
            const response = await signInWithDeviceBinding(credentials);
            const availableContexts = response.session.availableContexts ?? [response.session.activeContext];
            setSession(response.session);
            setActiveContext(response.session.activeContext);
            setContexts(availableContexts);
            setRuntime(response.runtime);
            await refreshRuntime(response.session.deviceCode ?? response.runtime.device.deviceCode);
          } catch (error) {
            setLoginError(error instanceof Error ? error.message : "Mobile sign-in failed.");
          } finally {
            setIsSubmitting(false);
          }
        }}
      />
    );
  }

  return (
    <MobileShell
      activeContext={activeContext}
      contexts={contexts.length ? contexts : [activeContext]}
      onCaptureEvidence={(input) => captureEvidence(session, activeContext, input)}
      onContextChange={setActiveContext}
      onQueueOperation={async (input: QueueOfflineOperationInput) => {
        const operation = await queueOfflineOperation(session, activeContext, input);
        setQueue((current) => [operation, ...current.filter((entry) => entry.id !== operation.id)]);
        return operation;
      }}
      onResolveScan={(scanValue: string, scanSource: MobileScanSource, scanContext: string) =>
        resolveScan(session, activeContext, scanValue, scanSource, scanContext)
      }
      onSync={async () => {
        const synced = await syncOfflineOperations(session.deviceCode ?? runtime?.device.deviceCode ?? "", queue);
        setQueue((current) => {
          const byId = new Map(current.map((entry) => [entry.id, entry]));
          synced.forEach((entry) => byId.set(entry.id, { ...byId.get(entry.id), ...entry }));
          return Array.from(byId.values());
        });
        if (session.deviceCode) {
          await refreshRuntime(session.deviceCode);
        }
        return synced;
      }}
      queue={queue}
      runtime={runtime}
      session={session}
      syncSummary={syncSummary}
      tasks={tasks}
    />
  );
}

export type MobileRuntimeHandlers = {
  onCaptureEvidence: (input: {
    sourceModule: string;
    sourceDocumentType: string;
    sourceDocumentId?: number | null;
    sourceDocumentNo?: string | null;
    evidenceType: string;
    fileName: string;
    contentType: string;
  }) => Promise<MobilePhotoEvidence>;
  onQueueOperation: (input: QueueOfflineOperationInput) => Promise<OfflineQueueEntry>;
  onResolveScan: (scanValue: string, scanSource: MobileScanSource, scanContext: string) => Promise<MobileScanResult>;
  onSync: () => Promise<OfflineQueueEntry[]>;
};
