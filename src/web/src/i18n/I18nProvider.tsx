import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import { useApiQuery, queryKeys } from "../api/hooks";
import { apiClient } from "../api/http";
import { useAuth } from "../auth/AuthContext";

const baseResources: Record<string, string> = {
  "app.title": "STS Manufacturing ERP",
  "nav.home": "Home",
  "nav.orderDelivery": "Order Delivery",
  "nav.stageWise": "Stage Wise",
  "nav.bomLibrary": "BOM Library",
  "nav.workOrders": "Work Orders",
  "nav.jobCards": "Job Cards",
  "nav.machineBoard": "Machine Board",
  "nav.occupancy": "Occupancy Calendar",
  "nav.items": "Items",
  "nav.customers": "Customers",
  "nav.suppliers": "Suppliers",
  "nav.translations": "Translations",
  "nav.settings": "Settings",
  "nav.contextSwitch": "Context Switch",
  "nav.notifications": "Notifications",
  "nav.approvals": "Approvals",
  "nav.reports": "Print Pack",
  "auth.loginTitle": "Sign in to STS Manufacturing ERP",
  "auth.loginSubtitle": "Access your assigned company, branch, and role workspace for manufacturing operations.",
  "auth.forgotPassword": "Forgot password or MFA recovery",
  "auth.deviceRegistration": "Register this browser for faster approval and notification recovery.",
  "shell.context": "Operating context",
  "shell.notifications": "Notifications",
  "shell.approvals": "Approvals due"
};

interface I18nValue {
  languageCode: string;
  setLanguageCode: (languageCode: string) => void;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nValue | undefined>(undefined);

export function I18nProvider({ children }: PropsWithChildren) {
  const { user, status } = useAuth();
  const [languageCode, setLanguageCode] = useState(user?.languageCode ?? "en-IN");

  useEffect(() => {
    if (user?.languageCode) {
      setLanguageCode(user.languageCode);
    }
  }, [user?.languageCode]);

  const translationsQuery = useApiQuery(
    queryKeys.translation(languageCode),
    () => apiClient.localization.resources(languageCode),
    {
      enabled: status === "authenticated"
    }
  );

  const resources = useMemo(
    () => ({
      ...baseResources,
      ...(translationsQuery.data?.resources ?? {})
    }),
    [translationsQuery.data?.resources]
  );

  const value = useMemo<I18nValue>(
    () => ({
      languageCode,
      setLanguageCode,
      t: (key, fallback) => resources[key] ?? fallback ?? key
    }),
    [languageCode, resources]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used inside I18nProvider.");
  }

  return context;
}
