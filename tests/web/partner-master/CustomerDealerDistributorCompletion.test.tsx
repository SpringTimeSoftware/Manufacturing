import React from "react";
import { cleanup, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Route, Routes } from "react-router-dom";
import { CustomerListDetailPage } from "../../../src/web/src/pages/PartnerPages";
import { renderWithApp } from "../../../src/web/src/test/render";

afterEach(() => {
  cleanup();
});

function renderCustomerMaster() {
  return renderWithApp(
    <Routes>
      <Route path="/partners/customers" element={<CustomerListDetailPage />} />
    </Routes>,
    { route: "/partners/customers" }
  );
}

describe("CUSTOMER-DEALER-DISTRIBUTOR-MASTER completion pack", () => {
  it("opens a governed customer create workspace with truthful commercial controls", async () => {
    renderCustomerMaster();

    fireEvent.click(await screen.findByRole("button", { name: "New customer draft" }));
    const dialog = await screen.findByRole("dialog", { name: "Draft Customer" });

    expect(document.querySelector(".ui-drawer__panel")).not.toBeInTheDocument();
    expect(within(dialog).getByLabelText("Customer type").tagName).toBe("SELECT");
    expect(within(dialog).getByLabelText("Tax category").tagName).toBe("SELECT");
    expect(within(dialog).getByLabelText("Currency").tagName).toBe("SELECT");
    expect(within(dialog).getByLabelText("Payment terms").tagName).toBe("SELECT");
    expect(within(dialog).getByLabelText("Credit limit")).toHaveAttribute("type", "number");
    expect(within(dialog).getByLabelText("Credit days")).toHaveAttribute("type", "number");
    expect(within(dialog).getByLabelText("Price list")).toBeDisabled();
    expect(within(dialog).getByText("Maintain customer price-list assignment from Price Lists.")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Discount scheme")).toBeDisabled();
    expect(within(dialog).getByText("Maintain customer discount assignment from Discount Schemes.")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Salesperson")).toBeDisabled();
    expect(within(dialog).getByText("Salesperson assignment requires an approved sales user source.")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Save Draft" })).toBeDisabled();
    expect(within(dialog).getAllByText("Sign in with partner master write access to save this record.").length).toBeGreaterThan(0);
  });

  it("allows customer site, contact, document metadata inspection and keeps upload truthful", async () => {
    renderCustomerMaster();

    fireEvent.click(await screen.findByRole("button", { name: "New customer draft" }));
    const dialog = await screen.findByRole("dialog", { name: "Draft Customer" });

    fireEvent.click(within(dialog).getByRole("button", { name: "Add customer site" }));
    fireEvent.change(within(dialog).getByLabelText("Site code"), { target: { value: "SHIP-02" } });
    expect(within(dialog).getByDisplayValue("SHIP-02")).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Add contact point" }));
    const contactNames = within(dialog).getAllByLabelText("Contact name");
    fireEvent.change(contactNames[contactNames.length - 1], { target: { value: "Customer Contact" } });
    expect(within(dialog).getByDisplayValue("Customer Contact")).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: "Add document metadata" }));
    expect(within(dialog).getByText("Customer document metadata")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Upload customer document" })).toBeDisabled();
    expect(within(dialog).getAllByText("Sign in with partner master write access to attach documents.").length).toBeGreaterThan(0);
  });
});
