import { useMemo, useState, type ReactNode } from "react";
import type {
  CurrencyDto,
  CurrencyUpsertRequest,
  DiscountSchemeDto,
  DiscountSchemeUpsertRequest,
  ExchangeRateSetupUpsertRequest,
  PaymentTermUpsertRequest,
  PriceListDto,
  PriceListUpsertRequest,
  TaxCategoryDto,
  TaxCategoryUpsertRequest,
  TradeTermUpsertRequest
} from "../api/contracts";
import { queryKeys, useApiQuery } from "../api/hooks";
import { useAuth } from "../auth/AuthContext";
import {
  listCommercialCurrencies,
  listCommercialExchangeRates,
  listCommercialPaymentTerms,
  listCommercialTaxCategories,
  listCommercialTradeTerms,
  listDiscountSchemes,
  listPriceLists,
  saveCurrency,
  saveDiscountScheme,
  saveExchangeRate,
  savePaymentTerm,
  savePriceList,
  saveTaxCategory,
  saveTradeTerm
} from "../commercial/commercialMasterAdapters";
import {
  buildMasterFilter,
  listCustomerSetup,
  listItemGroupSetup,
  listItemMasterSetup,
  type CustomerSetupItem,
  type ItemGroupSetupItem
} from "../masters/masterDataAdapters";
import { Card } from "../ui/Card";
import type { DataGridColumn } from "../ui/DataGrid";
import {
  ErpActionBar,
  ErpDecimalField,
  ErpEmptyState,
  ErpFilterBar,
  ErpGrid,
  ErpLookupField,
  ErpMoneyField,
  ErpModalWorkspace,
  ErpNumberField,
  ErpStatusChip,
  ErpValidationSummary
} from "../ui/ErpComponents";
import { ListPageShell } from "../ui/ListPageShell";
import { KpiStrip } from "../ui/boards";

type StatusTone = "info" | "success" | "warn" | "danger" | "neutral";
type CommercialSetupKind = "currency" | "rate" | "tax" | "payment" | "trade";

const todayIso = "2026-04-23";
const statusOptions = ["Active", "Draft", "Inactive", "On Hold"].map(toOption);
const approvalOptions = ["Draft", "Review", "Approved", "Retired"].map(toOption);
const priceListTypeOptions = ["Standard Sales", "Customer Contract", "Export", "Purchase Reference"].map(toOption);
const discountTypeOptions = ["Quantity Break", "Customer Scheme", "Campaign", "Item Group"].map(toOption);
const applicabilityOptions = ["Item", "Item Group", "Customer", "Customer Group", "Price List"].map(toOption);
const rateTypeOptions = ["Manual", "Month End", "Transaction"].map(toOption);
const rateSourceOptions = ["Finance table", "Bank advisory", "Contract rate"].map(toOption);
const roundingOptions = ["HalfUp", "Bankers", "Floor", "Ceiling"].map(toOption);
const taxScopeOptions = ["Domestic sale", "Export", "Purchase", "Service"].map(toOption);
const dueModeOptions = ["InvoiceDate", "DispatchDate", "Milestone"].map(toOption);
const tradeModeOptions = ["Domestic dispatch", "Export", "Customer pickup", "Supplier delivery"].map(toOption);
const uomOptions = [
  { label: "PCS - Pieces", value: "1" },
  { label: "KG - Kilogram", value: "2" },
  { label: "MTR - Meter", value: "3" }
];
const saveReason = "Sign in with commercial master write access to save this setup.";

function toOption(value: string) {
  return { label: value, value };
}

function statusTone(status: string): StatusTone {
  if (status === "Active" || status === "Approved") {
    return "success";
  }

  if (status === "Draft" || status === "Review") {
    return "info";
  }

  if (status === "On Hold") {
    return "warn";
  }

  return "neutral";
}

function hasLiveWrite(session: ReturnType<typeof useAuth>["session"]) {
  return Boolean(session?.accessToken && !session.accessToken.startsWith("demo-"));
}

function toId(value: string) {
  return value ? Number(value) : null;
}

function formatMoney(value: number, currencyCode: string | null | undefined) {
  return `${currencyCode ?? ""} ${value.toLocaleString("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`.trim();
}

function textInput(label: string, value: string | number | null | undefined, onChange: (value: string) => void, type = "text") {
  if (type === "number") {
    const numericValue = typeof value === "number" ? value : value ? Number(value) : null;
    const commitNumber = (nextValue: number | null) => onChange(nextValue === null ? "" : String(nextValue));

    if (/price|amount/i.test(label)) {
      return <ErpMoneyField currencyCode="INR" label={label} min={0} onChange={commitNumber} value={numericValue} />;
    }

    if (/rate|percent|quantity/i.test(label)) {
      return <ErpDecimalField label={label} min={0} onChange={commitNumber} scale={3} value={numericValue} />;
    }

    return <ErpNumberField label={label} min={0} onChange={commitNumber} value={numericValue} />;
  }

  return (
    <label className="erp-lookup-field">
      <span>{label}</span>
      <input aria-label={label} onChange={(event) => onChange(event.target.value)} type={type} value={value ?? ""} />
    </label>
  );
}

function checkboxInput(label: string, checked: boolean, onChange: (value: boolean) => void) {
  return (
    <label className="form-checkbox">
      <input checked={checked} onChange={(event) => onChange(event.target.checked)} type="checkbox" />
      <span>{label}</span>
    </label>
  );
}

function dateInput(label: string, value: string | null, onChange: (value: string | null) => void) {
  return (
    <label className="erp-lookup-field">
      <span>{label}</span>
      <input aria-label={label} onChange={(event) => onChange(event.target.value || null)} type="date" value={value ?? ""} />
    </label>
  );
}

function buildPriceListRequest(
  companyId: number,
  currencies: CurrencyDto[],
  taxCategories: TaxCategoryDto[],
  itemGroups: ItemGroupSetupItem[],
  customers: CustomerSetupItem[]
): PriceListUpsertRequest {
  const currency = currencies[0];
  const tax = taxCategories[0];
  const itemGroup = itemGroups[0];
  const customer = customers[0];

  return {
    companyId,
    priceListCode: "NEW-PRICE-LIST",
    priceListName: "New commercial price list",
    currencyId: currency?.id ?? 0,
    priceListType: "Standard Sales",
    effectiveFrom: todayIso,
    effectiveTo: null,
    customerSegment: "Domestic industrial",
    approvalStatus: "Draft",
    status: "Draft",
    lines: [
      {
        lineNo: 10,
        itemId: 10002,
        itemGroupId: null,
        uomId: 1,
        minQuantity: 1,
        unitPrice: 0,
        discountEligible: true,
        taxCategoryId: tax?.id ?? null,
        effectiveFrom: todayIso,
        effectiveTo: null,
        status: "Draft"
      }
    ],
    assignments: [
      {
        customerId: customer?.customerId ?? null,
        customerGroupCode: null,
        itemGroupId: itemGroup?.groupId ?? null,
        branchId: 10,
        priorityRank: 10,
        effectiveFrom: todayIso,
        effectiveTo: null,
        status: "Draft"
      }
    ]
  };
}

