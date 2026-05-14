import { cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildLiveItemSession, mockLiveItemMasterApi, renderItemMaster } from "./itemPackTestUtils";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ITEM-PRODUCT-MASTER-COMPLETION-01 save and reopen all tabs", () => {
  it("persists core UOM ids, packaging values, physical specs, and planning quantities", async () => {
    const api = mockLiveItemMasterApi();

    renderItemMaster(buildLiveItemSession());

    fireEvent.click(await screen.findByRole("row", { name: "FG-BRACKET-001 item master" }));
    const dialog = await screen.findByRole("dialog", { name: /Fabricated Mounting Bracket/i });

    fireEvent.change(within(dialog).getByLabelText("Short name"), { target: { value: "Bracket Pack Test" } });

    fireEvent.click(within(dialog).getByRole("tab", { name: "UOM & Conversions" }));
    fireEvent.change(within(dialog).getByLabelText("Purchase UOM"), { target: { value: "KG" } });

    fireEvent.click(within(dialog).getByRole("tab", { name: "Packaging" }));
    fireEvent.change(within(dialog).getByLabelText("Packaging UOM"), { target: { value: "KG" } });
    fireEvent.change(within(dialog).getByLabelText("Net weight"), { target: { value: "2.5" } });
    fireEvent.change(within(dialog).getByLabelText("Gross weight"), { target: { value: "3" } });

    fireEvent.click(within(dialog).getByRole("tab", { name: "Physical Specs" }));
    fireEvent.change(within(dialog).getByLabelText("Length"), { target: { value: "210" } });

    fireEvent.click(within(dialog).getByRole("tab", { name: "Planning/Replenishment" }));
    fireEvent.change(within(dialog).getByLabelText("Safety stock"), { target: { value: "15" } });

    fireEvent.click(within(dialog).getByRole("button", { name: "Save Draft" }));

    await waitFor(() => expect(api.updateProfile).toHaveBeenCalledTimes(1));
    expect(api.updateProfile.mock.calls[0][1]).toMatchObject({
      packaging: {
        packagingUomId: 2,
        netWeight: 2.5,
        grossWeight: 3
      },
      physicalSpecs: {
        lengthValue: 210
      },
      planningPolicy: {
        safetyStockQty: 15
      }
    });

    fireEvent.click(within(dialog).getAllByRole("button", { name: "Close" })[0]);
    fireEvent.click(await screen.findByRole("row", { name: "FG-BRACKET-001 item master" }));
    const reopened = await screen.findByRole("dialog", { name: /Fabricated Mounting Bracket/i });

    fireEvent.click(within(reopened).getByRole("tab", { name: "UOM & Conversions" }));
    expect(within(reopened).getByLabelText("Purchase UOM")).toHaveValue("KG");

    fireEvent.click(within(reopened).getByRole("tab", { name: "Packaging" }));
    expect(within(reopened).getByLabelText("Packaging UOM")).toHaveValue("KG");
    expect(within(reopened).getByLabelText("Net weight")).toHaveValue(2.5);
    expect(within(reopened).getByLabelText("Gross weight")).toHaveValue(3);

    fireEvent.click(within(reopened).getByRole("tab", { name: "Physical Specs" }));
    expect(within(reopened).getByLabelText("Length")).toHaveValue(210);

    fireEvent.click(within(reopened).getByRole("tab", { name: "Planning/Replenishment" }));
    expect(within(reopened).getByLabelText("Safety stock")).toHaveValue(15);
  });
});
