import { useMemo, useState, type PropsWithChildren, type ReactNode } from "react";
import { Button } from "./Button";
import { DataGrid, type DataGridColumn } from "./DataGrid";
import { EmptyState } from "./EmptyState";
import { FilterBar } from "./FilterBar";
import { ModalDialog } from "./ModalDialog";

type ErpButtonVariant = "primary" | "secondary" | "ghost" | "quiet";
type ErpStatusTone = "info" | "success" | "warn" | "danger" | "neutral";

export interface ErpAction {
  disabled?: boolean;
  hidden?: boolean;
  label: string;
  onClick?: () => void;
  reason?: string;
  variant?: ErpButtonVariant;
}

interface ErpActionBarProps {
  danger?: ErpAction[];
  primary?: ErpAction[];
  secondary?: ErpAction[];
  testId?: string;
  utility?: ErpAction[];
}

function ErpActionGroup({ actions, group }: { actions?: ErpAction[]; group: string }) {
  const visibleActions = actions?.filter((action) => !action.hidden) ?? [];

  if (visibleActions.length === 0) {
    return null;
  }

  return (
    <div className={`erp-action-bar__group erp-action-bar__group--${group}`} role="group">
      {visibleActions.map((action) => {
        const missingHandler = !action.onClick;
        const disabled = action.disabled || missingHandler;
        const reason = action.reason ?? (missingHandler ? "Action requires an enabled workflow." : action.disabled ? "Action is temporarily unavailable." : undefined);

        return (
          <span className="erp-action-bar__action" data-action-state={disabled ? "disabled" : "working"} key={`${group}-${action.label}`}>
            <Button
              className={group === "danger" ? "erp-action-bar__button--danger" : undefined}
              disabled={disabled}
              onClick={disabled ? undefined : action.onClick}
              title={reason}
              variant={action.variant ?? (group === "primary" ? "primary" : "secondary")}
            >
              {action.label}
            </Button>
            {disabled && reason ? <small className="erp-action-bar__reason">{reason}</small> : null}
          </span>
        );
      })}
    </div>
  );
}

export function ErpActionBar({ danger, primary, secondary, testId, utility }: ErpActionBarProps) {
  return (
    <div className="erp-action-bar" data-testid={testId}>
      <div className="erp-action-bar__main">
        <ErpActionGroup actions={utility} group="utility" />
        <ErpActionGroup actions={secondary} group="secondary" />
      </div>
      <div className="erp-action-bar__main erp-action-bar__main--end">
        <ErpActionGroup actions={danger} group="danger" />
        <ErpActionGroup actions={primary} group="primary" />
      </div>
    </div>
  );
}

interface ErpFilterBarProps {
  actions?: ReactNode;
  ariaLabel?: string;
  onClear?: () => void;
  testId?: string;
}

export function ErpFilterBar({
  actions,
  ariaLabel = "ERP filters",
  children,
  onClear,
  testId
}: PropsWithChildren<ErpFilterBarProps>) {
  const filterActions = (
    <>
      {actions}
      {onClear ? (
        <Button onClick={onClear} variant="quiet">
          Clear filters
        </Button>
      ) : null}
    </>
  );

  return (
    <div aria-label={ariaLabel} className="erp-filter-bar" data-testid={testId} role="search">
      <FilterBar actions={actions || onClear ? filterActions : undefined}>{children}</FilterBar>
    </div>
  );
}

export interface ErpLookupOption {
  disabled?: boolean;
  label: string;
  value: string;
}

interface ErpLookupFieldProps {
  allowFreeText?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  error?: string;
  helper?: string;
  label: string;
  onChange: (value: string) => void;
  options?: ErpLookupOption[];
  placeholder?: string;
  quickCreateEnabled?: boolean;
  required?: boolean;
  value: string;
}

