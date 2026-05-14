import { cleanup, fireEvent, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { buildLiveItemSession, mockLiveItemMasterApi, renderItemMaster } from "./itemPackTestUtils";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ITEM-PRODUCT-MASTER-COMPLETION-01 item media truth", () => {
  it("shows disabled reasons for media actions when the user is not in a live write session", async () => {
    renderItemMaster();

    fireEvent.click(await screen.findByRole("row", { name: "FG-BRACKET-001 item master" }));
    const dialog = await screen.findByRole("dialog", { name: /Fabricated Mounting Bracket/i });

    fireEvent.click(within(dialog).getByRole("tab", { name: "Images & Media" }));

    expect(within(dialog).getByRole("button", { name: "Upload media" })).toBeDisabled();
    expect(within(dialog).getAllByText("Sign in with item master write access to attach media.").length).toBeGreaterThan(0);
    expect(within(dialog).getByRole("button", { name: "Set primary" })).toBeDisabled();
    expect(within(dialog).getByText("Primary image changes require item media lifecycle approval.")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "Retire media" })).toBeDisabled();
    expect(within(dialog).getByText("Media retirement requires document-control approval.")).toBeInTheDocument();
  });

  it("uploads media through the shared attachment workflow for a saved live item", async () => {
    const api = mockLiveItemMasterApi();

    renderItemMaster(buildLiveItemSession());

    fireEvent.click(await screen.findByRole("row", { name: "FG-BRACKET-001 item master" }));
    const dialog = await screen.findByRole("dialog", { name: /Fabricated Mounting Bracket/i });

    fireEvent.click(within(dialog).getByRole("tab", { name: "Images & Media" }));
    const uploadState = within(dialog).getByText("Upload media").closest(".erp-file-action-state");
    const input = uploadState?.querySelector("input");
    expect(input).toBeInstanceOf(HTMLInputElement);
    expect(input).not.toBeDisabled();

    const file = new File(["image-bytes"], "bracket-photo.png", { type: "image/png" });
    fireEvent.change(input as HTMLInputElement, { target: { files: [file] } });

    await waitFor(() => expect(api.uploadAttachment).toHaveBeenCalledTimes(1));
    expect(api.uploadAttachment.mock.calls[0][0]).toMatchObject({
      relatedDocumentType: "ItemMedia",
      relatedDocumentId: 10002
    });
    expect(await within(dialog).findByText("bracket-photo.png uploaded and linked to this item.")).toBeInTheDocument();
  });
});
