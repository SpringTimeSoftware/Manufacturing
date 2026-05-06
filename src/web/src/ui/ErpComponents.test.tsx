import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  ErpActionBar,
  ErpFilterBar,
  ErpGrid,
  ErpLookupField,
  ErpModalWorkspace,
  ErpStatusChip,
  ErpValidationSummary
} from "./ErpComponents";
import type { DataGridColumn } from "./DataGrid";
import { Tile } from "./Tile";

interface RowRecord {
  id: string;
  status: string;
}

describe("ERP governance UI components", () => {
  it("groups action buttons and exposes disabled reasons", () => {
    const onPrimary = vi.fn();

    render(
      <ErpActionBar
        primary={[{ label: "Save draft", onClick: onPrimary }]}
        secondary={[{ disabled: true, label: "Upload media", reason: "Media storage is not enabled." }]}
        utility={[{ label: "Review audit" }]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Save draft" }));

    expect(onPrimary).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Upload media" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Review audit" })).toBeDisabled();
    expect(screen.getByText("Media storage is not enabled.")).toBeInTheDocument();
    expect(screen.getByText("Action requires an enabled workflow.")).toBeInTheDocument();
  });

  it("does not render passive tiles as dead buttons", () => {
    const onClick = vi.fn();

    render(
      <>
        <Tile label="Passive KPI" meta="Current">42</Tile>
        <Tile label="Open board" onClick={onClick}>Open</Tile>
      </>
    );

    expect(screen.queryByRole("button", { name: /Passive KPI/i })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Open board/i }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders compact filter controls with reset support", () => {
    const onClear = vi.fn();

    render(
      <ErpFilterBar ariaLabel="Item filters" onClear={onClear}>
        <input aria-label="Search items" />
        <select aria-label="Status">
          <option>Any</option>
        </select>
      </ErpFilterBar>
    );

    expect(screen.getByRole("search", { name: "Item filters" })).toBeInTheDocument();
    expect(screen.getByLabelText("Search items")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it("blocks arbitrary free text in lookup fields by default", () => {
    const onChange = vi.fn();

    render(
      <ErpLookupField
        label="Stock UOM"
        onChange={onChange}
        options={[{ label: "PCS", value: "PCS" }]}
        value="PCS"
      />
    );

    expect(screen.getByLabelText("Stock UOM").tagName).toBe("SELECT");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("renders fixed ERP status chips and dense grids", () => {
    const columns: DataGridColumn<RowRecord>[] = [
      {
        key: "status",
        header: "Status",
        render: (record) => <ErpStatusChip tone="success">{record.status}</ErpStatusChip>
      }
    ];

    render(
      <ErpGrid
        ariaLabel="Governed grid"
        columns={columns}
        getRowId={(record) => record.id}
        records={[{ id: "1", status: "Active" }]}
        testId="governed-grid"
      />
    );

    expect(screen.getByTestId("governed-grid")).toHaveClass("erp-grid");
    expect(screen.getByText("Active")).toHaveClass("erp-status-chip", "erp-status-chip--success");
  });

  it("renders modal workspace header, body, and sticky footer hooks", () => {
    render(
      <ErpModalWorkspace
        footer={<button type="button">Save draft</button>}
        isOpen
        onClose={vi.fn()}
        statusMeta={<span>Draft</span>}
        title="Draft Item"
      >
        <p>Core fields</p>
      </ErpModalWorkspace>
    );

    expect(screen.getByRole("dialog", { name: "Draft Item" })).toBeInTheDocument();
    expect(screen.getByTestId("erp-modal-workspace")).toHaveClass("erp-modal-workspace__body");
    expect(document.querySelector(".erp-modal-workspace__footer")).toBeInTheDocument();
  });

  it("keeps validation compact and expands only on request", () => {
    render(<ErpValidationSummary errors={["One", "Two", "Three"]} maxVisible={2} />);

    expect(screen.getByText("One")).toBeInTheDocument();
    expect(screen.getByText("Two")).toBeInTheDocument();
    expect(screen.queryByText("Three")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Show 1 more" }));
    expect(screen.getByText("Three")).toBeInTheDocument();
  });
});
