import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { renderWithApp } from "../test/render";
import { DiscountSchemeMasterPage, PriceListMasterPage, TaxCurrencyTermsPage } from "./CommercialMasterPages";

const internalTerms = /adapter|fallback|mock|source status|prompt|React|TypeScript|seeded fallback/i;

describe("Wave 4C commercial master pages", () => {
  it("renders governed price list setup with controlled commercial lookups", async () => {
    const user = userEvent.setup();
    renderWithApp(<PriceListMasterPage />);

    expect(await screen.findByRole("heading", { name: "Price Lists" })).toBeInTheDocument();
    expect(screen.getByTestId("price-list-action-bar")).toBeInTheDocument();
    expect(screen.getByTestId("price-list-filter-bar")).toBeInTheDocument();
    expect(await screen.findByTestId("price-list-grid")).toBeInTheDocument();
    expect(screen.getByText("Price lines")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "New price list" }));
    const modal = await screen.findByTestId("price-list-modal");

    expect(within(modal).getByLabelText("Currency").tagName).toBe("SELECT");
    expect(within(modal).getByLabelText("Price list type").tagName).toBe("SELECT");
    expect(within(modal).getByLabelText("UOM").tagName).toBe("SELECT");
    expect(within(modal).getByLabelText("Tax category").tagName).toBe("SELECT");
    expect(within(modal).getByLabelText("Customer").tagName).toBe("SELECT");
    await user.selectOptions(within(modal).getByLabelText("Currency"), "7002");
    const unitPriceField = within(modal).getByLabelText("Unit price");
    expect(within(unitPriceField.closest(".erp-money-field") as HTMLElement).getByText("USD")).toBeInTheDocument();
    expect(screen.getByText("Sign in with commercial master write access to save this setup.")).toBeInTheDocument();
    expect(screen.getByText("Unit price must be greater than zero before activation.")).toBeInTheDocument();
  });

  it("renders discount scheme create workspace with controlled applicability fields", async () => {
    const user = userEvent.setup();
    renderWithApp(<DiscountSchemeMasterPage />);

    expect(await screen.findByRole("heading", { name: "Discount Schemes" })).toBeInTheDocument();
    expect(screen.getByTestId("discount-action-bar")).toBeInTheDocument();
    expect(await screen.findByTestId("discount-grid")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "New discount scheme" }));
    const modal = await screen.findByTestId("discount-modal");

    expect(within(modal).getByLabelText("Discount type").tagName).toBe("SELECT");
    expect(within(modal).getByLabelText("Currency").tagName).toBe("SELECT");
    expect(within(modal).getByLabelText("Applicability type").tagName).toBe("SELECT");
    expect(within(modal).getByLabelText("Item").tagName).toBe("SELECT");
    expect(within(modal).getByLabelText("Price list").tagName).toBe("SELECT");
    await user.selectOptions(within(modal).getByLabelText("Currency"), "7002");
    const discountAmountField = within(modal).getByLabelText("Discount amount");
    expect(within(discountAmountField.closest(".erp-money-field") as HTMLElement).getByText("USD")).toBeInTheDocument();
  });

  it("renders tax, currency, rate, payment, and trade-term setup without internal copy", async () => {
    const user = userEvent.setup();
    const { container } = renderWithApp(<TaxCurrencyTermsPage />);

    expect(await screen.findByRole("heading", { name: "Tax, Currency & Terms" })).toBeInTheDocument();
    expect(screen.getByTestId("tax-currency-action-bar")).toBeInTheDocument();
    expect(screen.getByTestId("currency-grid")).toBeInTheDocument();
    expect(screen.getByTestId("tax-grid")).toBeInTheDocument();
    expect(screen.getByText("Payment terms")).toBeInTheDocument();
    expect(screen.getByText("Exchange-rate setup")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "New tax category" }));
    const modal = await screen.findByTestId("commercial-setup-modal");
    expect(within(modal).getByLabelText("Tax scope").tagName).toBe("SELECT");
    expect(within(modal).getByLabelText("Status").tagName).toBe("SELECT");
    expect(screen.getByText("Sign in with commercial master write access to save this setup.")).toBeInTheDocument();
    expect(container.textContent).not.toMatch(internalTerms);
  });
});
