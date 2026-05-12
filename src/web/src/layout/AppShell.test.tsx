import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { buildDemoSession } from "../auth/AuthContext";
import { renderWithApp } from "../test/render";
import { AppShell } from "./AppShell";

describe("AppShell", () => {
  it("renders grouped manufacturing navigation with visible active menu item", async () => {
    const { container } = renderWithApp(
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<div>Dashboard content</div>} />
        </Route>
      </Routes>
    );

    expect(await screen.findByText("Dashboard content")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Skip to content" })).toBeInTheDocument();
    expect(screen.getByText("OVERVIEW")).toBeInTheDocument();
    expect(screen.getByText("PLANNING")).toBeInTheDocument();
    expect(screen.getByText("ENGINEERING & PRODUCTION")).toBeInTheDocument();
    expect(screen.getByText("MASTER DATA")).toBeInTheDocument();
    expect(screen.getByText("COMMERCIAL SETUP")).toBeInTheDocument();
    expect(screen.getByText("PROCUREMENT")).toBeInTheDocument();
    expect(screen.getByText("INVENTORY")).toBeInTheDocument();
    expect(screen.getByText("QUALITY")).toBeInTheDocument();
    expect(screen.getByText("DISPATCH")).toBeInTheDocument();
    expect(screen.getByText("PLATFORM")).toBeInTheDocument();
    expect(screen.getByText("REPORTS")).toBeInTheDocument();
    expect(screen.queryByText("WORKFLOW SHORTCUTS")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home Dashboard" })).toHaveClass(
      "app-shell__nav-link--active"
    );
    expect(container.querySelector(".app-shell__nav-svg")).not.toBeNull();
    expect(container.querySelector(".app-shell__nav-section-count")).toBeNull();
    expect(screen.getByLabelText("Company")).toHaveDisplayValue("STS Precision Fabricators");
    expect(screen.getByLabelText("Branch")).toHaveDisplayValue("Main Fabrication Plant");
    expect(screen.getByRole("button", { name: /Notifications/i })).toBeInTheDocument();

    const sectionHeaderText = Array.from(container.querySelectorAll(".app-shell__nav-section-button"))
      .map((button) => button.textContent ?? "")
      .join(" ");
    expect(sectionHeaderText).not.toMatch(/\d/);
    expect(sectionHeaderText).not.toMatch(/\+\d/);
    expect(sectionHeaderText).not.toMatch(/\bLESS\b/i);
  });

  it("hides optional workflow UI when the related flags are disabled", async () => {
    renderWithApp(
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<div>Dashboard content</div>} />
        </Route>
      </Routes>,
      {
        flags: {
          enableNotificationCenter: false,
          showDemoBadges: false,
          showSeededNavigation: false
        }
      }
    );

    expect(await screen.findByText("Dashboard content")).toBeInTheDocument();
    expect(screen.queryByText("WORKFLOW SHORTCUTS")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Notifications/i })).not.toBeInTheDocument();
    expect(screen.getByText("STS Manufacturing ERP")).toBeInTheDocument();
  });

  it("renders full-access role navigation without internal implementation copy", async () => {
    const superAdminSession = {
      ...buildDemoSession(),
      user: {
        ...buildDemoSession().user,
        displayName: "Super Admin",
        userName: "super.admin",
        email: "super.admin@sts.local",
        roles: ["SuperAdmin" as const]
      }
    };

    const { container } = renderWithApp(
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<div>Dashboard content</div>} />
        </Route>
      </Routes>,
      {
        session: superAdminSession
      }
    );

    expect(await screen.findByText("Dashboard content")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Platform/i }));
    expect(screen.getByRole("link", { name: "Users" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Platform Settings" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Tenant Settings" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Commercial Setup/i }));
    expect(screen.getByRole("link", { name: "Price Lists" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Discount Schemes" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Tax, Currency & Terms" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Master Data/i }));
    expect(screen.getByRole("link", { name: "Customers" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Suppliers" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Items" })).toBeInTheDocument();

    const shellText = container.textContent ?? "";
    [
      /\bP0\b/i,
      /reference UI/i,
      /guarded demo/i,
      /demo shell/i,
      /backend reachable/i,
      /source status/i,
      /React \+ TypeScript/i,
      /fallback/i,
      /adapter/i,
      /mock/i,
      /mobile/i
    ].forEach((pattern) => expect(shellText).not.toMatch(pattern));
  });
});
