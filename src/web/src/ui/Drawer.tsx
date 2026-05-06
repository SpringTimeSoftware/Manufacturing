import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type PropsWithChildren,
  type ReactNode
} from "react";
import { Button } from "./Button";

interface DrawerProps {
  title: string;
  description?: string;
  isOpen: boolean;
  onClose: () => void;
  footer?: ReactNode;
  panelClassName?: string;
}

export function Drawer({ children, description, footer, isOpen, onClose, panelClassName, title }: PropsWithChildren<DrawerProps>) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previousActiveElement?.focus();
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handlePanelKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }

    if (event.key !== "Tab" || !panelRef.current) {
      return;
    }

    const focusable = panelRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (focusable.length === 0) {
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  return (
    <aside className="ui-drawer ui-drawer--open">
      <button aria-label="Close drawer overlay" className="ui-drawer__overlay" onClick={onClose} type="button" />
      <section
        aria-describedby={description ? descriptionId : undefined}
        aria-labelledby={titleId}
        aria-modal="true"
        className={["ui-drawer__panel", panelClassName].filter(Boolean).join(" ")}
        onKeyDown={handlePanelKeyDown}
        ref={panelRef}
        role="dialog"
      >
        <header className="ui-drawer__header">
          <div>
            <h2 className="ui-drawer__title" id={titleId}>
              {title}
            </h2>
            {description ? (
              <p className="ui-card__description" id={descriptionId}>
                {description}
              </p>
            ) : null}
          </div>
          <Button onClick={onClose} ref={closeButtonRef} variant="quiet">
            Close
          </Button>
        </header>
        <div className="ui-drawer__body">{children}</div>
        {footer ? <footer className="ui-drawer__footer">{footer}</footer> : null}
      </section>
    </aside>
  );
}
