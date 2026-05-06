import type { PropsWithChildren } from "react";
import { AuthProvider } from "../auth/AuthContext";
import { FeatureFlagProvider } from "../featureFlags/FeatureFlagProvider";
import { I18nProvider } from "../i18n/I18nProvider";
import { NotificationProvider } from "../notifications/NotificationProvider";
import { WorkspacePreferenceProvider } from "../platform/WorkspacePreferenceContext";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <AuthProvider>
      <FeatureFlagProvider>
        <WorkspacePreferenceProvider>
          <I18nProvider>
            <NotificationProvider>{children}</NotificationProvider>
          </I18nProvider>
        </WorkspacePreferenceProvider>
      </FeatureFlagProvider>
    </AuthProvider>
  );
}
