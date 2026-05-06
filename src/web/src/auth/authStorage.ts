import type { AuthSessionResponse } from "../api/contracts";

const storageKey = "sts-mfg.web.session";

function isStoredSession(value: unknown): value is AuthSessionResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<AuthSessionResponse>;

  return (
    typeof candidate.accessToken === "string" &&
    candidate.accessToken.trim().length > 0 &&
    typeof candidate.refreshToken === "string" &&
    candidate.refreshToken.trim().length > 0 &&
    typeof candidate.accessTokenExpiresOnUtc === "string" &&
    Boolean(candidate.user)
  );
}

export function readStoredSession() {
  const raw = globalThis.localStorage?.getItem(storageKey);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!isStoredSession(parsed)) {
      globalThis.localStorage?.removeItem(storageKey);
      return null;
    }

    return parsed;
  } catch {
    globalThis.localStorage?.removeItem(storageKey);
    return null;
  }
}

export function storeSession(session: AuthSessionResponse) {
  globalThis.localStorage?.setItem(storageKey, JSON.stringify(session));
}

export function clearStoredSession() {
  globalThis.localStorage?.removeItem(storageKey);
}