function toPriceListRequest(row: PriceListDto): PriceListUpsertRequest {
  return {
    companyId: row.companyId,
    priceListCode: row.priceListCode,
    priceListName: row.priceListName,
    currencyId: row.currencyId,
    priceListType: row.priceListType,
    effectiveFrom: row.effectiveFrom,
    effectiveTo: row.effectiveTo,
    customerSegment: row.customerSegment,
    approvalStatus: row.approvalStatus,
    status: row.status,
    lines: row.lines.map((line) => ({
      lineNo: line.lineNo,
      itemId: line.itemId,
      itemGroupId: line.itemGroupId,
      uomId: line.uomId,
      minQuantity: line.minQuantity,
      unitPrice: line.unitPrice,
      discountEligible: line.discountEligible,
      taxCategoryId: line.taxCategoryId,
      effectiveFrom: line.effectiveFrom,
      effectiveTo: line.effectiveTo,
      status: line.status
    })),
    assignments: row.assignments.map((assignment) => ({
      customerId: assignment.customerId,
      customerGroupCode: assignment.customerGroupCode,
      itemGroupId: assignment.itemGroupId,
      branchId: assignment.branchId,
      priorityRank: assignment.priorityRank,
      effectiveFrom: assignment.effectiveFrom,
      effectiveTo: assignment.effectiveTo,
      status: assignment.status
    }))
  };
}

function buildDiscountRequest(companyId: number, currencies: CurrencyDto[], priceLists: PriceListDto[]): DiscountSchemeUpsertRequest {
  return {
    companyId,
    schemeCode: "NEW-DISCOUNT",
    schemeName: "New discount scheme",
    discountType: "Quantity Break",
    currencyId: currencies[0]?.id ?? null,
    effectiveFrom: todayIso,
    effectiveTo: null,
    requiresApproval: true,
    approvalStatus: "Draft",
    status: "Draft",
    rules: [
      {
        ruleNo: 10,
        ruleName: "Quantity break",
        applicabilityType: "Item",
        customerId: null,
        customerGroupCode: null,
        itemId: 10002,
        itemGroupId: null,
        minQuantity: 1,
        discountPercent: 0,
        discountAmount: null,
        priceListId: priceLists[0]?.id ?? null,
        status: "Draft"
      }
    ]
  };
}

function toDiscountRequest(row: DiscountSchemeDto): DiscountSchemeUpsertRequest {
  return {
    companyId: row.companyId,
    schemeCode: row.schemeCode,
    schemeName: row.schemeName,
    discountType: row.discountType,
    currencyId: row.currencyId,
    effectiveFrom: row.effectiveFrom,
    effectiveTo: row.effectiveTo,
    requiresApproval: row.requiresApproval,
    approvalStatus: row.approvalStatus,
    status: row.status,
    rules: row.rules.map((rule) => ({
      ruleNo: rule.ruleNo,
      ruleName: rule.ruleName,
      applicabilityType: rule.applicabilityType,
      customerId: rule.customerId,
      customerGroupCode: rule.customerGroupCode,
      itemId: rule.itemId,
      itemGroupId: rule.itemGroupId,
      minQuantity: rule.minQuantity,
      discountPercent: rule.discountPercent,
      discountAmount: rule.discountAmount,
      priceListId: rule.priceListId,
      status: rule.status
    }))
  };
}

function SidebarGuidance({ children }: { children: ReactNode }) {
  return (
      <Card title="Commercial control" description="Use controlled commercial data before quoting, ordering, purchasing, and customer dispatch.">
      {children}
    </Card>
  );
}

