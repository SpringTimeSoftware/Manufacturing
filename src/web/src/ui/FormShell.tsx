import { useEffect, useEffectEvent, useState, type PropsWithChildren, type ReactNode } from "react";
import { ErpValidationSummary } from "./ErpComponents";

interface FormShellProps {
  title: string;
  bodyClassName?: string;
  className?: string;
  description?: string;
  initialFingerprint: string;
  validationErrors?: string[];
  actions?: ReactNode;
}

export function FormShell({
  actions,
  bodyClassName,
  children,
  className,
  description,
  initialFingerprint,
  title,
  validationErrors = []
}: PropsWithChildren<FormShellProps>) {
  const [currentFingerprint, setCurrentFingerprint] = useState(initialFingerprint);

  useEffect(() => {
    setCurrentFingerprint(initialFingerprint);
  }, [initialFingerprint]);

  const isDirty = currentFingerprint !== initialFingerprint;

  const handleBeforeUnload = useEffectEvent((event: BeforeUnloadEvent) => {
    if (!isDirty) {
      return;
    }

    event.preventDefault();
    event.returnValue = "";
  });

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [handleBeforeUnload]);

  return (
    <section className={["ui-form-shell", className].filter(Boolean).join(" ")}>
      <header className="ui-form-shell__header">
        <div>
          <h3>{title}</h3>
          {description ? <p>{description}</p> : null}
        </div>
        {actions ? <div className="ui-form-shell__actions">{actions}</div> : null}
      </header>
      <ErpValidationSummary errors={validationErrors} />
      <div
        className={["ui-form-shell__body", bodyClassName].filter(Boolean).join(" ")}
        onInput={() => {
          setCurrentFingerprint(`dirty:${Date.now()}`);
        }}
      >
        {children}
      </div>
      {isDirty ? <p className="ui-form-shell__dirty">Unsaved changes are present.</p> : null}
    </section>
  );
}
