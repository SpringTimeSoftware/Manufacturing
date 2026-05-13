import { fireEvent, screen, within } from "@testing-library/react";
import React from "react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ItemListPage } from "../../../src/web/src/pages/ItemMasterPages";
import { renderWithApp } from "../../../src/web/src/test/render";

function renderItemMaster() {
  renderWithApp(
    <Routes>
      <Route path="/masters/items" element={<ItemListPage />} />
    </Routes>,
    { route: "/masters/items" }
  );
}

describe("QUALITY-GATES-01 item master field governance", () => {
  it("keeps core classification governed and measurable fields numeric", async () => {
    renderItemMaster();

    fireEvent.click(await screen.findByRole("button", { name: /New item draft/i }));
    const dialog = await screen.findByRole("dialog", { name: /Draft Item/i });

    expect(within(dialog).getByLabelText("Item group/category").tagName).toBe("SELECT");
    expect(within(dialog).getByLabelText("Stock UOM").tagName).toBe("SELECT");

    fireEvent.click(within(dialog).getByRole("tab", { name: "Classification" }));
    expect(within(dialog).getByLabelText("Category").tagName).toBe("SELECT");
    expect(within(dialog).getByLabelText("Subcategory").tagName).toBe("SELECT");
    expect(within(dialog).getByLabelText("Product family").tagName).toBe("SELECT");
    expect(within(dialog).getByLabelText("Business segment").tagName).toBe("SELECT");

    fireEvent.click(within(dialog).getByRole("tab", { name: "Packaging" }));
    expect(within(dialog).getByLabelText("Net weight")).toHaveAttribute("type", "number");
    expect(within(dialog).getByLabelText("Gross weight")).toHaveAttribute("type", "number");
  });
});