export function PriceListMasterPage() {
  const { session, user } = useAuth();
  const companyId = user?.activeContext.companyId ?? 1;
  const canSave = hasLiveWrite(session);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draft, setDraft] = useState<PriceListUpsertRequest | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const filter = buildMasterFilter(companyId, user?.activeContext.branchId, search, status);
  const priceListsQuery = useApiQuery(queryKeys.commercial.priceLists(companyId, search, status), () => listPriceLists(session, filter));
  const currenciesQuery = useApiQuery(queryKeys.commercial.currencies(companyId, "", "all"), () => listCommercialCurrencies(session, buildMasterFilter(companyId, null, "", "all")));
  const taxQuery = useApiQuery(queryKeys.commercial.taxCategories(companyId, "", "all"), () => listCommercialTaxCategories(session, buildMasterFilter(companyId, null, "", "all")));
  const itemQuery = useApiQuery(queryKeys.masters.items(companyId, "", "all"), () => listItemMasterSetup(session, buildMasterFilter(companyId, null, "", "all")));
  const itemGroupQuery = useApiQuery(queryKeys.masters.itemGroups(companyId, "", "all"), () => listItemGroupSetup(buildMasterFilter(companyId, null, "", "all")));
  const customerQuery = useApiQuery(queryKeys.partners.customers(companyId, null, "", "all"), () => listCustomerSetup(session, buildMasterFilter(companyId, null, "", "all")));

  const priceLists = priceListsQuery.data ?? [];
  const currencies = currenciesQuery.data ?? [];
  const taxCategories = taxQuery.data ?? [];
  const items = itemQuery.data ?? [];
  const itemGroups = itemGroupQuery.data ?? [];
  const customers = customerQuery.data ?? [];

  const currencyOptions = currencies.map((currency) => ({ label: `${currency.currencyCode} - ${currency.currencyName}`, value: String(currency.id) }));
  const taxOptions = taxCategories.map((tax) => ({ label: `${tax.taxCategoryCode} - ${tax.taxCategoryName}`, value: String(tax.id) }));
  const itemOptions = items.map((item) => ({ label: `${item.code} - ${item.name}`, value: String(item.itemId) }));
  const itemGroupOptions = itemGroups.map((group) => ({ label: `${group.code} - ${group.name}`, value: String(group.groupId) }));
  const customerOptions = customers.map((customer) => ({ label: `${customer.code} - ${customer.name}`, value: String(customer.customerId) }));

  const kpis = useMemo(
    () => [
      { label: "Price lists", value: String(priceLists.length), hint: "Commercial setup headers" },
      { label: "Active lists", value: String(priceLists.filter((row) => row.status === "Active").length), hint: "Available for transactions" },
      { label: "Draft lists", value: String(priceLists.filter((row) => row.approvalStatus === "Draft").length), hint: "Needs review before use" },
      { label: "Price lines", value: String(priceLists.reduce((sum, row) => sum + row.lines.length, 0)), hint: "Item or group price rows" },
      { label: "Assignments", value: String(priceLists.reduce((sum, row) => sum + row.assignments.length, 0)), hint: "Customer and segment coverage" }
    ],
    [priceLists]
  );

  const columns: DataGridColumn<PriceListDto>[] = [
    {
      key: "code",
      header: "Price list",
      render: (row) => (
        <div>
          <strong>{row.priceListCode}</strong>
          <p>{row.priceListName}</p>
        </div>
      )
    },
    { key: "type", header: "Type", render: (row) => row.priceListType },
    { key: "currency", header: "Currency", render: (row) => row.currencyCode },
    { key: "effective", header: "Effective", render: (row) => `${row.effectiveFrom}${row.effectiveTo ? ` to ${row.effectiveTo}` : ""}` },
    { key: "lines", header: "Lines", render: (row) => row.lines.length },
    { key: "assignments", header: "Assignments", render: (row) => row.assignments.length },
    { key: "approval", header: "Approval", render: (row) => <ErpStatusChip tone={statusTone(row.approvalStatus)}>{row.approvalStatus}</ErpStatusChip> },
    { key: "status", header: "Status", render: (row) => <ErpStatusChip tone={statusTone(row.status)}>{row.status}</ErpStatusChip> }
  ];

  const openNew = () => {
    setSelectedId(null);
    setDraft(buildPriceListRequest(companyId, currencies, taxCategories, itemGroups, customers));
    setSaveMessage(null);
  };

  const openEdit = (row: PriceListDto) => {
    setSelectedId(row.id);
    setDraft(toPriceListRequest(row));
    setSaveMessage(null);
  };

  const updateLine = (patch: Partial<PriceListUpsertRequest["lines"][number]>) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            lines: [{ ...current.lines[0], ...patch }]
          }
        : current
    );
  };

  const updateAssignment = (patch: Partial<PriceListUpsertRequest["assignments"][number]>) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            assignments: [{ ...current.assignments[0], ...patch }]
          }
        : current
    );
  };

  const validation = draft
    ? [
        !draft.priceListCode ? "Price list code is required." : "",
        !draft.priceListName ? "Price list name is required." : "",
        !draft.currencyId ? "Currency is required." : "",
        draft.lines.some((line) => !line.uomId) ? "Each price line needs a UOM." : "",
        draft.lines.some((line) => line.unitPrice <= 0) ? "Unit price must be greater than zero before activation." : ""
      ].filter(Boolean)
    : [];

  const handleSave = async () => {
    if (!draft || validation.length > 0) {
      return;
    }

    const saved = await savePriceList(session, selectedId, draft);
    setSaveMessage(`Saved ${saved.priceListCode}.`);
    setDraft(toPriceListRequest(saved));
  };

  return (
    <ListPageShell
      actions={
        <ErpActionBar
          primary={[{ label: "New price list", onClick: openNew }]}
          secondary={[{ disabled: true, label: "Request approval", reason: "Approval routing is controlled from the approval workbench." }]}
          testId="price-list-action-bar"
        />
      }
      aside={
        <SidebarGuidance>
          <div className="compact-stack">
            <ErpStatusChip tone="success">Currency controlled</ErpStatusChip>
            <ErpStatusChip tone="success">UOM-aware pricing</ErpStatusChip>
            <ErpStatusChip tone="info">Customer applicability</ErpStatusChip>
          </div>
        </SidebarGuidance>
      }
      description="Maintain governed price headers, UOM-aware price lines, tax category linkage, and customer applicability."
      filters={
        <ErpFilterBar onClear={() => { setSearch(""); setStatus("all"); }} testId="price-list-filter-bar">
          <input aria-label="Search price lists" onChange={(event) => setSearch(event.target.value)} placeholder="Search price lists" value={search} />
          <select aria-label="Price list status" onChange={(event) => setStatus(event.target.value)} value={status}>
            <option value="all">All statuses</option>
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </ErpFilterBar>
      }
      title="Price Lists"
    >
      <KpiStrip items={kpis} />
      <ErpGrid
        ariaLabel="Price lists"
        columns={columns}
        emptyState={{ description: "No price lists match the current filters.", title: "No price lists" }}
        getRowId={(row) => String(row.id)}
        isLoading={priceListsQuery.isLoading}
        onRowSelect={openEdit}
        records={priceLists}
        rowLabel={(row) => row.priceListCode}
        testId="price-list-grid"
      />
      <ErpModalWorkspace
        footer={
          <ErpActionBar
            primary={[{ disabled: !canSave || validation.length > 0, label: "Save Draft", onClick: handleSave, reason: !canSave ? saveReason : validation[0] }]}
            secondary={[{ label: "Close", onClick: () => setDraft(null), variant: "secondary" }]}
          />
        }
        isOpen={Boolean(draft)}
        onClose={() => setDraft(null)}
        statusMeta={
          <div className="context-chip-row">
            <ErpStatusChip tone={statusTone(draft?.status ?? "Draft")}>{draft?.status ?? "Draft"}</ErpStatusChip>
            <ErpStatusChip tone={statusTone(draft?.approvalStatus ?? "Draft")}>{draft?.approvalStatus ?? "Draft"}</ErpStatusChip>
            {saveMessage ? <ErpStatusChip tone="success">{saveMessage}</ErpStatusChip> : null}
          </div>
        }
        title={selectedId ? `Price list ${draft?.priceListCode}` : "New price list draft"}
        validation={<ErpValidationSummary errors={validation} title="Price list checks" />}
      >
        {draft ? (
          <div className="modal-form-grid" data-testid="price-list-modal">
            <Card title="Header" description="Controlled commercial header data.">
              <div className="form-grid form-grid--three">
                {textInput("Price list code", draft.priceListCode, (value) => setDraft({ ...draft, priceListCode: value }))}
                {textInput("Price list name", draft.priceListName, (value) => setDraft({ ...draft, priceListName: value }))}
                <ErpLookupField label="Currency" onChange={(value) => setDraft({ ...draft, currencyId: Number(value) })} options={currencyOptions} required value={String(draft.currencyId || "")} />
                <ErpLookupField label="Price list type" onChange={(value) => setDraft({ ...draft, priceListType: value })} options={priceListTypeOptions} required value={draft.priceListType} />
                {dateInput("Effective from", draft.effectiveFrom, (value) => setDraft({ ...draft, effectiveFrom: value ?? todayIso }))}
                {dateInput("Effective to", draft.effectiveTo, (value) => setDraft({ ...draft, effectiveTo: value }))}
                {textInput("Customer segment", draft.customerSegment, (value) => setDraft({ ...draft, customerSegment: value || null }))}
                <ErpLookupField label="Approval status" onChange={(value) => setDraft({ ...draft, approvalStatus: value })} options={approvalOptions} value={draft.approvalStatus} />
                <ErpLookupField label="Status" onChange={(value) => setDraft({ ...draft, status: value })} options={statusOptions} value={draft.status} />
              </div>
            </Card>
            <Card title="Price line" description="UOM, item, tax category, and discount eligibility.">
              <div className="form-grid form-grid--three">
                {textInput("Line number", draft.lines[0]?.lineNo, (value) => updateLine({ lineNo: Number(value) || 10 }), "number")}
                <ErpLookupField label="Item" onChange={(value) => updateLine({ itemId: toId(value), itemGroupId: null })} options={itemOptions} value={String(draft.lines[0]?.itemId ?? "")} />
                <ErpLookupField label="Item group" onChange={(value) => updateLine({ itemGroupId: toId(value), itemId: null })} options={itemGroupOptions} value={String(draft.lines[0]?.itemGroupId ?? "")} />
                <ErpLookupField label="UOM" onChange={(value) => updateLine({ uomId: Number(value) })} options={uomOptions} required value={String(draft.lines[0]?.uomId ?? "")} />
                {textInput("Minimum quantity", draft.lines[0]?.minQuantity, (value) => updateLine({ minQuantity: Number(value) || 0 }), "number")}
                {textInput("Unit price", draft.lines[0]?.unitPrice, (value) => updateLine({ unitPrice: Number(value) || 0 }), "number")}
                <ErpLookupField label="Tax category" onChange={(value) => updateLine({ taxCategoryId: toId(value) })} options={taxOptions} value={String(draft.lines[0]?.taxCategoryId ?? "")} />
                {dateInput("Line effective from", draft.lines[0]?.effectiveFrom ?? todayIso, (value) => updateLine({ effectiveFrom: value ?? todayIso }))}
                {checkboxInput("Discount eligible", Boolean(draft.lines[0]?.discountEligible), (value) => updateLine({ discountEligible: value }))}
              </div>
            </Card>
            <Card title="Applicability" description="Customer, group, branch, and item-group priority controls.">
              <div className="form-grid form-grid--three">
                <ErpLookupField label="Customer" onChange={(value) => updateAssignment({ customerId: toId(value), customerGroupCode: null })} options={customerOptions} value={String(draft.assignments[0]?.customerId ?? "")} />
                {textInput("Customer group", draft.assignments[0]?.customerGroupCode, (value) => updateAssignment({ customerGroupCode: value || null, customerId: null }))}
                <ErpLookupField label="Item group applicability" onChange={(value) => updateAssignment({ itemGroupId: toId(value) })} options={itemGroupOptions} value={String(draft.assignments[0]?.itemGroupId ?? "")} />
                {textInput("Branch id", draft.assignments[0]?.branchId, (value) => updateAssignment({ branchId: toId(value) }), "number")}
                {textInput("Priority rank", draft.assignments[0]?.priorityRank, (value) => updateAssignment({ priorityRank: Number(value) || 10 }), "number")}
                <ErpLookupField label="Assignment status" onChange={(value) => updateAssignment({ status: value })} options={statusOptions} value={draft.assignments[0]?.status ?? "Draft"} />
              </div>
            </Card>
          </div>
        ) : null}
      </ErpModalWorkspace>
    </ListPageShell>
  );
}

