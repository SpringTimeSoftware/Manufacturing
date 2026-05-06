import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { renderWithApp } from "../test/render";
import { RouteGuard } from "./RouteGuard";

describe("RouteGuard", () => {
  it("redirects anonymous users to the sign-in route", async () => {
    renderWithApp(
      <Routes>
        <Route
          path="/secure"
          element={
            <RouteGuard>
              <div>Secure workspace</div>
            </RouteGuard>
          }
        />
        <Route path="/login" element={<div>Login route</div>} />
      </Routes>,
      {
        route: "/secure",
        session: null,
        status: "anonymous"
      }
    );

    expect(await screen.findByText("Login route")).toBeInTheDocument();
    expect(screen.queryByText("Secure workspace")).not.toBeInTheDocument();
  });

  it("blocks authenticated users outside the required role scope", async () => {
    renderWithApp(
      <Routes>
        <Route
          path="/secure"
          element={
            <RouteGuard roles={["PlatformAdmin"]}>
              <div>Platform workspace</div>
            </RouteGuard>
          }
        />
      </Routes>,
      {
        route: "/secure"
      }
    );

    expect(await screen.findByText("Access limited by role scope")).toBeInTheDocument();
    expect(screen.queryByText("Platform workspace")).not.toBeInTheDocument();
  });
});
