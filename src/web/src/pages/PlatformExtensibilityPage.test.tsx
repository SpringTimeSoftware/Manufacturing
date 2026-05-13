import { fireEvent, screen, waitFor } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { renderWithApp } from "../test/render";
import { PlatformExtensibilityPage } from "./PlatformExtensibilityPage";

describe("PlatformExtensibilityPage", () => {
  it("renders UDF definitions and opens a governed create workspace", async () => {
    renderWithApp(
      <Routes>
        <Route path="/platform/extensibility" element={<PlatformExtensibilityPage />} />
      </Routes>,
      {
        route: "/platform/extensibility"
      }
    );

    expect(await screen.findByText("Extensibility")).toBeInTheDocument();
    expect(await screen.findByText("Customer drawing number")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "New field" }));

    expect(await screen.findByText("New field definition")).toBeInTheDocument();
    expect(screen.getByLabelText("Entity type").closest("[data-control-type='lookup']")).toBeTruthy();
    expect(screen.getByLabelText("Data type")).toBeInTheDocument();
    expect(screen.getByLabelText("Maximum text length")).toHaveAttribute("type", "number");

    expect(screen.getByRole("button", { name: "Save definition" })).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Field key"), { target: { value: "heatTreatmentCode" } });
    fireEvent.change(screen.getByLabelText("Label"), { target: { value: "Heat treatment code" } });

    expect(screen.getByRole("button", { name: "Save definition" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Save definition" }));

    await waitFor(() => {
      expect(screen.queryByText("New field definition")).not.toBeInTheDocument();
    });
  });
});