export function DiscountSchemeMasterPage() {
  const { session, user } = useAuth();
  const companyId = user?.activeContext.companyId ?? 1;
  const canSave = hasLiveWrite(session);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [draft, setDraft] = useState<DiscountSchemeUpsertRequest | null>(null);

  const filter = buildMasterFilter(companyId, user?.activeContext.branchId, search, status);
  const discountQuery = useApiQuery(queryKeys.commercial.discountSchemes(companyId, search, status), () => listDiscountSchemes(session, filter));
  const currenciesQuery = useApiQuery(queryKeys.commercial.currencies(companyId, "", "all"), () => listCommercialCurrencies(session, buildMasterFilter(companyId, null, "", "all")));
  const priceListQuery = useApiQuery(queryKeys.commercial.priceLists(companyId, "", "all"), () => listPriceLists(session, buildMasterFilter(companyId, null, "", "all")));
  const itemQuery = useApiQuery(queryKeys.masters.items(companyId, "", "all"), () => listItemMasterSetup(session, buildMasterFilter(companyId, null, "", "all")));
  const itemGroupQuery = useApiQuery(queryKeys.masters.itemGroups(companyId, "", "all"), () => listItemGroupSetup(buildMasterFilter(companyId, null, "", "all")));
  const customerQuery = useApiQuery(queryKeys.partners.customers(companyId, null, "", "all"), () => listCustomerSetup(session, buildMasterFilter(companyId, null, "", "all")));

  const rows = discountQuery.data ?? [];
  const currencies = currenciesQuery.data ?? [];
  const priceLists = priceListQuery.data ?? [];
  const items = itemQuery.data ?? [];
  const itemGroups = itemGroupQuery.data ?? [];
  const customers = customerQuery.data ?? [];

  const currencyOptions = currencies.map((currency) => ({ label: `${currency.currencyCode} - ${currency.currencyName}`, value: String(currency.id) }));
  const priceListOptions = priceLists.map((list) => ({ label: `${list.priceListCode} - ${list.priceListName}`, value: String(list.id) }));
  const itemOptions = items.map((item) => ({ label: `${item.code} - ${item.name}`, value: String(item.itemId) }));
  const itemGroupOptions = itemGroups.map((group) => ({ label: `${group.code} - ${group.name}`, value: String(group.groupId) }));
  const customerOptions = customers.map((customer) => ({ label: `${customer.code} - ${customer.name}`, value: String(customer.customerId) }));

  const columns: DataGridColumn<DiscountSchemeDto>[] = [
    {
      key: "scheme",
      header: "Discount scheme",
      render: (row) => (
        <div>
          <strong>{row.schemeCode}</strong>
          <p>{row.schemeName}</p>
        </div>
      )
    },
    { key: "type", header: "Type", render: (row) => row.discountType },
    { key: "currency", header: "Currency", render: (row) => row.currencyCode ?? "No currency limit" },
    { key: "rules", header: "Rules", render: (row) => row.rules.length },
    { key: "effective", header: "Effective", render: (row) => `${row.effectiveFrom}${row.effectiveTo ? ` to ${row.effectiveTo}` : ""}` },
    { key: "approval", header: "Approval", render: (row) => <ErpStatusChip tone={statusTone(row.approvalStatus)}>{row.approvalStatus}</ErpStatusChip> },
    { key: "status", header: "Status", render: (row) => <ErpStatusChip tone={statusTone(row.status)}>{row.status}</ErpStatusChip> }
  ];

  const validation = draft
    ? [
        !draft.schemeCode ? "Discount scheme code is required." : "",
        !draft.schemeName ? "Discount scheme name is required." : "",
        !draft.discountType ? "Discount type is required." : "",
        draft.rules.some((rule) => !rule.discountPercent && !rule.discountAmount) ? "Each rule requires a discount percentage or amount." : ""
      ].filter(Boolean)
    : [];

  const updateRule = (patch: Partial<DiscountSchemeUpsertRequest["rules"][number]>) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            rules: [{ ...current.rules[0], ...patch }]
          }
        : current
    );
  };

  const handleSave = async () => {
    if (!draft || validation.length > 0) {
      return;
    }

    const saved = await saveDiscountScheme(session, selectedId, draft);
    setSelectedId(saved.id);
    setDraft(toDiscountRequest(saved));
  };

  return (
    <ListPageShell
      actions={<ErpActionBar primary={[{ label: "New discount scheme", onClick: () => { setSelectedId(null); setDraft(buildDiscountRequest(companyId, currencies, priceLists)); } }]} testId="discount-action-bar" />}
      aside={
        <SidebarGuidance>
          <div className="compact-stack">
            <ErpStatusChip tone="success">Breaks controlled</ErpStatusChip>
            <ErpStatusChip tone="info">Approval-aware</ErpStatusChip>
            <ErpStatusChip tone="info">Price-list linkage</ErpStatusChip>
          </div>
        </SidebarGuidance>
      }
      description="Maintain governed discount schemes, quantity breaks, applicability rules, and price-list references."
      filters={
        <ErpFilterBar onClear={() => { setSearch(""); setStatus("all"); }} testId="discount-filter-bar">
          <input aria-label="Search discount schemes" onChange={(event) => setSearch(event.target.value)} placeholder="Search discount schemes" value={search} />
          <select aria-label="Discount status" onChange={(event) => setStatus(event.target.value)} value={status}>
            <option value="all">All statuses</option>
            {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </ErpFilterBar>
      }
      title="Discount Schemes"
    >
      <KpiStrip
        items={[
          { label: "Schemes", value: String(rows.length), hint: "Discount headers" },
          { label: "Active", value: String(rows.filter((row) => row.status === "Active").length), hint: "Available setup" },
          { label: "Rules", value: String(rows.reduce((sum, row) => sum + row.rules.length, 0)), hint: "Break and applicability rows" },
          { label: "Approval pending", value: String(rows.filter((row) => row.approvalStatus !== "Approved").length), hint: "Needs review" }
        ]}
      />
      <ErpGrid
        ariaLabel="Discount schemes"
        columns={columns}
        emptyState={{ description: "No discount schemes match the current filters.", title: "No discount schemes" }}
        getRowId={(row) => String(row.id)}
        isLoading={discountQuery.isLoading}
        onRowSelect={(row) => { setSelectedId(row.id); setDraft(toDiscountRequest(row)); }}
        records={rows}
        rowLabel={(row) => row.schemeCode}
        testId="discount-grid"
      />
      <ErpModalWorkspace
        footer={<ErpActionBar primary={[{ disabled: !canSave || validation.length > 0, label: "Save Draft", onClick: handleSave, reason: !canSave ? saveReason : validation[0] }]} secondary={[{ label: "Close", onClick: () => setDraft(null) }]} />}
        isOpen={Boolean(draft)}
        onClose={() => setDraft(null)}
        statusMeta={<ErpStatusChip tone={statusTone(draft?.approvalStatus ?? "Draft")}>{draft?.approvalStatus ?? "Draft"}</ErpStatusChip>}
        title={selectedId ? `Discount scheme ${draft?.schemeCode}` : "New discount scheme draft"}
        validation={<ErpValidationSummary errors={validation} title="Discount scheme checks" />}
      >
        {draft ? (
          <div className="modal-form-grid" data-testid="discount-modal">
            <Card title="Header" description="Discount ownership, dates, currency, and approval state.">
              <div className="form-grid form-grid--three">
                {textInput("Scheme code", draft.schemeCode, (value) => setDraft({ ...draft, schemeCode: value }))}
                {textInput("Scheme name", draft.schemeName, (value) => setDraft({ ...draft, schemeName: value }))}
                <ErpLookupField label="Discount type" onChange={(value) => setDraft({ ...draft, discountType: value })} options={discountTypeOptions} required value={draft.discountType} />
                <ErpLookupField label="Currency" onChange={(value) => setDraft({ ...draft, currencyId: toId(value) })} options={currencyOptions} value={String(draft.currencyId ?? "")} />
                {dateInput("Effective from", draft.effectiveFrom, (value) => setDraft({ ...draft, effectiveFrom: value ?? todayIso }))}
                {dateInput("Effective to", draft.effectiveTo, (value) => setDraft({ ...draft, effectiveTo: value }))}
                <ErpLookupField label="Approval status" onChange={(value) => setDraft({ ...draft, approvalStatus: value })} options={approvalOptions} value={draft.approvalStatus} />
                <ErpLookupField label="Status" onChange={(value) => setDraft({ ...draft, status: value })} options={statusOptions} value={draft.status} />
                {checkboxInput("Approval required", draft.requiresApproval, (value) => setDraft({ ...draft, requiresApproval: value }))}
              </div>
            </Card>
            <Card title="Discount rule" description="Controlled applicability and break setup.">
              <div className="form-grid form-grid--three">
                {textInput("Rule number", draft.rules[0]?.ruleNo, (value) => updateRule({ ruleNo: Number(value) || 10 }), "number")}
                {textInput("Rule name", draft.rules[0]?.ruleName, (value) => updateRule({ ruleName: value }))}
                <ErpLookupField label="Applicability type" onChange={(value) => updateRule({ applicabilityType: value })} options={applicabilityOptions} required value={draft.rules[0]?.applicabilityType ?? "Item"} />
                <ErpLookupField label="Customer" onChange={(value) => updateRule({ customerId: toId(value), customerGroupCode: null })} options={customerOptions} value={String(draft.rules[0]?.customerId ?? "")} />
                {textInput("Customer group", draft.rules[0]?.customerGroupCode, (value) => updateRule({ customerGroupCode: value || null, customerId: null }))}
                <ErpLookupField label="Item" onChange={(value) => updateRule({ itemId: toId(value), itemGroupId: null })} options={itemOptions} value={String(draft.rules[0]?.itemId ?? "")} />
                <ErpLookupField label="Item group" onChange={(value) => updateRule({ itemGroupId: toId(value), itemId: null })} options={itemGroupOptions} value={String(draft.rules[0]?.itemGroupId ?? "")} />
                {textInput("Minimum quantity", draft.rules[0]?.minQuantity, (value) => updateRule({ minQuantity: Number(value) || 0 }), "number")}
                {textInput("Discount percent", draft.rules[0]?.discountPercent, (value) => updateRule({ discountPercent: value ? Number(value) : null }), "number")}
                {textInput("Discount amount", draft.rules[0]?.discountAmount, (value) => updateRule({ discountAmount: value ? Number(value) : null }), "number")}
                <ErpLookupField label="Price list" onChange={(value) => updateRule({ priceListId: toId(value) })} options={priceListOptions} value={String(draft.rules[0]?.priceListId ?? "")} />
                <ErpLookupField label="Rule status" onChange={(value) => updateRule({ status: value })} options={statusOptions} value={draft.rules[0]?.status ?? "Draft"} />
              </div>
            </Card>
          </div>
        ) : null}
      </ErpModalWorkspace>
    </ListPageShell>
  );
}

