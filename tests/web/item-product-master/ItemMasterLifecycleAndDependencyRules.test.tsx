import { cleanup, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderItemMaster } from "./itemPackTestUtils";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ITEM-PRODUCT-MASTER-COMPLETION-01 lifecycle and action truth", () => {
  it("opens create/edit workspaces as centered modals and keeps save/audit actions truthful", async () => {
    renderItemMaster();

    fireEvent.click(await screen.findByRole("button", { name: /New item draft/i }));
    const draftDialog = await screen.findByRole("dialog", { name: /Draft Item/i });

    expect(document.querySelector(".ui-drawer__panel--item-master")).not.toBeInTheDocument();
    expect(document.querySelector(".ui-modal__panel--item-master")).toBeInTheDocument();
    expect(within(draftDialog).getByLabelText("Lifecycle status").tagName).toBe("SELECT");
    expect(within(draftDialog).getByRole("button", { name: "Save Draft" })).toBeDisabled();
    expect(within(draftDialog).getAllByText("Sign in with item master write access to save this record.").length).toBeGreaterThan(0);

    fireEvent.click(within(draftDialog).getByRole("button", { name: "Review audit" }));
    expect(within(draftDialog).getByText("Audit and history")).toBeInTheDocument();
  });
});
