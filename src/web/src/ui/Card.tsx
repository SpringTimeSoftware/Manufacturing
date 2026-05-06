import type { PropsWithChildren, ReactNode } from "react";

interface CardProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}

export function Card({ actions, children, className, description, title }: PropsWithChildren<CardProps>) {
  return (
    <section className={["ui-card", className].filter(Boolean).join(" ")}>
      {(title || actions) && (
        <header className="ui-card__header">
          <div>
            {title ? <h2 className="ui-card__title">{title}</h2> : null}
            {description ? <p className="ui-card__description">{description}</p> : null}
          </div>
          {actions ? <div className="ui-card__actions">{actions}</div> : null}
        </header>
      )}
      <div className="ui-card__body">{children}</div>
    </section>
  );
}
