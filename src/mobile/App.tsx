import { useMemo, useState } from "react";
import { MobileShell } from "./src/MobileShell";
import { signInWithDeviceBinding } from "./src/mobileAuth";
import { seededMobileContexts, seededOfflineQueue } from "./src/mobileSeedData";
import { summarizeQueue } from "./src/offlineQueue";
import type { MobileContext, MobileSession } from "./src/mobileTypes";
import { LoginScreen } from "./src/screens/LoginScreen";

export default function App() {
  const [session, setSession] = useState<MobileSession | null>(null);
  const [activeContext, setActiveContext] = useState<MobileContext>(seededMobileContexts[0]);
  const [queue] = useState(seededOfflineQueue);

  const syncSummary = useMemo(
    () => {
      const summary = summarizeQueue(queue);

      return {
        lastSyncLabel: session ? "Today 09:35" : "Sign in to sync",
        pendingCount: summary.pending,
        failedCount: summary.failed
      };
    },
    [queue, session]
  );

  if (!session) {
    return (
      <LoginScreen
        onSubmit={(credentials) => {
          setSession(signInWithDeviceBinding(credentials, activeContext));
        }}
      />
    );
  }

  return (
    <MobileShell
      activeContext={activeContext}
      contexts={seededMobileContexts}
      onContextChange={setActiveContext}
      queue={queue}
      session={session}
      syncSummary={syncSummary}
    />
  );
}
