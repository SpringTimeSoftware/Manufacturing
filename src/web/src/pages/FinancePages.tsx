import { startTransition, useDeferredValue, useMemo, useState } from "react";
import type {
  ArInvoiceDto,
  ArInvoiceFromShipmentRequest,
  ChartOfAccountDto,
  ChartOfAccountUpsertRequest,
  FiscalPeriodDto,
  FiscalPeriodUpsertRequest,
  InventoryValuationEntryDto,
  JournalDto,
  JournalLineUpsertRequest,
  JournalUpsertRequest,
  PostingProfileDto,
  PostingProfileUpsertRequest,
  TaxLedgerEntryDto
} from "../api/contracts";
import { apiClient } from "../api/http";
import { useApiMutation, useApiQuery } from "../api/hooks";
import { hasLiveSession } from "../api/liveData";
import { useAuth } from "../auth/AuthContext";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { DataGrid, type DataGridColumn } from "../ui/DataGrid";
import {
  ErpActionBar,
  ErpDecimalField,
  ErpLookupField,
  ErpMoneyField,
  ErpModalWorkspace,
  ErpNumberField,
  ErpTransactionLineGrid,
  ErpValidationSummary
} from "../ui/ErpComponents";
import { FilterBar } from "../ui/FilterBar";
import { FormShell } from "../ui/FormShell";
import { ListPageShell } from "../ui/ListPageShell";

const accountClassOptions = ["Asset", "Liability", "Equity", "Revenue", "Expense", "Contra"].map(toOption);
const normalBalanceOptions = ["Debit", "Credit"].map(toOption);
const accountStatusOptions = ["Active", "Inactive"].map(toOption);
const periodStatusOptions = ["Open", "Soft Closed", "Closed", "Locked"].map(toOption);
const journalStatusOptions = ["Draft"].map(toOption);
const postingKeys = ["AP_INVOICE_INVENTORY", "AP_INVOICE_INPUT_TAX", "AR_INVOICE_REVENUE", "AR_INVOICE_OUTPUT_TAX"].map(toOption);
const currencyOptions = ["INR", "USD", "EUR", "GBP"].map(toOption);

