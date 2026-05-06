import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import type { PropsWithChildren, ReactElement } from "react";
import { MemoryRouter } from "react-router-dom";
import type { AuthSessionResponse, NotificationItem } from "../api/contracts";
import { buildDemoSession, AuthProvider } from "../auth/AuthContext";
import {
  FeatureFlagProvider,
  type FeatureFlags
} from "../featureFlags/FeatureFlagProvider";
import { I18nProvider } from "../i18n/I18nProvider";
import {
  NotificationProvider,
  seededNotifications
} from "../notifications/NotificationProvider";
import { WorkspacePreferenceProvider } from "../platform/WorkspacePreferenceContext";

interface RenderOptions {
  flags?: Partial<FeatureFlags>;
  notifications?: NotificationItem[];
  route?: string;
  session?: AuthSessionResponse | null;
  status?: "authenticated" | "anonymous" | "restoring";
}

export function renderWithApp(
  ui: ReactElement,
  {
    flags,
    notifications = seededNotifications,
    route = "/",
    session = buildDemoSession(),
    status = session ? "authenticated" : "anonymous"
  }: RenderOptions = {}
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false
      }
    }
  });

  function Wrapper({ children }: PropsWithChildren) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[route]}>
          <AuthProvider
            disableAutoRestore
            initialSession={session}
            initialStatus={status}
          >
            <FeatureFlagProvider initialFlags={flags} persist={false}>
              <WorkspacePreferenceProvider>
                <I18nProvider>
                  <NotificationProvider initialNotifications={notifications}>
                    {children}
                  </NotificationProvider>
                </I18nProvider>
              </WorkspacePreferenceProvider>
            </FeatureFlagProvider>
          </AuthProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper });
}
