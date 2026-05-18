import { useEffect, useMemo, useState } from "react";
import type { UdfRuntimeFieldDto, UdfValueUpsertRequest } from "../api/contracts";
import { useApiMutation, useApiQuery } from "../api/hooks";
import { useAuth } from "../auth/AuthContext";
import { Button } from "../ui/Button";
import { EmptyState } from "../ui/EmptyState";
import {
  ErpDecimalField,
  ErpLookupField,
  ErpMoneyField,
  ErpNumberField,
  ErpStatusChip,
  ErpValidationSummary
} from "../ui/ErpComponents";
import { listUdfRuntimeFields, saveUdfRuntimeValues } from "./platformAdminAdapters";

interface UdfRuntimePanelProps {
  companyId?: number | null;
  disabledReason?: string;
  entityId: number | null | undefined;
  entityLevel?: string;
  entityLineId?: number | null;
  entityType: string;
  readOnly?: boolean;
  screenKey: string;
  title?: string;
}

type DraftValue = {
  booleanValue: boolean | null;
  dateTimeValue: string;
  dateValue: string;
  numberValue: number | null;
  textValue: string;
};

function initialDraft(field: UdfRuntimeFieldDto): DraftValue {
  const value = field.value;
  return {
    booleanValue: value?.valueBoolean ?? null,
    dateTimeValue: value?.valueDateTime ?? "",
    dateValue: value?.valueDate ?? "",
    numberValue:
      value?.valueNumber ??
      value?.valueDecimal ??
      value?.valueMoneyAmount ??
      value?.valueInteger ??
      null,
    textValue:
      value?.valueText ??
      value?.valueLongText ??
      value?.valueOptionCode ??
      value?.displayValue ??
      ""
  };
}

function toValueRequest(field: UdfRuntimeFieldDto, draft: DraftValue, entityId: number, companyId?: number | null, entityLineId?: number | null): UdfValueUpsertRequest {
  const base: UdfValueUpsertRequest = {
    definitionId: field.placement.udfDefinitionId,
    entityId,
    companyId: companyId ?? field.placement.companyId ?? null,
    entityLineId: entityLineId ?? null,
    status: "Active"
  };
  const type = field.placement.dataType;

  if (["Integer"].includes(type)) {
    return { ...base, valueInteger: draft.numberValue === null ? null : Math.trunc(draft.numberValue), displayValue: draft.numberValue === null ? null : String(Math.trunc(draft.numberValue)) };
  }

  if (["Number"].includes(type)) {
    return { ...base, valueNumber: draft.numberValue, displayValue: draft.numberValue === null ? null : String(draft.numberValue) };
  }

  if (["Decimal"].includes(type)) {
    return { ...base, valueDecimal: draft.numberValue, displayValue: draft.numberValue === null ? null : String(draft.numberValue) };
  }

  if (["Money"].includes(type)) {
    return { ...base, valueMoneyAmount: draft.numberValue, displayValue: draft.numberValue === null ? null : String(draft.numberValue) };
  }

  if (type === "Date") {
    return { ...base, valueDate: draft.dateValue || null, displayValue: draft.dateValue || null };
  }

  if (type === "DateTime") {
    return { ...base, valueDateTime: draft.dateTimeValue || null, displayValue: draft.dateTimeValue || null };
  }

  if (type === "Boolean") {
    return { ...base, valueBoolean: draft.booleanValue ?? false, displayValue: draft.booleanValue ? "Yes" : "No" };
  }

  if (["SingleSelect", "MultiSelect", "Lookup"].includes(type)) {
    return { ...base, valueOptionCode: draft.textValue || null, displayValue: draft.textValue || null };
  }

  if (type === "LongText") {
    return { ...base, valueLongText: draft.textValue || null, displayValue: draft.textValue || null };
  }

  if (type === "Json") {
    return { ...base, valueJson: draft.textValue || null, displayValue: draft.textValue ? "JSON value" : null };
  }

  if (type === "AttachmentReference") {
    return { ...base, attachmentReferenceId: draft.numberValue, displayValue: draft.numberValue === null ? null : `Attachment ${draft.numberValue}` };
  }

  return { ...base, valueText: draft.textValue || null, displayValue: draft.textValue || null };
}

function fieldLabel(field: UdfRuntimeFieldDto) {
  return field.placement.label;
}

function optionSet(field: UdfRuntimeFieldDto) {
  const current = field.value?.valueOptionCode ?? field.value?.displayValue ?? "";
  const base = [
    { label: "Standard", value: "STANDARD" },
    { label: "Priority", value: "PRIORITY" },
    { label: "Customer-specific", value: "CUSTOMER_SPECIFIC" }
  ];

  if (current && !base.some((option) => option.value === current)) {
    return [{ label: current, value: current }, ...base];
  }

  return base;
}

