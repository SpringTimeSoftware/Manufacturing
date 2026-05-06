import type { ReactNode } from "react";

export interface TimelineEntry {
  id: string;
  title: string;
  meta: string;
  detail?: ReactNode;
}

interface TimelineProps {
  entries: TimelineEntry[];
}

export function Timeline({ entries }: TimelineProps) {
  return (
    <ol className="ui-timeline">
      {entries.map((entry) => (
        <li className="ui-timeline__entry" key={entry.id}>
          <span className="ui-timeline__dot" />
          <div className="ui-timeline__content">
            <strong>{entry.title}</strong>
            <span>{entry.meta}</span>
            {entry.detail ? <div>{entry.detail}</div> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
