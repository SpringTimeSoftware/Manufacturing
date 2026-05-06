import type { PropsWithChildren, ReactNode } from "react";

interface TileProps {
  label: string;
  eyebrow?: string;
  meta?: ReactNode;
  onClick?: () => void;
}

export function Tile({ children, eyebrow, label, meta, onClick }: PropsWithChildren<TileProps>) {
  const content = (
    <>
      {eyebrow ? <span className="ui-tile__eyebrow">{eyebrow}</span> : null}
      <strong className="ui-tile__label">{label}</strong>
      {children ? <span className="ui-tile__content">{children}</span> : null}
      {meta ? <span className="ui-tile__meta">{meta}</span> : null}
    </>
  );

  if (!onClick) {
    return <div className="ui-tile">{content}</div>;
  }

  return (
    <button className="ui-tile" onClick={onClick} type="button">
      {content}
    </button>
  );
}
