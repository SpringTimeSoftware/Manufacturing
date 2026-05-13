import { fireEvent, screen, waitFor } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { apiClient } from "../api/http";
import { renderWithApp } from "../test/render";
import {
  ApprovalWorkbenchPage,
  ContextSwitchPage,
  ForgotPasswordPage
} from "./PlatformPages";

describe("PlatformPages", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the context switch preview with warehouse data", async () => {
    renderWithApp(
      <Routes>
        <Route path="/platform/context-switch" element={<ContextSwitchPage />} />
      </Routes>,
      {
        route: "/platform/context-switch"
      }
    );

    expect(await screen.findByText("Company / Branch / Warehouse Switch")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Main Fabrication Plant")).toBeInTheDocument();
    expect(screen.getByText("Context preview")).toBeInTheDocument();
  });

  it("loads approvals and records a decision", async () => {
    renderWithApp(
      <Routes>
        <Route path="/platform/approvals" element={<ApprovalWorkbenchPage />} />
      </Routes>,
      {
        route: "/platform/approvals"
      }
    );

    expect(await screen.findByText("Approval Workbench")).toBeInTheDocument();
    expect((await screen.findAllByText("Approve revised ozone tank BOM")).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: "Approve" }));

    await waitFor(() => {
      expect(screen.getByText(/recorded for BOM-FG-OZ-50 \/ R4/i)).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Approve" })).toBeDisabled();
    expect(screen.getAllByText("Only pending or escalated approvals can receive a decision.").length).toBeGreaterThan(0);
  });

  it("renders forgot-password recovery options for anonymous users", async () => {
    vi.spyOn(apiClient.auth, "forgotPassword").mockResolvedValue({
      requestToken: "reset-test",
      message: "Recovery guidance was prepared if the account details are valid.",
      deliverySummary: "Recovery guidance was queued through the selected channel.",
      availableChallenges: ["Password reset link"],
      expiresOnUtc: new Date(Date.now() + 1000 * 60 * 20).toISOString(),
      pendingEndpoint: "/api/auth/forgot-password"
    });

    renderWithApp(
      <Routes>
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Routes>,
      {
        route: "/forgot-password",
        session: null,
        status: "anonymous"
      }
    );

    expect(await screen.findByText("Recover access")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("User name or email"), {
      target: { value: "planning.manager@sts.local" }
    });
    fireEvent.change(screen.getByLabelText("Company code"), {
      target: { value: "STS" }
    });
    fireEvent.click(screen.getByRole("button", { name: "Request recovery guidance" }));

    await waitFor(() => {
      expect(screen.getByText(/Recovery guidance was prepared/i)).toBeInTheDocument();
    });
  });
});
