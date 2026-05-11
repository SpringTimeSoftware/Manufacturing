import { fireEvent, screen, within } from "@testing-library/react";
import type { ReactElement } from "react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { renderWithApp } from "../test/render";
import { SupplierLeadTimeMatrixPage } from "./CommercialPlanningPages";
import {
  BarcodeLabelSetupPage,
  ItemGroupMasterPage,
  ItemListPage,
  ItemVariantMatrixPage
} from "./ItemMasterPages";
import {
  MeasurementProfileMasterPage,
  UomClassMasterPage,
  UomConversionMasterPage
} from "./MeasurementPages";
import {
  CustomerListDetailPage,
  SupplierListDetailPage
} from "./PartnerPages";

const internalCopyPattern =
  /\bP0\b|React|TypeScript|reference UI|guarded demo|backend reachable|fallback|adapter|mock|seeded fallback|source status|demo shell|Workspace data/i;

function renderPage(path: string, element: ReactElement) {
  return renderWithApp(
    <Routes>
      <Route path={path} element={element} />
    </Routes>,
    { route: path }
  );
}

describe("Wave UX-GLOBAL-02 master-data enforcement", () => {
  it("renders governed action, filter, and grid patterns on master-data list screens", async () => {
    renderPage("/masters/item-groups", <ItemGroupMasterPage />);

    expect(await screen.findByText("Item Group / Category Master")).toBeInTheDocument();
    expect(screen.getByTestId("item-group-action-bar")).toHaveClass("erp-action-bar");
    expect(screen.getByRole("search", { name: "Search item groups filters" })).toHaveClass("erp-filter-bar");
    expect(screen.getByTestId("item-group-grid")).toHaveClass("erp-grid");

    const newDraft = screen.getByRole("button", { name: "New item group draft" });
    expect(newDraft).toBeDisabled();
    expect(screen.getByText("Draft creation requires the governed master-data maintenance workflow.")).toBeInTheDocument();
  });

  it("keeps Item Master business-facing and removes the old workspace-data action text", async () => {
    renderPage("/masters/items", <ItemListPage />);

    expect(await screen.findByText("Item List")).toBeInTheDocument();
    expect(await screen.findByText("Mild Steel Plate 6mm")).toBeInTheDocument();
    expect(screen.queryByText("Workspace data")).not.toBeInTheDocument();
    expect(document.body.textContent ?? "").not.toMatch(internalCopyPattern);
    expect(screen.getAllByText(/Setup complete|Review mode/).length).toBeGreaterThan(0);
  });

  it("opens Customer detail in a governed modal workspace with controlled lookups", async () => {
    renderPage("/partners/customers", <CustomerListDetailPage />);

    expect(await screen.findByText("Demo Industrial Customer")).toBeInTheDocument();
    expect(screen.getByTestId("customer-master-action-bar")).toHaveClass("erp-action-bar");
    expect(screen.getByTestId("customer-master-filter-bar")).toHaveClass("erp-filter-bar");
    expect(screen.getByTestId("customer-master-grid")).toHaveClass("erp-grid");

    fireEvent.click(await screen.findByText("Demo Industrial Customer"));

    const dialog = await screen.findByRole("dialog", { name: "Demo Industrial Customer" });
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
    ].forEach(
      (section) => expect(within(dialog).getByText(section)).toBeInTheDocument()
    );
    expect(within(dialog).getByLabelText("Customer type").tagName).toBe("SELECT");
    expect(within(dialog).getByLabelText("Payment terms").tagName).toBe("SELECT");
    expect(within(dialog).getByRole("button", { name: "Save Draft" })).toBeDisabled();
  });

  it("opens Supplier detail in a governed modal workspace with controlled lookups", async () => {
    renderPage("/partners/suppliers", <SupplierListDetailPage />);

    expect(await screen.findByText("Demo Steel Supplier")).toBeInTheDocument();
    expect(screen.getByTestId("supplier-master-action-bar")).toHaveClass("erp-action-bar");
    expect(screen.getByTestId("supplier-master-filter-bar")).toHaveClass("erp-filter-bar");
    expect(screen.getByTestId("supplier-master-grid")).toHaveClass("erp-grid");

    fireEvent.click(await screen.findByText("Demo Steel Supplier"));

    const dialog = await screen.findByRole("dialog", { name: "Demo Steel Supplier" });
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
    ].forEach(
      (section) => expect(within(dialog).getByText(section)).toBeInTheDocument()
    );
    expect(within(dialog).getByLabelText("Supplier type/category").tagName).toBe("SELECT");
    expect(within(dialog).getByLabelText("Payment terms").tagName).toBe("SELECT");
    expect(within(dialog).getByRole("button", { name: "Save Draft" })).toBeDisabled();
  });

  it("enforces lookup/select controls for measurement master fields", async () => {
    renderPage("/masters/uom-classes", <UomClassMasterPage />);

    expect(await screen.findByText("UOM Class Master")).toBeInTheDocument();
    expect(screen.getByTestId("uom-class-action-bar")).toHaveClass("erp-action-bar");
    expect(screen.getByTestId("uom-class-filter-bar")).toHaveClass("erp-filter-bar");
    expect(screen.getByTestId("uom-class-grid")).toHaveClass("erp-grid");
    fireEvent.click(await screen.findByRole("row", { name: "COUNT UOM class" }));
    expect(within(await screen.findByRole("dialog", { name: "Count" })).getByLabelText("Base UOM").tagName).toBe("SELECT");
  });

  it("enforces lookup/select controls on conversion, profile, variant, barcode, and lead-time editors", async () => {
    let view = renderPage("/masters/uom-conversions", <UomConversionMasterPage />);
    fireEvent.click(await screen.findByRole("row", { name: "SHEET to SQM conversion" }));
    let dialog = await screen.findByRole("dialog", { name: "SHEET -> SQM" });
    expect(within(dialog).getByLabelText("From UOM").tagName).toBe("SELECT");
    expect(within(dialog).getByLabelText("To UOM").tagName).toBe("SELECT");
    view.unmount();

    view = renderPage("/masters/measurement-profiles", <MeasurementProfileMasterPage />);
    fireEvent.click(await screen.findByRole("row", { name: "STD-COUNT measurement profile" }));
    dialog = await screen.findByRole("dialog", { name: "Standard Count Item" });
    expect(within(dialog).getByLabelText("Stock UOM class").tagName).toBe("SELECT");
    view.unmount();

    view = renderPage("/masters/item-variants", <ItemVariantMatrixPage />);
    fireEvent.click(await screen.findByRole("row", { name: "SS-304-6MM item variant" }));
    dialog = await screen.findByRole("dialog", { name: "SS304 6mm sheet" });
    expect(within(dialog).getByLabelText("Variant item/template selector").tagName).toBe("SELECT");
    view.unmount();

    view = renderPage("/masters/barcodes", <BarcodeLabelSetupPage />);
    fireEvent.click(await screen.findByRole("row", { name: "FG-BRACKET-001 barcode" }));
    dialog = await screen.findByRole("dialog", { name: "FG-BRACKET-001" });
    expect(within(dialog).getByLabelText("Barcode item selector").tagName).toBe("SELECT");
    view.unmount();

    renderPage("/commercial/supplier-lead-times", <SupplierLeadTimeMatrixPage />);
    expect(await screen.findByText("Supplier Lead Time Matrix")).toBeInTheDocument();
    expect(screen.getByTestId("supplier-lead-time-action-bar")).toHaveClass("erp-action-bar");
    expect(screen.getByTestId("supplier-lead-time-filter-bar")).toHaveClass("erp-filter-bar");
    expect(screen.getByTestId("supplier-lead-time-grid")).toHaveClass("erp-grid");
    expect(screen.getByRole("button", { name: "New lead-time row" })).toBeDisabled();
    fireEvent.click(await screen.findByRole("row", { name: "RM-PLATE-001 supplier lead-time matrix" }));
    dialog = await screen.findByRole("dialog", { name: "RM-PLATE-001" });
    expect(within(dialog).getByLabelText("Supplier lead-time item selector").tagName).toBe("SELECT");
    expect(within(dialog).getByLabelText("Supplier").tagName).toBe("SELECT");
    expect(within(dialog).getByLabelText("Order policy").tagName).toBe("SELECT");
  });
});
