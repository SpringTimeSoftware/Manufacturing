import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import {
  BarcodeLabelSetupPage,
  ItemAttributeMasterPage,
  ItemGroupMasterPage,
  ItemListPage,
  ItemVariantMatrixPage,
  ReasonCodeRulesPage
} from "./ItemMasterPages";
import {
  MeasurementProfileMasterPage,
  UomClassMasterPage,
  UomConversionMasterPage
} from "./MeasurementPages";
import { CustomerListDetailPage, SupplierListDetailPage } from "./PartnerPages";
import { renderWithApp } from "../test/render";

describe("Prompt P084-P089 master-data pages", () => {
  it("renders P084 UOM class and conversion screens with detail drawers", async () => {
    renderWithApp(
      <Routes>
        <Route path="/measurements/uom-classes" element={<UomClassMasterPage />} />
        <Route path="/measurements/uom-conversions" element={<UomConversionMasterPage />} />
      </Routes>,
      { route: "/measurements/uom-classes" }
    );

    expect(await screen.findByText("UOM Class Master")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("row", { name: "COUNT UOM class" }));
    expect(await screen.findByText("UOM class setup")).toBeInTheDocument();
  });

  it("renders P084 conversion setup with formula tokens", async () => {
    renderWithApp(
      <Routes>
        <Route path="/measurements/uom-conversions" element={<UomConversionMasterPage />} />
      </Routes>,
      { route: "/measurements/uom-conversions" }
    );

    expect(await screen.findByText("UOM Conversion Master")).toBeInTheDocument();
    expect(await screen.findByText("LENGTH_MM, WIDTH_MM")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("row", { name: "SHEET to SQM conversion" }));
    expect(await screen.findByText("Conversion setup")).toBeInTheDocument();
  });

  it("renders P085 measurement profiles and dimensional formulas", async () => {
    renderWithApp(
      <Routes>
        <Route path="/measurements/profiles" element={<MeasurementProfileMasterPage />} />
      </Routes>,
      { route: "/measurements/profiles" }
    );

    expect(await screen.findByText("Measurement Profile Master")).toBeInTheDocument();
    expect(await screen.findByText("SHEET-WEIGHT")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("row", { name: "STD-COUNT measurement profile" }));
    expect(await screen.findByText("Measurement profile setup")).toBeInTheDocument();
  });

  it("renders P086 item group, attribute, and reason code setup screens", async () => {
    renderWithApp(
      <Routes>
        <Route path="/masters/item-groups" element={<ItemGroupMasterPage />} />
        <Route path="/masters/item-attributes" element={<ItemAttributeMasterPage />} />
        <Route path="/masters/reason-codes" element={<ReasonCodeRulesPage />} />
      </Routes>,
      { route: "/masters/item-groups" }
    );

    expect(await screen.findByText("Item Group / Category Master")).toBeInTheDocument();
    expect(await screen.findByText("Raw Materials")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("row", { name: "RAW item group" }));
    expect(await screen.findByText("Item group setup")).toBeInTheDocument();
    expect(screen.getAllByText("Review mode").length).toBeGreaterThan(0);
  });

  it("opens item attribute allowed-value maintenance instead of disabling the value action", async () => {
    renderWithApp(
      <Routes>
        <Route path="/masters/item-attributes" element={<ItemAttributeMasterPage />} />
      </Routes>,
      { route: "/masters/item-attributes" }
    );

    expect(await screen.findByText("Item Attribute Master")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("row", { name: "THICKNESS item attribute" }));
    expect((await screen.findAllByText("Allowed values")).length).toBeGreaterThan(0);
    expect(screen.getByDisplayValue("6MM")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Add allowed value" }));
    expect(screen.getByLabelText("Allowed value 5 code")).toBeInTheDocument();
  });

  it("renders P087 item list and detail editor", async () => {
    renderWithApp(
      <Routes>
        <Route path="/masters/items" element={<ItemListPage />} />
      </Routes>,
      { route: "/masters/items" }
    );

    expect(await screen.findByText("Item List")).toBeInTheDocument();
    expect(await screen.findByText("Mild Steel Plate 6mm")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("row", { name: "RM-PLATE-001 item master" }));
    expect(await screen.findByText("Item detail editor")).toBeInTheDocument();
  });

  it("renders P088 item variants and barcode setup", async () => {
    renderWithApp(
      <Routes>
        <Route path="/masters/item-variants" element={<ItemVariantMatrixPage />} />
      </Routes>,
      { route: "/masters/item-variants" }
    );

    expect(await screen.findByText("Item Variant Matrix")).toBeInTheDocument();
    expect(await screen.findByText("SS304 6mm sheet")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("row", { name: "SS-304-6MM item variant" }));
    expect(await screen.findByText("Variant setup")).toBeInTheDocument();
  });

  it("renders P088 barcode label setup", async () => {
    renderWithApp(
      <Routes>
        <Route path="/masters/barcodes" element={<BarcodeLabelSetupPage />} />
      </Routes>,
      { route: "/masters/barcodes" }
    );

    expect(await screen.findByText("Barcode / Label Setup")).toBeInTheDocument();
    expect(await screen.findByText("FG-BRACKET-001")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("row", { name: "FG-BRACKET-001 barcode" }));
    expect(await screen.findByText("Barcode setup")).toBeInTheDocument();
  });

  it("renders P089 customer and supplier list/detail screens", async () => {
    renderWithApp(
      <Routes>
        <Route path="/partners/customers" element={<CustomerListDetailPage />} />
      </Routes>,
      { route: "/partners/customers" }
    );

    expect(await screen.findByText("Customer List & Detail")).toBeInTheDocument();
    expect(await screen.findByText("Demo Industrial Customer")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("row", { name: "CUST-DEMO customer" }));
    expect(await screen.findByText("Customer setup")).toBeInTheDocument();
  });

  it("renders P089 supplier list/detail screen with lead-time preview", async () => {
    renderWithApp(
      <Routes>
        <Route path="/partners/suppliers" element={<SupplierListDetailPage />} />
      </Routes>,
      { route: "/partners/suppliers" }
    );

    expect(await screen.findByText("Supplier List & Detail")).toBeInTheDocument();
    expect(await screen.findByText("Demo Steel Supplier")).toBeInTheDocument();
    expect(await screen.findByText("RM-PLATE-001")).toBeInTheDocument();
    fireEvent.click(await screen.findByRole("row", { name: "SUP-DEMO supplier" }));
    expect(await screen.findByText("Supplier setup")).toBeInTheDocument();
  });
});
