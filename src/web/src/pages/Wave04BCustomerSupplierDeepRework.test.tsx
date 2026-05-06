import { fireEvent, screen, within } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { renderWithApp } from "../test/render";
import { CustomerListDetailPage, SupplierListDetailPage } from "./PartnerPages";

const internalCopyPattern =
  /\bP0\b|React|TypeScript|reference UI|guarded demo|backend reachable|fallback|adapter|mock|seeded fallback|source status|demo shell|Workspace data/i;

function renderCustomerPage() {
  return renderWithApp(
    <Routes>
      <Route path="/partners/customers" element={<CustomerListDetailPage />} />
    </Routes>,
    { route: "/partners/customers" }
  );
}

function renderSupplierPage() {
  return renderWithApp(
    <Routes>
      <Route path="/partners/suppliers" element={<SupplierListDetailPage />} />
    </Routes>,
    { route: "/partners/suppliers" }
  );
}

describe("Wave 4B customer and supplier deep business rework", () => {
  it("renders customer KPIs, dense columns, filters, and no internal copy", async () => {
    renderCustomerPage();

    expect(await screen.findByText("Customer List & Detail")).toBeInTheDocument();
    expect(await screen.findByText("Demo Industrial Customer")).toBeInTheDocument();
    ["Total customers", "Active customers", "Credit watch", "Sites ready", "Contacts ready", "Catalog enabled"].forEach((label) =>
      expect(screen.getAllByText(label).length).toBeGreaterThan(0)
    );
    const customerGrid = screen.getByTestId("customer-master-grid");
    ["Customer code", "Customer name", "Legal/type", "Terms", "Credit status", "Contacts", "Sites/addresses", "Status"].forEach((header) =>
      expect(within(customerGrid).getByText(header)).toBeInTheDocument()
    );
    expect(screen.getByLabelText("Customer type filter").tagName).toBe("SELECT");
    expect(screen.getByLabelText("Customer payment terms filter").tagName).toBe("SELECT");
    expect(document.body.textContent ?? "").not.toMatch(internalCopyPattern);
  });

  it("opens a new customer draft in a governed modal with required sections and controlled lookups", async () => {
    renderCustomerPage();

    fireEvent.click(await screen.findByRole("button", { name: "New customer draft" }));

    const dialog = await screen.findByRole("dialog", { name: "Draft Customer" });
    expect(dialog).toBeInTheDocument();
    expect(document.querySelector(".ui-drawer__panel")).not.toBeInTheDocument();
    [
      "Core Info",
      "Legal/Tax",
      "Sites / Bill-to / Ship-to",
      "Contacts",
      "Contact Points",
      "Credit Profile",
      "Terms & Commercial",
      "Dispatch Preferences",
      "Catalog / Visibility",
      "Customer Item References",
      "Documents",
      "Audit / History"
    ].forEach((section) => expect(within(dialog).getByText(section)).toBeInTheDocument());
    expect(within(dialog).getByLabelText("Payment terms").tagName).toBe("SELECT");
    expect(within(dialog).getByLabelText("Contact role").tagName).toBe("SELECT");
    expect(within(dialog).getByLabelText("Communication channel").tagName).toBe("SELECT");
    expect(within(dialog).getByRole("button", { name: "Upload customer document" })).toBeDisabled();
    expect(within(dialog).getByRole("button", { name: "Add document metadata" })).toBeInTheDocument();
    expect(within(dialog).getAllByText("Binary upload storage is not enabled. Document metadata can be saved now.").length).toBeGreaterThan(0);
    expect(within(dialog).getByRole("button", { name: "Save Draft" })).toBeDisabled();
  });

  it("renders supplier KPIs, dense columns, filters, and no internal copy", async () => {
    renderSupplierPage();

    expect(await screen.findByText("Supplier List & Detail")).toBeInTheDocument();
    expect(await screen.findByText("Demo Steel Supplier")).toBeInTheDocument();
    ["Total suppliers", "Active suppliers", "Approved suppliers", "Compliance pending", "Lead-time coverage", "Contacts ready"].forEach((label) =>
      expect(screen.getAllByText(label).length).toBeGreaterThan(0)
    );
    const supplierGrid = screen.getByTestId("supplier-master-grid");
    ["Supplier code", "Supplier name", "Supplier type/category", "Terms", "Compliance", "Lead-time signal", "Contacts", "Status"].forEach((header) =>
      expect(within(supplierGrid).getByText(header)).toBeInTheDocument()
    );
    expect(screen.getByLabelText("Supplier type/category filter").tagName).toBe("SELECT");
    expect(screen.getByLabelText("Supplier payment terms filter").tagName).toBe("SELECT");
    expect(document.body.textContent ?? "").not.toMatch(internalCopyPattern);
  });

  it("opens a new supplier draft in a governed modal with required sections and controlled lookups", async () => {
    renderSupplierPage();

    fireEvent.click(await screen.findByRole("button", { name: "New supplier draft" }));

    const dialog = await screen.findByRole("dialog", { name: "Draft Supplier" });
    expect(dialog).toBeInTheDocument();
    expect(document.querySelector(".ui-drawer__panel")).not.toBeInTheDocument();
    [
      "Core Info",
      "Legal/Tax",
      "Sites / Addresses",
      "Contacts",
      "Contact Points",
      "Terms & Commercial",
      "Supplier Categories / Capability",
      "Lead-Time Rules",
      "Approved Items / Vendor References",
      "Compliance Documents",
      "Documents",
      "Audit / History"
    ].forEach((section) => expect(within(dialog).getByText(section)).toBeInTheDocument());
    expect(within(dialog).getByLabelText("Payment terms").tagName).toBe("SELECT");
    expect(within(dialog).getByLabelText("Contact role").tagName).toBe("SELECT");
    expect(within(dialog).getByLabelText("Communication channel").tagName).toBe("SELECT");
    expect(within(dialog).getByRole("button", { name: "Upload compliance document" })).toBeDisabled();
    expect(within(dialog).getByRole("button", { name: "Add compliance metadata" })).toBeInTheDocument();
    expect(within(dialog).getAllByText("Binary upload storage is not enabled. Document metadata can be saved now.").length).toBeGreaterThan(0);
    expect(within(dialog).getByRole("button", { name: "Save Draft" })).toBeDisabled();
  });
});
