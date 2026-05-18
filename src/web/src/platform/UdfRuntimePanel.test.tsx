import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithApp } from "../test/render";
import { UdfRuntimePanel } from "./UdfRuntimePanel";

describe("UdfRuntimePanel", () => {
  it("renders placed customer UDFs and persists through the runtime adapter", async () => {
    renderWithApp(
      <UdfRuntimePanel
        companyId={1}
        entityId={501}
        entityType="Customer"
        screenKey="partners.customers"
        title="Customer custom fields"
      />
    );

    expect(await screen.findByText("Customer custom fields")).toBeInTheDocument();
    expect(await screen.findByLabelText("Preferred dispatch window")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Preferred dispatch window"), { target: { value: "PRIORITY" } });
    fireEvent.click(screen.getByRole("button", { name: "Save custom fields" }));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Save custom fields" })).toBeEnabled();
    });
  });

  it("blocks unsaved entities with a clear reason", () => {
    renderWithApp(
      <UdfRuntimePanel
        entityId={0}
        entityType="Quote"
        screenKey="commercial.quotes"
        title="Quote custom fields"
      />
    );

    expect(screen.getByText("Unavailable until saved")).toBeInTheDocument();
    expect(screen.getByText("Save the core record before entering custom field values.")).toBeInTheDocument();
  });
});
