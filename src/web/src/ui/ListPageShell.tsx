import type { PropsWithChildren, ReactNode } from "react";

interface ListPageShellProps {
  title: string;
  description: string;
  actions?: ReactNode;
  filters?: ReactNode;
  aside?: ReactNode;
}

export function ListPageShell({
  actions,
  aside,
  children,
  description,
  filters,
  title
}: PropsWithChildren<ListPageShellProps>) {
  return (
    <section className="page-shell">
      <header className="page-shell__header">
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {actions ? <div className="page-shell__actions">{actions}</div> : null}
      </header>
      {filters ? <div className="page-shell__filters">{filters}</div> : null}
      <div className={`page-shell__body ${aside ? "page-shell__body--with-aside" : ""}`}>
        <div>{children}</div>
        {aside ? <aside>{aside}</aside> : null}
      </div>
    </section>
  );
}
