import type { PropsWithChildren, ReactNode } from "react";

interface FilterBarProps {
  actions?: ReactNode;
}

export function FilterBar({ actions, children }: PropsWithChildren<FilterBarProps>) {
  return (
    <div className="ui-filter-bar">
      <div className="ui-filter-bar__content">{children}</div>
      {actions ? <div className="ui-filter-bar__actions">{actions}</div> : null}
    </div>
  );
}
