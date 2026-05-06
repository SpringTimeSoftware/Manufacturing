import { fireEvent, screen, within } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { renderWithApp } from "../test/render";
import { CustomerListDetailPage, SupplierListDetailPage } from "./PartnerPages";

const internalCopyPattern =
  /\bP0\b|React|TypeScript|reference UI|guarded demo|backend reachable|fallback|adapter|mock|seeded fallback|source status|demo shell|Workspace data/i;

describe("Wave 4B.1 partner profile editing foundation", () => {
  it("allows customer site, contact point, and document metadata editing in the governed modal", async () => {
    renderWithApp(
      <Routes>
        <Route path="/partners/customers" element={<CustomerListDetailPage />} />
      </Routes>,
      { route: "/partners/customers" }
    );

    fireEvent.click(await screen.findByRole("button", { name: "New customer draft" }));
    const dialog = await screen.findByRole("dialog", { name: "Draft Customer" });

    fireEvent.click(within(dialog).getByRole("button", { name: "Add customer site" }));
    fireEvent.change(within(dialog).getByLabelText("Site code"), { target: { value: "SHIP-02" } });
    expect(within(dialog).getByDisplayValue("SHIP-02")).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Add contact point" }));
    const contactNameFields = within(dialog).getAllByLabelText("Contact name");
    fireEvent.change(contactNameFields[contactNameFields.length - 1], { target: { value: "Asha Rao" } });
    expect(within(dialog).getByDisplayValue("Asha Rao")).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Add document metadata" }));
    expect(within(dialog).getByText("Customer document metadata")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Upload customer document" })).toBeDisabled();
    expect(document.body.textContent ?? "").not.toMatch(internalCopyPattern);
  });

  it("allows supplier site, contact point, and compliance metadata editing in the governed modal", async () => {
    renderWithApp(
      <Routes>
        <Route path="/partners/suppliers" element={<SupplierListDetailPage />} />
      </Routes>,
      { route: "/partners/suppliers" }
    );

    fireEvent.click(await screen.findByRole("button", { name: "New supplier draft" }));
    const dialog = await screen.findByRole("dialog", { name: "Draft Supplier" });

    fireEvent.click(within(dialog).getByRole("button", { name: "Add supplier site" }));
    fireEvent.change(within(dialog).getByLabelText("Site code"), { target: { value: "ORDER-02" } });
    expect(within(dialog).getByDisplayValue("ORDER-02")).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Add contact point" }));
    const contactNameFields = within(dialog).getAllByLabelText("Contact name");
    fireEvent.change(contactNameFields[contactNameFields.length - 1], { target: { value: "Nikhil Desai" } });
    expect(within(dialog).getByDisplayValue("Nikhil Desai")).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Add compliance metadata" }));
    expect(within(dialog).getAllByText("Supplier document metadata").length).toBeGreaterThan(0);
    expect(within(dialog).getByRole("button", { name: "Upload compliance document" })).toBeDisabled();
    expect(document.body.textContent ?? "").not.toMatch(internalCopyPattern);
  });
});
