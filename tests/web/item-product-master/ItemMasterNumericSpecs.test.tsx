import { cleanup, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderItemMaster } from "./itemPackTestUtils";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ITEM-PRODUCT-MASTER-COMPLETION-01 numeric item specs", () => {
  it("uses governed numeric controls for weight, dimension, planning, and purchase quantities", async () => {
    renderItemMaster();

    fireEvent.click(await screen.findByRole("row", { name: "FG-BRACKET-001 item master" }));
    const dialog = await screen.findByRole("dialog", { name: /Fabricated Mounting Bracket/i });

    fireEvent.click(within(dialog).getByRole("tab", { name: "Packaging" }));
    ["Inner pack", "Carton", "Pallet", "Net weight", "Gross weight", "Package length", "Package width", "Package height", "Label count"].forEach((label) => {
      expect(within(dialog).getByLabelText(label)).toHaveAttribute("type", "number");
    });

    fireEvent.click(within(dialog).getByRole("tab", { name: "Physical Specs" }));
    ["Length", "Width", "Height", "Thickness", "Shelf life"].forEach((label) => {
      expect(within(dialog).getByLabelText(label)).toHaveAttribute("type", "number");
    });

    fireEvent.click(within(dialog).getByRole("tab", { name: "Planning/Replenishment" }));
    ["Safety stock", "Reorder point", "Minimum quantity", "Maximum quantity", "Lead time", "Lot size"].forEach((label) => {
      expect(within(dialog).getByLabelText(label)).toHaveAttribute("type", "number");
    });

    fireEvent.click(within(dialog).getByRole("tab", { name: "Purchase/Vendor" }));
    expect(within(dialog).getByLabelText("Purchase lead time")).toHaveAttribute("type", "number");
    expect(within(dialog).getByLabelText("MOQ")).toHaveAttribute("type", "number");
  });
});
