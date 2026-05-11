import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { renderWithApp } from "../test/render";
import { GlobalSearchPage } from "./SearchPage";

describe("GlobalSearchPage", () => {
  it("searches accessible screen records without live data fallback", async () => {
    renderWithApp(
      <Routes>
        <Route path="/search" element={<GlobalSearchPage />} />
      </Routes>,
      {
        route: "/search"
      }
    );

    expect(await screen.findByText("Global Search")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Search manufacturing records"), {
      target: { value: "audit" }
    });

    expect(await screen.findByText("Audit Trail")).toBeInTheDocument();
    expect(screen.getAllByText("Navigation catalog").length).toBeGreaterThan(0);
  });
});
