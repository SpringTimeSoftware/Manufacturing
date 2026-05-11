import { startTransition, useDeferredValue, useMemo, useState } from "react";
import type {
  BinDto,
  BinUpsertRequest,
  BranchDto,
  BranchUpsertRequest,
  CompanyDto,
  CompanyUpsertRequest,
  DepartmentDto,
  DepartmentUpsertRequest,
  QueryFilter,
  ShiftDto,
  ShiftUpsertRequest,
  WarehouseDto,
  WarehouseUpsertRequest
} from "../api/contracts";
import { apiClient } from "../api/http";
import { queryKeys, useApiQuery } from "../api/hooks";
import { hasLiveSession } from "../api/liveData";
import { useAuth } from "../auth/AuthContext";
import {
  listBranchSetup,
  listBinSetup,
  listCompanySetup,
  listDepartmentSetup,
  listShiftSetup,
  listWarehouseSetup,
  type BinSetupItem,
  type BranchSetupItem,
  type CompanySetupItem,
  type DepartmentSetupItem,
  type ShiftSetupItem,
  type WarehouseSetupItem,
  type SetupDataSource
} from "../organization/organizationAdapters";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { DataGrid, type DataGridColumn } from "../ui/DataGrid";
import {
  ErpActionBar,
  ErpDecimalField,
  ErpFilterBar,
  ErpGrid,
  ErpLookupField,
  ErpModalWorkspace,
  ErpNumberField,
  ErpStatusChip,
  ErpValidationSummary
} from "../ui/ErpComponents";
import { EmptyState } from "../ui/EmptyState";
import { FilterBar } from "../ui/FilterBar";
import { FormShell } from "../ui/FormShell";
import { ListPageShell } from "../ui/ListPageShell";
import { Tile } from "../ui/Tile";
import { KpiStrip } from "../ui/boards";

function SourceBadge({ source }: { source: SetupDataSource }) {
  return <Badge tone={source === "Live" ? "success" : "neutral"}>{source === "Live" ? "Live records" : "Review mode"}</Badge>;
}

type CompanyDraft = { id: number | null; values: CompanyUpsertRequest };
type BranchDraft = { id: number | null; values: BranchUpsertRequest };
type DepartmentDraft = { id: number | null; values: DepartmentUpsertRequest };
type WarehouseDraft = { id: number | null; values: WarehouseUpsertRequest };
type BinDraft = { id: number | null; values: BinUpsertRequest };
type ShiftDraft = { id: number | null; values: ShiftUpsertRequest };
type MessageTone = "info" | "success" | "warn" | "danger" | "neutral";

const setupStatusOptions = ["Active", "Draft", "Inactive"].map(toOption);
const timeZoneOptions = ["Asia/Kolkata", "UTC"].map(toOption);
const currencyOptions = ["INR", "USD", "EUR"].map(toOption);
const calendarProfileOptions = ["IND-MFG-2026", "EXPORT-2026"].map(toOption);
const branchTypeOptions = ["Manufacturing", "Warehouse", "Office", "Vendor"].map(toOption);
const departmentTypeOptions = ["Sales", "Planning", "Production", "Quality", "Stores", "Dispatch", "Admin"].map(toOption);
const warehouseTypeOptions = ["Raw Material", "WIP", "Finished Goods", "Dispatch", "Quarantine", "Tool Store"].map(toOption);
const binTypeOptions = ["Rack", "Row", "Staging", "Quarantine", "Dispatch", "Floor"].map(toOption);
const blockReasonOptions = ["None", "QC_HOLD", "DAMAGED", "COUNT_LOCK", "SAFETY_HOLD"].map(toOption);
const saveAccessReason = "Sign in with company administration access to save organization setup.";

function toOption(value: string) {
  return { label: value, value };
}

