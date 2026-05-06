import { useMemo, useState, type KeyboardEvent, type ReactNode, type UIEvent } from "react";
import { EmptyState } from "./EmptyState";
import { PageSkeleton } from "./Skeleton";

export interface DataGridColumn<TRecord> {
  key: string;
  header: string;
  width?: string;
  render: (record: TRecord) => ReactNode;
}

interface VirtualizationOptions {
  enabled?: boolean;
  overscan?: number;
  rowHeight?: number;
  viewportHeight?: number;
}

interface DataGridProps<TRecord> {
  ariaLabel?: string;
  columns: DataGridColumn<TRecord>[];
  emptyState?: {
    title: string;
    description: string;
    hint?: ReactNode;
  };
  getRowId: (record: TRecord) => string;
  isLoading?: boolean;
  onRowSelect?: (record: TRecord) => void;
  records: TRecord[];
  rowLabel?: (record: TRecord) => string;
  virtualization?: VirtualizationOptions;
}

export function DataGrid<TRecord>({
  ariaLabel,
  columns,
  emptyState,
  getRowId,
  isLoading = false,
  onRowSelect,
  records,
  rowLabel,
  virtualization
}: DataGridProps<TRecord>) {
  const [scrollTop, setScrollTop] = useState(0);
  const virtualizationEnabled = Boolean(virtualization?.enabled && records.length > 12);
  const rowHeight = virtualization?.rowHeight ?? 52;
  const overscan = virtualization?.overscan ?? 3;
  const viewportHeight = virtualization?.viewportHeight ?? 420;

  const visibleRange = useMemo(() => {
    if (!virtualizationEnabled) {
      return {
        end: records.length,
        offsetBottom: 0,
        offsetTop: 0,
        start: 0
      };
    }

    const visibleCount = Math.max(Math.ceil(viewportHeight / rowHeight), 1);
    const start = Math.max(Math.floor(scrollTop / rowHeight) - overscan, 0);
    const end = Math.min(start + visibleCount + overscan * 2, records.length);

    return {
      end,
      offsetBottom: Math.max((records.length - end) * rowHeight, 0),
      offsetTop: start * rowHeight,
      start
    };
  }, [overscan, records.length, rowHeight, scrollTop, viewportHeight, virtualizationEnabled]);

  const visibleRecords = useMemo(
    () => records.slice(visibleRange.start, visibleRange.end),
    [records, visibleRange.end, visibleRange.start]
  );

  const handleKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, record: TRecord) => {
    if (!onRowSelect) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onRowSelect(record);
    }
  };

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    if (!virtualizationEnabled) {
      return;
    }

    setScrollTop(event.currentTarget.scrollTop);
  };

  if (isLoading) {
    return <PageSkeleton rows={4} />;
  }

  if (records.length === 0) {
    return (
      <EmptyState
        description={emptyState?.description ?? "No rows match the current selection."}
        hint={emptyState?.hint}
        title={emptyState?.title ?? "No records available"}
      />
    );
  }

  return (
    <div
      className={`ui-grid ${virtualizationEnabled ? "ui-grid--virtualized" : ""}`}
      onScroll={handleScroll}
      style={virtualizationEnabled ? { maxHeight: `${viewportHeight}px` } : undefined}
    >
      <table aria-label={ariaLabel}>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} style={column.width ? { width: column.width } : undefined}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {virtualizationEnabled && visibleRange.offsetTop > 0 ? (
            <tr aria-hidden="true" className="ui-grid__spacer">
              <td colSpan={columns.length} style={{ height: `${visibleRange.offsetTop}px` }} />
            </tr>
          ) : null}
          {visibleRecords.map((record) => (
            <tr
              aria-label={rowLabel?.(record)}
              className={onRowSelect ? "ui-grid__row--actionable" : undefined}
              key={getRowId(record)}
              onClick={() => onRowSelect?.(record)}
              onKeyDown={(event) => handleKeyDown(event, record)}
              tabIndex={onRowSelect ? 0 : undefined}
            >
              {columns.map((column) => (
                <td key={column.key}>{column.render(record)}</td>
              ))}
            </tr>
          ))}
          {virtualizationEnabled && visibleRange.offsetBottom > 0 ? (
            <tr aria-hidden="true" className="ui-grid__spacer">
              <td colSpan={columns.length} style={{ height: `${visibleRange.offsetBottom}px` }} />
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}
