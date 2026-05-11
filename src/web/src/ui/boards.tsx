import type { PropsWithChildren, ReactNode } from "react";
import { Badge } from "./Badge";
import { KpiCard } from "./KpiCard";

export interface KanbanTicket {
  id: string;
  title: string;
  meta: string;
  progress?: string;
  badges?: Array<{ label: string; tone: "info" | "success" | "warn" | "danger" | "neutral" }>;
}

export interface KanbanColumn {
  id: string;
  label: string;
  count: number;
  tickets: KanbanTicket[];
}

export interface LaneSlot {
  id: string;
  title: string;
  meta: string;
  start: string;
  end: string;
  emphasis?: "current" | "queued" | "blocked";
  tags?: Array<{ label: string; tone: "info" | "success" | "warn" | "danger" | "neutral" }>;
}

export interface Lane {
  id: string;
  machine: string;
  detail: string;
  status: "Running" | "Idle" | "Down";
  slots: LaneSlot[];
}

export interface OccupancyRow {
  id: string;
  label: string;
  detail: string;
  cells: Array<{
    date: string;
    state: "free" | "occupied" | "down";
    title?: string;
    subtitle?: string;
  }>;
}

export function KpiStrip({ items }: { items: Array<{ label: string; value: string; hint?: string }> }) {
  return (
    <div className="ui-kpi-strip">
      {items.map((item) => (
        <KpiCard key={item.label} hint={item.hint} label={item.label} value={item.value} />
      ))}
    </div>
  );
}

export function KanbanBoard({ columns }: { columns: KanbanColumn[] }) {
  return (
    <div className="ui-kanban">
      {columns.map((column) => (
        <section className="ui-kanban__column" key={column.id}>
          <header className="ui-kanban__header">
            <strong>{column.label}</strong>
            <span>{column.count}</span>
          </header>
          <div className="ui-kanban__list">
            {column.tickets.map((ticket) => (
              <article className="ui-kanban__ticket" key={ticket.id}>
                <div className="ui-kanban__ticket-top">
                  <div>
                    <strong>{ticket.title}</strong>
                    <p>{ticket.meta}</p>
                  </div>
                  {ticket.progress ? <Badge tone="info">{ticket.progress}</Badge> : null}
                </div>
                {ticket.badges?.length ? (
                  <div className="ui-inline-badges">
                    {ticket.badges.map((badge) => (
                      <Badge key={`${ticket.id}-${badge.label}`} tone={badge.tone}>
                        {badge.label}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function LaneBoard({ lanes, onSlotSelect }: { lanes: Lane[]; onSlotSelect?: (lane: Lane, slot: LaneSlot) => void }) {
  return (
    <div className="ui-lane-board">
      {lanes.map((lane) => (
        <section className="ui-lane-board__lane" key={lane.id}>
          <header className="ui-lane-board__lane-header">
            <div>
              <strong>{lane.machine}</strong>
              <p>{lane.detail}</p>
            </div>
            <Badge
              tone={lane.status === "Running" ? "success" : lane.status === "Down" ? "danger" : "info"}
            >
              {lane.status}
            </Badge>
          </header>
          <div className="ui-lane-board__slots">
            {lane.slots.map((slot) => (
              <article
                className={`ui-lane-board__slot ui-lane-board__slot--${slot.emphasis ?? "queued"}`}
                key={slot.id}
                onClick={onSlotSelect ? () => onSlotSelect(lane, slot) : undefined}
                onKeyDown={onSlotSelect ? (event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSlotSelect(lane, slot);
                  }
                } : undefined}
                role={onSlotSelect ? "button" : undefined}
                tabIndex={onSlotSelect ? 0 : undefined}
              >
                <strong>{slot.title}</strong>
                <p>{slot.meta}</p>
                <div className="ui-lane-board__slot-time">
                  <span>{slot.start}</span>
                  <span>{slot.end}</span>
                </div>
                {slot.tags?.length ? (
                  <div className="ui-inline-badges">
                    {slot.tags.map((tag) => (
                      <Badge key={`${slot.id}-${tag.label}`} tone={tag.tone}>
                        {tag.label}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export function OccupancyCalendar({
  columns,
  rows
}: PropsWithChildren<{ columns: string[]; rows: OccupancyRow[]; helper?: ReactNode }>) {
  return (
    <div className="ui-calendar">
      <div className="ui-calendar__header">
        <div>Machine</div>
        {columns.map((column) => (
          <div key={column}>{column}</div>
        ))}
      </div>
      {rows.map((row) => (
        <div className="ui-calendar__row" key={row.id}>
          <div className="ui-calendar__machine">
            <strong>{row.label}</strong>
            <span>{row.detail}</span>
          </div>
          {row.cells.map((cell) => (
            <div className="ui-calendar__cell" key={`${row.id}-${cell.date}`}>
              <div className={`ui-calendar__block ui-calendar__block--${cell.state}`}>
                {cell.title ? <strong>{cell.title}</strong> : null}
                {cell.subtitle ? <span>{cell.subtitle}</span> : null}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
