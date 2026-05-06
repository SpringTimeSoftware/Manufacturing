import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Drawer } from "./Drawer";

describe("Drawer", () => {
  it("does not render content when closed", () => {
    render(
      <Drawer isOpen={false} onClose={vi.fn()} title="Order detail">
        <div>Drawer body</div>
      </Drawer>
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("focuses the close button and closes on escape", () => {
    const onClose = vi.fn();

    render(
      <Drawer description="Order detail drawer" isOpen onClose={onClose} title="Order detail">
        <button type="button">Focusable action</button>
      </Drawer>
    );

    const dialog = screen.getByRole("dialog", { name: "Order detail" });
    const closeButton = screen.getByRole("button", { name: "Close" });

    expect(closeButton).toHaveFocus();

    fireEvent.keyDown(dialog, { key: "Escape" });

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
