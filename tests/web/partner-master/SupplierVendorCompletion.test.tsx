import React from "react";
import { cleanup, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Route, Routes } from "react-router-dom";
import { SupplierListDetailPage } from "../../../src/web/src/pages/PartnerPages";
import { renderWithApp } from "../../../src/web/src/test/render";

afterEach(() => {
  cleanup();
});

function renderSupplierMaster() {
  return renderWithApp(
    <Routes>
      <Route path="/partners/suppliers" element={<SupplierListDetailPage />} />
    </Routes>,
    { route: "/partners/suppliers" }
  );
}

describe("SUPPLIER-VENDOR-MASTER completion pack", () => {
  it("opens a governed supplier create workspace with controlled terms and compliance fields", async () => {
    renderSupplierMaster();

    fireEvent.click(await screen.findByRole("button", { name: "New supplier draft" }));
    const dialog = await screen.findByRole("dialog", { name: "Draft Supplier" });

    expect(document.querySelector(".ui-drawer__panel")).not.toBeInTheDocument();
    expect(within(dialog).getByLabelText("Supplier type/category").tagName).toBe("SELECT");
    expect(within(dialog).getByLabelText("Tax category").tagName).toBe("SELECT");
    expect(within(dialog).getByLabelText("Currency").tagName).toBe("SELECT");
    expect(within(dialog).getByLabelText("Payment terms").tagName).toBe("SELECT");
    expect(within(dialog).getByLabelText("Preferred supplier").tagName).toBe("SELECT");
    expect(within(dialog).getByLabelText("Supplier capability").tagName).toBe("SELECT");
    expect(within(dialog).getByLabelText("Compliance status").tagName).toBe("SELECT");
    expect(within(dialog).getByLabelText("Default branch")).toBeDisabled();
    expect(within(dialog).getByText("Default branch follows the signed-in operating context.")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Save Draft" })).toBeDisabled();
    expect(within(dialog).getAllByText("Sign in with partner master write access to save this record.").length).toBeGreaterThan(0);
  });

  it("allows supplier site, contact, compliance metadata inspection and keeps upload truthful", async () => {
    renderSupplierMaster();

    fireEvent.click(await screen.findByRole("button", { name: "New supplier draft" }));
    const dialog = await screen.findByRole("dialog", { name: "Draft Supplier" });

    fireEvent.click(within(dialog).getByRole("button", { name: "Add supplier site" }));
    fireEvent.change(within(dialog).getByLabelText("Site code"), { target: { value: "ORDER-02" } });
    expect(within(dialog).getByDisplayValue("ORDER-02")).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Add contact point" }));
    const contactNames = within(dialog).getAllByLabelText("Contact name");
    fireEvent.change(contactNames[contactNames.length - 1], { target: { value: "Supplier Contact" } });
    expect(within(dialog).getByDisplayValue("Supplier Contact")).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Add compliance metadata" }));
    expect(within(dialog).getAllByText("Supplier document metadata").length).toBeGreaterThan(0);
    expect(within(dialog).getByRole("button", { name: "Upload compliance document" })).toBeDisabled();
    expect(within(dialog).getAllByText("Sign in with partner master write access to attach documents.").length).toBeGreaterThan(0);
  });
});
