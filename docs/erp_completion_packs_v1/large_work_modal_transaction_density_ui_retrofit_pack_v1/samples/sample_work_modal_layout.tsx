// Reference sample only. Do not blindly copy.
// Adapt to the existing STS Manufacturing ERP component structure and naming.

import React, { useMemo, useState } from 'react';

type Issue = { id?: string; message: string; field?: string };

type CompactValidationSummaryProps = {
  issues: Issue[];
  title?: string;
  defaultExpanded?: boolean;
};

export function CompactValidationSummary({
  issues,
  title = 'Validation',
  defaultExpanded = false,
}: CompactValidationSummaryProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const inlineText = useMemo(() => {
    const first = issues.slice(0, 3).map((x) => x.field || x.message).join(', ');
    const more = issues.length > 3 ? ` +${issues.length - 3} more` : '';
    return `${issues.length} ${issues.length === 1 ? 'issue' : 'issues'}${first ? `: ${first}` : ''}${more}`;
  }, [issues]);

  if (!issues.length) return null;

  return (
    <section className="compact-validation-strip" aria-label={title}>
      <div className="compact-validation-strip__main">
        <strong>{inlineText}</strong>
        <button
          type="button"
          className="compact-link-button"
          aria-expanded={expanded}
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? 'Hide details' : 'View details'}
        </button>
      </div>
      {expanded && (
        <ul className="compact-validation-strip__list">
          {issues.map((issue, index) => (
            <li key={issue.id || index}>{issue.message}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

type WorkModalProps = {
  title: string;
  subtitle?: string;
  statusBadges?: React.ReactNode;
  quickActions?: React.ReactNode;
  validation?: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
};

export function LargeWorkModal({
  title,
  subtitle,
  statusBadges,
  quickActions,
  validation,
  footer,
  onClose,
  children,
}: WorkModalProps) {
  return (
    <div className="work-modal-shell" role="dialog" aria-modal="true" aria-labelledby="work-modal-title">
      <header className="work-modal-header">
        <div className="work-modal-title-block">
          <div className="work-modal-title-row">
            <h2 id="work-modal-title">{title}</h2>
            {statusBadges && <div className="work-modal-status-badges">{statusBadges}</div>}
          </div>
          {subtitle && <p className="work-modal-subtitle">{subtitle}</p>}
        </div>
        <div className="work-modal-header-actions">
          {quickActions}
          <button type="button">Help</button>
          <button type="button" onClick={onClose}>Close</button>
        </div>
      </header>

      <main className="work-modal-body">
        {validation}
        {children}
      </main>

      {footer && <footer className="work-modal-footer">{footer}</footer>}
    </div>
  );
}

export function ExampleQuoteHeaderForm() {
  return (
    <section className="erp-card erp-card--compact">
      <h3>Header</h3>
      <div className="form-grid form-grid--12">
        <div className="form-grid__item span-3">Quote number field</div>
        <div className="form-grid__item span-6">Customer field</div>
        <div className="form-grid__item span-3">Sales owner field</div>
        <div className="form-grid__item span-3">Quote date field</div>
        <div className="form-grid__item span-3">Expiry date field</div>
        <div className="form-grid__item span-3">Priority field</div>
        <div className="form-grid__item span-3">Status field</div>
        <div className="form-grid__item span-4">Price list field</div>
        <div className="form-grid__item span-4">Discount scheme field</div>
        <div className="form-grid__item span-4">Payment terms field</div>
      </div>
    </section>
  );
}

export function ExampleTransactionLineGrid() {
  return (
    <section className="erp-card erp-card--compact">
      <div className="section-title-row">
        <div>
          <h3>Quote lines</h3>
          <p>2 lines</p>
        </div>
        <button type="button">Add Line</button>
      </div>

      <div className="transaction-grid-scroll">
        <div className="transaction-line-grid" role="table" aria-label="Quote lines">
          <div className="transaction-line-grid__header" role="row">
            <div role="columnheader">Line</div>
            <div role="columnheader">Item *</div>
            <div role="columnheader">Order UOM *</div>
            <div role="columnheader">Qty *</div>
            <div role="columnheader">Unit Price</div>
            <div role="columnheader">Price Source</div>
            <div role="columnheader">Discount</div>
            <div role="columnheader">Actions</div>
          </div>
          <div className="transaction-line-grid__row" role="row">
            <div role="cell"><input aria-label="Line number" defaultValue="10" /></div>
            <div role="cell"><select aria-label="Item"><option>Select</option></select></div>
            <div role="cell"><select aria-label="Order UOM"><option>Select</option></select></div>
            <div role="cell"><input aria-label="Quantity" defaultValue="1" /></div>
            <div role="cell"><input aria-label="Unit price" defaultValue="0" /></div>
            <div role="cell"><select aria-label="Price source"><option>Manual</option></select></div>
            <div role="cell"><input aria-label="Discount percentage" defaultValue="0" /></div>
            <div role="cell"><button type="button" aria-label="Line actions">⋮</button></div>
          </div>
        </div>
      </div>
    </section>
  );
}