export function ErpLookupField({
  allowFreeText = false,
  disabled = false,
  disabledReason,
  error,
  helper,
  label,
  onChange,
  options = [],
  placeholder = "Select",
  quickCreateEnabled = false,
  required = false,
  value
}: ErpLookupFieldProps) {
  const normalizedOptions = useMemo(() => {
    if (!value || options.some((option) => option.value === value)) {
      return options;
    }

    return [{ label: value, value }, ...options];
  }, [options, value]);
  const sourceUnavailable = !allowFreeText && normalizedOptions.length === 0 && !value;
  const isDisabled = disabled || sourceUnavailable;
  const reason = disabledReason ?? (sourceUnavailable ? "Lookup source is not available for this context." : undefined);

  return (
    <label className={`erp-lookup-field erp-governed-field ${error ? "erp-lookup-field--error" : ""}`} data-control-type={allowFreeText ? "free-text" : "lookup"}>
      <span>
        {label}
        {required ? <b aria-hidden="true">*</b> : null}
      </span>
      {allowFreeText ? (
        <input
          aria-label={label}
          disabled={isDisabled}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          value={value}
        />
      ) : (
        <select aria-label={label} disabled={isDisabled} onChange={(event) => onChange(event.target.value)} required={required} value={value}>
          <option value="">{placeholder}</option>
          {normalizedOptions.map((option) => (
            <option disabled={option.disabled} key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
      {helper ? <small>{helper}</small> : null}
      {isDisabled && reason ? <small>{reason}</small> : null}
      {quickCreateEnabled ? <small>Quick create is available for authorized users.</small> : null}
      {error ? <small className="erp-lookup-field__error">{error}</small> : null}
    </label>
  );
}

type NumberValue = number | null;

interface ErpNumberFieldProps {
  disabled?: boolean;
  disabledReason?: string;
  error?: string;
  helper?: string;
  label: string;
  max?: number;
  min?: number;
  onChange: (value: NumberValue) => void;
  required?: boolean;
  step?: number;
  unit?: string;
  value: NumberValue;
}

function toNumberInputValue(value: NumberValue) {
  return value === null || Number.isNaN(value) ? "" : String(value);
}

export function parseGovernedNumberInput(value: string, scale?: number): NumberValue {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  if (typeof scale !== "number") {
    return parsed;
  }

  const factor = 10 ** scale;
  return Math.round(parsed * factor) / factor;
}

export function ErpNumberField({
  disabled,
  disabledReason,
  error,
  helper,
  label,
  max,
  min,
  onChange,
  required,
  step = 1,
  unit,
  value
}: ErpNumberFieldProps) {
  return (
    <label className={`erp-number-field erp-governed-field ${error ? "erp-lookup-field--error" : ""}`} data-control-type="number">
      <span>
        {label}
        {required ? <b aria-hidden="true">*</b> : null}
      </span>
      <input
        aria-label={label}
        aria-invalid={Boolean(error)}
        disabled={disabled}
        inputMode="numeric"
        max={max}
        min={min}
        onChange={(event) => onChange(parseGovernedNumberInput(event.target.value, 0))}
        required={required}
        step={step}
        type="number"
        value={toNumberInputValue(value)}
      />
      {unit ? <small>{unit}</small> : null}
      {helper ? <small>{helper}</small> : null}
      {disabled && disabledReason ? <small>{disabledReason}</small> : null}
      {error ? <small className="erp-lookup-field__error">{error}</small> : null}
    </label>
  );
}

interface ErpDecimalFieldProps extends Omit<ErpNumberFieldProps, "step"> {
  precision?: number;
  scale?: number;
  step?: number;
}

export function ErpDecimalField({ precision, scale = 3, step, ...props }: ErpDecimalFieldProps) {
  const decimalStep = step ?? Number(`0.${"0".repeat(Math.max(scale - 1, 0))}1`);
  const max = props.max ?? (precision ? 10 ** Math.max(precision - scale, 1) - decimalStep : undefined);

  return (
    <label className={`erp-number-field erp-decimal-field erp-governed-field ${props.error ? "erp-lookup-field--error" : ""}`} data-control-type="decimal">
      <span>
        {props.label}
        {props.required ? <b aria-hidden="true">*</b> : null}
      </span>
      <input
        aria-label={props.label}
        aria-invalid={Boolean(props.error)}
        disabled={props.disabled}
        inputMode="decimal"
        max={max}
        min={props.min}
        onChange={(event) => props.onChange(parseGovernedNumberInput(event.target.value, scale))}
        required={props.required}
        step={decimalStep}
        type="number"
        value={toNumberInputValue(props.value)}
      />
      {props.unit ? <small>{props.unit}</small> : null}
      {props.helper ? <small>{props.helper}</small> : null}
      {props.disabled && props.disabledReason ? <small>{props.disabledReason}</small> : null}
      {props.error ? <small className="erp-lookup-field__error">{props.error}</small> : null}
    </label>
  );
}

interface ErpMoneyFieldProps extends Omit<ErpDecimalFieldProps, "unit"> {
  currencyCode?: string;
}

export function ErpMoneyField({ currencyCode = "INR", scale = 2, step = 0.01, ...props }: ErpMoneyFieldProps) {
  return (
    <div className="erp-money-field">
      <ErpDecimalField {...props} scale={scale} step={step} unit={currencyCode} />
    </div>
  );
}

interface ErpFileActionStateProps {
  accept?: string;
  disabledReason?: string;
  enabled: boolean;
  fileName?: string;
  label: string;
  onAction?: () => void;
  onFileSelect?: (file: File | null) => void;
}

export function ErpFileActionState({
  accept,
  disabledReason = "File storage is not enabled for this workspace.",
  enabled,
  fileName,
  label,
  onAction,
  onFileSelect
}: ErpFileActionStateProps) {
  const working = enabled && Boolean(onAction || onFileSelect);
  const reason = working ? undefined : disabledReason;

  if (onFileSelect) {
    return (
      <label className="erp-file-action-state erp-governed-field" data-action-state={working ? "working" : "disabled"} data-control-type="file-action">
        <span>{label}</span>
        <input
          accept={accept}
          aria-label={label}
          disabled={!working}
          onChange={(event) => onFileSelect(event.target.files?.[0] ?? null)}
          type="file"
        />
        {fileName ? <small>{fileName}</small> : null}
        {reason ? <small>{reason}</small> : null}
      </label>
    );
  }

  return (
    <span className="erp-file-action-state" data-action-state={working ? "working" : "disabled"} data-control-type="file-action">
      <Button disabled={!working} onClick={working ? onAction : undefined} title={reason} variant="secondary">
        {label}
      </Button>
      {fileName ? <small>{fileName}</small> : null}
      {reason ? <small>{reason}</small> : null}
    </span>
  );
}

interface ErpStatusChipProps {
  tone?: ErpStatusTone;
}

export function ErpStatusChip({ children, tone = "neutral" }: PropsWithChildren<ErpStatusChipProps>) {
  return <span className={`erp-status-chip erp-status-chip--${tone}`}>{children}</span>;
}

interface ErpGridProps<TRecord> {
  ariaLabel?: string;
  columns: DataGridColumn<TRecord>[];
  emptyState?: {
    description: string;
    hint?: ReactNode;
    title: string;
  };
  getRowId: (record: TRecord) => string;
  isLoading?: boolean;
  onRowSelect?: (record: TRecord) => void;
  records: TRecord[];
  rowLabel?: (record: TRecord) => string;
  testId?: string;
  virtualization?: {
    enabled?: boolean;
    overscan?: number;
    rowHeight?: number;
    viewportHeight?: number;
  };
}

export function ErpGrid<TRecord>({ testId, ...props }: ErpGridProps<TRecord>) {
  return (
    <div className="erp-grid" data-testid={testId}>
      <DataGrid {...props} />
    </div>
  );
}

interface ErpModalWorkspaceProps {
  description?: string;
  footer?: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  panelClassName?: string;
  sectionNavigation?: ReactNode;
  statusMeta?: ReactNode;
  title: string;
  validation?: ReactNode;
}

export function ErpModalWorkspace({
  children,
  description,
  footer,
  isOpen,
  onClose,
  panelClassName,
  sectionNavigation,
  statusMeta,
  title,
  validation
}: PropsWithChildren<ErpModalWorkspaceProps>) {
  return (
    <ModalDialog
      description={description}
      footer={footer ? <div className="erp-modal-workspace__footer">{footer}</div> : undefined}
      isOpen={isOpen}
      onClose={onClose}
      panelClassName={["erp-modal-workspace", panelClassName].filter(Boolean).join(" ")}
      title={title}
    >
      <div className="erp-modal-workspace__body" data-testid="erp-modal-workspace">
        {statusMeta ? <div className="erp-modal-workspace__meta">{statusMeta}</div> : null}
        {validation ? <div className="erp-modal-workspace__validation">{validation}</div> : null}
        <div className={sectionNavigation ? "erp-modal-workspace__layout" : "erp-modal-workspace__layout erp-modal-workspace__layout--single"}>
          {sectionNavigation ? <aside className="erp-modal-workspace__sections">{sectionNavigation}</aside> : null}
          <div className="erp-modal-workspace__content">{children}</div>
        </div>
      </div>
    </ModalDialog>
  );
}

interface ErpValidationSummaryProps {
  errors?: string[];
  maxVisible?: number;
  title?: string;
}

export function ErpValidationSummary({
  errors = [],
  maxVisible = 4,
  title = "Validation summary"
}: ErpValidationSummaryProps) {
  const [expanded, setExpanded] = useState(false);

  if (errors.length === 0) {
    return null;
  }

  const visibleErrors = expanded ? errors : errors.slice(0, maxVisible);
  const hiddenCount = errors.length - visibleErrors.length;

  return (
    <div className="erp-validation-summary" role="alert">
      <div className="erp-validation-summary__header">
        <strong>{title}</strong>
        <span>{errors.length} issue{errors.length === 1 ? "" : "s"}</span>
      </div>
      <ul>
        {visibleErrors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
      {hiddenCount > 0 || expanded ? (
        <Button onClick={() => setExpanded((current) => !current)} variant="quiet">
          {expanded ? "Show fewer" : `Show ${hiddenCount} more`}
        </Button>
      ) : null}
    </div>
  );
}

interface ErpEmptyStateProps {
  actionLabel?: string;
  description: string;
  hint?: ReactNode;
  onAction?: () => void;
  title: string;
}

export function ErpEmptyState({ actionLabel, description, hint, onAction, title }: ErpEmptyStateProps) {
  return (
    <div className="erp-empty-state">
      <EmptyState actionLabel={actionLabel} description={description} hint={hint} onAction={onAction} title={title} />
    </div>
  );
}