function toOption(value: string) {
  return { label: value, value };
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function nextNo(prefix: string) {
  return `${prefix}-${Date.now().toString().slice(-6)}`;
}

function money(value: number | null | undefined, currencyCode = "INR") {
  return `${currencyCode} ${(value ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
}

function numberValue(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function useFinanceFilter(search: string, status: string) {
  const { user } = useAuth();
  const deferredSearch = useDeferredValue(search);

  return useMemo(
    () => ({
      companyId: user?.activeContext.companyId ?? undefined,
      branchId: user?.activeContext.branchId ?? undefined,
      filter: {
        companyId: user?.activeContext.companyId ?? undefined,
        branchId: user?.activeContext.branchId ?? undefined,
        search: deferredSearch,
        status: status === "all" ? undefined : status
      }
    }),
    [deferredSearch, status, user?.activeContext.branchId, user?.activeContext.companyId]
  );
}

function useLiveFinanceReason() {
  const { session } = useAuth();
  return hasLiveSession(session) ? undefined : "Live company sign-in is required for finance changes.";
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone = normalized.includes("posted") || normalized.includes("open") || normalized.includes("active")
    ? "success"
    : normalized.includes("closed") || normalized.includes("locked") || normalized.includes("pending")
      ? "warn"
      : normalized.includes("inactive")
        ? "danger"
        : "info";
  return <Badge tone={tone}>{status}</Badge>;
}

function FinanceFilters({ search, setSearch, status, setStatus }: { search: string; setSearch: (value: string) => void; status: string; setStatus: (value: string) => void }) {
  return (
    <FilterBar
      actions={
        <Button
          onClick={() => {
            setSearch("");
            setStatus("all");
          }}
          variant="quiet"
        >
          Clear filters
        </Button>
      }
    >
      <input aria-label="Search finance records" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search number, account, or source" value={search} />
      <select aria-label="Finance status" onChange={(event) => setStatus(event.target.value)} value={status}>
        <option value="all">Status: Any</option>
        <option value="Active">Active</option>
        <option value="Draft">Draft</option>
        <option value="Posted">Posted</option>
        <option value="Open">Open</option>
        <option value="Closed">Closed</option>
        <option value="Locked">Locked</option>
      </select>
    </FilterBar>
  );
}

function accountOptions(accounts: ChartOfAccountDto[] | undefined) {
  return (accounts ?? []).map((account) => ({
    disabled: !account.isActive || !account.isPostingAllowed || account.status !== "Active",
    label: `${account.accountCode} - ${account.accountName}`,
    value: String(account.id)
  }));
}

const accountColumns: DataGridColumn<ChartOfAccountDto>[] = [
  { key: "code", header: "Account", render: (record) => <strong>{record.accountCode}</strong> },
  { key: "name", header: "Name", render: (record) => record.accountName },
  { key: "class", header: "Class", render: (record) => record.accountClass },
  { key: "posting", header: "Posting", render: (record) => (record.isPostingAllowed ? "Posting" : "Parent / control") },
  { key: "status", header: "Status", render: (record) => <StatusBadge status={record.status} /> }
];

export function ChartOfAccountsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [draft, setDraft] = useState<ChartOfAccountUpsertRequest | null>(null);
  const { companyId, filter } = useFinanceFilter(search, status);
  const liveReason = useLiveFinanceReason();
  const query = useApiQuery(["finance", "chart-of-accounts", filter], () => apiClient.finance.chartOfAccounts(filter));
  const create = useApiMutation(apiClient.finance.createChartOfAccount, { onSuccess: () => setDraft(null) });

  return (
    <ListPageShell
      actions={
        <ErpActionBar
          primary={[{ disabled: Boolean(liveReason), label: "New Account", onClick: () => setDraft({ companyId: companyId ?? 0, accountCode: "", accountName: "", accountClass: "Asset", parentAccountId: null, normalBalance: "Debit", isActive: true, isPostingAllowed: true, status: "Active" }), reason: liveReason }]}
          testId="finance-coa-action-bar"
        />
      }
      description="Governed chart of accounts used by AP, AR, GL, tax, valuation, WIP, and COGS posting profiles."
      filters={<FinanceFilters search={search} setSearch={setSearch} status={status} setStatus={setStatus} />}
      title="Chart of Accounts"
    >
      <DataGrid ariaLabel="Chart of accounts" columns={accountColumns} getRowId={(record) => String(record.id)} isLoading={query.isLoading} records={query.data?.items ?? []} rowLabel={(record) => record.accountCode} />
      <ErpModalWorkspace
        footer={<ErpActionBar primary={[{ disabled: Boolean(liveReason) || create.isPending, label: create.isPending ? "Saving account" : "Save Account", onClick: draft && !liveReason ? () => create.mutate(draft) : undefined, reason: liveReason }]} utility={[{ label: "Close", onClick: () => setDraft(null), variant: "quiet" }]} />}
        isOpen={Boolean(draft)}
        onClose={() => setDraft(null)}
        title="New account"
      >
        {draft ? (
          <FormShell initialFingerprint={`${draft.accountCode}-${draft.accountName}`} title="Account rules">
            <label><span>Account code</span><input aria-label="Account code" onChange={(event) => setDraft({ ...draft, accountCode: event.target.value })} value={draft.accountCode} /></label>
            <label><span>Account name</span><input aria-label="Account name" onChange={(event) => setDraft({ ...draft, accountName: event.target.value })} value={draft.accountName} /></label>
            <ErpLookupField label="Account class" onChange={(value) => setDraft({ ...draft, accountClass: value })} options={accountClassOptions} required value={draft.accountClass} />
            <ErpLookupField label="Normal balance" onChange={(value) => setDraft({ ...draft, normalBalance: value })} options={normalBalanceOptions} required value={draft.normalBalance} />
            <ErpLookupField label="Status" onChange={(value) => setDraft({ ...draft, status: value, isActive: value === "Active" })} options={accountStatusOptions} required value={draft.status} />
            <label><span>Posting allowed</span><input checked={draft.isPostingAllowed} onChange={(event) => setDraft({ ...draft, isPostingAllowed: event.target.checked })} type="checkbox" /></label>
          </FormShell>
        ) : null}
      </ErpModalWorkspace>
    </ListPageShell>
  );
}

const periodColumns: DataGridColumn<FiscalPeriodDto>[] = [
  { key: "period", header: "Period", render: (record) => <strong>{record.periodName}</strong> },
  { key: "dates", header: "Dates", render: (record) => `${record.startDate} to ${record.endDate}` },
  { key: "locks", header: "Module locks", render: (record) => [record.apLocked ? "AP" : null, record.arLocked ? "AR" : null, record.inventoryLocked ? "Inventory" : null, record.productionLocked ? "Production" : null, record.glLocked ? "GL" : null].filter(Boolean).join(", ") || "None" },
  { key: "status", header: "Status", render: (record) => <StatusBadge status={record.status} /> }
];

export function FiscalPeriodsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [draft, setDraft] = useState<FiscalPeriodUpsertRequest | null>(null);
  const { companyId, filter } = useFinanceFilter(search, status);
  const liveReason = useLiveFinanceReason();
  const query = useApiQuery(["finance", "fiscal-periods", filter], () => apiClient.finance.fiscalPeriods(filter));
  const create = useApiMutation(apiClient.finance.createFiscalPeriod, { onSuccess: () => setDraft(null) });

  return (
    <ListPageShell
      actions={<ErpActionBar primary={[{ disabled: Boolean(liveReason), label: "New Period", onClick: () => setDraft({ companyId: companyId ?? 0, fiscalYear: 2026, periodNo: 5, periodName: "May 2026", startDate: todayIsoDate(), endDate: todayIsoDate(), status: "Open", apLocked: false, arLocked: false, inventoryLocked: false, productionLocked: false, glLocked: false }), reason: liveReason }]} testId="finance-period-action-bar" />}
      description="Posting calendar controls AP, AR, inventory, production, and GL posting dates."
      filters={<FinanceFilters search={search} setSearch={setSearch} status={status} setStatus={setStatus} />}
      title="Fiscal Periods"
    >
      <DataGrid ariaLabel="Fiscal periods" columns={periodColumns} getRowId={(record) => String(record.id)} isLoading={query.isLoading} records={query.data?.items ?? []} rowLabel={(record) => record.periodName} />
      <ErpModalWorkspace footer={<ErpActionBar primary={[{ disabled: Boolean(liveReason) || create.isPending, label: create.isPending ? "Saving period" : "Save Period", onClick: draft && !liveReason ? () => create.mutate(draft) : undefined, reason: liveReason }]} utility={[{ label: "Close", onClick: () => setDraft(null), variant: "quiet" }]} />} isOpen={Boolean(draft)} onClose={() => setDraft(null)} title="New fiscal period">
        {draft ? (
          <FormShell initialFingerprint={`${draft.periodName}-${draft.status}`} title="Period control">
            <ErpNumberField label="Fiscal year" min={2000} onChange={(value) => setDraft({ ...draft, fiscalYear: value ?? draft.fiscalYear })} value={draft.fiscalYear} />
            <ErpNumberField label="Period number" min={1} onChange={(value) => setDraft({ ...draft, periodNo: value ?? draft.periodNo })} value={draft.periodNo} />
            <label><span>Period name</span><input aria-label="Period name" onChange={(event) => setDraft({ ...draft, periodName: event.target.value })} value={draft.periodName} /></label>
            <label><span>Start date</span><input aria-label="Start date" onChange={(event) => setDraft({ ...draft, startDate: event.target.value })} type="date" value={draft.startDate} /></label>
            <label><span>End date</span><input aria-label="End date" onChange={(event) => setDraft({ ...draft, endDate: event.target.value })} type="date" value={draft.endDate} /></label>
            <ErpLookupField label="Status" onChange={(value) => setDraft({ ...draft, status: value })} options={periodStatusOptions} value={draft.status} />
            {(["apLocked", "arLocked", "inventoryLocked", "productionLocked", "glLocked"] as const).map((field) => (
              <label key={field}><span>{field.replace("Locked", " locked").toUpperCase()}</span><input checked={draft[field]} onChange={(event) => setDraft({ ...draft, [field]: event.target.checked })} type="checkbox" /></label>
            ))}
          </FormShell>
        ) : null}
      </ErpModalWorkspace>
    </ListPageShell>
  );
}

const profileColumns: DataGridColumn<PostingProfileDto>[] = [
  { key: "key", header: "Posting key", render: (record) => <strong>{record.postingKey}</strong> },
  { key: "debit", header: "Debit", render: (record) => record.debitAccountCode },
  { key: "credit", header: "Credit", render: (record) => record.creditAccountCode },
  { key: "source", header: "Mapping source", render: (record) => record.mappingSource },
  { key: "status", header: "Status", render: (record) => <StatusBadge status={record.status} /> }
];

export function PostingProfilesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [draft, setDraft] = useState<PostingProfileUpsertRequest | null>(null);
  const { companyId, filter } = useFinanceFilter(search, status);
  const liveReason = useLiveFinanceReason();
  const accounts = useApiQuery(["finance", "accounts-for-profiles"], () => apiClient.finance.chartOfAccounts({ companyId, status: "Active", pageSize: 250 }));
  const query = useApiQuery(["finance", "posting-profiles", filter], () => apiClient.finance.postingProfiles(filter));
  const create = useApiMutation(apiClient.finance.createPostingProfile, { onSuccess: () => setDraft(null) });
  const options = accountOptions(accounts.data?.items);

  return (
    <ListPageShell
      actions={<ErpActionBar primary={[{ disabled: Boolean(liveReason), label: "New Posting Profile", onClick: () => setDraft({ companyId: companyId ?? 0, profileCode: "", postingKey: "AR_INVOICE_REVENUE", debitAccountId: 0, creditAccountId: 0, mappingSource: "Company finance posting profile", effectiveFrom: todayIsoDate(), effectiveTo: null, status: "Active" }), reason: liveReason }]} testId="finance-profile-action-bar" />}
      description="Deterministic account mappings replace hardcoded posting accounts for AP, AR, tax, valuation, WIP, and COGS."
      filters={<FinanceFilters search={search} setSearch={setSearch} status={status} setStatus={setStatus} />}
      title="Posting Profiles"
    >
      <DataGrid ariaLabel="Posting profiles" columns={profileColumns} getRowId={(record) => String(record.id)} isLoading={query.isLoading} records={query.data?.items ?? []} rowLabel={(record) => record.profileCode} />
      <ErpModalWorkspace footer={<ErpActionBar primary={[{ disabled: Boolean(liveReason) || create.isPending, label: create.isPending ? "Saving profile" : "Save Profile", onClick: draft && !liveReason ? () => create.mutate(draft) : undefined, reason: liveReason }]} utility={[{ label: "Close", onClick: () => setDraft(null), variant: "quiet" }]} />} isOpen={Boolean(draft)} onClose={() => setDraft(null)} title="New posting profile">
        {draft ? (
          <FormShell initialFingerprint={`${draft.profileCode}-${draft.postingKey}`} title="Profile mapping">
            <label><span>Profile code</span><input aria-label="Profile code" onChange={(event) => setDraft({ ...draft, profileCode: event.target.value })} value={draft.profileCode} /></label>
            <ErpLookupField label="Posting key" onChange={(value) => setDraft({ ...draft, postingKey: value })} options={postingKeys} required value={draft.postingKey} />
            <ErpLookupField label="Debit account" onChange={(value) => setDraft({ ...draft, debitAccountId: numberValue(value) ?? 0 })} options={options} required value={draft.debitAccountId ? String(draft.debitAccountId) : ""} />
            <ErpLookupField label="Credit account" onChange={(value) => setDraft({ ...draft, creditAccountId: numberValue(value) ?? 0 })} options={options} required value={draft.creditAccountId ? String(draft.creditAccountId) : ""} />
            <label><span>Mapping source</span><input aria-label="Mapping source" onChange={(event) => setDraft({ ...draft, mappingSource: event.target.value })} value={draft.mappingSource} /></label>
            <label><span>Effective from</span><input aria-label="Effective from" onChange={(event) => setDraft({ ...draft, effectiveFrom: event.target.value })} type="date" value={draft.effectiveFrom} /></label>
            <ErpLookupField label="Status" onChange={(value) => setDraft({ ...draft, status: value })} options={accountStatusOptions} value={draft.status} />
          </FormShell>
        ) : null}
      </ErpModalWorkspace>
    </ListPageShell>
  );
}

const journalColumns: DataGridColumn<JournalDto>[] = [
  { key: "journal", header: "Journal", render: (record) => <strong>{record.journalNo}</strong> },
  { key: "source", header: "Source", render: (record) => `${record.sourceModule} / ${record.sourceDocumentType}` },
  { key: "date", header: "Posting date", render: (record) => record.postingDate },
  { key: "amount", header: "Amount", render: (record) => money(record.lines.reduce((total, line) => total + line.debitAmount, 0), record.currencyCode) },
  { key: "status", header: "Status", render: (record) => <StatusBadge status={record.status} /> }
];

function buildJournalDraft(companyId: number | undefined, branchId: number | undefined): JournalUpsertRequest {
  return {
    companyId: companyId ?? 0,
    branchId: branchId ?? null,
    journalNo: nextNo("JV-DRAFT"),
    postingDate: todayIsoDate(),
    documentDate: todayIsoDate(),
    sourceModule: "GL",
    sourceDocumentType: "Manual",
    sourceDocumentId: null,
    sourceDocumentNo: null,
    currencyCode: "INR",
    exchangeRateSnapshot: 1,
    status: "Draft",
    remarks: "",
    lines: [
      { lineNo: 10, accountId: 0, debitAmount: 0, creditAmount: 0, branchId: branchId ?? null, narration: "" },
      { lineNo: 20, accountId: 0, debitAmount: 0, creditAmount: 0, branchId: branchId ?? null, narration: "" }
    ]
  };
}

function renumberJournalLines(lines: JournalLineUpsertRequest[]) {
  return lines.map((line, index) => ({ ...line, lineNo: (index + 1) * 10 }));
}

export function GlJournalsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [draft, setDraft] = useState<JournalUpsertRequest | null>(null);
  const [selected, setSelected] = useState<JournalDto | null>(null);
  const { companyId, branchId, filter } = useFinanceFilter(search, status);
  const liveReason = useLiveFinanceReason();
  const accounts = useApiQuery(["finance", "accounts-for-journals"], () => apiClient.finance.chartOfAccounts({ companyId, status: "Active", pageSize: 250 }));
  const query = useApiQuery(["finance", "journals", filter], () => apiClient.finance.journals(filter));
  const create = useApiMutation(apiClient.finance.createJournal, { onSuccess: () => setDraft(null) });
  const post = useApiMutation(apiClient.finance.postJournal);
  const reverse = useApiMutation(({ id, reason }: { id: number; reason: string }) => apiClient.finance.reverseJournal(id, reason));
  const options = accountOptions(accounts.data?.items);
  const validationErrors = draft
    ? [
        draft.lines.some((line) => !line.accountId) ? "Every journal line requires a governed posting account." : null,
        draft.lines.reduce((total, line) => total + line.debitAmount, 0) !== draft.lines.reduce((total, line) => total + line.creditAmount, 0) ? "Journal debit and credit totals must balance before save/post." : null
      ].filter(Boolean) as string[]
    : [];

  const lineColumns = useMemo(
    () => [
      { key: "line", header: "Line", render: (line: JournalLineUpsertRequest) => line.lineNo, width: "4rem" },
      { key: "account", header: "Account", required: true, render: (line: JournalLineUpsertRequest, index: number) => <ErpLookupField label={`Line ${line.lineNo} account`} onChange={(value) => setDraft((current) => current ? { ...current, lines: current.lines.map((entry, entryIndex) => entryIndex === index ? { ...entry, accountId: numberValue(value) ?? 0 } : entry) } : current)} options={options} value={line.accountId ? String(line.accountId) : ""} /> },
      { key: "debit", header: "Debit", render: (line: JournalLineUpsertRequest, index: number) => <ErpMoneyField label={`Line ${line.lineNo} debit`} min={0} onChange={(value) => setDraft((current) => current ? { ...current, lines: current.lines.map((entry, entryIndex) => entryIndex === index ? { ...entry, debitAmount: value ?? 0 } : entry) } : current)} value={line.debitAmount} /> },
      { key: "credit", header: "Credit", render: (line: JournalLineUpsertRequest, index: number) => <ErpMoneyField label={`Line ${line.lineNo} credit`} min={0} onChange={(value) => setDraft((current) => current ? { ...current, lines: current.lines.map((entry, entryIndex) => entryIndex === index ? { ...entry, creditAmount: value ?? 0 } : entry) } : current)} value={line.creditAmount} /> },
      { key: "narration", header: "Narration", render: (line: JournalLineUpsertRequest, index: number) => <input aria-label={`Line ${line.lineNo} narration`} onChange={(event) => setDraft((current) => current ? { ...current, lines: current.lines.map((entry, entryIndex) => entryIndex === index ? { ...entry, narration: event.target.value } : entry) } : current)} value={line.narration ?? ""} /> },
      { key: "actions", header: "Actions", render: (_line: JournalLineUpsertRequest, index: number) => <Button disabled={(draft?.lines.length ?? 0) <= 2} onClick={() => setDraft((current) => current ? { ...current, lines: renumberJournalLines(current.lines.filter((_entry, entryIndex) => entryIndex !== index)) } : current)} title={(draft?.lines.length ?? 0) <= 2 ? "At least two journal lines are required." : undefined} variant="quiet">Remove Line</Button> }
    ],
    [draft?.lines.length, options]
  );

  return (
    <ListPageShell
      actions={<ErpActionBar primary={[{ disabled: Boolean(liveReason), label: "New Journal", onClick: () => setDraft(buildJournalDraft(companyId, branchId)), reason: liveReason }]} testId="finance-journal-action-bar" />}
      description="Balanced, source-aware general ledger journals with fiscal period and posting-account validation."
      filters={<FinanceFilters search={search} setSearch={setSearch} status={status} setStatus={setStatus} />}
      title="GL Journals"
    >
      <DataGrid ariaLabel="GL journals" columns={journalColumns} getRowId={(record) => String(record.id)} isLoading={query.isLoading} onRowSelect={setSelected} records={query.data?.items ?? []} rowLabel={(record) => record.journalNo} />
      <ErpModalWorkspace footer={<ErpActionBar primary={[{ disabled: Boolean(liveReason) || create.isPending || validationErrors.length > 0, label: create.isPending ? "Saving journal" : "Save Journal", onClick: draft && !liveReason && validationErrors.length === 0 ? () => create.mutate(draft) : undefined, reason: validationErrors[0] ?? liveReason }]} utility={[{ label: "Close", onClick: () => setDraft(null), variant: "quiet" }]} />} isOpen={Boolean(draft)} onClose={() => setDraft(null)} title="New GL journal">
        {draft ? (
          <FormShell initialFingerprint={`${draft.journalNo}-${draft.lines.length}`} title="Journal header" validationErrors={validationErrors}>
            <label><span>Journal number</span><input aria-label="Journal number" onChange={(event) => setDraft({ ...draft, journalNo: event.target.value })} value={draft.journalNo} /></label>
            <label><span>Posting date</span><input aria-label="Posting date" onChange={(event) => setDraft({ ...draft, postingDate: event.target.value })} type="date" value={draft.postingDate} /></label>
            <label><span>Document date</span><input aria-label="Document date" onChange={(event) => setDraft({ ...draft, documentDate: event.target.value })} type="date" value={draft.documentDate} /></label>
            <ErpLookupField label="Status" onChange={(value) => setDraft({ ...draft, status: value })} options={journalStatusOptions} value={draft.status} />
            <label className="form-span-2"><span>Remarks</span><input aria-label="Journal remarks" onChange={(event) => setDraft({ ...draft, remarks: event.target.value })} value={draft.remarks ?? ""} /></label>
            <div className="form-span-2">
              <ErpTransactionLineGrid ariaLabel="Journal line grid" columns={lineColumns} getRowId={(line) => String(line.lineNo)} lines={draft.lines} onAddLine={() => setDraft({ ...draft, lines: renumberJournalLines([...draft.lines, { lineNo: 0, accountId: 0, debitAmount: 0, creditAmount: 0, branchId: branchId ?? null, narration: "" }]) })} testId="finance-journal-line-grid" />
            </div>
          </FormShell>
        ) : null}
      </ErpModalWorkspace>
      <ErpModalWorkspace
        footer={<ErpActionBar danger={[{ disabled: selected?.status !== "Posted" || Boolean(liveReason) || reverse.isPending, label: reverse.isPending ? "Reversing journal" : "Reverse Journal", onClick: selected && selected.status === "Posted" && !liveReason ? () => reverse.mutate({ id: selected.id, reason: "Correction approved by finance." }) : undefined, reason: selected?.status !== "Posted" ? "Only posted journals can be reversed." : liveReason }]} primary={[{ disabled: selected?.status !== "Draft" || Boolean(liveReason) || post.isPending, label: post.isPending ? "Posting journal" : "Post Journal", onClick: selected && selected.status === "Draft" && !liveReason ? () => post.mutate(selected.id) : undefined, reason: selected?.status !== "Draft" ? "Only draft journals can be posted." : liveReason }]} utility={[{ label: "Close", onClick: () => setSelected(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        title={selected?.journalNo ?? "Journal"}
      >
        {selected ? <JournalSummary journal={selected} /> : null}
      </ErpModalWorkspace>
    </ListPageShell>
  );
}

function JournalSummary({ journal }: { journal: JournalDto }) {
  return (
    <Card>
      <p><strong>Status:</strong> {journal.status}</p>
      <p><strong>Source:</strong> {journal.sourceModule} / {journal.sourceDocumentType} {journal.sourceDocumentNo ?? ""}</p>
      <DataGrid ariaLabel="Posted journal lines" columns={[
        { key: "line", header: "Line", render: (line) => line.lineNo },
        { key: "account", header: "Account", render: (line) => line.accountCode },
        { key: "debit", header: "Debit", render: (line) => money(line.debitAmount, journal.currencyCode) },
        { key: "credit", header: "Credit", render: (line) => money(line.creditAmount, journal.currencyCode) }
      ]} getRowId={(line) => String(line.id)} records={journal.lines} rowLabel={(line) => `${line.lineNo}`} />
    </Card>
  );
}

export function ApInvoicesPage() {
  const [supplierInvoiceId, setSupplierInvoiceId] = useState<number | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const liveReason = useLiveFinanceReason();
  const post = useApiMutation(apiClient.procurement.postSupplierInvoice, { onSuccess: (data) => setResult(`Posted ${data.invoice.supplierInvoiceNo} to ${data.liability.liabilityNo}`) });

  return (
    <ListPageShell
      actions={<ErpActionBar primary={[{ disabled: Boolean(liveReason) || !supplierInvoiceId || post.isPending, label: post.isPending ? "Posting AP invoice" : "Post Supplier Invoice", onClick: supplierInvoiceId && !liveReason ? () => post.mutate(supplierInvoiceId) : undefined, reason: liveReason ?? (!supplierInvoiceId ? "Enter a matched supplier invoice ID before posting." : undefined) }]} secondary={[{ disabled: true, label: "Create supplier invoice here", reason: "Supplier invoices are created from the procurement receipt workspace to preserve PO/GRN matching evidence." }]} testId="finance-ap-action-bar" />}
      description="AP posting uses matched procurement supplier invoices, governed posting profiles, fiscal periods, GL, AP liability, input tax, and valuation entries."
      title="AP Invoices / Supplier Ledger"
    >
      <Card>
        <FormShell initialFingerprint={`${supplierInvoiceId ?? ""}`} title="Supplier invoice posting">
          <ErpNumberField label="Matched supplier invoice ID" min={1} onChange={setSupplierInvoiceId} value={supplierInvoiceId} />
          {result ? <Badge tone="success">{result}</Badge> : null}
          <ErpValidationSummary errors={post.error ? [post.error.message] : []} />
        </FormShell>
      </Card>
    </ListPageShell>
  );
}

const arColumns: DataGridColumn<ArInvoiceDto>[] = [
  { key: "invoice", header: "Invoice", render: (record) => <strong>{record.invoiceNo}</strong> },
  { key: "source", header: "Source", render: (record) => record.sourceDocumentNo ?? `Shipment ${record.shipmentId ?? "-"}` },
  { key: "date", header: "Invoice date", render: (record) => record.invoiceDate },
  { key: "amount", header: "Grand total", render: (record) => money(record.grandTotalAmount, record.currencyCode) },
  { key: "status", header: "AR status", render: (record) => <StatusBadge status={record.arStatus} /> }
];

export function ArInvoicesPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [draft, setDraft] = useState<ArInvoiceFromShipmentRequest | null>(null);
  const [selected, setSelected] = useState<ArInvoiceDto | null>(null);
  const { filter } = useFinanceFilter(search, status);
  const liveReason = useLiveFinanceReason();
  const query = useApiQuery(["finance", "ar-invoices", filter], () => apiClient.finance.arInvoices(filter));
  const create = useApiMutation(apiClient.finance.createArInvoiceFromShipment, { onSuccess: (record) => { setDraft(null); setSelected(record); } });
  const post = useApiMutation(apiClient.finance.postArInvoice);

  return (
    <ListPageShell
      actions={<ErpActionBar primary={[{ disabled: Boolean(liveReason), label: "Create AR Invoice", onClick: () => setDraft({ shipmentId: 0, invoiceNo: nextNo("AR-DRAFT"), invoiceDate: todayIsoDate(), dueDate: todayIsoDate(), currencyCode: "INR", exchangeRateSnapshot: 1 }), reason: liveReason }]} testId="finance-ar-action-bar" />}
      description="AR invoices copy shipment and sales-order commercial snapshots exactly and post receivables, revenue, output tax, and valuation status."
      filters={<FinanceFilters search={search} setSearch={setSearch} status={status} setStatus={setStatus} />}
      title="AR Invoices / Customer Ledger"
    >
      <DataGrid ariaLabel="AR invoices" columns={arColumns} getRowId={(record) => String(record.id)} isLoading={query.isLoading} onRowSelect={setSelected} records={query.data?.items ?? []} rowLabel={(record) => record.invoiceNo} />
      <ErpModalWorkspace footer={<ErpActionBar primary={[{ disabled: Boolean(liveReason) || create.isPending || !draft?.shipmentId, label: create.isPending ? "Creating invoice" : "Create from Shipment", onClick: draft && !liveReason && draft.shipmentId ? () => create.mutate(draft) : undefined, reason: liveReason ?? (!draft?.shipmentId ? "A shipment ID is required." : undefined) }]} utility={[{ label: "Close", onClick: () => setDraft(null), variant: "quiet" }]} />} isOpen={Boolean(draft)} onClose={() => setDraft(null)} title="Create AR invoice">
        {draft ? (
          <FormShell initialFingerprint={`${draft.invoiceNo}-${draft.shipmentId}`} title="Shipment invoice source">
            <ErpNumberField label="Shipment ID" min={1} onChange={(value) => setDraft({ ...draft, shipmentId: value ?? 0 })} value={draft.shipmentId || null} />
            <label><span>Invoice number</span><input aria-label="Invoice number" onChange={(event) => setDraft({ ...draft, invoiceNo: event.target.value })} value={draft.invoiceNo} /></label>
            <label><span>Invoice date</span><input aria-label="Invoice date" onChange={(event) => setDraft({ ...draft, invoiceDate: event.target.value })} type="date" value={draft.invoiceDate} /></label>
            <label><span>Due date</span><input aria-label="Due date" onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })} type="date" value={draft.dueDate ?? ""} /></label>
            <ErpLookupField label="Currency" onChange={(value) => setDraft({ ...draft, currencyCode: value })} options={currencyOptions} value={draft.currencyCode} />
            <ErpDecimalField label="Exchange rate snapshot" min={0} onChange={(value) => setDraft({ ...draft, exchangeRateSnapshot: value ?? 1 })} value={draft.exchangeRateSnapshot} />
          </FormShell>
        ) : null}
      </ErpModalWorkspace>
      <ErpModalWorkspace footer={<ErpActionBar primary={[{ disabled: selected?.arStatus === "Posted" || Boolean(liveReason) || post.isPending, label: post.isPending ? "Posting AR invoice" : "Post AR Invoice", onClick: selected && selected.arStatus !== "Posted" && !liveReason ? () => post.mutate(selected.id) : undefined, reason: selected?.arStatus === "Posted" ? "Posted AR invoices are locked." : liveReason }]} utility={[{ label: "Close", onClick: () => setSelected(null), variant: "quiet" }]} />} isOpen={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.invoiceNo ?? "AR invoice"}>
        {selected ? <ArInvoiceSummary invoice={selected} /> : null}
      </ErpModalWorkspace>
    </ListPageShell>
  );
}

function ArInvoiceSummary({ invoice }: { invoice: ArInvoiceDto }) {
  return (
    <Card>
      <p><strong>Source:</strong> {invoice.sourceDocumentNo ?? `Shipment ${invoice.shipmentId ?? "-"}`}</p>
      <p><strong>Snapshot total:</strong> {money(invoice.grandTotalAmount, invoice.currencyCode)}</p>
      <DataGrid ariaLabel="AR invoice snapshot lines" columns={[
        { key: "line", header: "Line", render: (line) => line.lineNo },
        { key: "item", header: "Item", render: (line) => line.itemId },
        { key: "qty", header: "Qty", render: (line) => line.invoiceQuantity },
        { key: "price", header: "Unit price", render: (line) => money(line.unitPrice, invoice.currencyCode) },
        { key: "tax", header: "Tax", render: (line) => money(line.taxAmount, invoice.currencyCode) },
        { key: "total", header: "Total", render: (line) => money(line.lineTotalAmount, invoice.currencyCode) }
      ]} getRowId={(line) => String(line.id)} records={invoice.lines} rowLabel={(line) => `${line.lineNo}`} />
    </Card>
  );
}

const valuationColumns: DataGridColumn<InventoryValuationEntryDto>[] = [
  { key: "source", header: "Source", render: (record) => `${record.sourceDocumentType} ${record.sourceDocumentNo ?? record.sourceDocumentId ?? ""}` },
  { key: "item", header: "Item", render: (record) => record.itemId },
  { key: "grain", header: "Tracking grain", render: (record) => `WH ${record.warehouseId ?? "-"} / Bin ${record.binId ?? "-"} / Lot ${record.lotId ?? "-"} / Serial ${record.serialId ?? "-"} / PCID ${record.pcidId ?? "-"}` },
  { key: "qty", header: "Quantity", render: (record) => record.quantity },
  { key: "cost", header: "Value", render: (record) => money(record.totalCost) },
  { key: "status", header: "Status", render: (record) => <StatusBadge status={record.status} /> }
];

export function InventoryValuationPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const { filter } = useFinanceFilter(search, status);
  const query = useApiQuery(["finance", "inventory-valuation", filter], () => apiClient.finance.inventoryValuation(filter));

  return (
    <ListPageShell
      actions={<ErpActionBar secondary={[{ disabled: true, label: "Revalue stock", reason: "Manual revaluation requires an approved valuation policy and maker-checker workflow." }]} testId="finance-valuation-action-bar" />}
      description="Valuation rows are linked to stock transactions and source documents so quantity and value remain reconcilable."
      filters={<FinanceFilters search={search} setSearch={setSearch} status={status} setStatus={setStatus} />}
      title="Inventory Valuation"
    >
      <DataGrid ariaLabel="Inventory valuation" columns={valuationColumns} getRowId={(record) => String(record.id)} isLoading={query.isLoading} records={query.data?.items ?? []} rowLabel={(record) => `${record.sourceDocumentType}-${record.id}`} />
    </ListPageShell>
  );
}

const taxColumns: DataGridColumn<TaxLedgerEntryDto>[] = [
  { key: "direction", header: "Direction", render: (record) => <strong>{record.taxDirection}</strong> },
  { key: "source", header: "Source", render: (record) => `${record.sourceDocumentType} ${record.sourceDocumentId}` },
  { key: "date", header: "Posting date", render: (record) => record.postingDate },
  { key: "taxable", header: "Taxable", render: (record) => money(record.taxableAmount) },
  { key: "tax", header: "Tax", render: (record) => money(record.taxAmount) },
  { key: "status", header: "Status", render: (record) => <StatusBadge status={record.status} /> }
];

export function TaxLedgerPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const { filter } = useFinanceFilter(search, status);
  const query = useApiQuery(["finance", "tax-ledger", filter], () => apiClient.finance.taxLedger(filter));

  return (
    <ListPageShell
      actions={<ErpActionBar secondary={[{ disabled: true, label: "Recalculate Tax", reason: "Posted tax ledger uses persisted document snapshots and cannot be recalculated from current tax master." }]} testId="finance-tax-action-bar" />}
      description="Input and output tax ledger entries are posted from persisted AP/AR document tax snapshots."
      filters={<FinanceFilters search={search} setSearch={setSearch} status={status} setStatus={setStatus} />}
      title="Tax Ledger"
    >
      <DataGrid ariaLabel="Tax ledger" columns={taxColumns} getRowId={(record) => String(record.id)} isLoading={query.isLoading} records={query.data?.items ?? []} rowLabel={(record) => `${record.taxDirection}-${record.id}`} />
    </ListPageShell>
  );
}

export function FinanceDeferredActionsPage() {
  return (
    <ListPageShell
      actions={<ErpActionBar secondary={[
        { disabled: true, label: "Post landed cost", reason: "Landed cost durable allocation is scheduled after GRN/AP matching is finalized for all purchase flows." },
        { disabled: true, label: "Create debit note", reason: "Debit note posting requires vendor-return accounting source documents." },
        { disabled: true, label: "Create credit note", reason: "Credit note posting requires customer-return source documents." },
        { disabled: true, label: "Execute payment", reason: "Bank/payment provider execution is outside this finance foundation and requires treasury approval." }
      ]} testId="finance-deferred-action-bar" />}
      description="Finance boundaries that are deliberately disabled until their source flows and maker-checker rules are complete."
      title="Finance Boundaries"
    >
      <Card>
        <h3>Disabled with business reason</h3>
        <p>Landed cost, debit notes, credit notes, and payment execution are represented here so they cannot appear as active finance actions before their source document contracts are complete.</p>
      </Card>
    </ListPageShell>
  );
}