export function UdfRuntimePanel({
  companyId,
  disabledReason,
  entityId,
  entityLevel = "Header",
  entityLineId,
  entityType,
  readOnly = false,
  screenKey,
  title = "Custom fields"
}: UdfRuntimePanelProps) {
  const { session } = useAuth();
  const liveEntityId = entityId ?? 0;
  const isEntitySaved = liveEntityId > 0;
  const [drafts, setDrafts] = useState<Record<number, DraftValue>>({});
  const [saveError, setSaveError] = useState<string | null>(null);

  const query = useApiQuery(
    ["platform", "udf-runtime", screenKey, entityType, entityLevel, liveEntityId, entityLineId ?? 0],
    () => listUdfRuntimeFields(session, screenKey, entityType, entityLevel, liveEntityId, entityLineId),
    { enabled: isEntitySaved, staleTime: 60_000 }
  );

  const fields = query.data ?? [];

  useEffect(() => {
    if (fields.length === 0) {
      return;
    }

    setDrafts((current) => {
      const next = { ...current };
      for (const field of fields) {
        if (!next[field.placement.id]) {
          next[field.placement.id] = initialDraft(field);
        }
      }
      return next;
    });
  }, [fields]);

  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    for (const field of fields) {
      const draft = drafts[field.placement.id];
      if (field.placement.isRequired && draft) {
        const isMissing = draft.textValue.trim().length === 0 && draft.numberValue === null && !draft.dateValue && !draft.dateTimeValue && draft.booleanValue === null;
        if (isMissing) {
          errors.push(`${field.placement.label} is required.`);
        }
      }
    }
    return errors;
  }, [drafts, fields]);

  const mutation = useApiMutation(
    (values: UdfValueUpsertRequest[]) =>
      saveUdfRuntimeValues(session, entityType, liveEntityId, {
        values
      }),
    {
      onSuccess: () => setSaveError(null),
      onError: (error) => setSaveError(error.message)
    }
  );

  const blockedReason = disabledReason ?? (!isEntitySaved ? "Save the core record before entering custom field values." : undefined);
  const isBlocked = Boolean(blockedReason) || readOnly;

  const updateDraft = (fieldId: number, partial: Partial<DraftValue>) => {
    setDrafts((current) => ({
      ...current,
      [fieldId]: {
        ...(current[fieldId] ?? { booleanValue: null, dateTimeValue: "", dateValue: "", numberValue: null, textValue: "" }),
        ...partial
      }
    }));
  };

  const save = () => {
    const requests = fields.map((field) =>
      toValueRequest(
        field,
        drafts[field.placement.id] ?? initialDraft(field),
        liveEntityId,
        companyId,
        entityLineId
      )
    );
    mutation.mutate(requests);
  };

  if (!isEntitySaved) {
    return (
      <section className="udf-runtime-panel" data-testid={`udf-runtime-${screenKey}`}>
        <div className="udf-runtime-panel__header">
          <h3>{title}</h3>
          <ErpStatusChip tone="warn">Unavailable until saved</ErpStatusChip>
        </div>
        <p className="muted">{blockedReason}</p>
      </section>
    );
  }

  return (
    <section className="udf-runtime-panel" data-testid={`udf-runtime-${screenKey}`}>
      <div className="udf-runtime-panel__header">
        <div>
          <h3>{title}</h3>
          <p className="muted">Configured for {entityType} {entityLevel.toLowerCase()} through platform placement metadata.</p>
        </div>
        <div className="udf-runtime-panel__actions">
          <ErpStatusChip tone={fields.length > 0 ? "success" : "neutral"}>{fields.length} active</ErpStatusChip>
          <Button
            disabled={isBlocked || validationErrors.length > 0 || fields.length === 0 || mutation.isPending}
            onClick={save}
            title={isBlocked ? blockedReason : validationErrors[0]}
            variant="primary"
          >
            {mutation.isPending ? "Saving..." : "Save custom fields"}
          </Button>
        </div>
      </div>

      <ErpValidationSummary errors={saveError ? [saveError, ...validationErrors] : validationErrors} />

      {query.isError ? (
        <EmptyState
          description="Runtime field placement could not be loaded for this record."
          hint={query.error instanceof Error ? query.error.message : undefined}
          title="Custom fields unavailable"
        />
      ) : null}

      {!query.isLoading && fields.length === 0 && !query.isError ? (
        <p className="muted">No active custom fields are placed on this workspace.</p>
      ) : null}

      <div className="udf-runtime-panel__grid">
        {fields.map((field) => {
          const draft = drafts[field.placement.id] ?? initialDraft(field);
          const disabled = isBlocked || field.placement.isReadOnly;
          const disabledText = readOnly ? "This record status locks custom field edits." : blockedReason;
          const type = field.placement.dataType;

          if (["Integer", "Number"].includes(type)) {
            return (
              <ErpNumberField
                disabled={disabled}
                disabledReason={disabledText}
                key={field.placement.id}
                label={fieldLabel(field)}
                onChange={(value) => updateDraft(field.placement.id, { numberValue: value })}
                required={field.placement.isRequired}
                value={draft.numberValue}
              />
            );
          }

          if (["Decimal"].includes(type)) {
            return (
              <ErpDecimalField
                disabled={disabled}
                disabledReason={disabledText}
                key={field.placement.id}
                label={fieldLabel(field)}
                onChange={(value) => updateDraft(field.placement.id, { numberValue: value })}
                required={field.placement.isRequired}
                value={draft.numberValue}
              />
            );
          }

          if (type === "Money") {
            return (
              <ErpMoneyField
                disabled={disabled}
                disabledReason={disabledText}
                key={field.placement.id}
                label={fieldLabel(field)}
                onChange={(value) => updateDraft(field.placement.id, { numberValue: value })}
                required={field.placement.isRequired}
                value={draft.numberValue}
              />
            );
          }

          if (["SingleSelect", "MultiSelect", "Lookup"].includes(type) || ["Select", "Lookup"].includes(field.placement.controlType)) {
            return (
              <ErpLookupField
                disabled={disabled}
                disabledReason={disabledText}
                key={field.placement.id}
                label={fieldLabel(field)}
                onChange={(value) => updateDraft(field.placement.id, { textValue: value })}
                options={optionSet(field)}
                required={field.placement.isRequired}
                value={draft.textValue}
              />
            );
          }

          if (type === "Boolean") {
            return (
              <label className="erp-governed-field" data-control-type="checkbox" key={field.placement.id}>
                <span>{fieldLabel(field)}</span>
                <input
                  aria-label={fieldLabel(field)}
                  checked={draft.booleanValue ?? false}
                  disabled={disabled}
                  onChange={(event) => updateDraft(field.placement.id, { booleanValue: event.target.checked })}
                  type="checkbox"
                />
                {disabled && disabledText ? <small>{disabledText}</small> : null}
              </label>
            );
          }

          if (type === "Date" || type === "DateTime") {
            const isDateTime = type === "DateTime";
            return (
              <label className="erp-governed-field" data-control-type={isDateTime ? "datetime" : "date"} key={field.placement.id}>
                <span>
                  {fieldLabel(field)}
                  {field.placement.isRequired ? <b aria-hidden="true">*</b> : null}
                </span>
                <input
                  aria-label={fieldLabel(field)}
                  disabled={disabled}
                  onChange={(event) => updateDraft(field.placement.id, isDateTime ? { dateTimeValue: event.target.value } : { dateValue: event.target.value })}
                  required={field.placement.isRequired}
                  type={isDateTime ? "datetime-local" : "date"}
                  value={isDateTime ? draft.dateTimeValue : draft.dateValue}
                />
                {disabled && disabledText ? <small>{disabledText}</small> : null}
              </label>
            );
          }

          return (
            <label className="erp-governed-field" data-control-type={type === "LongText" ? "textarea" : "text"} key={field.placement.id}>
              <span>
                {fieldLabel(field)}
                {field.placement.isRequired ? <b aria-hidden="true">*</b> : null}
              </span>
              {type === "LongText" ? (
                <textarea
                  aria-label={fieldLabel(field)}
                  disabled={disabled}
                  onChange={(event) => updateDraft(field.placement.id, { textValue: event.target.value })}
                  required={field.placement.isRequired}
                  rows={3}
                  value={draft.textValue}
                />
              ) : (
                <input
                  aria-label={fieldLabel(field)}
                  disabled={disabled}
                  onChange={(event) => updateDraft(field.placement.id, { textValue: event.target.value })}
                  required={field.placement.isRequired}
                  type={type === "Email" ? "email" : type === "Url" ? "url" : type === "Phone" ? "tel" : "text"}
                  value={draft.textValue}
                />
              )}
              {disabled && disabledText ? <small>{disabledText}</small> : null}
            </label>
          );
        })}
      </div>
    </section>
  );
}