export function TaxCurrencyTermsPage() {
  const { session, user } = useAuth();
  const companyId = user?.activeContext.companyId ?? 1;
  const canSave = hasLiveWrite(session);
  const [search, setSearch] = useState("");
  const [activeKind, setActiveKind] = useState<CommercialSetupKind | null>(null);
  const [currencyDraft, setCurrencyDraft] = useState<CurrencyUpsertRequest | null>(null);
  const [rateDraft, setRateDraft] = useState<ExchangeRateSetupUpsertRequest | null>(null);
  const [taxDraft, setTaxDraft] = useState<TaxCategoryUpsertRequest | null>(null);
  const [paymentDraft, setPaymentDraft] = useState<PaymentTermUpsertRequest | null>(null);
  const [tradeDraft, setTradeDraft] = useState<TradeTermUpsertRequest | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const filter = buildMasterFilter(companyId, null, search, "all");
  const currenciesQuery = useApiQuery(queryKeys.commercial.currencies(companyId, search, "all"), () => listCommercialCurrencies(session, filter));
  const ratesQuery = useApiQuery(queryKeys.commercial.exchangeRates(companyId, search, "all"), () => listCommercialExchangeRates(session, filter));
  const taxQuery = useApiQuery(queryKeys.commercial.taxCategories(companyId, search, "all"), () => listCommercialTaxCategories(session, filter));
  const paymentQuery = useApiQuery(queryKeys.commercial.paymentTerms(companyId, search, "all"), () => listCommercialPaymentTerms(session, filter));
  const tradeQuery = useApiQuery(queryKeys.commercial.tradeTerms(companyId, search, "all"), () => listCommercialTradeTerms(session, filter));

  const currencies = currenciesQuery.data ?? [];
  const rates = ratesQuery.data ?? [];
  const taxes = taxQuery.data ?? [];
  const payments = paymentQuery.data ?? [];
  const trades = tradeQuery.data ?? [];
  const currencyOptions = currencies.map((currency) => ({ label: `${currency.currencyCode} - ${currency.currencyName}`, value: String(currency.id) }));

  const closeModal = () => {
    setActiveKind(null);
    setSelectedId(null);
    setCurrencyDraft(null);
    setRateDraft(null);
    setTaxDraft(null);
    setPaymentDraft(null);
    setTradeDraft(null);
  };

  const openNew = (kind: CommercialSetupKind) => {
    setSelectedId(null);
    setActiveKind(kind);
    if (kind === "currency") {
      setCurrencyDraft({ companyId, currencyCode: "NEW", currencyName: "New currency", symbol: null, decimalPrecision: 2, roundingMode: "HalfUp", isBaseCurrency: false, status: "Draft" });
    } else if (kind === "rate") {
      setRateDraft({ companyId, currencyId: currencies[0]?.id ?? 0, rateType: "Manual", rateSource: "Finance table", manualRate: null, effectiveFrom: todayIso, effectiveTo: null, status: "Draft" });
    } else if (kind === "tax") {
      setTaxDraft({
        companyId,
        taxCategoryCode: "NEW-TAX",
        taxCategoryName: "New tax category",
        taxScope: "Domestic sale",
        defaultRatePercent: 0,
        isRecoverable: true,
        status: "Draft",
        taxCodes: [{ taxCode: "NEW-TAX-CODE", taxCodeName: "New tax code", ratePercent: 0, effectiveFrom: todayIso, effectiveTo: null, status: "Draft" }]
      });
    } else if (kind === "payment") {
      setPaymentDraft({ companyId, paymentTermsCode: "NEW-TERM", paymentTermsName: "New payment term", netDays: 0, discountDays: null, discountPercent: null, dueCalculationMode: "InvoiceDate", status: "Draft" });
    } else {
      setTradeDraft({ companyId, tradeTermsCode: "NEW-TRADE", tradeTermsName: "New trade term", tradeMode: "Domestic dispatch", responsibilitySummary: "", status: "Draft" });
    }
  };

  const handleSave = async () => {
    if (activeKind === "currency" && currencyDraft) {
      await saveCurrency(session, selectedId, currencyDraft);
    } else if (activeKind === "rate" && rateDraft) {
      await saveExchangeRate(session, selectedId, rateDraft);
    } else if (activeKind === "tax" && taxDraft) {
      await saveTaxCategory(session, selectedId, taxDraft);
    } else if (activeKind === "payment" && paymentDraft) {
      await savePaymentTerm(session, selectedId, paymentDraft);
    } else if (activeKind === "trade" && tradeDraft) {
      await saveTradeTerm(session, selectedId, tradeDraft);
    }
  };

  const currencyColumns: DataGridColumn<CurrencyDto>[] = [
    { key: "code", header: "Currency", render: (row) => <strong>{row.currencyCode}</strong> },
    { key: "name", header: "Name", render: (row) => row.currencyName },
    { key: "precision", header: "Precision", render: (row) => row.decimalPrecision },
    { key: "base", header: "Base", render: (row) => (row.isBaseCurrency ? <ErpStatusChip tone="success">Base currency</ErpStatusChip> : <ErpStatusChip>Additional</ErpStatusChip>) },
    { key: "status", header: "Status", render: (row) => <ErpStatusChip tone={statusTone(row.status)}>{row.status}</ErpStatusChip> }
  ];

  const taxColumns: DataGridColumn<TaxCategoryDto>[] = [
    { key: "code", header: "Tax category", render: (row) => <strong>{row.taxCategoryCode}</strong> },
    { key: "name", header: "Name", render: (row) => row.taxCategoryName },
    { key: "scope", header: "Scope", render: (row) => row.taxScope },
    { key: "rate", header: "Default rate", render: (row) => `${row.defaultRatePercent}%` },
    { key: "codes", header: "Codes", render: (row) => row.taxCodes.length },
    { key: "status", header: "Status", render: (row) => <ErpStatusChip tone={statusTone(row.status)}>{row.status}</ErpStatusChip> }
  ];

  return (
    <ListPageShell
      actions={
        <ErpActionBar
          primary={[{ label: "New currency", onClick: () => openNew("currency") }, { label: "New tax category", onClick: () => openNew("tax") }]}
          secondary={[{ label: "New payment term", onClick: () => openNew("payment") }, { label: "New trade term", onClick: () => openNew("trade") }, { label: "New rate setup", onClick: () => openNew("rate") }]}
          testId="tax-currency-action-bar"
        />
      }
      aside={
        <SidebarGuidance>
          <div className="compact-stack">
            <ErpStatusChip tone="success">Tax controlled</ErpStatusChip>
            <ErpStatusChip tone="success">Currency lookup</ErpStatusChip>
            <ErpStatusChip tone="info">Terms reusable</ErpStatusChip>
          </div>
        </SidebarGuidance>
      }
        description="Maintain tax categories, currency setup, exchange-rate controls, payment terms, and trade terms from one controlled setup page."
      filters={
        <ErpFilterBar onClear={() => setSearch("")} testId="tax-currency-filter-bar">
          <input aria-label="Search commercial setup" onChange={(event) => setSearch(event.target.value)} placeholder="Search setup" value={search} />
        </ErpFilterBar>
      }
      title="Tax, Currency & Terms"
    >
      <KpiStrip
        items={[
          { label: "Currencies", value: String(currencies.length), hint: "Monetary setup" },
          { label: "Tax categories", value: String(taxes.length), hint: "Tax calculation controls" },
          { label: "Payment terms", value: String(payments.length), hint: "Customer and supplier terms" },
          { label: "Trade terms", value: String(trades.length), hint: "Delivery responsibility setup" },
          { label: "Rate setups", value: String(rates.length), hint: "Manual or governed exchange rates" }
        ]}
      />
      <div className="modal-form-grid">
        <Card title="Currency setup" description="Controlled money setup for price lists, discounts, and commercial terms.">
          <ErpGrid ariaLabel="Currencies" columns={currencyColumns} emptyState={{ description: "No currency setup is available.", title: "No currencies" }} getRowId={(row) => String(row.id)} onRowSelect={(row) => { setSelectedId(row.id); setActiveKind("currency"); setCurrencyDraft({ ...row }); }} records={currencies} testId="currency-grid" />
        </Card>
        <Card title="Tax setup" description="Tax categories and codes used by price lines and transactions.">
          <ErpGrid ariaLabel="Tax categories" columns={taxColumns} emptyState={{ description: "No tax category setup is available.", title: "No tax categories" }} getRowId={(row) => String(row.id)} onRowSelect={(row) => { setSelectedId(row.id); setActiveKind("tax"); setTaxDraft({ ...row, taxCodes: row.taxCodes }); }} records={taxes} testId="tax-grid" />
        </Card>
        <Card title="Payment and trade terms" description="Reusable commercial terms for customers and suppliers.">
          <div className="compact-list">
            {payments.map((term) => (
              <button className="compact-list__row" key={term.id} onClick={() => { setSelectedId(term.id); setActiveKind("payment"); setPaymentDraft({ ...term }); }} type="button">
                <strong>{term.paymentTermsCode}</strong>
                <span>{term.paymentTermsName}</span>
                <ErpStatusChip tone={statusTone(term.status)}>{term.status}</ErpStatusChip>
              </button>
            ))}
            {trades.map((term) => (
              <button className="compact-list__row" key={term.id} onClick={() => { setSelectedId(term.id); setActiveKind("trade"); setTradeDraft({ ...term }); }} type="button">
                <strong>{term.tradeTermsCode}</strong>
                <span>{term.tradeTermsName}</span>
                <ErpStatusChip tone={statusTone(term.status)}>{term.status}</ErpStatusChip>
              </button>
            ))}
            {payments.length === 0 && trades.length === 0 ? <ErpEmptyState description="No payment or trade terms match the current search." title="No terms" /> : null}
          </div>
        </Card>
        <Card title="Exchange-rate setup" description="Manual or governed exchange-rate source settings.">
          <div className="compact-list">
            {rates.map((rate) => (
              <button className="compact-list__row" key={rate.id} onClick={() => { setSelectedId(rate.id); setActiveKind("rate"); setRateDraft({ ...rate }); }} type="button">
                <strong>{rate.currencyCode}</strong>
                <span>{rate.rateType} / {rate.rateSource}</span>
                <span>{rate.manualRate ? formatMoney(rate.manualRate, "INR") : "No manual rate"}</span>
              </button>
            ))}
            {rates.length === 0 ? <ErpEmptyState description="No exchange-rate setup matches the current search." title="No rate setup" /> : null}
          </div>
        </Card>
      </div>
      <ErpModalWorkspace
        footer={<ErpActionBar primary={[{ disabled: !canSave, label: "Save Setup", onClick: handleSave, reason: !canSave ? saveReason : undefined }]} secondary={[{ label: "Close", onClick: closeModal }]} />}
        isOpen={Boolean(activeKind)}
        onClose={closeModal}
        title={activeKind ? `Commercial ${activeKind} setup` : "Commercial setup"}
      >
        <div className="modal-form-grid" data-testid="commercial-setup-modal">
          {activeKind === "currency" && currencyDraft ? (
            <Card title="Currency" description="Code, precision, and rounding control.">
              <div className="form-grid form-grid--three">
                {textInput("Currency code", currencyDraft.currencyCode, (value) => setCurrencyDraft({ ...currencyDraft, currencyCode: value }))}
                {textInput("Currency name", currencyDraft.currencyName, (value) => setCurrencyDraft({ ...currencyDraft, currencyName: value }))}
                {textInput("Symbol", currencyDraft.symbol, (value) => setCurrencyDraft({ ...currencyDraft, symbol: value || null }))}
                {textInput("Decimal precision", currencyDraft.decimalPrecision, (value) => setCurrencyDraft({ ...currencyDraft, decimalPrecision: Number(value) || 0 }), "number")}
                <ErpLookupField label="Rounding mode" onChange={(value) => setCurrencyDraft({ ...currencyDraft, roundingMode: value })} options={roundingOptions} value={currencyDraft.roundingMode} />
                <ErpLookupField label="Status" onChange={(value) => setCurrencyDraft({ ...currencyDraft, status: value })} options={statusOptions} value={currencyDraft.status} />
                {checkboxInput("Base currency", currencyDraft.isBaseCurrency, (value) => setCurrencyDraft({ ...currencyDraft, isBaseCurrency: value }))}
              </div>
            </Card>
          ) : null}
          {activeKind === "rate" && rateDraft ? (
            <Card title="Exchange-rate source" description="Rate source and effective date setup.">
              <div className="form-grid form-grid--three">
                <ErpLookupField label="Currency" onChange={(value) => setRateDraft({ ...rateDraft, currencyId: Number(value) })} options={currencyOptions} value={String(rateDraft.currencyId || "")} />
                <ErpLookupField label="Rate type" onChange={(value) => setRateDraft({ ...rateDraft, rateType: value })} options={rateTypeOptions} value={rateDraft.rateType} />
                <ErpLookupField label="Rate source" onChange={(value) => setRateDraft({ ...rateDraft, rateSource: value })} options={rateSourceOptions} value={rateDraft.rateSource} />
                {textInput("Manual rate", rateDraft.manualRate, (value) => setRateDraft({ ...rateDraft, manualRate: value ? Number(value) : null }), "number")}
                {dateInput("Effective from", rateDraft.effectiveFrom, (value) => setRateDraft({ ...rateDraft, effectiveFrom: value ?? todayIso }))}
                {dateInput("Effective to", rateDraft.effectiveTo, (value) => setRateDraft({ ...rateDraft, effectiveTo: value }))}
                <ErpLookupField label="Status" onChange={(value) => setRateDraft({ ...rateDraft, status: value })} options={statusOptions} value={rateDraft.status} />
              </div>
            </Card>
          ) : null}
          {activeKind === "tax" && taxDraft ? (
            <Card title="Tax category" description="Category, scope, and primary tax code.">
              <div className="form-grid form-grid--three">
                {textInput("Tax category code", taxDraft.taxCategoryCode, (value) => setTaxDraft({ ...taxDraft, taxCategoryCode: value }))}
                {textInput("Tax category name", taxDraft.taxCategoryName, (value) => setTaxDraft({ ...taxDraft, taxCategoryName: value }))}
                <ErpLookupField label="Tax scope" onChange={(value) => setTaxDraft({ ...taxDraft, taxScope: value })} options={taxScopeOptions} value={taxDraft.taxScope} />
                {textInput("Default rate percent", taxDraft.defaultRatePercent, (value) => setTaxDraft({ ...taxDraft, defaultRatePercent: Number(value) || 0 }), "number")}
                {checkboxInput("Recoverable tax", taxDraft.isRecoverable, (value) => setTaxDraft({ ...taxDraft, isRecoverable: value }))}
                <ErpLookupField label="Status" onChange={(value) => setTaxDraft({ ...taxDraft, status: value })} options={statusOptions} value={taxDraft.status} />
                {textInput("Tax code", taxDraft.taxCodes[0]?.taxCode, (value) => setTaxDraft({ ...taxDraft, taxCodes: [{ ...taxDraft.taxCodes[0], taxCode: value }] }))}
                {textInput("Tax code name", taxDraft.taxCodes[0]?.taxCodeName, (value) => setTaxDraft({ ...taxDraft, taxCodes: [{ ...taxDraft.taxCodes[0], taxCodeName: value }] }))}
                {textInput("Tax code rate", taxDraft.taxCodes[0]?.ratePercent, (value) => setTaxDraft({ ...taxDraft, taxCodes: [{ ...taxDraft.taxCodes[0], ratePercent: Number(value) || 0 }] }), "number")}
              </div>
            </Card>
          ) : null}
          {activeKind === "payment" && paymentDraft ? (
            <Card title="Payment term" description="Due calculation and discount terms.">
              <div className="form-grid form-grid--three">
                {textInput("Payment terms code", paymentDraft.paymentTermsCode, (value) => setPaymentDraft({ ...paymentDraft, paymentTermsCode: value }))}
                {textInput("Payment terms name", paymentDraft.paymentTermsName, (value) => setPaymentDraft({ ...paymentDraft, paymentTermsName: value }))}
                {textInput("Net days", paymentDraft.netDays, (value) => setPaymentDraft({ ...paymentDraft, netDays: Number(value) || 0 }), "number")}
                {textInput("Discount days", paymentDraft.discountDays, (value) => setPaymentDraft({ ...paymentDraft, discountDays: value ? Number(value) : null }), "number")}
                {textInput("Discount percent", paymentDraft.discountPercent, (value) => setPaymentDraft({ ...paymentDraft, discountPercent: value ? Number(value) : null }), "number")}
                <ErpLookupField label="Due calculation" onChange={(value) => setPaymentDraft({ ...paymentDraft, dueCalculationMode: value })} options={dueModeOptions} value={paymentDraft.dueCalculationMode} />
                <ErpLookupField label="Status" onChange={(value) => setPaymentDraft({ ...paymentDraft, status: value })} options={statusOptions} value={paymentDraft.status} />
              </div>
            </Card>
          ) : null}
          {activeKind === "trade" && tradeDraft ? (
            <Card title="Trade term" description="Delivery responsibility and commercial term usage.">
              <div className="form-grid form-grid--three">
                {textInput("Trade terms code", tradeDraft.tradeTermsCode, (value) => setTradeDraft({ ...tradeDraft, tradeTermsCode: value }))}
                {textInput("Trade terms name", tradeDraft.tradeTermsName, (value) => setTradeDraft({ ...tradeDraft, tradeTermsName: value }))}
                <ErpLookupField label="Trade mode" onChange={(value) => setTradeDraft({ ...tradeDraft, tradeMode: value })} options={tradeModeOptions} value={tradeDraft.tradeMode} />
                {textInput("Responsibility summary", tradeDraft.responsibilitySummary, (value) => setTradeDraft({ ...tradeDraft, responsibilitySummary: value || null }))}
                <ErpLookupField label="Status" onChange={(value) => setTradeDraft({ ...tradeDraft, status: value })} options={statusOptions} value={tradeDraft.status} />
              </div>
            </Card>
          ) : null}
        </div>
      </ErpModalWorkspace>
    </ListPageShell>
  );
}
