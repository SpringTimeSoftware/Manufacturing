import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { renderWithApp } from "../test/render";
import {
  DashboardHomePage,
  ExecutiveCockpitPage
} from "./DashboardPages";

describe("DashboardPages", () => {
  it("renders the role home dashboard with operational sections", async () => {
    const { container } = renderWithApp(
      <Routes>
        <Route path="/" element={<DashboardHomePage />} />
      </Routes>
    );

    expect(await screen.findByText("Delivery risk")).toBeInTheDocument();
    expect(screen.getByText("Production progress")).toBeInTheDocument();
    expect(screen.getByText("Bottlenecks and approvals")).toBeInTheDocument();
    expect(screen.getByText("Quick access")).toBeInTheDocument();
    expect(screen.getByText("Review order risk")).toBeInTheDocument();

    const dashboardText = container.textContent ?? "";
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
      /mock/i
    ].forEach((pattern) => expect(dashboardText).not.toMatch(pattern));
  });

  it("renders the executive cockpit with intervention and stage surfaces", async () => {
    renderWithApp(
      <Routes>
        <Route path="/dashboards/executive-cockpit" element={<ExecutiveCockpitPage />} />
      </Routes>,
      {
        route: "/dashboards/executive-cockpit"
      }
    );

    expect(await screen.findByText("Executive Cockpit")).toBeInTheDocument();
    expect(screen.getByText("Priority interventions")).toBeInTheDocument();
    expect(screen.getByText("Stage pressure map")).toBeInTheDocument();

    fireEvent.click(await screen.findByRole("row", { name: "SO-2026-0189 executive intervention" }));

    expect(await screen.findByText("Risk status")).toBeInTheDocument();
    expect(screen.getAllByText("Enkay Ozone").length).toBeGreaterThan(0);
  });
});
