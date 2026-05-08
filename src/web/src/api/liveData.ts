import type { AuthSessionResponse } from "./contracts";

export function isDemoSession(session: AuthSessionResponse | null | undefined) {
  return !session?.accessToken || session.accessToken.startsWith("demo-");
}

export function hasLiveSession(session: AuthSessionResponse | null | undefined) {
  return Boolean(session?.accessToken && !session.accessToken.startsWith("demo-"));
}

export function liveDataUnavailable(scope: string) {
  return new Error(`${scope} live data could not be loaded. Retry or contact your administrator.`);
}

export async function loadLiveOrDemoRows<T>(
  session: AuthSessionResponse | null | undefined,
  scope: string,
  demoLoader: () => T[],
  liveLoader: () => Promise<T[]>
) {
  if (isDemoSession(session)) {
    return demoLoader();
  }

  try {
    return await liveLoader();
  } catch {
    throw liveDataUnavailable(scope);
  }
}
