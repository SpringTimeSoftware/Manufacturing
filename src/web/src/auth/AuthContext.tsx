import {
  createContext,
  startTransition,
  useContext,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren
} from "react";
import { apiClient, ApiError } from "../api/http";
import type {
  AuthSessionResponse,
  CurrentUserResponse,
  LoginRequest,
  RoleCode,
  SwitchOperatingContextRequest
} from "../api/contracts";
import { clearStoredSession, readStoredSession, storeSession } from "./authStorage";

type AuthStatus = "restoring" | "anonymous" | "authenticated";

interface AuthContextValue {
  status: AuthStatus;
  session: AuthSessionResponse | null;
  user: CurrentUserResponse | null;
  login: (request: Omit<LoginRequest, "clientType">) => Promise<void>;
  logout: () => Promise<void>;
  switchContext: (request: Omit<SwitchOperatingContextRequest, "refreshToken">) => Promise<void>;
  restoreError: string | null;
  isAllowed: (roles?: RoleCode[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function buildDemoSession(): AuthSessionResponse {
  return {
    accessToken: "demo-access-token",
    refreshToken: "demo-refresh-token",
    accessTokenExpiresOnUtc: new Date(Date.now() + 1000 * 60 * 60 * 8).toISOString(),
    user: {
      userId: 1,
      userName: "planning.manager",
      displayName: "Ritika Sharma",
      email: "ritika.sharma@sts-precision.local",
      languageCode: "en-IN",
      activeContext: {
        companyId: 1,
        branchId: 10,
        companyCode: "STS",
        companyName: "STS Precision Fabricators",
        branchCode: "PLANT-1",
        branchName: "Main Fabrication Plant"
      },
      availableContexts: [
        {
          companyId: 1,
          companyCode: "STS",
          companyName: "STS Precision Fabricators",
          branchId: 10,
          branchCode: "PLANT-1",
          branchName: "Main Fabrication Plant"
        },
        {
          companyId: 1,
          companyCode: "STS",
          companyName: "STS Precision Fabricators",
          branchId: 11,
          branchCode: "WAREHOUSE-HUB",
          branchName: "Central Warehouse Hub"
        }
      ],
      roles: ["PlanningManager", "PlantHead"],
      scope: {
        hasDeploymentAccess: false,
        visibilityMode: "Company",
        allowedWarehouseIds: [101, 102, 103, 201, 202],
        allowedDepartmentIds: [12, 14, 16],
        teamUserIds: [1, 3, 5, 8]
      }
    }
  };
}

function toUserSafeSignInMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      return error.message || "Invalid user name or password.";
    }

    if (error.status === 403) {
      return "Your account is not assigned to the selected company or branch.";
    }

    return error.message || "Sign-in could not be completed. Retry or contact your administrator.";
  }

  return "Sign-in could not be completed. Retry or contact your administrator.";
}

function isAccessTokenCurrent(session: AuthSessionResponse) {
  const expiresOn = Date.parse(session.accessTokenExpiresOnUtc);

  if (!Number.isFinite(expiresOn)) {
    return false;
  }

  return expiresOn > Date.now() + 30_000;
}

interface AuthProviderProps extends PropsWithChildren {
  disableAutoRestore?: boolean;
  initialRestoreError?: string | null;
  initialSession?: AuthSessionResponse | null;
  initialStatus?: AuthStatus;
}

export function AuthProvider({
  children,
  disableAutoRestore = false,
  initialRestoreError = null,
  initialSession = null,
  initialStatus = "restoring"
}: AuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>(initialSession ? "authenticated" : initialStatus);
  const [session, setSession] = useState<AuthSessionResponse | null>(initialSession);
  const [restoreError, setRestoreError] = useState<string | null>(initialRestoreError);
  const restoreStarted = useRef(false);

  const commitSession = (nextSession: AuthSessionResponse | null) => {
    setSession(nextSession);
    setStatus(nextSession ? "authenticated" : "anonymous");

    if (nextSession) {
      storeSession(nextSession);
      return;
    }

    clearStoredSession();
  };

  const restoreSession = useEffectEvent(async () => {
    const stored = readStoredSession();

    if (!stored) {
      setStatus("anonymous");
      return;
    }

    if (isAccessTokenCurrent(stored)) {
      commitSession(stored);
    }

    try {
      const currentUser = await apiClient.auth.me();
      commitSession({
        ...stored,
        user: currentUser
      });
      setRestoreError(null);
      return;
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 401) {
        if (isAccessTokenCurrent(stored)) {
          commitSession(stored);
          setRestoreError("Session was restored from this browser. Live profile refresh will retry with the next API call.");
          return;
        }

        commitSession(null);
        setRestoreError("Session could not be verified. Sign in again to continue.");
        return;
      }
    }

    try {
      const refreshed = await apiClient.auth.refresh({
        refreshToken: stored.refreshToken,
        clientType: "Web"
      });
      commitSession(refreshed);
      setRestoreError(null);
    } catch (error) {
      if (!(error instanceof ApiError) || error.status >= 500 || error.status === 0) {
        if (isAccessTokenCurrent(stored)) {
          commitSession(stored);
          setRestoreError("Session was restored from this browser. Token refresh will retry when the API is available.");
          return;
        }
      }

      commitSession(null);
      setRestoreError(null);
    }
  });

  useEffect(() => {
    if (disableAutoRestore || restoreStarted.current) {
      return;
    }

    restoreStarted.current = true;
    void restoreSession();
  }, [disableAutoRestore, restoreSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      user: session?.user ?? null,
      restoreError,
      login: async (request) => {
        clearStoredSession();
        setSession(null);
        setRestoreError(null);

        try {
          const response = await apiClient.auth.login({
            ...request,
            clientType: "Web"
          });
          startTransition(() => {
            commitSession(response);
            setRestoreError(null);
          });
        } catch (error) {
          startTransition(() => {
            commitSession(null);
          });
          throw new Error(toUserSafeSignInMessage(error));
        }
      },
      logout: async () => {
        const current = session;

        try {
          if (current) {
            await apiClient.auth.logout({
              refreshToken: current.refreshToken,
              revokeAll: false
            });
          }
        } finally {
          startTransition(() => {
            commitSession(null);
          });
        }
      },
      switchContext: async (request) => {
        if (session?.accessToken.startsWith("demo-")) {
          const matchingContext = session.user.availableContexts.find(
            (context) =>
              context.companyId === request.companyId && context.branchId === request.branchId
          );

          if (!matchingContext) {
            return;
          }

          const nextSession = {
            ...session,
            user: {
              ...session.user,
              activeContext: {
                companyId: matchingContext.companyId,
                branchId: matchingContext.branchId,
                companyCode: matchingContext.companyCode,
                companyName: matchingContext.companyName,
                branchCode: matchingContext.branchCode,
                branchName: matchingContext.branchName
              }
            }
          };

          startTransition(() => {
            commitSession(nextSession);
          });

          return;
        }

        const response = await apiClient.auth.switchContext({
          ...request,
          refreshToken: session?.refreshToken
        });
        startTransition(() => {
          commitSession(response);
        });
      },
      isAllowed: (roles) => {
        if (!roles || roles.length === 0) {
          return true;
        }

        const currentRoles = session?.user.roles ?? [];
        return currentRoles.includes("SuperAdmin") || roles.some((role) => currentRoles.includes(role));
      }
    }),
    [restoreError, session, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return context;
}
