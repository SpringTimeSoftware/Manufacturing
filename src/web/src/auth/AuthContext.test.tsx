import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient, ApiError } from "../api/http";
import { AuthProvider, buildDemoSession, useAuth } from "./AuthContext";
import { clearStoredSession, readStoredSession, storeSession } from "./authStorage";

function AuthProbe() {
  const { restoreError, status } = useAuth();

  return (
    <div>
      <span data-testid="auth-status">{status}</span>
      <span data-testid="restore-error">{restoreError ?? "none"}</span>
    </div>
  );
}

function LoginProbe() {
  const { login, status } = useAuth();

  return (
    <div>
      <span data-testid="auth-status">{status}</span>
      <button
        type="button"
        onClick={() =>
          void login({
            userName: "planning.manager",
            password: "Planning@123",
            companyId: 1,
            branchId: 10
          })
        }
      >
        Sign in probe
      </button>
    </div>
  );
}

describe("AuthProvider session restore", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    clearStoredSession();
  });

  it("clears an invalid stored refresh token without showing a stale-token error", async () => {
    storeSession(buildDemoSession());
    vi.spyOn(apiClient.auth, "me").mockRejectedValueOnce(new ApiError("Authentication required.", 401));
    vi.spyOn(apiClient.auth, "refresh").mockRejectedValueOnce(
      new ApiError("Refresh token is invalid or expired.", 401)
    );

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("auth-status")).toHaveTextContent("anonymous"));
    expect(screen.getByTestId("restore-error")).toHaveTextContent("none");
    expect(readStoredSession()).toBeNull();
  });

  it("clears malformed stored sessions before restore", async () => {
    localStorage.setItem("sts-mfg.web.session", JSON.stringify({ refreshToken: "expired-refresh-token" }));

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId("auth-status")).toHaveTextContent("anonymous"));
    expect(readStoredSession()).toBeNull();
  });

  it("clears stale browser storage before a new login attempt", async () => {
    storeSession(buildDemoSession());
    const nextSession = {
      ...buildDemoSession(),
      accessToken: "fresh-access-token",
      refreshToken: "fresh-refresh-token"
    };

    vi.spyOn(apiClient.auth, "login").mockImplementationOnce(async () => {
      expect(readStoredSession()).toBeNull();
      return nextSession;
    });

    render(
      <AuthProvider disableAutoRestore initialStatus="anonymous">
        <LoginProbe />
      </AuthProvider>
    );

    fireEvent.click(screen.getByRole("button", { name: "Sign in probe" }));

    await waitFor(() => expect(screen.getByTestId("auth-status")).toHaveTextContent("authenticated"));
    expect(readStoredSession()?.accessToken).toBe("fresh-access-token");
  });
});