function nullableText(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function liveSource(session: ReturnType<typeof useAuth>["session"], records: Array<{ source: SetupDataSource }>) {
  return records[0]?.source ?? (hasLiveSession(session) ? "Live" : "Seeded");
}

function setupSaveReason(canSave: boolean, validation: string[]) {
  return !canSave ? saveAccessReason : validation[0];
}

function SetupMessage({ message, tone }: { message: string | null; tone: MessageTone }) {
  return message ? <ErpStatusChip tone={tone}>{message}</ErpStatusChip> : null;
}

function liveErrorState(scope: string, error: unknown) {
  return (
    <EmptyState
      description={`${scope} live data could not be loaded for the current operating context.`}
      hint={error instanceof Error ? error.message : undefined}
      title={`${scope} unavailable`}
    />
  );
}

function companyDraftFromItem(record: CompanySetupItem): CompanyDraft {
  return {
    id: record.companyId,
    values: {
      baseCurrencyCode: record.baseCurrencyCode === "Pending" ? null : record.baseCurrencyCode,
      companyCode: record.code,
      companyName: record.name,
      defaultCalendarCode: record.calendarCode === "Pending" ? null : record.calendarCode,
      defaultLanguageId: record.defaultLanguageId,
      legalName: record.legalName,
      status: record.status,
      taxRegistrationNo: record.taxRegistrationNo === "Not captured" ? null : record.taxRegistrationNo,
      timeZoneId: record.timeZoneId
    }
  };
}

function companyDraftFromDto(dto: CompanyDto): CompanyDraft {
  return {
    id: dto.id,
    values: {
      baseCurrencyCode: dto.baseCurrencyCode,
      companyCode: dto.companyCode,
      companyName: dto.companyName,
      defaultCalendarCode: dto.defaultCalendarCode,
      defaultLanguageId: dto.defaultLanguageId,
      legalName: dto.legalName,
      status: dto.status,
      taxRegistrationNo: dto.taxRegistrationNo,
      timeZoneId: dto.timeZoneId
    }
  };
}

function branchDraftFromItem(record: BranchSetupItem): BranchDraft {
  return {
    id: record.branchId,
    values: {
      branchCode: record.code,
      branchName: record.name,
      branchType: record.branchType,
      companyId: record.companyId,
      contactEmail: record.contactEmail === "Pending" ? null : record.contactEmail,
      defaultCalendarCode: record.calendarCode === "Pending" ? null : record.calendarCode,
      defaultLanguageId: record.defaultLanguageId,
      defaultShiftId: record.defaultShiftId,
      defaultWarehouseId: record.defaultWarehouseId,
      status: record.status,
      timeZoneId: record.timeZoneId
    }
  };
}

function branchDraftFromDto(dto: BranchDto): BranchDraft {
  return {
    id: dto.id,
    values: {
      branchCode: dto.branchCode,
      branchName: dto.branchName,
      branchType: dto.branchType,
      companyId: dto.companyId,
      contactEmail: dto.contactEmail,
      defaultCalendarCode: dto.defaultCalendarCode,
      defaultLanguageId: dto.defaultLanguageId,
      defaultShiftId: dto.defaultShiftId,
      defaultWarehouseId: dto.defaultWarehouseId,
      status: dto.status,
      timeZoneId: dto.timeZoneId
    }
  };
}

function departmentDraftFromItem(record: DepartmentSetupItem): DepartmentDraft {
  return {
    id: record.departmentId,
    values: {
      branchId: record.branchId,
      companyId: record.companyId,
      departmentCode: record.code,
      departmentName: record.name,
      departmentType: record.departmentType,
      managerUserId: record.managerUserId,
      parentDepartmentId: record.parentDepartmentId,
      status: record.status
    }
  };
}

function departmentDraftFromDto(dto: DepartmentDto): DepartmentDraft {
  return {
    id: dto.id,
    values: {
      branchId: dto.branchId,
      companyId: dto.companyId,
      departmentCode: dto.departmentCode,
      departmentName: dto.departmentName,
      departmentType: dto.departmentType,
      managerUserId: dto.managerUserId,
      parentDepartmentId: dto.parentDepartmentId,
      status: dto.status
    }
  };
}

function warehouseDraftFromItem(record: WarehouseSetupItem): WarehouseDraft {
  return {
    id: record.warehouseId,
    values: {
      allowsMixedLots: record.allowsMixedLots,
      allowsNegativeStock: record.allowsNegativeStock,
      branchId: record.branchId,
      companyId: record.companyId,
      isDefaultIssueWarehouse: record.defaultIssue,
      isDefaultReceivingWarehouse: record.defaultReceiving,
      isDispatchEnabled: record.dispatchEnabled,
      status: record.status,
      warehouseCode: record.code,
      warehouseName: record.name,
      warehouseType: record.warehouseType
    }
  };
}

function warehouseDraftFromDto(dto: WarehouseDto): WarehouseDraft {
  return {
    id: dto.id,
    values: {
      allowsMixedLots: dto.allowsMixedLots,
      allowsNegativeStock: dto.allowsNegativeStock,
      branchId: dto.branchId,
      companyId: dto.companyId,
      isDefaultIssueWarehouse: dto.isDefaultIssueWarehouse,
      isDefaultReceivingWarehouse: dto.isDefaultReceivingWarehouse,
      isDispatchEnabled: dto.isDispatchEnabled,
      status: dto.status,
      warehouseCode: dto.warehouseCode,
      warehouseName: dto.warehouseName,
      warehouseType: dto.warehouseType
    }
  };
}

function binDraftFromItem(record: BinSetupItem): BinDraft {
  return {
    id: record.binId,
    values: {
      binCode: record.code,
      binName: record.name,
      binType: record.binType,
      blockReasonCode: record.blockReason === "None" ? null : record.blockReason,
      branchId: record.branchId,
      capacityUomId: record.capacityUomId,
      capacityValue: record.capacityValue,
      companyId: record.companyId,
      countCycleDays: record.countCycleDays,
      isBlocked: record.isBlocked,
      isCountCycleRequired: record.cycleCountLabel !== "Not required",
      isDefaultIssueBin: record.defaultIssue,
      isDefaultReceiveBin: record.defaultReceive,
      parentBinId: record.parentBinId,
      status: record.status,
      warehouseId: record.warehouseId
    }
  };
}

function binDraftFromDto(dto: BinDto): BinDraft {
  return {
    id: dto.id,
    values: {
      binCode: dto.binCode,
      binName: dto.binName,
      binType: dto.binType,
      blockReasonCode: dto.blockReasonCode,
      branchId: dto.branchId,
      capacityUomId: dto.capacityUomId,
      capacityValue: dto.capacityValue,
      companyId: dto.companyId,
      countCycleDays: dto.countCycleDays,
      isBlocked: dto.isBlocked,
      isCountCycleRequired: dto.isCountCycleRequired,
      isDefaultIssueBin: dto.isDefaultIssueBin,
      isDefaultReceiveBin: dto.isDefaultReceiveBin,
      parentBinId: dto.parentBinId,
      status: dto.status,
      warehouseId: dto.warehouseId
    }
  };
}

function shiftDraftFromItem(record: ShiftSetupItem): ShiftDraft {
  return {
    id: record.shiftId,
    values: {
      branchId: record.branchId,
      breakMinutes: record.breakMinutes,
      calendarProfileCode: record.calendarProfileCode === "Pending" ? null : record.calendarProfileCode,
      companyId: record.companyId,
      crossesMidnight: record.crossesMidnight,
      endTime: record.endTime,
      sequenceNo: record.sequenceNo,
      shiftCode: record.code,
      shiftName: record.name,
      startTime: record.startTime,
      status: record.status
    }
  };
}

function shiftDraftFromDto(dto: ShiftDto): ShiftDraft {
  return {
    id: dto.id,
    values: {
      branchId: dto.branchId,
      breakMinutes: dto.breakMinutes,
      calendarProfileCode: dto.calendarProfileCode,
      companyId: dto.companyId,
      crossesMidnight: dto.crossesMidnight,
      endTime: dto.endTime,
      sequenceNo: dto.sequenceNo,
      shiftCode: dto.shiftCode,
      shiftName: dto.shiftName,
      startTime: dto.startTime,
      status: dto.status
    }
  };
}

function buildOrganizationFilter(
  companyId?: number | null,
  branchId?: number | null,
  search?: string,
  status?: string
): QueryFilter {
  return {
    branchId: branchId ?? undefined,
    companyId: companyId ?? undefined,
    page: 1,
    pageSize: 25,
    search: search?.trim() ? search.trim() : undefined,
    status: status && status !== "all" ? status : undefined
  };
}

const companyColumns: DataGridColumn<CompanySetupItem>[] = [
  { key: "code", header: "Company", width: "16%", render: (record) => <strong>{record.code}</strong> },
  {
    key: "name",
    header: "Legal entity",
    render: (record) => (
      <div>
        <strong>{record.name}</strong>
        <div className="muted">{record.legalName}</div>
      </div>
    )
  },
  { key: "tax", header: "Tax / Currency", width: "18%", render: (record) => `${record.taxRegistrationNo} / ${record.baseCurrencyCode}` },
  { key: "calendar", header: "Calendar", width: "16%", render: (record) => record.calendarCode },
  {
    key: "status",
    header: "Status",
    width: "12%",
    render: (record) => <ErpStatusChip tone={record.status === "Active" ? "success" : "warn"}>{record.status}</ErpStatusChip>
  }
];

const branchColumns: DataGridColumn<BranchSetupItem>[] = [
  { key: "code", header: "Branch", width: "16%", render: (record) => <strong>{record.code}</strong> },
  {
    key: "name",
    header: "Plant / site",
    render: (record) => (
      <div>
        <strong>{record.name}</strong>
        <div className="muted">{record.branchType}</div>
      </div>
    )
  },
  { key: "defaultWarehouse", header: "Default warehouse", width: "18%", render: (record) => record.defaultWarehouse },
  { key: "contact", header: "Contact", width: "20%", render: (record) => record.contactEmail },
  {
    key: "status",
    header: "Status",
    width: "12%",
    render: (record) => <Badge tone={record.status === "Active" ? "success" : "warn"}>{record.status}</Badge>
  }
];

const departmentColumns: DataGridColumn<DepartmentSetupItem>[] = [
  { key: "code", header: "Department", width: "16%", render: (record) => <strong>{record.code}</strong> },
  {
    key: "name",
    header: "Name",
    render: (record) => (
      <div>
        <strong>{record.name}</strong>
        <div className="muted">{record.departmentType}</div>
      </div>
    )
  },
  { key: "parent", header: "Parent", width: "16%", render: (record) => record.parentDepartment },
  { key: "manager", header: "Manager", width: "18%", render: (record) => record.manager },
  {
    key: "status",
    header: "Status",
    width: "12%",
    render: (record) => <Badge tone={record.status === "Active" ? "success" : "warn"}>{record.status}</Badge>
  }
];

const warehouseColumns: DataGridColumn<WarehouseSetupItem>[] = [
  { key: "code", header: "Warehouse", width: "16%", render: (record) => <strong>{record.code}</strong> },
  {
    key: "name",
    header: "Store",
    render: (record) => (
      <div>
        <strong>{record.name}</strong>
        <div className="muted">{record.warehouseType}</div>
      </div>
    )
  },
  {
    key: "defaults",
    header: "Defaults",
    width: "18%",
    render: (record) => (
      <div className="context-chip-row">
        {record.defaultReceiving ? <Badge tone="info">Receiving</Badge> : null}
        {record.defaultIssue ? <Badge tone="warn">Issue</Badge> : null}
        {record.dispatchEnabled ? <Badge tone="success">Dispatch</Badge> : null}
      </div>
    )
  },
  {
    key: "rules",
    header: "Rules",
    width: "18%",
    render: (record) => (record.allowsMixedLots ? "Mixed lots allowed" : "Single lot discipline")
  },
  {
    key: "status",
    header: "Status",
    width: "12%",
    render: (record) => <Badge tone={record.status === "Active" ? "success" : "warn"}>{record.status}</Badge>
  }
];

const binColumns: DataGridColumn<BinSetupItem>[] = [
  { key: "code", header: "Bin", width: "16%", render: (record) => <strong>{record.code}</strong> },
  {
    key: "name",
    header: "Location",
    render: (record) => (
      <div>
        <strong>{record.name}</strong>
        <div className="muted">{record.binType}</div>
      </div>
    )
  },
  { key: "capacity", header: "Capacity", width: "14%", render: (record) => record.capacityLabel },
  { key: "cycle", header: "Cycle count", width: "16%", render: (record) => record.cycleCountLabel },
  {
    key: "block",
    header: "Stock status",
    width: "16%",
    render: (record) => (
      <Badge tone={record.isBlocked ? "danger" : "success"}>{record.isBlocked ? record.blockReason : "Available"}</Badge>
    )
  }
];

const shiftColumns: DataGridColumn<ShiftSetupItem>[] = [
  { key: "code", header: "Shift", width: "16%", render: (record) => <strong>{record.code}</strong> },
  {
    key: "name",
    header: "Calendar slot",
    render: (record) => (
      <div>
        <strong>{record.name}</strong>
        <div className="muted">{record.calendarProfileCode}</div>
      </div>
    )
  },
  { key: "window", header: "Time", width: "20%", render: (record) => `${record.startTime} - ${record.endTime}` },
  { key: "break", header: "Break", width: "12%", render: (record) => `${record.breakMinutes} min` },
  {
    key: "status",
    header: "Status",
    width: "14%",
    render: (record) => (
      <Badge tone={record.crossesMidnight ? "warn" : record.status === "Active" ? "success" : "neutral"}>
        {record.crossesMidnight ? "Cross-midnight" : record.status}
      </Badge>
    )
  }
];

function SetupAside({
  description,
  source
}: {
  description: string;
  endpoint: string;
  source: SetupDataSource;
}) {
  return (
    <Card title="Organization guidance" description={description}>
      <div className="notification-item">
        <strong>Organization records</strong>
        <p>Organization records stay scoped to the active company and branch context.</p>
        <div className="context-chip-row">
          <SourceBadge source={source} />
          <Badge tone="info">Organization foundation</Badge>
        </div>
      </div>
    </Card>
  );
}

export function CompanyMasterPage() {
  const { session } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [draft, setDraft] = useState<CompanyDraft | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<MessageTone>("info");
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(() => buildOrganizationFilter(undefined, undefined, deferredSearch, status), [deferredSearch, status]);
  const query = useApiQuery(queryKeys.organization.companies(deferredSearch, status), () => listCompanySetup(session, filter), {
    staleTime: 60_000
  });
  const records = query.data ?? [];
  const source = liveSource(session, records);
  const canSave = hasLiveSession(session);
  const validation = draft
    ? [
        !draft.values.companyCode.trim() ? "Company code is required." : "",
        !draft.values.companyName.trim() ? "Company name is required." : "",
        !draft.values.legalName.trim() ? "Legal name is required." : "",
        !draft.values.timeZoneId ? "Timezone is required." : "",
        !draft.values.baseCurrencyCode ? "Base currency is required." : "",
        !draft.values.defaultCalendarCode ? "Calendar profile is required." : ""
      ].filter(Boolean)
    : [];
  const updateDraft = (patch: Partial<CompanyUpsertRequest>) =>
    setDraft((current) => (current ? { ...current, values: { ...current.values, ...patch } } : current));
  const openNew = () => {
    setDraft({
      id: null,
      values: {
        baseCurrencyCode: "INR",
        companyCode: "COMP-NEW",
        companyName: "New company",
        defaultCalendarCode: "IND-MFG-2026",
        defaultLanguageId: null,
        legalName: "New company legal name",
        status: "Draft",
        taxRegistrationNo: null,
        timeZoneId: "Asia/Kolkata"
      }
    });
    setMessage(null);
  };
  const save = async () => {
    if (!draft || validation.length > 0 || !canSave) {
      return;
    }

    try {
      const saved = draft.id
        ? await apiClient.organization.updateCompany(draft.id, draft.values)
        : await apiClient.organization.createCompany(draft.values);
      await query.refetch();
      setDraft(companyDraftFromDto(saved));
      setMessageTone("success");
      setMessage(`Saved ${saved.companyCode}.`);
    } catch (error) {
      setMessageTone("danger");
      setMessage(error instanceof Error ? error.message : "Company could not be saved.");
    }
  };

  return (
    <>
      <ListPageShell
        actions={
          <>
            <SourceBadge source={source} />
            <ErpActionBar
              primary={[
                {
                  disabled: !canSave,
                  label: "New company draft",
                  onClick: openNew,
                  reason: !canSave ? saveAccessReason : undefined
                }
              ]}
              secondary={[
                {
                  disabled: true,
                  label: "Export companies",
                  reason: "Company export requires the approved reporting workflow."
                }
              ]}
              testId="company-master-action-bar"
            />
          </>
        }
        aside={
          <SetupAside
            description="Company setup preserves the existing scoping backbone and verifies legal, currency, calendar, and localization readiness."
            endpoint="/api/companies"
            source={source}
          />
        }
        description="Legal entities, tax basics, base currency, timezone, and calendar setup for deployment-safe organization scoping."
        filters={
          <ErpFilterBar
            ariaLabel="Company master filters"
            onClear={() => {
              setSearch("");
              setStatus("all");
            }}
            testId="company-master-filter-bar"
          >
            <input
              aria-label="Search companies"
              onChange={(event) => startTransition(() => setSearch(event.target.value))}
              placeholder="Search company, legal name, tax no"
              value={search}
            />
            <select aria-label="Company status" onChange={(event) => setStatus(event.target.value)} value={status}>
              <option value="all">Status: Any</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
            </select>
          </ErpFilterBar>
        }
        title="Company Master"
      >
        <KpiStrip
          items={[
            { label: "Companies", value: String(records.length) },
            { label: "Active", value: String(records.filter((record) => record.status === "Active").length) },
            { label: "Currencies", value: String(new Set(records.map((record) => record.baseCurrencyCode)).size) },
            { label: "Calendars", value: String(new Set(records.map((record) => record.calendarCode)).size) }
          ]}
        />
        <Card title="Company registry" description="Legal-entity setup remains the top-level scope anchor for every later branch and warehouse screen.">
          <ErpGrid
            ariaLabel="Company master registry"
            columns={companyColumns}
            emptyState={{
              title: "No companies match the current filters",
              description: "Adjust search or status to restore the legal-entity registry."
            }}
            getRowId={(record) => record.id}
            isLoading={query.isLoading}
            onRowSelect={(record) => {
              setDraft(companyDraftFromItem(record));
              setMessage(null);
            }}
            records={records}
            rowLabel={(record) => `${record.code} company master`}
            testId="company-master-grid"
            virtualization={{ enabled: true }}
          />
        </Card>
        {query.isError ? liveErrorState("Company registry", query.error) : null}
      </ListPageShell>

      <ErpModalWorkspace
        description="Company details stay in-context so setup review does not leave administration."
        footer={<ErpActionBar primary={[{ disabled: !canSave || validation.length > 0, label: "Save company draft", onClick: save, reason: setupSaveReason(canSave, validation) }]} secondary={[{ disabled: true, label: "Inactivate / activate", reason: "Company lifecycle changes require dependency checks." }, { disabled: true, label: "Review audit", reason: "Company audit review requires audit workflow enablement." }]} utility={[{ label: "Close", onClick: () => setDraft(null), variant: "quiet" }]} />}
        isOpen={Boolean(draft)}
        onClose={() => setDraft(null)}
        statusMeta={<SetupMessage message={message} tone={messageTone} />}
        title={draft?.values.companyName ?? "Company detail"}
        validation={<ErpValidationSummary errors={validation} title="Company checks" />}
      >
        {draft ? (
          <FormShell initialFingerprint={`${draft.id ?? "new"}:${draft.values.companyCode}`} title="Company setup">
            <label>
              <span>Company code</span>
              <input onChange={(event) => updateDraft({ companyCode: event.target.value })} value={draft.values.companyCode} />
            </label>
            <label>
              <span>Company name</span>
              <input onChange={(event) => updateDraft({ companyName: event.target.value })} value={draft.values.companyName} />
            </label>
            <label>
              <span>Legal name</span>
              <input onChange={(event) => updateDraft({ legalName: event.target.value })} value={draft.values.legalName} />
            </label>
            <label>
              <span>Tax registration</span>
              <input onChange={(event) => updateDraft({ taxRegistrationNo: nullableText(event.target.value) })} value={draft.values.taxRegistrationNo ?? ""} />
            </label>
            <ErpLookupField label="Timezone" onChange={(value) => updateDraft({ timeZoneId: value })} options={timeZoneOptions} required value={draft.values.timeZoneId} />
            <ErpLookupField label="Base currency" onChange={(value) => updateDraft({ baseCurrencyCode: value })} options={currencyOptions} required value={draft.values.baseCurrencyCode ?? ""} />
            <ErpLookupField label="Calendar profile" onChange={(value) => updateDraft({ defaultCalendarCode: value })} options={calendarProfileOptions} required value={draft.values.defaultCalendarCode ?? ""} />
            <ErpLookupField label="Status" onChange={(value) => updateDraft({ status: value })} options={setupStatusOptions} value={draft.values.status} />
          </FormShell>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

export function BranchMasterPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [draft, setDraft] = useState<BranchDraft | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<MessageTone>("info");
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(
    () => buildOrganizationFilter(user?.activeContext.companyId, undefined, deferredSearch, status),
    [deferredSearch, status, user?.activeContext.companyId]
  );
  const query = useApiQuery(
    queryKeys.organization.branches(user?.activeContext.companyId, deferredSearch, status),
    () => listBranchSetup(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const source = liveSource(session, records);
  const canSave = hasLiveSession(session);
  const companyId = user?.activeContext.companyId ?? 1;
  const validation = draft
    ? [
        !draft.values.branchCode.trim() ? "Branch code is required." : "",
        !draft.values.branchName.trim() ? "Branch name is required." : "",
        !draft.values.branchType ? "Branch type is required." : "",
        !draft.values.timeZoneId ? "Timezone is required." : "",
        !draft.values.defaultCalendarCode ? "Calendar profile is required." : ""
      ].filter(Boolean)
    : [];
  const updateDraft = (patch: Partial<BranchUpsertRequest>) =>
    setDraft((current) => (current ? { ...current, values: { ...current.values, ...patch } } : current));
  const openNew = () => {
    setDraft({
      id: null,
      values: {
        branchCode: "BR-NEW",
        branchName: "New branch",
        branchType: "Manufacturing",
        companyId,
        contactEmail: null,
        defaultCalendarCode: "IND-MFG-2026",
        defaultLanguageId: null,
        defaultShiftId: null,
        defaultWarehouseId: null,
        status: "Draft",
        timeZoneId: "Asia/Kolkata"
      }
    });
    setMessage(null);
  };
  const save = async () => {
    if (!draft || validation.length > 0 || !canSave) {
      return;
    }

    try {
      const saved = draft.id
        ? await apiClient.organization.updateBranch(draft.id, draft.values)
        : await apiClient.organization.createBranch(draft.values);
      await query.refetch();
      setDraft(branchDraftFromDto(saved));
      setMessageTone("success");
      setMessage(`Saved ${saved.branchCode}.`);
    } catch (error) {
      setMessageTone("danger");
      setMessage(error instanceof Error ? error.message : "Branch could not be saved.");
    }
  };

  return (
    <>
      <ListPageShell
        actions={
          <>
            <SourceBadge source={source} />
            <ErpActionBar primary={[{ disabled: !canSave, label: "New branch draft", onClick: openNew, reason: !canSave ? saveAccessReason : undefined }]} secondary={[{ disabled: true, label: "Export branches", reason: "Branch export requires the approved reporting workflow." }]} testId="branch-master-action-bar" />
          </>
        }
        aside={
          <SetupAside
            description="Branch setup keeps plants, warehouses, timezones, shifts, and contact defaults visible for operations."
            endpoint="/api/branches"
            source={source}
          />
        }
        description="Plant, site, timezone, default warehouse, contact, and shift context for branch-scoped operations."
        filters={
          <FilterBar>
            <input
              aria-label="Search branches"
              onChange={(event) => startTransition(() => setSearch(event.target.value))}
              placeholder="Search branch, plant, warehouse"
              value={search}
            />
            <select aria-label="Branch status" onChange={(event) => setStatus(event.target.value)} value={status}>
              <option value="all">Status: Any</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
            </select>
          </FilterBar>
        }
        title="Branch Master"
      >
        <KpiStrip
          items={[
            { label: "Branches", value: String(records.length) },
            { label: "Manufacturing", value: String(records.filter((record) => record.branchType === "Manufacturing").length) },
            { label: "Warehouses", value: String(records.filter((record) => record.branchType === "Warehouse").length) },
            { label: "Timezone", value: records[0]?.timeZoneId ?? "Pending" }
          ]}
        />
        <Card title="Branch registry" description="Branch setup makes plant context explicit before warehouse, shift, and execution screens consume it.">
          <DataGrid
            ariaLabel="Branch master registry"
            columns={branchColumns}
            emptyState={{
              title: "No branches match the current filters",
              description: "Adjust search or status to restore the branch registry."
            }}
            getRowId={(record) => record.id}
            isLoading={query.isLoading}
            onRowSelect={(record) => {
              setDraft(branchDraftFromItem(record));
              setMessage(null);
            }}
            records={records}
            rowLabel={(record) => `${record.code} branch master`}
            virtualization={{ enabled: true }}
          />
        </Card>
        {query.isError ? liveErrorState("Branch registry", query.error) : null}
      </ListPageShell>

      <ErpModalWorkspace
        description="Branch detail links timezone, default warehouse, shift, and admin contact context."
        footer={<ErpActionBar primary={[{ disabled: !canSave || validation.length > 0, label: "Save branch draft", onClick: save, reason: setupSaveReason(canSave, validation) }]} secondary={[{ disabled: true, label: "Inactivate / activate", reason: "Branch lifecycle changes require dependency checks." }, { disabled: true, label: "Review context users", reason: "Context-user review requires organization approval workflow." }]} utility={[{ label: "Close", onClick: () => setDraft(null), variant: "quiet" }]} />}
        isOpen={Boolean(draft)}
        onClose={() => setDraft(null)}
        statusMeta={<SetupMessage message={message} tone={messageTone} />}
        title={draft?.values.branchName ?? "Branch detail"}
        validation={<ErpValidationSummary errors={validation} title="Branch checks" />}
      >
        {draft ? (
          <>
            <KpiStrip
              items={[
                { label: "Type", value: draft.values.branchType },
                { label: "Shift", value: draft.values.defaultShiftId ? String(draft.values.defaultShiftId) : "Not assigned" },
                { label: "Warehouse", value: draft.values.defaultWarehouseId ? String(draft.values.defaultWarehouseId) : "Not assigned" },
                { label: "Status", value: draft.values.status }
              ]}
            />
            <FormShell initialFingerprint={`${draft.id ?? "new"}:${draft.values.branchCode}`} title="Branch setup">
              <label>
                <span>Branch code</span>
                <input onChange={(event) => updateDraft({ branchCode: event.target.value })} value={draft.values.branchCode} />
              </label>
              <label>
                <span>Branch name</span>
                <input onChange={(event) => updateDraft({ branchName: event.target.value })} value={draft.values.branchName} />
              </label>
              <ErpLookupField label="Branch type" onChange={(value) => updateDraft({ branchType: value })} options={branchTypeOptions} required value={draft.values.branchType} />
              <ErpLookupField label="Timezone" onChange={(value) => updateDraft({ timeZoneId: value })} options={timeZoneOptions} required value={draft.values.timeZoneId} />
              <ErpLookupField label="Calendar profile" onChange={(value) => updateDraft({ defaultCalendarCode: value })} options={calendarProfileOptions} required value={draft.values.defaultCalendarCode ?? ""} />
              <ErpLookupField disabled disabledReason="Default warehouse is selected after warehouses are approved for this branch." label="Default warehouse" onChange={() => undefined} options={draft.values.defaultWarehouseId ? [{ label: String(draft.values.defaultWarehouseId), value: String(draft.values.defaultWarehouseId) }] : []} value={draft.values.defaultWarehouseId ? String(draft.values.defaultWarehouseId) : ""} />
              <label>
                <span>Contact email</span>
                <input onChange={(event) => updateDraft({ contactEmail: nullableText(event.target.value) })} type="email" value={draft.values.contactEmail ?? ""} />
              </label>
              <ErpLookupField label="Status" onChange={(value) => updateDraft({ status: value })} options={setupStatusOptions} value={draft.values.status} />
            </FormShell>
          </>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

export function DepartmentMasterPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [draft, setDraft] = useState<DepartmentDraft | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<MessageTone>("info");
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(
    () => buildOrganizationFilter(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    [deferredSearch, status, user?.activeContext.branchId, user?.activeContext.companyId]
  );
  const query = useApiQuery(
    queryKeys.organization.departments(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listDepartmentSetup(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const source = liveSource(session, records);
  const canSave = hasLiveSession(session);
  const companyId = user?.activeContext.companyId ?? 1;
  const branchId = user?.activeContext.branchId ?? null;
  const validation = draft
    ? [
        !draft.values.departmentCode.trim() ? "Department code is required." : "",
        !draft.values.departmentName.trim() ? "Department name is required." : "",
        !draft.values.departmentType ? "Department type is required." : ""
      ].filter(Boolean)
    : [];
  const updateDraft = (patch: Partial<DepartmentUpsertRequest>) =>
    setDraft((current) => (current ? { ...current, values: { ...current.values, ...patch } } : current));
  const openNew = () => {
    setDraft({
      id: null,
      values: {
        branchId,
        companyId,
        departmentCode: "DEPT-NEW",
        departmentName: "New department",
        departmentType: "Production",
        managerUserId: null,
        parentDepartmentId: null,
        status: "Draft"
      }
    });
    setMessage(null);
  };
  const save = async () => {
    if (!draft || validation.length > 0 || !canSave) {
      return;
    }

    try {
      const saved = draft.id
        ? await apiClient.organization.updateDepartment(draft.id, draft.values)
        : await apiClient.organization.createDepartment(draft.values);
      await query.refetch();
      setDraft(departmentDraftFromDto(saved));
      setMessageTone("success");
      setMessage(`Saved ${saved.departmentCode}.`);
    } catch (error) {
      setMessageTone("danger");
      setMessage(error instanceof Error ? error.message : "Department could not be saved.");
    }
  };

  return (
    <>
      <ListPageShell
        actions={
          <>
            <SourceBadge source={source} />
            <ErpActionBar primary={[{ disabled: !canSave, label: "New department draft", onClick: openNew, reason: !canSave ? saveAccessReason : undefined }]} secondary={[{ disabled: true, label: "Export departments", reason: "Department export requires the approved reporting workflow." }]} testId="department-master-action-bar" />
          </>
        }
        aside={
          <SetupAside
            description="Department setup keeps planning, production, quality, stores, and dispatch ownership explicit for scope and workflow rules."
            endpoint="/api/departments"
            source={source}
          />
        }
        description="Sales, planning, production, QC, stores, dispatch, and admin departments for workflow ownership and data scope."
        filters={
          <FilterBar>
            <input
              aria-label="Search departments"
              onChange={(event) => startTransition(() => setSearch(event.target.value))}
              placeholder="Search department, manager, type"
              value={search}
            />
            <select aria-label="Department status" onChange={(event) => setStatus(event.target.value)} value={status}>
              <option value="all">Status: Any</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
            </select>
          </FilterBar>
        }
        title="Department Master"
      >
        <KpiStrip
          items={[
            { label: "Departments", value: String(records.length) },
            { label: "Production-facing", value: String(records.filter((record) => ["Production", "Quality", "Stores"].includes(record.departmentType)).length) },
            { label: "Managers assigned", value: String(records.filter((record) => record.manager !== "Unassigned").length) },
            { label: "Status", value: records.every((record) => record.status === "Active") ? "Ready" : "Review" }
          ]}
        />
        <Card title="Department registry" description="Department ownership connects setup, workflows, notifications, and branch-scoped administration.">
          <DataGrid
            ariaLabel="Department master registry"
            columns={departmentColumns}
            emptyState={{
              title: "No departments match the current filters",
              description: "Adjust search or status to restore the department registry."
            }}
            getRowId={(record) => record.id}
            isLoading={query.isLoading}
            onRowSelect={(record) => {
              setDraft(departmentDraftFromItem(record));
              setMessage(null);
            }}
            records={records}
            rowLabel={(record) => `${record.code} department master`}
            virtualization={{ enabled: true }}
          />
        </Card>
        {query.isError ? liveErrorState("Department registry", query.error) : null}
      </ListPageShell>

      <ErpModalWorkspace
        description="Department detail keeps ownership and scope context available for admin review."
        footer={<ErpActionBar primary={[{ disabled: !canSave || validation.length > 0, label: "Save department draft", onClick: save, reason: setupSaveReason(canSave, validation) }]} secondary={[{ disabled: true, label: "Inactivate / activate", reason: "Department lifecycle changes require dependency checks." }, { disabled: true, label: "Review workflow usage", reason: "Workflow usage review requires organization approval workflow." }]} utility={[{ label: "Close", onClick: () => setDraft(null), variant: "quiet" }]} />}
        isOpen={Boolean(draft)}
        onClose={() => setDraft(null)}
        statusMeta={<SetupMessage message={message} tone={messageTone} />}
        title={draft?.values.departmentName ?? "Department detail"}
        validation={<ErpValidationSummary errors={validation} title="Department checks" />}
      >
        {draft ? (
          <>
            <div className="utility-grid">
              <Tile eyebrow={draft.values.parentDepartmentId ? `Parent ${draft.values.parentDepartmentId}` : "Root"} label="Manager" meta={draft.values.status}>
                {draft.values.managerUserId ? `User ${draft.values.managerUserId}` : "Unassigned"}
              </Tile>
              <Tile eyebrow="Department type" label={draft.values.departmentType} meta={`Branch ${draft.values.branchId ?? "All"}`}>
                {draft.values.departmentCode}
              </Tile>
            </div>
            <FormShell initialFingerprint={`${draft.id ?? "new"}:${draft.values.departmentCode}`} title="Department setup">
              <label>
                <span>Department code</span>
                <input onChange={(event) => updateDraft({ departmentCode: event.target.value })} value={draft.values.departmentCode} />
              </label>
              <label>
                <span>Department name</span>
                <input onChange={(event) => updateDraft({ departmentName: event.target.value })} value={draft.values.departmentName} />
              </label>
              <ErpLookupField label="Department type" onChange={(value) => updateDraft({ departmentType: value })} options={departmentTypeOptions} required value={draft.values.departmentType} />
              <ErpLookupField disabled disabledReason="Parent department is assigned after department hierarchy approval." label="Parent department" onChange={() => undefined} options={draft.values.parentDepartmentId ? [{ label: String(draft.values.parentDepartmentId), value: String(draft.values.parentDepartmentId) }] : []} value={draft.values.parentDepartmentId ? String(draft.values.parentDepartmentId) : ""} />
              <ErpLookupField disabled disabledReason="Manager assignment is controlled by user and role setup." label="Manager" onChange={() => undefined} options={draft.values.managerUserId ? [{ label: String(draft.values.managerUserId), value: String(draft.values.managerUserId) }] : []} value={draft.values.managerUserId ? String(draft.values.managerUserId) : ""} />
              <ErpLookupField label="Status" onChange={(value) => updateDraft({ status: value })} options={setupStatusOptions} value={draft.values.status} />
            </FormShell>
          </>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

export function WarehouseMasterPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [draft, setDraft] = useState<WarehouseDraft | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<MessageTone>("info");
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(
    () => buildOrganizationFilter(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    [deferredSearch, status, user?.activeContext.branchId, user?.activeContext.companyId]
  );
  const query = useApiQuery(
    queryKeys.organization.warehouses(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listWarehouseSetup(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const source = liveSource(session, records);
  const canSave = hasLiveSession(session);
  const companyId = user?.activeContext.companyId ?? 1;
  const branchId = user?.activeContext.branchId ?? 10;
  const validation = draft
    ? [
        !draft.values.warehouseCode.trim() ? "Warehouse code is required." : "",
        !draft.values.warehouseName.trim() ? "Warehouse name is required." : "",
        !draft.values.warehouseType ? "Warehouse type is required." : ""
      ].filter(Boolean)
    : [];
  const updateDraft = (patch: Partial<WarehouseUpsertRequest>) =>
    setDraft((current) => (current ? { ...current, values: { ...current.values, ...patch } } : current));
  const openNew = () => {
    setDraft({
      id: null,
      values: {
        allowsMixedLots: true,
        allowsNegativeStock: false,
        branchId,
        companyId,
        isDefaultIssueWarehouse: false,
        isDefaultReceivingWarehouse: false,
        isDispatchEnabled: false,
        status: "Draft",
        warehouseCode: "WH-NEW",
        warehouseName: "New warehouse",
        warehouseType: "Raw Material"
      }
    });
    setMessage(null);
  };
  const save = async () => {
    if (!draft || validation.length > 0 || !canSave) {
      return;
    }

    try {
      const saved = draft.id
        ? await apiClient.organization.updateWarehouse(draft.id, draft.values)
        : await apiClient.organization.createWarehouse(draft.values);
      await query.refetch();
      setDraft(warehouseDraftFromDto(saved));
      setMessageTone("success");
      setMessage(`Saved ${saved.warehouseCode}.`);
    } catch (error) {
      setMessageTone("danger");
      setMessage(error instanceof Error ? error.message : "Warehouse could not be saved.");
    }
  };

  return (
    <>
      <ListPageShell
        actions={
          <>
            <SourceBadge source={source} />
            <ErpActionBar primary={[{ disabled: !canSave, label: "New warehouse draft", onClick: openNew, reason: !canSave ? saveAccessReason : undefined }]} secondary={[{ disabled: true, label: "Export warehouses", reason: "Warehouse export requires the approved reporting workflow." }]} testId="warehouse-master-action-bar" />
          </>
        }
        aside={
          <SetupAside
            description="Warehouse setup preserves branch mapping and WIP/RM/FG semantics without changing inventory posting behavior."
            endpoint="/api/warehouses"
            source={source}
          />
        }
        description="Warehouse type, branch mapping, receiving/issue defaults, dispatch enablement, and stock discipline."
        filters={
          <FilterBar>
            <input
              aria-label="Search warehouses"
              onChange={(event) => startTransition(() => setSearch(event.target.value))}
              placeholder="Search warehouse, type, branch"
              value={search}
            />
            <select aria-label="Warehouse status" onChange={(event) => setStatus(event.target.value)} value={status}>
              <option value="all">Status: Any</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
            </select>
          </FilterBar>
        }
        title="Warehouse Master"
      >
        <KpiStrip
          items={[
            { label: "Warehouses", value: String(records.length) },
            { label: "Dispatch enabled", value: String(records.filter((record) => record.dispatchEnabled).length) },
            { label: "Default issue", value: String(records.filter((record) => record.defaultIssue).length) },
            { label: "Mixed-lot stores", value: String(records.filter((record) => record.allowsMixedLots).length) }
          ]}
        />
        <Card title="Warehouse registry" description="Branch-scoped stores for RM, WIP, FG, dispatch, and inventory control.">
          <DataGrid
            ariaLabel="Warehouse master registry"
            columns={warehouseColumns}
            emptyState={{
              title: "No warehouses match the current filters",
              description: "Adjust search or status to restore warehouse setup."
            }}
            getRowId={(record) => record.id}
            isLoading={query.isLoading}
            onRowSelect={(record) => {
              setDraft(warehouseDraftFromItem(record));
              setMessage(null);
            }}
            records={records}
            rowLabel={(record) => `${record.code} warehouse master`}
            virtualization={{ enabled: true }}
          />
        </Card>
        {query.isError ? liveErrorState("Warehouse registry", query.error) : null}
      </ListPageShell>

      <ErpModalWorkspace
        description="Warehouse detail keeps default receiving, issue, dispatch, and stock behavior visible."
        footer={<ErpActionBar primary={[{ disabled: !canSave || validation.length > 0, label: "Save warehouse draft", onClick: save, reason: setupSaveReason(canSave, validation) }]} secondary={[{ disabled: true, label: "Inactivate / activate", reason: "Warehouse lifecycle changes require dependency checks." }, { disabled: true, label: "Review bins", reason: "Bin review requires warehouse setup workflow enablement." }]} utility={[{ label: "Close", onClick: () => setDraft(null), variant: "quiet" }]} />}
        isOpen={Boolean(draft)}
        onClose={() => setDraft(null)}
        statusMeta={<SetupMessage message={message} tone={messageTone} />}
        title={draft?.values.warehouseName ?? "Warehouse detail"}
        validation={<ErpValidationSummary errors={validation} title="Warehouse checks" />}
      >
        {draft ? (
          <>
            <KpiStrip
              items={[
                { label: "Type", value: draft.values.warehouseType },
                { label: "Dispatch", value: draft.values.isDispatchEnabled ? "Enabled" : "No" },
                { label: "Mixed lots", value: draft.values.allowsMixedLots ? "Allowed" : "Blocked" },
                { label: "Negative stock", value: draft.values.allowsNegativeStock ? "Allowed" : "Blocked" }
              ]}
            />
            <FormShell initialFingerprint={`${draft.id ?? "new"}:${draft.values.warehouseCode}`} title="Warehouse setup">
              <label>
                <span>Warehouse code</span>
                <input onChange={(event) => updateDraft({ warehouseCode: event.target.value })} value={draft.values.warehouseCode} />
              </label>
              <label>
                <span>Warehouse name</span>
                <input onChange={(event) => updateDraft({ warehouseName: event.target.value })} value={draft.values.warehouseName} />
              </label>
              <ErpLookupField label="Warehouse type" onChange={(value) => updateDraft({ warehouseType: value })} options={warehouseTypeOptions} required value={draft.values.warehouseType} />
              <ErpLookupField disabled disabledReason="Branch is controlled by the active operating context." label="Branch" onChange={() => undefined} options={[{ label: String(draft.values.branchId), value: String(draft.values.branchId) }]} value={String(draft.values.branchId)} />
              <label className="form-checkbox"><input checked={draft.values.isDefaultReceivingWarehouse} onChange={(event) => updateDraft({ isDefaultReceivingWarehouse: event.target.checked })} type="checkbox" /><span>Default receiving warehouse</span></label>
              <label className="form-checkbox"><input checked={draft.values.isDefaultIssueWarehouse} onChange={(event) => updateDraft({ isDefaultIssueWarehouse: event.target.checked })} type="checkbox" /><span>Default issue warehouse</span></label>
              <label className="form-checkbox"><input checked={draft.values.isDispatchEnabled} onChange={(event) => updateDraft({ isDispatchEnabled: event.target.checked })} type="checkbox" /><span>Dispatch enabled</span></label>
              <label className="form-checkbox"><input checked={draft.values.allowsMixedLots} onChange={(event) => updateDraft({ allowsMixedLots: event.target.checked })} type="checkbox" /><span>Allow mixed lots</span></label>
              <label className="form-checkbox"><input checked={draft.values.allowsNegativeStock} onChange={(event) => updateDraft({ allowsNegativeStock: event.target.checked })} type="checkbox" /><span>Allow negative stock</span></label>
              <ErpLookupField label="Status" onChange={(value) => updateDraft({ status: value })} options={setupStatusOptions} value={draft.values.status} />
            </FormShell>
          </>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

export function BinMasterPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [draft, setDraft] = useState<BinDraft | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<MessageTone>("info");
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(
    () => buildOrganizationFilter(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    [deferredSearch, status, user?.activeContext.branchId, user?.activeContext.companyId]
  );
  const query = useApiQuery(
    queryKeys.organization.bins(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listBinSetup(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const source = liveSource(session, records);
  const canSave = hasLiveSession(session);
  const companyId = user?.activeContext.companyId ?? 1;
  const branchId = user?.activeContext.branchId ?? 10;
  const warehouseOptions = Array.from(new Map(records.map((record) => [record.warehouseId, record.warehouseId])).keys()).map((id) => ({
    label: `Warehouse ${id}`,
    value: String(id)
  }));
  const validation = draft
    ? [
        !draft.values.binCode.trim() ? "Bin code is required." : "",
        !draft.values.binName.trim() ? "Bin name is required." : "",
        !draft.values.warehouseId ? "Warehouse is required." : "",
        draft.values.capacityValue !== null && draft.values.capacityValue < 0 ? "Capacity cannot be negative." : "",
        draft.values.isCountCycleRequired && (!draft.values.countCycleDays || draft.values.countCycleDays < 1) ? "Cycle-count days must be at least 1." : "",
        draft.values.isBlocked && !draft.values.blockReasonCode ? "Blocked bins require a block reason." : ""
      ].filter(Boolean)
    : [];
  const updateDraft = (patch: Partial<BinUpsertRequest>) =>
    setDraft((current) => (current ? { ...current, values: { ...current.values, ...patch } } : current));
  const openNew = () => {
    const warehouseId = Number(warehouseOptions[0]?.value ?? 0);
    if (!warehouseId) {
      setMessageTone("warn");
      setMessage("Create or load a warehouse before creating a bin.");
      return;
    }

    setDraft({
      id: null,
      values: {
        binCode: "BIN-NEW",
        binName: "New bin",
        binType: "Rack",
        blockReasonCode: null,
        branchId,
        capacityUomId: null,
        capacityValue: null,
        companyId,
        countCycleDays: null,
        isBlocked: false,
        isCountCycleRequired: false,
        isDefaultIssueBin: false,
        isDefaultReceiveBin: false,
        parentBinId: null,
        status: "Draft",
        warehouseId
      }
    });
    setMessage(null);
  };
  const save = async () => {
    if (!draft || validation.length > 0 || !canSave) {
      return;
    }

    try {
      const saved = draft.id
        ? await apiClient.organization.updateBin(draft.id, draft.values)
        : await apiClient.organization.createBin(draft.values);
      await query.refetch();
      setDraft(binDraftFromDto(saved));
      setMessageTone("success");
      setMessage(`Saved ${saved.binCode}.`);
    } catch (error) {
      setMessageTone("danger");
      setMessage(error instanceof Error ? error.message : "Bin could not be saved.");
    }
  };

  return (
    <>
      <ListPageShell
        actions={
          <>
            <SourceBadge source={source} />
            <ErpActionBar primary={[{ disabled: !canSave || warehouseOptions.length === 0, label: "New bin draft", onClick: openNew, reason: !canSave ? saveAccessReason : warehouseOptions.length === 0 ? "Load a warehouse before creating bins." : undefined }]} secondary={[{ disabled: true, label: "Export bins", reason: "Bin export requires the approved reporting workflow." }]} testId="bin-master-action-bar" />
          </>
        }
        aside={
          <SetupAside
            description="Bin setup keeps row/rack/bin capacity, quarantine, and cycle-count rules visible without inventing stock movements."
            endpoint="/api/bins"
            source={source}
          />
        }
        description="Row, rack, staging, quarantine, capacity, default receive/issue, and cycle-count setup."
        filters={
          <FilterBar>
            <input
              aria-label="Search bins"
              onChange={(event) => startTransition(() => setSearch(event.target.value))}
              placeholder="Search bin, warehouse, type, block reason"
              value={search}
            />
            <select aria-label="Bin status" onChange={(event) => setStatus(event.target.value)} value={status}>
              <option value="all">Status: Any</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
            </select>
          </FilterBar>
        }
        title="Bin Master"
      >
        <KpiStrip
          items={[
            { label: "Bins", value: String(records.length) },
            { label: "Blocked", value: String(records.filter((record) => record.isBlocked).length) },
            { label: "Cycle count", value: String(records.filter((record) => record.cycleCountLabel !== "Not required").length) },
            { label: "Default issue", value: String(records.filter((record) => record.defaultIssue).length) }
          ]}
        />
        <Card title="Bin registry" description="Warehouse locations and quarantine controls for inventory operations.">
          <DataGrid
            ariaLabel="Bin master registry"
            columns={binColumns}
            emptyState={{
              title: "No bins match the current filters",
              description: "Adjust search or status to restore bin setup."
            }}
            getRowId={(record) => record.id}
            isLoading={query.isLoading}
            onRowSelect={(record) => {
              setDraft(binDraftFromItem(record));
              setMessage(null);
            }}
            records={records}
            rowLabel={(record) => `${record.code} bin master`}
            virtualization={{ enabled: true }}
          />
        </Card>
        {query.isError ? liveErrorState("Bin registry", query.error) : null}
      </ListPageShell>

      <ErpModalWorkspace
        description="Bin detail keeps capacity and stock-status controls auditable for warehouse admins."
        footer={<ErpActionBar primary={[{ disabled: !canSave || validation.length > 0, label: "Save bin draft", onClick: save, reason: setupSaveReason(canSave, validation) }]} secondary={[{ disabled: true, label: "Inactivate / activate", reason: "Bin lifecycle changes require stock dependency checks." }, { disabled: true, label: "Review stock usage", reason: "Stock usage review requires warehouse setup workflow enablement." }]} utility={[{ label: "Close", onClick: () => setDraft(null), variant: "quiet" }]} />}
        isOpen={Boolean(draft)}
        onClose={() => setDraft(null)}
        statusMeta={<SetupMessage message={message} tone={messageTone} />}
        title={draft?.values.binName ?? "Bin detail"}
        validation={<ErpValidationSummary errors={validation} title="Bin checks" />}
      >
        {draft ? (
          <>
            <div className="utility-grid">
              <Tile eyebrow={draft.values.binType} label="Capacity" meta={draft.values.status}>
                {draft.values.capacityValue === null ? "Not capped" : String(draft.values.capacityValue)}
              </Tile>
              <Tile eyebrow="Cycle count" label={draft.values.isCountCycleRequired ? `Every ${draft.values.countCycleDays ?? "?"} days` : "Not required"} meta={draft.values.isBlocked ? draft.values.blockReasonCode ?? "Blocked" : "Available"}>
                {draft.values.binCode}
              </Tile>
            </div>
            <FormShell initialFingerprint={`${draft.id ?? "new"}:${draft.values.binCode}`} title="Bin setup">
              <ErpLookupField label="Warehouse" onChange={(value) => updateDraft({ warehouseId: Number(value) })} options={warehouseOptions} required value={String(draft.values.warehouseId || "")} />
              <label>
                <span>Bin code</span>
                <input onChange={(event) => updateDraft({ binCode: event.target.value })} value={draft.values.binCode} />
              </label>
              <label>
                <span>Bin name</span>
                <input onChange={(event) => updateDraft({ binName: event.target.value })} value={draft.values.binName} />
              </label>
              <ErpLookupField label="Bin type" onChange={(value) => updateDraft({ binType: value })} options={binTypeOptions} value={draft.values.binType} />
              <ErpDecimalField label="Capacity" min={0} onChange={(value) => updateDraft({ capacityValue: value })} scale={3} value={draft.values.capacityValue} />
              <ErpLookupField disabled disabledReason="Capacity UOM selection requires measurement setup linkage." label="Capacity UOM" onChange={() => undefined} options={draft.values.capacityUomId ? [{ label: String(draft.values.capacityUomId), value: String(draft.values.capacityUomId) }] : []} value={draft.values.capacityUomId ? String(draft.values.capacityUomId) : ""} />
              <label className="form-checkbox"><input checked={draft.values.isDefaultReceiveBin} onChange={(event) => updateDraft({ isDefaultReceiveBin: event.target.checked })} type="checkbox" /><span>Default receive bin</span></label>
              <label className="form-checkbox"><input checked={draft.values.isDefaultIssueBin} onChange={(event) => updateDraft({ isDefaultIssueBin: event.target.checked })} type="checkbox" /><span>Default issue bin</span></label>
              <label className="form-checkbox"><input checked={draft.values.isCountCycleRequired} onChange={(event) => updateDraft({ isCountCycleRequired: event.target.checked, countCycleDays: event.target.checked ? draft.values.countCycleDays ?? 30 : null })} type="checkbox" /><span>Cycle count required</span></label>
              <ErpNumberField disabled={!draft.values.isCountCycleRequired} disabledReason="Enable cycle count before setting the interval." label="Cycle-count days" min={1} onChange={(value) => updateDraft({ countCycleDays: value })} value={draft.values.countCycleDays} />
              <label className="form-checkbox"><input checked={draft.values.isBlocked} onChange={(event) => updateDraft({ isBlocked: event.target.checked, blockReasonCode: event.target.checked ? draft.values.blockReasonCode ?? "QC_HOLD" : null })} type="checkbox" /><span>Blocked / quarantine</span></label>
              <ErpLookupField disabled={!draft.values.isBlocked} disabledReason="Enable blocked state before selecting a reason." label="Block reason" onChange={(value) => updateDraft({ blockReasonCode: value === "None" ? null : value })} options={blockReasonOptions} value={draft.values.blockReasonCode ?? "None"} />
              <ErpLookupField label="Status" onChange={(value) => updateDraft({ status: value })} options={setupStatusOptions} value={draft.values.status} />
            </FormShell>
          </>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

export function ShiftCalendarPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [draft, setDraft] = useState<ShiftDraft | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [messageTone, setMessageTone] = useState<MessageTone>("info");
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(
    () => buildOrganizationFilter(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    [deferredSearch, status, user?.activeContext.branchId, user?.activeContext.companyId]
  );
  const query = useApiQuery(
    queryKeys.organization.shifts(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listShiftSetup(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const source = liveSource(session, records);
  const canSave = hasLiveSession(session);
  const companyId = user?.activeContext.companyId ?? 1;
  const branchId = user?.activeContext.branchId ?? null;
  const validation = draft
    ? [
        !draft.values.shiftCode.trim() ? "Shift code is required." : "",
        !draft.values.shiftName.trim() ? "Shift name is required." : "",
        !draft.values.startTime ? "Start time is required." : "",
        !draft.values.endTime ? "End time is required." : "",
        draft.values.breakMinutes < 0 ? "Break minutes cannot be negative." : "",
        draft.values.sequenceNo < 1 ? "Sequence must be at least 1." : "",
        !draft.values.calendarProfileCode ? "Calendar profile is required." : ""
      ].filter(Boolean)
    : [];
  const updateDraft = (patch: Partial<ShiftUpsertRequest>) =>
    setDraft((current) => (current ? { ...current, values: { ...current.values, ...patch } } : current));
  const openNew = () => {
    setDraft({
      id: null,
      values: {
        branchId,
        breakMinutes: 45,
        calendarProfileCode: "IND-MFG-2026",
        companyId,
        crossesMidnight: false,
        endTime: "16:30",
        sequenceNo: 1,
        shiftCode: "SHIFT-NEW",
        shiftName: "New shift",
        startTime: "08:00",
        status: "Draft"
      }
    });
    setMessage(null);
  };
  const save = async () => {
    if (!draft || validation.length > 0 || !canSave) {
      return;
    }

    try {
      const saved = draft.id
        ? await apiClient.organization.updateShift(draft.id, draft.values)
        : await apiClient.organization.createShift(draft.values);
      await query.refetch();
      setDraft(shiftDraftFromDto(saved));
      setMessageTone("success");
      setMessage(`Saved ${saved.shiftCode}.`);
    } catch (error) {
      setMessageTone("danger");
      setMessage(error instanceof Error ? error.message : "Shift could not be saved.");
    }
  };

  return (
    <>
      <ListPageShell
        actions={
          <>
            <SourceBadge source={source} />
            <ErpActionBar primary={[{ disabled: !canSave, label: "New shift draft", onClick: openNew, reason: !canSave ? saveAccessReason : undefined }]} secondary={[{ disabled: true, label: "Export shift calendar", reason: "Shift calendar export requires the approved reporting workflow." }]} testId="shift-calendar-action-bar" />
          </>
        }
        aside={
          <SetupAside
            description="Shift setup exposes working windows, breaks, and cross-midnight rules without touching job-card execution."
            endpoint="/api/shifts"
            source={source}
          />
        }
        description="Shift patterns, holiday calendar profile, break minutes, overtime readiness, and cross-midnight controls."
        filters={
          <FilterBar>
            <input
              aria-label="Search shifts"
              onChange={(event) => startTransition(() => setSearch(event.target.value))}
              placeholder="Search shift, time, calendar profile"
              value={search}
            />
            <select aria-label="Shift status" onChange={(event) => setStatus(event.target.value)} value={status}>
              <option value="all">Status: Any</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
            </select>
          </FilterBar>
        }
        title="Shift Calendar"
      >
        <KpiStrip
          items={[
            { label: "Shifts", value: String(records.length) },
            { label: "Cross-midnight", value: String(records.filter((record) => record.crossesMidnight).length) },
            { label: "Break minutes", value: String(records.reduce((sum, record) => sum + record.breakMinutes, 0)) },
            { label: "Calendars", value: String(new Set(records.map((record) => record.calendarProfileCode)).size) }
          ]}
        />
        <Card title="Shift calendar registry" description="Working windows and break rules for production and warehouse planning.">
          <DataGrid
            ariaLabel="Shift calendar registry"
            columns={shiftColumns}
            emptyState={{
              title: "No shifts match the current filters",
              description: "Adjust search or status to restore shift setup."
            }}
            getRowId={(record) => record.id}
            isLoading={query.isLoading}
            onRowSelect={(record) => {
              setDraft(shiftDraftFromItem(record));
              setMessage(null);
            }}
            records={records}
            rowLabel={(record) => `${record.code} shift calendar`}
            virtualization={{ enabled: true }}
          />
        </Card>
        {query.isError ? liveErrorState("Shift calendar", query.error) : null}
      </ListPageShell>

      <ErpModalWorkspace
        description="Shift detail keeps working window and break rules available for setup review."
        footer={<ErpActionBar primary={[{ disabled: !canSave || validation.length > 0, label: "Save shift draft", onClick: save, reason: setupSaveReason(canSave, validation) }]} secondary={[{ disabled: true, label: "Inactivate / activate", reason: "Shift lifecycle changes require calendar dependency checks." }, { disabled: true, label: "Review machine calendar", reason: "Machine calendar review requires organization approval workflow." }]} utility={[{ label: "Close", onClick: () => setDraft(null), variant: "quiet" }]} />}
        isOpen={Boolean(draft)}
        onClose={() => setDraft(null)}
        statusMeta={<SetupMessage message={message} tone={messageTone} />}
        title={draft?.values.shiftName ?? "Shift detail"}
        validation={<ErpValidationSummary errors={validation} title="Shift checks" />}
      >
        {draft ? (
          <>
            <KpiStrip
              items={[
                { label: "Start", value: draft.values.startTime },
                { label: "End", value: draft.values.endTime },
                { label: "Break", value: `${draft.values.breakMinutes} min` },
                { label: "Sequence", value: String(draft.values.sequenceNo) }
              ]}
            />
            <FormShell initialFingerprint={`${draft.id ?? "new"}:${draft.values.shiftCode}`} title="Shift setup">
              <label>
                <span>Shift code</span>
                <input onChange={(event) => updateDraft({ shiftCode: event.target.value })} value={draft.values.shiftCode} />
              </label>
              <label>
                <span>Shift name</span>
                <input onChange={(event) => updateDraft({ shiftName: event.target.value })} value={draft.values.shiftName} />
              </label>
              <label>
                <span>Start time</span>
                <input onChange={(event) => updateDraft({ startTime: event.target.value })} type="time" value={draft.values.startTime} />
              </label>
              <label>
                <span>End time</span>
                <input onChange={(event) => updateDraft({ endTime: event.target.value })} type="time" value={draft.values.endTime} />
              </label>
              <ErpNumberField label="Break minutes" min={0} onChange={(value) => updateDraft({ breakMinutes: value ?? 0 })} value={draft.values.breakMinutes} />
              <ErpNumberField label="Sequence" min={1} onChange={(value) => updateDraft({ sequenceNo: value ?? 1 })} value={draft.values.sequenceNo} />
              <label className="form-checkbox"><input checked={draft.values.crossesMidnight} onChange={(event) => updateDraft({ crossesMidnight: event.target.checked })} type="checkbox" /><span>Crosses midnight</span></label>
              <ErpLookupField label="Calendar profile" onChange={(value) => updateDraft({ calendarProfileCode: value })} options={calendarProfileOptions} required value={draft.values.calendarProfileCode ?? ""} />
              <ErpLookupField label="Status" onChange={(value) => updateDraft({ status: value })} options={setupStatusOptions} value={draft.values.status} />
            </FormShell>
          </>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}
