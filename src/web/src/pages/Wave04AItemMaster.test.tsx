import { fireEvent, screen, within } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { renderWithApp } from "../test/render";
import { ItemListPage } from "./ItemMasterPages";

function renderItemMaster() {
  renderWithApp(
    <Routes>
      <Route path="/masters/items" element={<ItemListPage />} />
    </Routes>,
    { route: "/masters/items" }
  );
}

const internalCopyPattern =
  /\bP0\b|React|TypeScript|reference UI|guarded demo|backend reachable|fallback|adapter|mock|seeded fallback|source status|demo shell/i;

describe("Wave 04A Item Master deep rework", () => {
  it("renders dense ERP item list columns and filters", async () => {
    renderItemMaster();

    expect(await screen.findByText("Item List")).toBeInTheDocument();
    expect(await screen.findByText("Mild Steel Plate 6mm")).toBeInTheDocument();
    expect(screen.getByText("Total items")).toBeInTheDocument();
    expect(screen.getByText("Active items")).toBeInTheDocument();
    expect(screen.getByText("Incomplete items")).toBeInTheDocument();
    expect(screen.getByText("Make / buy / subcontract")).toBeInTheDocument();
    expect(screen.getByTestId("item-master-action-bar")).toHaveClass("erp-action-bar");
    expect(screen.getByTestId("item-master-filter-bar")).toHaveClass("erp-filter-bar");
    expect(screen.getByTestId("item-master-grid")).toHaveClass("erp-grid");
    expect(screen.getByRole("columnheader", { name: "Item code" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Group / category" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "UOM" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Make / buy" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "QC" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Catalog" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Media / documents" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Active/status" })).toBeInTheDocument();
    expect(screen.getByLabelText("QC required")).toBeInTheDocument();
    expect(screen.getByLabelText("Catalog visible")).toBeInTheDocument();
    expect(screen.getByLabelText("Has media")).toBeInTheDocument();
  });

  it("opens item detail with every required V2 section", async () => {
    renderItemMaster();

    fireEvent.click(await screen.findByRole("row", { name: "FG-BRACKET-001 item master" }));

    expect(await screen.findByRole("dialog", { name: "Fabricated Mounting Bracket" })).toBeInTheDocument();
    expect(await screen.findByText("Item detail editor")).toBeInTheDocument();
    expect(document.querySelector(".ui-drawer__panel--item-master")).not.toBeInTheDocument();
    expect(document.querySelector(".ui-modal__panel--item-master")).toBeInTheDocument();
    ["Identity", "Media & Catalog", "Measurement & Packaging", "Operations", "Commercial", "References", "Governance"].forEach(
      (group) => expect(screen.getByText(group)).toBeInTheDocument()
    );
    [
      "Core Info",
      "Classification",
      "Images & Media",
      "Catalog",
      "UOM & Conversions",
      "Packaging",
      "Physical Specs",
      "Barcode & Labels",
      "Variants/Templates",
      "Manufacturing",
      "Planning/Replenishment",
      "Inventory/Warehouse Policy",
      "Quality/Traceability",
      "Sales/Commercial",
      "Purchase/Vendor",
      "Customer References",
      "Attachments/Documents",
      "Audit/History"
    ].forEach((tab) => {
      expect(screen.getByRole("tab", { name: tab })).toBeInTheDocument();
    });
    expect(screen.getByRole("button", { name: "Save Draft" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save & Continue" })).toBeInTheDocument();
  });

  it("opens New Item Draft in create mode with required fields and save action", async () => {
    renderItemMaster();

    fireEvent.click(await screen.findByRole("button", { name: "New item draft" }));

    const dialog = await screen.findByRole("dialog", { name: "Draft Item" });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText("Item detail editor")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Item code")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Item name")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Short name")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Item type")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Item group/category")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Stock UOM")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Item group/category").tagName).toBe("SELECT");
    expect(within(dialog).getByLabelText("Stock UOM").tagName).toBe("SELECT");
    expect(within(dialog).getByLabelText("Default warehouse").tagName).toBe("SELECT");
    expect(within(dialog).getByRole("button", { name: "Save Draft" })).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Save Draft" }));
    expect((await within(dialog).findAllByText(/Item code is required/)).length).toBeGreaterThan(0);
  });

  it("renders media, catalog, packaging, specs, and reference support", async () => {
    renderItemMaster();

    fireEvent.click(await screen.findByRole("row", { name: "FG-BRACKET-001 item master" }));
    fireEvent.click(await screen.findByRole("tab", { name: "Classification" }));
    const classificationDialog = await screen.findByRole("dialog", { name: "Fabricated Mounting Bracket" });
    expect(within(classificationDialog).getByLabelText("Category").tagName).toBe("SELECT");
    expect(within(classificationDialog).getByLabelText("Subcategory").tagName).toBe("SELECT");
    expect(within(classificationDialog).getByLabelText("Subcategory")).toBeDisabled();
    expect(within(classificationDialog).getByLabelText("Product family").tagName).toBe("SELECT");
    expect(within(classificationDialog).getByLabelText("Product family")).toBeDisabled();
    expect(within(classificationDialog).getByLabelText("Business segment").tagName).toBe("SELECT");
    expect(within(classificationDialog).getByLabelText("Business segment")).toBeDisabled();
    expect(
      within(classificationDialog).getAllByText("Dedicated item taxonomy setup is required before this value can be selected.").length
    ).toBeGreaterThan(0);

    fireEvent.click(await screen.findByRole("tab", { name: "Images & Media" }));
    expect(await screen.findByText("Primary image")).toBeInTheDocument();
    expect(screen.getByText("Gallery and media")).toBeInTheDocument();
    expect(screen.getByText("Drawing, spec, and photo slots")).toBeInTheDocument();
    expect(screen.getByText("Media actions")).toBeInTheDocument();
    expect(screen.getByText("Media storage is not enabled for item records, so upload actions are unavailable.")).toBeInTheDocument();
    const dialog = screen.getByRole("dialog", { name: "Fabricated Mounting Bracket" });
    expect(within(dialog).getByRole("button", { name: "Upload media" })).toBeDisabled();

    fireEvent.click(screen.getByRole("tab", { name: "Catalog" }));
    expect(screen.getByText("Catalog visibility")).toBeInTheDocument();
    expect(screen.getByText("Catalog preview")).toBeInTheDocument();
    expect(screen.getByText("Customer-visible specs")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Packaging" }));
    expect(screen.getByText("Inner pack")).toBeInTheDocument();
    expect(screen.getByText("Packing instructions")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Physical Specs" }));
    expect(screen.getByText("Material")).toBeInTheDocument();
    expect(screen.getByText("Color / finish")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Customer References" }));
    expect(screen.getByText("Customer item code")).toBeInTheDocument();
    expect(screen.getByDisplayValue("ENK-BR-441")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add customer reference" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Purchase/Vendor" }));
    expect(screen.getByText("Vendor item references")).toBeInTheDocument();
    expect(screen.getByText("Vendor item code")).toBeInTheDocument();
    expect(screen.getByDisplayValue("PC-BLK-BR-001")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Add vendor reference" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Attachments/Documents" }));
    expect(screen.getByText("Attachments and controlled documents")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("tab", { name: "Audit/History" }));
    expect(screen.getByText("Audit and history")).toBeInTheDocument();
  });

  it("does not expose internal scaffold wording in item list or detail", async () => {
    renderItemMaster();

    fireEvent.click(await screen.findByRole("row", { name: "RM-SS-SHEET item master" }));
    await screen.findByText("Item detail editor");

    expect(document.body.textContent ?? "").not.toMatch(internalCopyPattern);
  });
});
