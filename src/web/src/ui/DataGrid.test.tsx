import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DataGrid, type DataGridColumn } from "./DataGrid";

interface GridRecord {
  id: string;
  name: string;
}

const columns: DataGridColumn<GridRecord>[] = [
  {
    key: "name",
    header: "Name",
    render: (record) => record.name
  }
];

describe("DataGrid", () => {
  it("renders empty-state guidance when records are absent", () => {
    render(
      <DataGrid
        columns={columns}
        emptyState={{
          title: "No seeded records",
          description: "Add a demo record or clear the filters."
        }}
        getRowId={(record) => record.id}
        records={[]}
      />
    );

    expect(screen.getByText("No seeded records")).toBeInTheDocument();
    expect(screen.getByText("Add a demo record or clear the filters.")).toBeInTheDocument();
  });

  it("supports keyboard row activation", () => {
    const onRowSelect = vi.fn();

    render(
      <DataGrid
        columns={columns}
        getRowId={(record) => record.id}
        onRowSelect={onRowSelect}
        records={[{ id: "row-1", name: "FG-OZ-50" }]}
        rowLabel={(record) => record.name}
      />
    );

    const row = screen.getByLabelText("FG-OZ-50");
    fireEvent.keyDown(row, { key: "Enter" });

    expect(onRowSelect).toHaveBeenCalledWith({ id: "row-1", name: "FG-OZ-50" });
  });

  it("limits rendered rows when virtualization is enabled", () => {
    const records = Array.from({ length: 40 }).map((_, index) => ({
      id: `row-${index}`,
      name: `Item ${index + 1}`
    }));

    render(
      <DataGrid
        columns={columns}
        getRowId={(record) => record.id}
        records={records}
        virtualization={{ enabled: true, overscan: 1, rowHeight: 32, viewportHeight: 96 }}
      />
    );

    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.queryByText("Item 40")).not.toBeInTheDocument();
  });
});
