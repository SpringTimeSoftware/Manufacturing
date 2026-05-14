import { fireEvent, screen, within } from "@testing-library/react";
import type { ReactElement } from "react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { renderWithApp } from "../test/render";
import { QuoteEstimateListPage } from "./CommercialPlanningPages";
import { PurchaseOrderPage } from "./ProcurementPages";
import { MaterialIssuePage } from "./InventoryPages";
import { WorkOrdersPage } from "./OperationsPages";
import { UserManagementPage } from "./AdminPages";

const blockedCopy =
  /Workspace data|Setup planned|governed setup|internal only|source status|fallback|adapter|mock|seeded fallback/i;

function renderPage(path: string, element: ReactElement) {
  return renderWithApp(
    <Routes>
      <Route path={path} element={element} />
    </Routes>,
    { route: path }
  );
}

describe("Wave UX-GLOBAL-03 modal, action, and lookup reliability", () => {
  it("keeps sales quote draft actions honest and opens centered modal detail", async () => {
    renderPage("/sales/quotes", <QuoteEstimateListPage />);

    expect(await screen.findByText("Estimate / Quote List")).toBeInTheDocument();
    expect(screen.getByTestId("quote-action-bar")).toHaveClass("erp-action-bar");
    expect(screen.getByRole("button", { name: "New quote draft" })).not.toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "New quote draft" }));
    const draftDialog = await screen.findByRole("dialog", { name: "New quote draft" });
    expect(within(draftDialog).getByTestId("erp-modal-workspace")).toBeInTheDocument();
    expect(within(draftDialog).getByLabelText("Customer").tagName).toBe("SELECT");
    expect(within(draftDialog).getByRole("button", { name: "Save quote draft" })).toBeDisabled();
    expect(within(draftDialog).getByText("Live workspace sign-in is required before saving quote drafts.")).toBeInTheDocument();
    fireEvent.click(within(draftDialog).getAllByRole("button", { name: "Close" })[0]);

    fireEvent.click(await screen.findByRole("row", { name: "QT-2026-0042 quote" }));
    const dialog = await screen.findByRole("dialog", { name: "QT-2026-0042" });
    expect(within(dialog).getByTestId("erp-modal-workspace")).toBeInTheDocument();
    expect(document.querySelector(".ui-drawer__panel")).not.toBeInTheDocument();
    expect(within(dialog).getByLabelText("Customer").tagName).toBe("SELECT");
    expect(within(dialog).getByRole("button", { name: "Save quote draft" })).toBeDisabled();
  });

  it("classifies procurement save and approval actions with disabled reasons", async () => {
    renderPage("/procurement/purchase-orders", <PurchaseOrderPage />);

    expect(await screen.findByText("Purchase Order List / Detail")).toBeInTheDocument();
    expect(screen.getByTestId("purchase-order-action-bar")).toHaveClass("erp-action-bar");
    expect(screen.getByRole("button", { name: "Approve PO" })).toBeDisabled();
    expect(screen.getByText("Purchase order approval requires a live procurement session.")).toBeInTheDocument();

    fireEvent.click(await screen.findByRole("row", { name: "PO-2026-0114 purchase order" }));
    const dialog = await screen.findByRole("dialog", { name: "PO-2026-0114" });
    expect(within(dialog).getByTestId("erp-modal-workspace")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Supplier").tagName).toBe("SELECT");
    expect(within(dialog).getByRole("button", { name: "Save purchase order" })).toBeDisabled();
    expect(within(dialog).getByText("Purchase order save requires a live procurement session.")).toBeInTheDocument();
  });

  it("uses governed modal and lookup controls for inventory issue review", async () => {
    renderPage("/inventory/material-issue", <MaterialIssuePage />);

    expect(await screen.findByText("Material Issue to WO")).toBeInTheDocument();
    expect(screen.getByTestId("material-issue-action-bar")).toHaveClass("erp-action-bar");
    expect(screen.getByRole("button", { name: "Prepare issue draft" })).toBeDisabled();

    fireEvent.click(await screen.findByRole("row", { name: "ISS-WO-2026-044 material issue" }));
    const dialog = await screen.findByRole("dialog", { name: "ISS-WO-2026-044" });
    expect(within(dialog).getByTestId("erp-modal-workspace")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("From location").tagName).toBe("SELECT");
    expect(within(dialog).getByLabelText("Issue mode").tagName).toBe("SELECT");
  });

  it("converts production work-order detail to centered modal with disabled release actions", async () => {
    renderPage("/production/work-orders", <WorkOrdersPage />);

    expect(await screen.findByText("Work Orders")).toBeInTheDocument();
    expect(screen.getByTestId("work-order-action-bar")).toHaveClass("erp-action-bar");
    expect(screen.getByRole("button", { name: "New work order" })).toBeDisabled();

    fireEvent.click(await screen.findByRole("row", { name: "WO-2026-044 work order" }));
    const dialog = await screen.findByRole("dialog", { name: "WO-2026-044" });
    expect(within(dialog).getByTestId("erp-modal-workspace")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Release work order" })).toBeDisabled();
    expect(within(dialog).getAllByText("Live production sign-in is required before updating work orders.").length).toBeGreaterThan(0);
  });

  it("keeps admin access editors centered and removes weak implementation wording", async () => {
    renderPage("/admin/users", <UserManagementPage />);

    expect(await screen.findByText("User Management")).toBeInTheDocument();
    expect(screen.getByTestId("user-management-action-bar")).toHaveClass("erp-action-bar");
    expect(screen.getByRole("button", { name: "Invite user" })).toBeDisabled();
    expect(document.body.textContent ?? "").not.toMatch(blockedCopy);

    fireEvent.click(await screen.findByRole("row", { name: "Super Admin user details" }));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByTestId("erp-modal-workspace")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Login policy").tagName).toBe("SELECT");
  });
});
