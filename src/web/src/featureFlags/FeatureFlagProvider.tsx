import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";

export interface FeatureFlags {
  enableDenseGridVirtualization: boolean;
  enableNotificationCenter: boolean;
  enablePrintAndExport: boolean;
  showDemoBadges: boolean;
  showEmptyStateHints: boolean;
  showSeededNavigation: boolean;
}

const storageKey = "sts-mfg-web-feature-flags";

const defaultFlags: FeatureFlags = {
  enableDenseGridVirtualization: true,
  enableNotificationCenter: true,
  enablePrintAndExport: true,
  showDemoBadges: true,
  showEmptyStateHints: true,
  showSeededNavigation: true
};

interface FeatureFlagContextValue {
  flags: FeatureFlags;
  setFlag: <TKey extends keyof FeatureFlags>(key: TKey, value: FeatureFlags[TKey]) => void;
}

interface FeatureFlagProviderProps extends PropsWithChildren {
  initialFlags?: Partial<FeatureFlags>;
  persist?: boolean;
}

const FeatureFlagContext = createContext<FeatureFlagContextValue | undefined>(undefined);

function readStoredFlags(): FeatureFlags {
  if (typeof window === "undefined") {
    return defaultFlags;
  }

  try {
    const raw = window.localStorage.getItem(storageKey);

    if (!raw) {
      return defaultFlags;
    }

    return {
      ...defaultFlags,
      ...(JSON.parse(raw) as Partial<FeatureFlags>)
    };
  } catch {
    return defaultFlags;
  }
}

export function FeatureFlagProvider({
  children,
  initialFlags,
  persist = true
}: FeatureFlagProviderProps) {
  const [flags, setFlags] = useState<FeatureFlags>(() => ({
    ...readStoredFlags(),
    ...initialFlags
  }));

  useEffect(() => {
    if (typeof window === "undefined" || !persist) {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(flags));
  }, [flags, persist]);

  const value = useMemo<FeatureFlagContextValue>(
    () => ({
      flags,
      setFlag: (key, value) => {
        setFlags((current) => ({
          ...current,
          [key]: value
        }));
      }
    }),
    [flags]
  );

  return <FeatureFlagContext.Provider value={value}>{children}</FeatureFlagContext.Provider>;
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext);

  if (!context) {
    throw new Error("useFeatureFlags must be used within FeatureFlagProvider.");
  }

  return context;
}
