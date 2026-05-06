import { fireEvent, screen, waitFor } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { renderWithApp } from "../test/render";
import {
  ApprovalWorkbenchPage,
  ContextSwitchPage,
  ForgotPasswordPage
} from "./PlatformPages";

describe("PlatformPages", () => {
  it("renders the context switch workspace preview with warehouse data", async () => {
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
    expect(screen.getByText("Workspace preview")).toBeInTheDocument();
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
  });

  it("renders forgot-password recovery options for anonymous users", async () => {
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
