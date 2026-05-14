import { cleanup, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderItemMaster } from "./itemPackTestUtils";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ITEM-PRODUCT-MASTER-COMPLETION-01 governed classification", () => {
  it("renders item taxonomy and UOM values as governed selectors", async () => {
    renderItemMaster();

    fireEvent.click(await screen.findByRole("button", { name: /New item draft/i }));
    const dialog = await screen.findByRole("dialog", { name: /Draft Item/i });

    expect(within(dialog).getByLabelText("Item group/category").tagName).toBe("SELECT");
    expect(within(dialog).getByLabelText("Stock UOM").tagName).toBe("SELECT");

    fireEvent.click(within(dialog).getByRole("tab", { name: "Classification" }));
    ["Category", "Subcategory", "Product family", "Business segment", "Reporting bucket"].forEach((label) => {
      expect(within(dialog).getByLabelText(label).tagName).toBe("SELECT");
    });

    fireEvent.click(within(dialog).getByRole("tab", { name: "UOM & Conversions" }));
    ["Base UOM", "Purchase UOM", "Sales UOM", "Production UOM", "Measurement profile"].forEach((label) => {
      expect(within(dialog).getByLabelText(label).tagName).toBe("SELECT");
    });
  });
});
