import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { renderWithApp } from "../test/render";
import {
  AuditTrailPage,
  RolePermissionMatrixPage,
  UserManagementPage
} from "./AdminPages";

describe("AdminPages", () => {
  it("renders user management and opens the access drawer", async () => {
    renderWithApp(
      <Routes>
        <Route path="/platform/users" element={<UserManagementPage />} />
      </Routes>,
      {
        route: "/platform/users"
      }
    );

    expect(await screen.findByText("User Management")).toBeInTheDocument();
    expect(await screen.findByText("Ritika Sharma")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Ritika Sharma"));

    expect(await screen.findByText("Access policy")).toBeInTheDocument();
  });

  it("renders the role matrix and opens permission details", async () => {
    renderWithApp(
      <Routes>
        <Route path="/platform/roles" element={<RolePermissionMatrixPage />} />
      </Routes>,
      {
        route: "/platform/roles"
      }
    );

    expect(await screen.findByText("Role & Permission Matrix")).toBeInTheDocument();
    expect(await screen.findByText("Planning Manager")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Planning Manager"));

    expect(await screen.findByText("Permission lanes")).toBeInTheDocument();
  });

  it("renders audit trail events and opens the audit workspace", async () => {
    renderWithApp(
      <Routes>
        <Route path="/platform/audit-trail" element={<AuditTrailPage />} />
      </Routes>,
      {
        route: "/platform/audit-trail"
      }
    );

    expect(await screen.findByText("Audit Trail")).toBeInTheDocument();
    const approvalRow = await screen.findByRole("row", {
      name: /platform\.approval\.decision ApprovalWorkItem/
    });
    expect(approvalRow).toBeInTheDocument();

    fireEvent.click(approvalRow);

    expect(await screen.findByText("Audit event detail")).toBeInTheDocument();
  });
});
