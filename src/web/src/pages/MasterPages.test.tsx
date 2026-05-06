import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { renderWithApp } from "../test/render";
import {
  TenantSettingsPage,
  TranslationSetupPage,
  WorkflowNumberingPage
} from "./MasterPages";

describe("MasterPages", () => {
  it("renders language setup and opens translation detail", async () => {
    renderWithApp(
      <Routes>
        <Route path="/platform/translations" element={<TranslationSetupPage />} />
      </Routes>,
      {
        route: "/platform/translations"
      }
    );

    expect(await screen.findByText("Language & Translation Setup")).toBeInTheDocument();
    expect(await screen.findByText("production.receipt.create")).toBeInTheDocument();

    fireEvent.click(screen.getByText("production.receipt.create"));

    expect(await screen.findByText("Translation editor")).toBeInTheDocument();
  });

  it("renders workflow numbering and opens the selected template", async () => {
    renderWithApp(
      <Routes>
        <Route path="/platform/workflow-numbering" element={<WorkflowNumberingPage />} />
      </Routes>,
      {
        route: "/platform/workflow-numbering"
      }
    );

    expect(await screen.findByText("Workflow & Numbering Setup")).toBeInTheDocument();
    expect(await screen.findByText("Sales Order")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Sales Order"));

    expect(await screen.findByText("Workflow template")).toBeInTheDocument();
  });

  it("renders tenant settings and allows feature-flag review", async () => {
    renderWithApp(
      <Routes>
        <Route path="/platform/tenant-settings" element={<TenantSettingsPage />} />
      </Routes>,
      {
        route: "/platform/tenant-settings"
      }
    );

    expect(await screen.findByText("Tenant Settings")).toBeInTheDocument();
    expect(await screen.findByText("Notification center")).toBeInTheDocument();
    expect(screen.getAllByText("Feature flags").length).toBeGreaterThan(0);
    expect(screen.getByText("Tenant policy registry")).toBeInTheDocument();
  });
});
