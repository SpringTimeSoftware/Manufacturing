import { startTransition, useDeferredValue, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { BlanketOrderUpsertRequest, DemandForecastUpsertRequest, MasterProductionScheduleUpsertRequest, QuoteDto, QuoteUpsertRequest, SalesOrderDto, SalesOrderUpsertRequest, SupplierLeadTimeUpsertRequest } from "../api/contracts";
import { apiClient } from "../api/http";
import { queryKeys, useApiMutation, useApiQuery } from "../api/hooks";
import { hasLiveSession } from "../api/liveData";
import { useAuth } from "../auth/AuthContext";
import {
  listAttachmentViewerSetup,
  listAvailablePromiseSetup,
  listBlanketOrderSetup,
  listDemandForecastSetup,
  listMpsPlannerSetup,
  listQuoteSetup,
  listSalesOrderSetup,
  saveMpsDraft,
  saveQuoteDraft,
  type AttachmentViewerItem,
  type AvailablePromiseItem,
  type BlanketOrderSetupItem,
  type DemandForecastSetupItem,
  type MpsPlannerItem,
  type QuoteSetupItem,
  type SalesOrderSetupItem
} from "../commercial/commercialPlanningAdapters";
import {
  buildMasterFilter,
  listSupplierLeadTimeSetup,
  type MasterDataSource,
  type SupplierLeadTimeSetupItem
} from "../masters/masterDataAdapters";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import { DataGrid, type DataGridColumn } from "../ui/DataGrid";
import { EmptyState } from "../ui/EmptyState";
import {
  ErpActionBar,
  ErpDecimalField,
  ErpFileActionState,
  ErpFilterBar,
  ErpGrid,
  ErpLookupField,
  ErpMoneyField,
  ErpModalWorkspace,
  ErpNumberField,
  ErpStatusChip,
  ErpTransactionLineGrid,
  ErpTransactionTotalsPanel,
  ErpValidationSummary
} from "../ui/ErpComponents";
import { FilterBar } from "../ui/FilterBar";
import { FormShell } from "../ui/FormShell";
import { ListPageShell } from "../ui/ListPageShell";
import { Tile } from "../ui/Tile";
import { KpiStrip } from "../ui/boards";

function SourceBadge({ source }: { source: MasterDataSource }) {
  const tone = source === "Live" ? "success" : source === "Deferred" ? "info" : "neutral";
  return <ErpStatusChip tone={tone}>{source === "Live" ? "Setup complete" : "Readiness view"}</ErpStatusChip>;
}

function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone = normalized.includes("risk") || normalized.includes("review")
    ? "danger"
    : normalized.includes("draft")
      ? "warn"
      : normalized.includes("approved") || normalized.includes("active") || normalized.includes("firm") || normalized.includes("promise")
        ? "success"
        : "info";

  return <ErpStatusChip tone={tone}>{status}</ErpStatusChip>;
}

function dateControlValue(value: string | null | undefined) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function WorkbenchAside({
  description,
  source
}: {
  description: string;
  endpoint: string;
  source: MasterDataSource;
}) {
  return (
    <Card title="Planning guidance" description={description}>
      <div className="notification-item">
        <strong>Planning records</strong>
        <p>Review the records available for this planning area before taking the next action.</p>
        <div className="context-chip-row">
          <SourceBadge source={source} />
          <Badge tone="info">Ready for review</Badge>
        </div>
      </div>
    </Card>
  );
}

const leadTimeColumns: DataGridColumn<SupplierLeadTimeSetupItem>[] = [
  { key: "item", header: "Item / group", render: (record) => <strong>{record.itemLabel}</strong> },
  { key: "supplier", header: "Supplier", width: "16%", render: (record) => `Supplier ${record.supplierId}` },
  { key: "days", header: "Lead time", width: "14%", render: (record) => `${record.leadTimeDays} days` },
  { key: "policy", header: "Order policy", width: "22%", render: (record) => record.orderPolicy },
  {
    key: "route",
    header: "Route",
    width: "14%",
    render: (record) => <ErpStatusChip tone={record.isSubcontractLeadTime ? "info" : "neutral"}>{record.isSubcontractLeadTime ? "Subcontract" : "Purchase"}</ErpStatusChip>
  },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

const attachmentColumns: DataGridColumn<AttachmentViewerItem>[] = [
  { key: "document", header: "Document", width: "22%", render: (record) => <strong>{record.documentNo}</strong> },
  {
    key: "file",
    header: "Attachment",
    render: (record) => (
      <div>
        <strong>{record.fileName}</strong>
        <div className="muted">{record.fileType} / {record.fileSize}</div>
      </div>
    )
  },
  { key: "linked", header: "Linked to", width: "20%", render: (record) => record.linkedDocument },
  { key: "uploaded", header: "Uploaded", width: "16%", render: (record) => record.uploadedOn },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

const quoteColumns: DataGridColumn<QuoteSetupItem>[] = [
  { key: "quote", header: "Quote", width: "18%", render: (record) => <strong>{record.quoteNo}</strong> },
  {
    key: "customer",
    header: "Customer / spec",
    render: (record) => (
      <div>
        <strong>{record.customerLabel}</strong>
        <div className="muted">{record.specRef}</div>
      </div>
    )
  },
  { key: "date", header: "Dates", width: "20%", render: (record) => `${record.quoteDate} / ${record.expiryDate}` },
  { key: "qty", header: "Lines / qty", width: "14%", render: (record) => `${record.lineCount} / ${record.totalQuantity}` },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

const salesOrderColumns: DataGridColumn<SalesOrderSetupItem>[] = [
  { key: "order", header: "Order", width: "18%", render: (record) => <strong>{record.salesOrderNo}</strong> },
  {
    key: "customer",
    header: "Demand",
    render: (record) => (
      <div>
        <strong>{record.customerLabel}</strong>
        <div className="muted">Source: {record.sourceQuoteLabel}</div>
      </div>
    )
  },
  { key: "promise", header: "Promise", width: "18%", render: (record) => record.promisedDate },
  { key: "qty", header: "Lines / qty", width: "14%", render: (record) => `${record.lineCount} / ${record.totalQuantity}` },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function addDaysIso(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function toOption(value: string) {
  return { label: value, value };
}

function numberValue(value: string) {
  if (!value) {
    return 0;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function directoryUserNumericId(value: string) {
  const match = value.match(/\d+$/);
  return match ? Number(match[0]) : 0;
}

function optionList<T>(items: T[] | undefined, getValue: (item: T) => number, getLabel: (item: T) => string) {
  return (items ?? []).map((item) => ({ label: getLabel(item), value: String(getValue(item)) }));
}

type CommercialSnapshotMeta = {
  subtotalAmount?: number;
  discountTotalAmount?: number;
  taxableAmount?: number;
  taxTotalAmount?: number;
  grandTotalAmount?: number;
  commercialStatus?: string;
  revisionNo?: number;
  releasedAt?: string | null;
  releasedByUserId?: number | null;
  convertedAt?: string | null;
  convertedByUserId?: number | null;
  sourceQuoteRevisionNo?: number | null;
  sourceQuoteVersionNo?: number | null;
  legacyCommercialIncomplete?: boolean;
};

type QuoteDraftState = QuoteUpsertRequest & CommercialSnapshotMeta;
type SalesOrderDraftState = SalesOrderUpsertRequest & CommercialSnapshotMeta;

function buildDraftQuoteNo() {
  const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 12);
  return `QT-DRAFT-${stamp}`;
}

function buildQuoteDraft(companyId: number, branchId: number): QuoteDraftState {
  const initialLine = buildQuoteDraftLine(10);

  return {
    companyId,
    branchId,
    quoteNo: buildDraftQuoteNo(),
    customerId: 0,
    customerAddressId: null,
    quoteDate: todayIso(),
    expiryDate: addDaysIso(30),
    priorityCode: "Medium",
    status: "Draft",
    customerSpecRef: "",
    salesOwnerUserId: null,
    salesOwnerName: null,
    internalRemarks: "",
    customerFacingRemarks: "",
    printRemarks: "",
    paymentTermsId: null,
    priceListId: null,
    discountSchemeId: null,
    taxCategoryId: null,
    taxTreatment: null,
    currencyId: null,
    exchangeRateId: null,
    exchangeRateSnapshot: null,
    tradeTermsId: null,
    freightAmount: 0,
    packingAmount: 0,
    insuranceAmount: 0,
    otherChargesAmount: 0,
    addLessAmount: 0,
    roundOffAmount: 0,
    commercialStatus: "Draft",
    revisionNo: 1,
    lines: [initialLine]
  };
}

function buildQuoteDraftLine(lineNo: number): QuoteUpsertRequest["lines"][number] {
  return {
    lineNo,
    itemId: 0,
    itemVariantId: null,
    orderUomId: 0,
    quantity: 1,
    unitPrice: 0,
    discountPercent: 0,
    taxPercent: 0,
    priceSourceType: "Manual",
    priceListLineId: null,
    discountSchemeId: null,
    discountRuleId: null,
    discountAmount: 0,
    taxCodeId: null,
    taxRateSnapshot: null,
    lineInternalRemarks: "",
    lineCustomerFacingRemarks: "",
    overrideReason: "",
    makeType: "Make",
    promisedDate: addDaysIso(14),
    priorityCode: "Medium",
    customerSpecRef: "",
    status: "Draft"
  };
}

function toQuoteDraft(dto: QuoteDto): QuoteDraftState {
  return {
    companyId: dto.companyId,
    branchId: dto.branchId,
    quoteNo: dto.quoteNo,
    customerId: dto.customerId,
    customerAddressId: dto.customerAddressId,
    quoteDate: dto.quoteDate,
    expiryDate: dto.expiryDate,
    priorityCode: dto.priorityCode,
    status: dto.status,
    customerSpecRef: dto.customerSpecRef ?? "",
    salesOwnerUserId: dto.salesOwnerUserId ?? null,
    salesOwnerName: dto.salesOwnerName ?? null,
    internalRemarks: dto.internalRemarks ?? "",
    customerFacingRemarks: dto.customerFacingRemarks ?? "",
    printRemarks: dto.printRemarks ?? "",
    paymentTermsId: dto.paymentTermsId ?? null,
    priceListId: dto.priceListId ?? null,
    discountSchemeId: dto.discountSchemeId ?? null,
    taxCategoryId: dto.taxCategoryId ?? null,
    taxTreatment: dto.taxTreatment ?? "Taxable",
    currencyId: dto.currencyId ?? null,
    exchangeRateId: dto.exchangeRateId ?? null,
    exchangeRateSnapshot: dto.exchangeRateSnapshot ?? null,
    tradeTermsId: dto.tradeTermsId ?? null,
    freightAmount: dto.freightAmount ?? 0,
    packingAmount: dto.packingAmount ?? 0,
    insuranceAmount: dto.insuranceAmount ?? 0,
    otherChargesAmount: dto.otherChargesAmount ?? 0,
    addLessAmount: dto.addLessAmount ?? 0,
    roundOffAmount: dto.roundOffAmount ?? 0,
    commercialStatus: dto.commercialStatus ?? dto.status,
    revisionNo: dto.revisionNo ?? 1,
    releasedAt: dto.releasedAt ?? null,
    releasedByUserId: dto.releasedByUserId ?? null,
    convertedAt: dto.convertedAt ?? null,
    convertedByUserId: dto.convertedByUserId ?? null,
    legacyCommercialIncomplete: dto.legacyCommercialIncomplete ?? false,
    subtotalAmount: dto.subtotalAmount ?? 0,
    discountTotalAmount: dto.discountTotalAmount ?? 0,
    taxableAmount: dto.taxableAmount ?? 0,
    taxTotalAmount: dto.taxTotalAmount ?? 0,
    grandTotalAmount: dto.grandTotalAmount ?? 0,
    lines: dto.lines.map((line) => ({
      lineNo: line.lineNo,
      itemId: line.itemId,
      itemVariantId: line.itemVariantId,
      itemRevisionId: line.itemRevisionId ?? null,
      engineeringDocumentRevisionId: line.engineeringDocumentRevisionId ?? null,
      bomRevisionId: line.bomRevisionId ?? null,
      routingId: line.routingId ?? null,
      orderUomId: line.orderUomId,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      discountPercent: line.discountPercent,
      discountAmount: line.discountAmount,
      taxPercent: line.taxPercent,
      taxCodeId: line.taxCodeId ?? null,
      taxRateSnapshot: line.taxRateSnapshot ?? null,
      priceSourceType: line.priceSourceType ?? "Manual",
      priceListLineId: line.priceListLineId ?? null,
      discountSchemeId: line.discountSchemeId ?? null,
      discountRuleId: line.discountRuleId ?? null,
      lineInternalRemarks: line.lineInternalRemarks ?? "",
      lineCustomerFacingRemarks: line.lineCustomerFacingRemarks ?? "",
      overrideReason: line.overrideReason ?? "",
      makeType: line.makeType,
      promisedDate: line.promisedDate,
      priorityCode: line.priorityCode,
      customerSpecRef: line.customerSpecRef ?? "",
      status: line.status
    }))
  };
}

function quoteSetupToDraft(record: QuoteSetupItem): QuoteDraftState {
  return {
    companyId: record.companyId,
    branchId: record.branchId,
    quoteNo: record.quoteNo,
    customerId: record.customerId,
    customerAddressId: record.customerAddressId,
    quoteDate: record.quoteDate,
    expiryDate: record.expiryDate === "Open" ? null : record.expiryDate,
    priorityCode: record.priorityCode,
    status: record.status,
    customerSpecRef: record.specRef === "No spec reference" ? "" : record.specRef,
    salesOwnerUserId: record.salesOwnerUserId ?? null,
    salesOwnerName: record.salesOwnerName ?? null,
    internalRemarks: record.internalRemarks ?? "",
    customerFacingRemarks: record.customerFacingRemarks ?? "",
    printRemarks: record.printRemarks ?? "",
    paymentTermsId: record.paymentTermsId ?? null,
    priceListId: record.priceListId ?? null,
    discountSchemeId: record.discountSchemeId ?? null,
    taxCategoryId: record.taxCategoryId ?? null,
    taxTreatment: record.taxTreatment ?? "Taxable",
    currencyId: record.currencyId ?? null,
    exchangeRateId: record.exchangeRateId ?? null,
    exchangeRateSnapshot: record.exchangeRateSnapshot ?? null,
    tradeTermsId: record.tradeTermsId ?? null,
    freightAmount: record.freightAmount ?? 0,
    packingAmount: record.packingAmount ?? 0,
    insuranceAmount: record.insuranceAmount ?? 0,
    otherChargesAmount: record.otherChargesAmount ?? 0,
    addLessAmount: record.addLessAmount ?? 0,
    roundOffAmount: record.roundOffAmount ?? 0,
    commercialStatus: record.commercialStatus ?? record.status,
    revisionNo: record.revisionNo ?? 1,
    releasedAt: record.releasedAt ?? null,
    convertedAt: record.convertedAt ?? null,
    subtotalAmount: record.subtotalAmount ?? 0,
    discountTotalAmount: record.discountTotalAmount ?? 0,
    taxableAmount: record.taxableAmount ?? 0,
    taxTotalAmount: record.taxTotalAmount ?? 0,
    grandTotalAmount: record.grandTotalAmount ?? 0,
    lines: record.lines.map((line) => ({
      lineNo: line.lineNo,
      itemId: line.itemId,
      itemVariantId: line.itemVariantId,
      itemRevisionId: line.itemRevisionId ?? null,
      engineeringDocumentRevisionId: line.engineeringDocumentRevisionId ?? null,
      bomRevisionId: line.bomRevisionId ?? null,
      routingId: line.routingId ?? null,
      orderUomId: line.orderUomId,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      discountPercent: line.discountPercent,
      discountAmount: line.discountAmount,
      taxPercent: line.taxPercent,
      taxCodeId: line.taxCodeId ?? null,
      taxRateSnapshot: line.taxRateSnapshot ?? null,
      priceSourceType: line.priceSourceType ?? "Manual",
      priceListLineId: line.priceListLineId ?? null,
      discountSchemeId: line.discountSchemeId ?? null,
      discountRuleId: line.discountRuleId ?? null,
      lineInternalRemarks: line.lineInternalRemarks ?? "",
      lineCustomerFacingRemarks: line.lineCustomerFacingRemarks ?? "",
      overrideReason: line.overrideReason ?? "",
      makeType: line.makeType,
      promisedDate: line.promisedDate,
      priorityCode: line.priorityCode,
      customerSpecRef: line.customerSpecRef ?? "",
      status: line.status
    }))
  };
}

function calculateCommercialTotals(document: {
  lines: Array<{ quantity: number; unitPrice?: number; discountPercent?: number; taxPercent?: number; discountAmount?: number }>;
  freightAmount?: number;
  packingAmount?: number;
  insuranceAmount?: number;
  otherChargesAmount?: number;
  addLessAmount?: number;
  roundOffAmount?: number;
}) {
  const lineTotals = document.lines.reduce(
    (totals, line) => {
      const gross = line.quantity * (line.unitPrice ?? 0);
      const discount = line.discountAmount && line.discountAmount > 0 ? line.discountAmount : gross * ((line.discountPercent ?? 0) / 100);
      const taxable = Math.max(gross - discount, 0);
      const tax = taxable * ((line.taxPercent ?? 0) / 100);
      return {
        gross: totals.gross + gross,
        discount: totals.discount + discount,
        taxable: totals.taxable + taxable,
        tax: totals.tax + tax,
        total: totals.total + taxable + tax
      };
    },
    { gross: 0, discount: 0, taxable: 0, tax: 0, total: 0 }
  );
  const charges = (document.freightAmount ?? 0) + (document.packingAmount ?? 0) + (document.insuranceAmount ?? 0) + (document.otherChargesAmount ?? 0);
  const total = lineTotals.total + charges + (document.addLessAmount ?? 0) + (document.roundOffAmount ?? 0);
  return { ...lineTotals, charges, total };
}

function moneyLabel(value: number) {
  return value.toLocaleString("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
}

function buildDraftSalesOrderNo() {
  const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 12);
  return `SO-DRAFT-${stamp}`;
}

function buildSalesOrderDraft(companyId: number, branchId: number): SalesOrderDraftState {
  return {
    companyId,
    branchId,
    salesOrderNo: buildDraftSalesOrderNo(),
    customerId: 0,
    billToAddressId: null,
    shipToAddressId: null,
    orderDate: todayIso(),
    promisedDate: addDaysIso(14),
    priorityCode: "Medium",
    status: "Draft",
    sourceQuoteId: null,
    sourceQuoteRevisionNo: null,
    sourceQuoteVersionNo: null,
    salesOwnerUserId: null,
    salesOwnerName: null,
    internalRemarks: "",
    customerFacingRemarks: "",
    printRemarks: "",
    paymentTermsId: null,
    priceListId: null,
    discountSchemeId: null,
    taxCategoryId: null,
    taxTreatment: null,
    currencyId: null,
    exchangeRateId: null,
    exchangeRateSnapshot: null,
    tradeTermsId: null,
    freightAmount: 0,
    packingAmount: 0,
    insuranceAmount: 0,
    otherChargesAmount: 0,
    addLessAmount: 0,
    roundOffAmount: 0,
    commercialStatus: "Draft",
    lines: [buildSalesOrderLine(10)]
  };
}

function buildSalesOrderLine(lineNo: number): SalesOrderUpsertRequest["lines"][number] {
  return {
    lineNo,
    itemId: 0,
    itemVariantId: null,
    orderUomId: 0,
    quantity: 1,
    unitPrice: 0,
    discountPercent: 0,
    discountAmount: 0,
    taxCodeId: null,
    taxRateSnapshot: null,
    priceSourceType: "Manual",
    priceListLineId: null,
    discountSchemeId: null,
    discountRuleId: null,
    lineInternalRemarks: "",
    lineCustomerFacingRemarks: "",
    overrideReason: "",
    makeType: "Make",
    promisedDate: addDaysIso(14),
    priorityCode: "Medium",
    customerSpecRef: "",
    requestedShipDate: addDaysIso(14),
    status: "Draft"
  };
}

function toSalesOrderDraft(record: SalesOrderSetupItem): SalesOrderDraftState {
  return {
    companyId: record.companyId,
    branchId: record.branchId,
    salesOrderNo: record.salesOrderNo,
    customerId: record.customerId,
    billToAddressId: record.billToAddressId,
    shipToAddressId: record.shipToAddressId,
    orderDate: record.orderDate,
    promisedDate: dateControlValue(record.promisedDate) || null,
    priorityCode: record.priorityCode,
    status: record.status,
    sourceQuoteId: record.sourceQuoteId,
    sourceQuoteRevisionNo: record.sourceQuoteRevisionNo ?? null,
    sourceQuoteVersionNo: record.sourceQuoteVersionNo ?? null,
    salesOwnerUserId: record.salesOwnerUserId ?? null,
    salesOwnerName: record.salesOwnerName ?? null,
    internalRemarks: record.internalRemarks ?? "",
    customerFacingRemarks: record.customerFacingRemarks ?? "",
    printRemarks: record.printRemarks ?? "",
    paymentTermsId: record.paymentTermsId ?? null,
    priceListId: record.priceListId ?? null,
    discountSchemeId: record.discountSchemeId ?? null,
    taxCategoryId: record.taxCategoryId ?? null,
    taxTreatment: record.taxTreatment ?? "Taxable",
    currencyId: record.currencyId ?? null,
    exchangeRateId: record.exchangeRateId ?? null,
    exchangeRateSnapshot: record.exchangeRateSnapshot ?? null,
    tradeTermsId: record.tradeTermsId ?? null,
    freightAmount: record.freightAmount ?? 0,
    packingAmount: record.packingAmount ?? 0,
    insuranceAmount: record.insuranceAmount ?? 0,
    otherChargesAmount: record.otherChargesAmount ?? 0,
    addLessAmount: record.addLessAmount ?? 0,
    roundOffAmount: record.roundOffAmount ?? 0,
    commercialStatus: record.commercialStatus ?? record.status,
    releasedAt: record.releasedAt ?? null,
    subtotalAmount: record.subtotalAmount ?? 0,
    discountTotalAmount: record.discountTotalAmount ?? 0,
    taxableAmount: record.taxableAmount ?? 0,
    taxTotalAmount: record.taxTotalAmount ?? 0,
    grandTotalAmount: record.grandTotalAmount ?? 0,
    lines: record.lines.length
      ? record.lines.map((line) => ({
          lineNo: line.lineNo,
          itemId: line.itemId,
          itemVariantId: line.itemVariantId,
          itemRevisionId: line.itemRevisionId ?? null,
          engineeringDocumentRevisionId: line.engineeringDocumentRevisionId ?? null,
          bomRevisionId: line.bomRevisionId ?? null,
          routingId: line.routingId ?? null,
          orderUomId: line.orderUomId,
          quantity: line.quantity,
          unitPrice: line.unitPrice ?? 0,
          discountPercent: line.discountPercent ?? 0,
          discountAmount: line.discountAmount ?? 0,
          taxCodeId: line.taxCodeId ?? null,
          taxRateSnapshot: line.taxRateSnapshot ?? null,
          priceSourceType: line.priceSourceType ?? "Manual",
          priceListLineId: line.priceListLineId ?? null,
          discountSchemeId: line.discountSchemeId ?? null,
          discountRuleId: line.discountRuleId ?? null,
          lineInternalRemarks: line.lineInternalRemarks ?? "",
          lineCustomerFacingRemarks: line.lineCustomerFacingRemarks ?? "",
          overrideReason: line.overrideReason ?? "",
          makeType: line.makeType,
          promisedDate: line.promisedDate,
          priorityCode: line.priorityCode,
          customerSpecRef: line.customerSpecRef ?? "",
          requestedShipDate: line.requestedShipDate,
          status: line.status
        }))
      : [buildSalesOrderLine(10)]
  };
}

function salesOrderDtoToDraft(dto: SalesOrderDto): SalesOrderDraftState {
  return {
    companyId: dto.companyId,
    branchId: dto.branchId,
    salesOrderNo: dto.salesOrderNo,
    customerId: dto.customerId,
    billToAddressId: dto.billToAddressId,
    shipToAddressId: dto.shipToAddressId,
    orderDate: dto.orderDate,
    promisedDate: dto.promisedDate,
    priorityCode: dto.priorityCode,
    status: dto.status,
    sourceQuoteId: dto.sourceQuoteId,
    sourceQuoteRevisionNo: dto.sourceQuoteRevisionNo ?? null,
    sourceQuoteVersionNo: dto.sourceQuoteVersionNo ?? null,
    salesOwnerUserId: dto.salesOwnerUserId ?? null,
    salesOwnerName: dto.salesOwnerName ?? null,
    internalRemarks: dto.internalRemarks ?? "",
    customerFacingRemarks: dto.customerFacingRemarks ?? "",
    printRemarks: dto.printRemarks ?? "",
    paymentTermsId: dto.paymentTermsId ?? null,
    priceListId: dto.priceListId ?? null,
    discountSchemeId: dto.discountSchemeId ?? null,
    taxCategoryId: dto.taxCategoryId ?? null,
    taxTreatment: dto.taxTreatment ?? "Taxable",
    currencyId: dto.currencyId ?? null,
    exchangeRateId: dto.exchangeRateId ?? null,
    exchangeRateSnapshot: dto.exchangeRateSnapshot ?? null,
    tradeTermsId: dto.tradeTermsId ?? null,
    freightAmount: dto.freightAmount ?? 0,
    packingAmount: dto.packingAmount ?? 0,
    insuranceAmount: dto.insuranceAmount ?? 0,
    otherChargesAmount: dto.otherChargesAmount ?? 0,
    addLessAmount: dto.addLessAmount ?? 0,
    roundOffAmount: dto.roundOffAmount ?? 0,
    commercialStatus: dto.commercialStatus ?? dto.status,
    releasedAt: dto.releasedAt ?? null,
    releasedByUserId: dto.releasedByUserId ?? null,
    legacyCommercialIncomplete: dto.legacyCommercialIncomplete ?? false,
    subtotalAmount: dto.subtotalAmount ?? 0,
    discountTotalAmount: dto.discountTotalAmount ?? 0,
    taxableAmount: dto.taxableAmount ?? 0,
    taxTotalAmount: dto.taxTotalAmount ?? 0,
    grandTotalAmount: dto.grandTotalAmount ?? 0,
    lines: dto.lines.map((line) => ({
      lineNo: line.lineNo,
      itemId: line.itemId,
      itemVariantId: line.itemVariantId,
      itemRevisionId: line.itemRevisionId ?? null,
      engineeringDocumentRevisionId: line.engineeringDocumentRevisionId ?? null,
      bomRevisionId: line.bomRevisionId ?? null,
      routingId: line.routingId ?? null,
      orderUomId: line.orderUomId,
      quantity: line.quantity,
      unitPrice: line.unitPrice ?? 0,
      discountPercent: line.discountPercent ?? 0,
      discountAmount: line.discountAmount ?? 0,
      taxCodeId: line.taxCodeId ?? null,
      taxRateSnapshot: line.taxRateSnapshot ?? null,
      priceSourceType: line.priceSourceType ?? "Manual",
      priceListLineId: line.priceListLineId ?? null,
      discountSchemeId: line.discountSchemeId ?? null,
      discountRuleId: line.discountRuleId ?? null,
      lineInternalRemarks: line.lineInternalRemarks ?? "",
      lineCustomerFacingRemarks: line.lineCustomerFacingRemarks ?? "",
      overrideReason: line.overrideReason ?? "",
      makeType: line.makeType,
      promisedDate: line.promisedDate,
      priorityCode: line.priorityCode,
      customerSpecRef: line.customerSpecRef ?? "",
      requestedShipDate: line.requestedShipDate,
      status: line.status
    }))
  };
}

const blanketOrderColumns: DataGridColumn<BlanketOrderSetupItem>[] = [
  { key: "blanket", header: "Contract", width: "20%", render: (record) => <strong>{record.blanketOrderNo}</strong> },
  { key: "customer", header: "Customer", render: (record) => record.customerLabel },
  { key: "horizon", header: "Horizon", width: "24%", render: (record) => record.horizon },
  { key: "release", header: "Next release", width: "20%", render: (record) => record.nextRelease },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

const forecastColumns: DataGridColumn<DemandForecastSetupItem>[] = [
  { key: "forecast", header: "Forecast", width: "20%", render: (record) => <strong>{record.forecastCode}</strong> },
  {
    key: "name",
    header: "Demand plan",
    render: (record) => (
      <div>
        <strong>{record.forecastName}</strong>
        <div className="muted">{record.periodType} / {record.horizon}</div>
      </div>
    )
  },
  { key: "buckets", header: "Buckets", width: "14%", render: (record) => record.bucketCount },
  { key: "qty", header: "Qty", width: "12%", render: (record) => record.totalQuantity },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

const mpsColumns: DataGridColumn<MpsPlannerItem>[] = [
  { key: "mps", header: "MPS", width: "18%", render: (record) => <strong>{record.mpsCode}</strong> },
  { key: "horizon", header: "Horizon", render: (record) => record.horizon },
  { key: "bucket", header: "First bucket", width: "20%", render: (record) => record.firstBucket },
  { key: "qty", header: "Planned qty", width: "14%", render: (record) => record.plannedQuantity },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.status} /> }
];

type MpsDraftState = MasterProductionScheduleUpsertRequest & {
  mpsId: number | null;
  source: MasterDataSource | "Draft";
};

const promiseColumns: DataGridColumn<AvailablePromiseItem>[] = [
  { key: "order", header: "Order", width: "18%", render: (record) => <strong>{record.orderRef}</strong> },
  {
    key: "item",
    header: "Demand",
    render: (record) => (
      <div>
        <strong>{record.itemLabel}</strong>
        <div className="muted">{record.customerLabel}</div>
      </div>
    )
  },
  { key: "dates", header: "Requested / promised", width: "22%", render: (record) => `${record.requestedDate} / ${record.promisedDate}` },
  { key: "material", header: "Material", width: "20%", render: (record) => record.materialSignal },
  { key: "status", header: "Status", width: "12%", render: (record) => <StatusBadge status={record.promiseStatus} /> }
];

export function SupplierLeadTimeMatrixPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [draft, setDraft] = useState<(SupplierLeadTimeUpsertRequest & { id: number | null; orderPolicy: string }) | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveTone, setSaveTone] = useState<"success" | "danger" | "info">("info");
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(
    () => buildMasterFilter(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    [deferredSearch, status, user?.activeContext.branchId, user?.activeContext.companyId]
  );
  const query = useApiQuery(
    queryKeys.partners.supplierLeadTimes(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listSupplierLeadTimeSetup(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const source = records[0]?.source ?? "Seeded";
  const canSave = hasLiveSession(session);
  const itemOptions = [
    { label: "Any item", value: "" },
    ...Array.from(new Map(records.filter((record) => record.itemId).map((record) => [record.itemId ?? 0, record.itemLabel])).entries()).map(
      ([value, label]) => ({ label, value: String(value) })
    )
  ];
  const supplierOptions = Array.from(new Set(records.map((record) => record.supplierId))).map((value) => ({ label: `Supplier ${value}`, value: String(value) }));
  const orderPolicyOptions = Array.from(
    new Set([
      "Priority 1",
      "Minimum order quantity",
      "Order multiple quantity",
      "Minimum and multiple quantity",
      ...records.map((record) => record.orderPolicy)
    ])
  ).map((value) => ({ label: value, value }));
  const openDraft = (record: SupplierLeadTimeSetupItem) => {
    setDraft({
      id: record.leadTimeId,
      companyId: record.companyId,
      supplierId: record.supplierId,
      branchId: record.branchId,
      itemId: record.itemId,
      itemGroupId: record.itemGroupId,
      leadTimeDays: record.leadTimeDays,
      minOrderQty: record.minOrderQty,
      orderMultipleQty: record.orderMultipleQty,
      orderPolicy: record.orderPolicy,
      isSubcontractLeadTime: record.isSubcontractLeadTime,
      priorityRank: record.priorityRank,
      status: record.status
    });
    setSaveMessage(null);
  };
  const openCreate = () => {
    const first = records[0];
    setDraft({
      id: null,
      companyId: user?.activeContext.companyId ?? first?.companyId ?? 1,
      supplierId: first?.supplierId ?? 0,
      branchId: user?.activeContext.branchId ?? null,
      itemId: first?.itemId ?? null,
      itemGroupId: null,
      leadTimeDays: 1,
      minOrderQty: null,
      orderMultipleQty: null,
      orderPolicy: "Priority 1",
      isSubcontractLeadTime: false,
      priorityRank: 1,
      status: "Draft"
    });
    setSaveMessage(null);
  };
  const closeDraft = () => {
    setDraft(null);
    setSaveMessage(null);
  };
  const updateDraft = (changes: Partial<SupplierLeadTimeUpsertRequest>) => setDraft((current) => (current ? { ...current, ...changes } : current));
  const updateOrderPolicy = (orderPolicy: string) => {
    setDraft((current) => {
      if (!current) {
        return current;
      }

      if (orderPolicy === "Priority 1") {
        return { ...current, orderPolicy, minOrderQty: null, orderMultipleQty: null, priorityRank: 1 };
      }

      if (orderPolicy === "Minimum order quantity") {
        return { ...current, orderPolicy, minOrderQty: current.minOrderQty ?? 1, orderMultipleQty: null };
      }

      if (orderPolicy === "Order multiple quantity") {
        return { ...current, orderPolicy, minOrderQty: null, orderMultipleQty: current.orderMultipleQty ?? 1 };
      }

      if (orderPolicy === "Minimum and multiple quantity") {
        return { ...current, orderPolicy, minOrderQty: current.minOrderQty ?? 1, orderMultipleQty: current.orderMultipleQty ?? 1 };
      }

      return { ...current, orderPolicy };
    });
  };
  const saveDraft = async () => {
    if (!draft || !canSave || isSaving) {
      return;
    }

    if (!draft.supplierId || draft.leadTimeDays <= 0) {
      setSaveTone("danger");
      setSaveMessage("Supplier and lead time days are required.");
      return;
    }

    try {
      setIsSaving(true);
      const request: SupplierLeadTimeUpsertRequest = {
        companyId: draft.companyId,
        supplierId: draft.supplierId,
        branchId: draft.branchId,
        itemId: draft.itemId,
        itemGroupId: draft.itemGroupId,
        leadTimeDays: draft.leadTimeDays,
        minOrderQty: draft.minOrderQty,
        orderMultipleQty: draft.orderMultipleQty,
        isSubcontractLeadTime: draft.isSubcontractLeadTime,
        priorityRank: draft.priorityRank,
        status: draft.status
      };
      const saved = draft.id ? await apiClient.partners.updateSupplierLeadTime(draft.id, request) : await apiClient.partners.createSupplierLeadTime(request);
      setDraft((current) => current ? { ...current, id: saved.id } : current);
      await query.refetch();
      setSaveTone("success");
      setSaveMessage("Supplier lead-time row saved.");
    } catch (error) {
      setSaveTone("danger");
      setSaveMessage(error instanceof Error ? error.message : "Supplier lead-time row could not be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <ListPageShell
        actions={
          <>
            <SourceBadge source={source} />
            <ErpActionBar
              primary={[{ disabled: !canSave, label: "New lead-time row", onClick: canSave ? openCreate : undefined, reason: canSave ? undefined : "Sign in with supplier master write access to create lead-time rows." }]}
              secondary={[{ disabled: true, label: "Export matrix", reason: "Export requires the governed supplier lead-time export workflow." }]}
              testId="supplier-lead-time-action-bar"
            />
          </>
        }
        aside={<WorkbenchAside description="Supplier lead-time setup feeds planning without changing procurement posting behavior." endpoint="/api/supplier-lead-times" source={source} />}
        description="Lead-time by supplier, item/category, branch, order policy, and subcontract route."
        filters={
          <ErpFilterBar
            ariaLabel="Supplier lead-time filters"
            onClear={() => {
              setSearch("");
              setStatus("all");
            }}
            testId="supplier-lead-time-filter-bar"
          >
            <input aria-label="Search supplier lead times" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search item, supplier, branch, policy" value={search} />
            <select aria-label="Supplier lead-time status" onChange={(event) => setStatus(event.target.value)} value={status}>
              <option value="all">Status: Any</option>
              <option value="Active">Active</option>
              <option value="Draft">Draft</option>
            </select>
          </ErpFilterBar>
        }
        title="Supplier Lead Time Matrix"
      >
        <KpiStrip
          items={[
            { label: "Matrix rows", value: String(records.length) },
            { label: "Subcontract", value: String(records.filter((record) => record.isSubcontractLeadTime).length) },
            { label: "Avg days", value: records.length ? String(Math.round(records.reduce((total, record) => total + record.leadTimeDays, 0) / records.length)) : "0" },
            { label: "Priority 1", value: String(records.filter((record) => record.priorityRank === 1).length) }
          ]}
        />
        <Card title="Lead-time matrix" description="Planning-safe supplier promises grouped by item, policy, and route.">
          <ErpGrid
            ariaLabel="Supplier lead time matrix"
            columns={leadTimeColumns}
            getRowId={(record) => record.id}
            isLoading={query.isLoading}
            onRowSelect={openDraft}
            records={records}
            rowLabel={(record) => `${record.itemLabel} supplier lead-time matrix`}
            testId="supplier-lead-time-grid"
            virtualization={{ enabled: true }}
          />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Supplier lead-time detail keeps item, supplier, and policy selection controlled by existing matrix values."
        footer={
          <ErpActionBar
            primary={[{ disabled: !canSave || isSaving, label: isSaving ? "Saving..." : "Save lead-time row", onClick: canSave && !isSaving ? saveDraft : undefined, reason: canSave ? undefined : "Sign in with supplier master write access to save lead-time rows." }]}
            secondary={[{ disabled: true, label: "Review audit", reason: "Supplier lead-time audit history requires recorded live changes." }]}
            utility={[{ label: "Close", onClick: closeDraft, variant: "quiet" }]}
          />
        }
        isOpen={Boolean(draft)}
        onClose={closeDraft}
        title={draft?.itemId ? itemOptions.find((option) => option.value === String(draft.itemId))?.label ?? "Lead-time detail" : "Lead-time detail"}
      >
        {draft ? (
          <FormShell initialFingerprint={`${draft.id ?? "new"}-${saveMessage ?? ""}`} title="Lead-time setup">
            {saveMessage ? <ErpStatusChip tone={saveTone}>{saveMessage}</ErpStatusChip> : null}
            <ErpLookupField
              label="Supplier lead-time item selector"
              onChange={(value) => updateDraft({ itemId: value ? Number(value) : null, itemGroupId: null })}
              options={itemOptions}
              value={draft.itemId ? String(draft.itemId) : ""}
            />
            <ErpLookupField
              label="Supplier"
              onChange={(value) => updateDraft({ supplierId: Number(value) })}
              options={supplierOptions}
              value={String(draft.supplierId)}
            />
            <ErpLookupField label="Order policy" onChange={updateOrderPolicy} options={orderPolicyOptions} value={draft.orderPolicy} />
            <ErpNumberField
              label="Lead time days"
              min={1}
              onChange={(value) => updateDraft({ leadTimeDays: value ?? 1 })}
              unit="days"
              value={draft.leadTimeDays}
            />
            <ErpNumberField label="Minimum order quantity" min={0} onChange={(value) => updateDraft({ minOrderQty: value })} value={draft.minOrderQty} />
            <ErpNumberField label="Order multiple quantity" min={0} onChange={(value) => updateDraft({ orderMultipleQty: value })} value={draft.orderMultipleQty} />
            <ErpNumberField label="Priority rank" min={1} onChange={(value) => updateDraft({ priorityRank: value ?? 1 })} value={draft.priorityRank} />
            <label className="form-checkbox">
              <input checked={draft.isSubcontractLeadTime} onChange={(event) => updateDraft({ isSubcontractLeadTime: event.target.checked })} type="checkbox" />
              <span>Subcontract lead time</span>
            </label>
            <ErpLookupField label="Status" onChange={(value) => updateDraft({ status: value })} options={["Active", "Draft", "Inactive"].map((value) => ({ label: value, value }))} value={draft.status} />
          </FormShell>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

function getAttachmentRecordRoute(record: AttachmentViewerItem) {
  const type = record.relatedDocumentType.toLowerCase();

  if (type.includes("bom")) {
    return "/engineering/boms";
  }

  if (type.includes("sales") || type.includes("order")) {
    return "/sales/orders";
  }

  if (type.includes("work")) {
    return "/production/work-orders";
  }

  if (type.includes("job")) {
    return "/production/job-cards";
  }

  if (type.includes("quality") || type.includes("hold") || type.includes("ncr")) {
    return "/quality/ncr";
  }

  return "/platform/attachments";
}

function saveBlob(blob: Blob, fileName: string, openPreview = false) {
  const url = window.URL.createObjectURL(blob);

  if (openPreview) {
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => window.URL.revokeObjectURL(url), 30_000);
    return;
  }

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(url);
}

export function AttachmentViewerPage() {
  const navigate = useNavigate();
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | undefined>();
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);
  const isLive = hasLiveSession(session);
  const filter = useMemo(
    () => buildMasterFilter(user?.activeContext.companyId, undefined, deferredSearch, status),
    [deferredSearch, status, user?.activeContext.companyId]
  );
  const query = useApiQuery(
    queryKeys.platform.attachments(user?.activeContext.companyId, deferredSearch, status),
    () => listAttachmentViewerSetup(session, filter),
    { staleTime: 60_000 }
  );
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? records[0] ?? null;
  const source: MasterDataSource = records[0]?.source ?? (isLive ? "Live" : "Deferred");
  const attachmentActionDisabledReason = !isLive
    ? "Attachment actions require a live signed-in session."
    : !selected
      ? "Select a document before using attachment actions."
      : !selected.attachmentId
        ? "This document reference does not have downloadable content."
        : undefined;
  const uploadMutation = useApiMutation(
    (file: File) => {
      if (!selected) {
        throw new Error("Select a document before uploading a linked file.");
      }

      return apiClient.platform.uploadAttachment({
        companyId: user?.activeContext.companyId,
        branchId: user?.activeContext.branchId,
        relatedDocumentType: selected.relatedDocumentType,
        relatedDocumentId: selected.relatedDocumentId,
        file
      });
    },
    {
      onSuccess: async (attachment) => {
        setUploadMessage(`${attachment.fileName} was linked to ${attachment.relatedDocumentType} ${attachment.relatedDocumentId}.`);
        setSelectedId(String(attachment.id));
        setActionError(null);
        await query.refetch();
      },
      onError: (error) => {
        setActionError(error.message);
      }
    }
  );

  const downloadSelected = async (openPreview = false) => {
    if (!selected?.attachmentId) {
      return;
    }

    try {
      const response = await apiClient.platform.downloadAttachment(selected.attachmentId);
      saveBlob(response.blob, selected.fileName, openPreview);
      setActionError(null);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : "Attachment content could not be opened.");
    }
  };

  return (
    <ListPageShell
      actions={
        <>
          <SourceBadge source={source} />
          <ErpFileActionState
            accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx"
            disabledReason={
              isLive && selected
                ? "Attachment upload is being linked to the selected business record."
                : "Select a live document record before uploading."
            }
            enabled={isLive && Boolean(selected) && !uploadMutation.isPending}
            fileName={selectedFileName}
            label={uploadMutation.isPending ? "Uploading document" : "Upload document"}
            onFileSelect={(file) => {
              if (!file) {
                return;
              }

              setSelectedFileName(file.name);
              setUploadMessage(null);
              setActionError(null);
              uploadMutation.mutate(file);
            }}
          />
          <ErpActionBar
            primary={[
              {
                disabled: Boolean(attachmentActionDisabledReason),
                label: "Preview",
                onClick: () => void downloadSelected(true),
                reason: attachmentActionDisabledReason
              }
            ]}
            secondary={[
              {
                disabled: Boolean(attachmentActionDisabledReason),
                label: "Download",
                onClick: () => void downloadSelected(false),
                reason: attachmentActionDisabledReason
              },
              {
                disabled: !selected,
                label: "Open linked record",
                onClick: () => {
                  if (selected) {
                    navigate(getAttachmentRecordRoute(selected));
                  }
                },
                reason: "Select a document before opening the linked record."
              }
            ]}
            testId="attachment-viewer-action-bar"
          />
        </>
      }
      aside={
        <Card title="Document access guidance" description="Review linked document references and attachment access for the selected company.">
          <div className="notification-item">
            <strong>Authorized document records</strong>
            <p>Preview, download, and upload actions stay tied to the selected business record and current operating scope.</p>
            <div className="context-chip-row">
              <SourceBadge source={source} />
              <Badge tone="info">Access scoped</Badge>
            </div>
          </div>
        </Card>
      }
      description="Drawings, PDFs, photos, and customer documents linked to manufacturing records."
      filters={
        <FilterBar>
          <input aria-label="Search attachments" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search document, filename, linked record" value={search} />
          <select aria-label="Attachment status" onChange={(event) => setStatus(event.target.value)} value={status}>
            <option value="all">Status: Any</option>
            <option value="Linked">Linked</option>
          </select>
        </FilterBar>
      }
      title="Attachment / Document Viewer"
    >
      {query.isError ? (
        <EmptyState
          description="Live attachment data could not be loaded. No document rows are shown until the service is available."
          hint={query.error instanceof Error ? query.error.message : undefined}
          title="Attachment viewer unavailable"
        />
      ) : (
        <div className="split-panels">
          <Card title="Document list" description="Document references prepared for commercial review and release tracking.">
            <DataGrid
              ariaLabel="Attachment document list"
              columns={attachmentColumns}
              getRowId={(record) => record.id}
              isLoading={query.isLoading}
              onRowSelect={(record) => setSelectedId(record.id)}
              records={records}
              rowLabel={(record) => `${record.documentNo} attachment`}
              virtualization={{ enabled: true }}
            />
          </Card>
          <Card title="Attachment preview" description={selected ? selected.linkedDocument : "Select an attachment to preview metadata."}>
            {selected ? (
              <div className="notification-item">
                <strong>{selected.fileName}</strong>
                <p>{selected.fileType} / {selected.fileSize} / uploaded by {selected.uploadedBy}</p>
                <div className="context-chip-row"><StatusBadge status={selected.status} /><Badge tone="info">{selected.uploadedOn}</Badge></div>
                {uploadMessage ? <p className="ui-validation-summary">{uploadMessage}</p> : null}
                {actionError ? <p className="login-form__error">{actionError}</p> : null}
              </div>
            ) : null}
          </Card>
        </div>
      )}
    </ListPageShell>
  );
}

export function QuoteEstimateListPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draftQuoteId, setDraftQuoteId] = useState<number | null>(null);
  const [draft, setDraft] = useState<QuoteDraftState | null>(null);
  const [reopenReason, setReopenReason] = useState("");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);
  const companyId = user?.activeContext.companyId ?? null;
  const branchId = user?.activeContext.branchId ?? null;
  const isLive = hasLiveSession(session);
  const filter = useMemo(
    () => buildMasterFilter(companyId, branchId, deferredSearch, status),
    [branchId, companyId, deferredSearch, status]
  );
  const query = useApiQuery(queryKeys.salesPlanning.quotes(companyId, branchId, deferredSearch, status), () => listQuoteSetup(session, filter), { staleTime: 60_000 });
  const customersQuery = useApiQuery(
    queryKeys.partners.customers(companyId, branchId, "", "Active"),
    () => isLive && companyId ? apiClient.partners.customers({ companyId, branchId: branchId ?? undefined, pageSize: 100, status: "Active" }).then((response) => response.items) : Promise.resolve([]),
    { staleTime: 60_000 }
  );
  const itemsQuery = useApiQuery(
    ["sales-planning", "quote-items", companyId ?? 0],
    () => isLive ? apiClient.masters.itemLookup(companyId) : Promise.resolve([]),
    { staleTime: 60_000 }
  );
  const uomsQuery = useApiQuery(
    queryKeys.measurements.uoms(companyId, "", "Active"),
    () => isLive ? apiClient.measurements.uoms({ pageSize: 100, status: "Active" }).then((response) => response.items) : Promise.resolve([]),
    { staleTime: 60_000 }
  );
  const usersQuery = useApiQuery(["platform", "sales-owner-users"], () => isLive ? apiClient.platform.users() : Promise.resolve([]), { staleTime: 60_000 });
  const priceListsQuery = useApiQuery(queryKeys.commercial.priceLists(companyId, "", "Active"), () => isLive ? apiClient.commercial.priceLists({ companyId: companyId ?? undefined, pageSize: 100, status: "Active" }).then((response) => response.items) : Promise.resolve([]), { staleTime: 60_000 });
  const discountSchemesQuery = useApiQuery(queryKeys.commercial.discountSchemes(companyId, "", "Active"), () => isLive ? apiClient.commercial.discountSchemes({ companyId: companyId ?? undefined, pageSize: 100, status: "Active" }).then((response) => response.items) : Promise.resolve([]), { staleTime: 60_000 });
  const taxCategoriesQuery = useApiQuery(queryKeys.commercial.taxCategories(companyId, "", "Active"), () => isLive ? apiClient.commercial.taxCategories({ companyId: companyId ?? undefined, pageSize: 100, status: "Active" }).then((response) => response.items) : Promise.resolve([]), { staleTime: 60_000 });
  const currenciesQuery = useApiQuery(queryKeys.commercial.currencies(companyId, "", "Active"), () => isLive ? apiClient.commercial.currencies({ companyId: companyId ?? undefined, pageSize: 100, status: "Active" }).then((response) => response.items) : Promise.resolve([]), { staleTime: 60_000 });
  const exchangeRatesQuery = useApiQuery(queryKeys.commercial.exchangeRates(companyId, "", "Active"), () => isLive ? apiClient.commercial.exchangeRates({ companyId: companyId ?? undefined, pageSize: 100, status: "Active" }).then((response) => response.items) : Promise.resolve([]), { staleTime: 60_000 });
  const paymentTermsQuery = useApiQuery(queryKeys.commercial.paymentTerms(companyId, "", "Active"), () => isLive ? apiClient.commercial.paymentTerms({ companyId: companyId ?? undefined, pageSize: 100, status: "Active" }).then((response) => response.items) : Promise.resolve([]), { staleTime: 60_000 });
  const tradeTermsQuery = useApiQuery(queryKeys.commercial.tradeTerms(companyId, "", "Active"), () => isLive ? apiClient.commercial.tradeTerms({ companyId: companyId ?? undefined, pageSize: 100, status: "Active" }).then((response) => response.items) : Promise.resolve([]), { staleTime: 60_000 });
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? "Seeded";
  const customerOptions = (customersQuery.data ?? []).map((customer) => ({ label: `${customer.customerCode} / ${customer.customerName}`, value: String(customer.id) }));
  const itemOptions = (itemsQuery.data ?? []).map((item) => ({ label: `${item.itemCode} / ${item.itemName}`, value: String(item.id) }));
  const uomOptions = (uomsQuery.data ?? []).map((uom) => ({ label: `${uom.uomCode} / ${uom.uomName}`, value: String(uom.id) }));
  const salesOwnerOptions = (usersQuery.data ?? [])
    .filter((userRecord) => userRecord.status === "Active" && directoryUserNumericId(userRecord.id) > 0)
    .map((userRecord) => ({ label: userRecord.displayName || userRecord.userName, value: String(directoryUserNumericId(userRecord.id)) }));
  const priceListOptions = (priceListsQuery.data ?? []).map((list) => ({ label: `${list.priceListCode} / ${list.priceListName}`, value: String(list.id) }));
  const discountSchemeOptions = (discountSchemesQuery.data ?? []).map((scheme) => ({ label: `${scheme.schemeCode} / ${scheme.schemeName}`, value: String(scheme.id) }));
  const taxCategoryOptions = (taxCategoriesQuery.data ?? []).map((tax) => ({ label: `${tax.taxCategoryCode} / ${tax.taxCategoryName}`, value: String(tax.id) }));
  const taxCodeOptions = (taxCategoriesQuery.data ?? []).flatMap((tax) => tax.taxCodes.map((code) => ({ label: `${code.taxCode} / ${code.ratePercent}%`, value: String(code.id) })));
  const currencyOptions = (currenciesQuery.data ?? []).map((currency) => ({ label: `${currency.currencyCode} / ${currency.currencyName}`, value: String(currency.id) }));
  const exchangeRateOptions = (exchangeRatesQuery.data ?? []).map((rate) => ({ label: `${rate.currencyCode} / ${rate.rateType} / ${rate.effectiveFrom}`, value: String(rate.id) }));
  const paymentTermOptions = (paymentTermsQuery.data ?? []).map((term) => ({ label: `${term.paymentTermsCode} / ${term.paymentTermsName}`, value: String(term.id) }));
  const tradeTermOptions = (tradeTermsQuery.data ?? []).map((term) => ({ label: `${term.tradeTermsCode} / ${term.tradeTermsName}`, value: String(term.id) }));
  const taxTreatmentOptions = ["Taxable", "Exempt", "ZeroRated", "OutOfScope"].map(toOption);
  const quoteCommercialStatus = draft?.commercialStatus ?? draft?.status ?? "Draft";
  const quoteLocked = ["Released", "Converted", "Closed", "Cancelled"].includes(quoteCommercialStatus);
  const validation = draft
    ? [
        !draft.quoteNo.trim() ? "Quote number is required." : "",
        !draft.customerId ? "Customer is required." : "",
        !draft.quoteDate ? "Quote date is required." : "",
        draft.lines.length === 0 ? "At least one quote line item is required." : "",
        ...draft.lines.flatMap((line, index) => [
          !line.itemId ? `Line ${index + 1} item is required.` : "",
          !line.orderUomId ? `Line ${index + 1} order UOM is required.` : "",
          line.quantity <= 0 ? `Line ${index + 1} quantity must be greater than zero.` : ""
        ])
      ].filter(Boolean)
    : [];
  const saveReason = !draft
    ? "Open a quote draft before saving."
    : quoteLocked
      ? "Released or converted quote snapshots are locked. Reopen a released quote before editing."
    : !isLive
      ? "Live workspace sign-in is required before saving quote drafts."
      : validation[0];
  const newDraftReason = !companyId || !branchId ? "Select an operating company and branch before creating a quote draft." : undefined;
  const saveMutation = useApiMutation(
    (request: QuoteUpsertRequest) => saveQuoteDraft(session, draftQuoteId, request),
    {
      onError: (error) => setSaveMessage(error.message),
      onSuccess: async (saved) => {
        setDraftQuoteId(saved.id);
        setDraft(toQuoteDraft(saved));
        setSelectedId(`quote-${saved.id}`);
        setSaveMessage(`Saved ${saved.quoteNo}.`);
        await query.refetch();
      }
    }
  );
  const releaseMutation = useApiMutation((quoteId: number) => apiClient.salesPlanning.releaseQuote(quoteId), {
    onError: (error) => setSaveMessage(error.message),
    onSuccess: async (released) => {
      setDraftQuoteId(released.id);
      setDraft(toQuoteDraft(released));
      setSaveMessage(`Released ${released.quoteNo}.`);
      await query.refetch();
    }
  });
  const reopenMutation = useApiMutation((payload: { quoteId: number; reason: string }) => apiClient.salesPlanning.reopenQuote(payload.quoteId, { reason: payload.reason }), {
    onError: (error) => setSaveMessage(error.message),
    onSuccess: async (reopened) => {
      setDraftQuoteId(reopened.id);
      setDraft(toQuoteDraft(reopened));
      setReopenReason("");
      setSaveMessage(`Reopened ${reopened.quoteNo}.`);
      await query.refetch();
    }
  });
  const convertMutation = useApiMutation((quoteId: number) => apiClient.salesPlanning.convertQuoteToSalesOrder(quoteId, {}), {
    onError: (error) => setSaveMessage(error.message),
    onSuccess: async (order) => {
      setSaveMessage(`Converted to sales order ${order.salesOrderNo}.`);
      setDraft((current) => current ? { ...current, commercialStatus: "Converted", status: "Converted", convertedAt: new Date().toISOString() } : current);
      await query.refetch();
    }
  });
  const quoteTotals = draft ? calculateCommercialTotals(draft) : null;
  const releaseReason = !draftQuoteId
    ? "Save the quote draft before release."
    : !isLive
      ? "Live sales session is required before releasing a quote."
      : validation[0]
        ? validation[0]
        : quoteCommercialStatus === "Released"
          ? "Quote is already released."
          : quoteCommercialStatus === "Converted"
            ? "Converted quotes cannot be released again."
            : undefined;
  const convertReason = !draftQuoteId
    ? "Save and release the quote before conversion."
    : !isLive
      ? "Live sales session is required before converting a quote."
      : quoteCommercialStatus !== "Released"
        ? "Only a released quote can be converted to a sales order."
        : undefined;
  const reopenReasonText = quoteCommercialStatus !== "Released"
    ? "Only released quotes can be reopened."
    : !reopenReason.trim()
      ? "Enter a reopen reason to keep the commercial audit trail."
      : undefined;

  const openNewDraft = () => {
    if (!companyId || !branchId) {
      return;
    }

    setSelectedId(null);
    setDraftQuoteId(null);
    setDraft(buildQuoteDraft(companyId, branchId));
    setReopenReason("");
    setSaveMessage(null);
  };

  const updateLine = (lineIndex: number, patch: Partial<QuoteUpsertRequest["lines"][number]>) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            lines: current.lines.map((line, index) => (index === lineIndex ? { ...line, ...patch } : line))
          }
        : current
    );
  };

  const addQuoteLine = () => {
    setDraft((current) => current ? { ...current, lines: [...current.lines, buildQuoteDraftLine((current.lines.length + 1) * 10)] } : current);
  };

  const removeQuoteLine = (lineIndex: number) => {
    setDraft((current) =>
      current
        ? {
            ...current,
            lines: current.lines.filter((_, index) => index !== lineIndex).map((line, index) => ({ ...line, lineNo: (index + 1) * 10 }))
          }
        : current
    );
  };
  const refreshQuoteCustomerDefaults = async () => {
    if (!draft || !companyId || !branchId || !isLive || quoteLocked) {
      return;
    }

    try {
      const defaults = await apiClient.partners.customerCommercialDefaults(draft.customerId, {
        companyId,
        branchId,
        customerAddressId: draft.customerAddressId,
        documentDate: draft.quoteDate
      });
      setDraft({
        ...draft,
        salesOwnerUserId: draft.salesOwnerUserId ?? defaults.salesOwner.value,
        salesOwnerName: draft.salesOwnerUserId ? draft.salesOwnerName : defaults.salesOwner.display,
        priceListId: draft.priceListId ?? defaults.priceList.value,
        discountSchemeId: draft.discountSchemeId ?? defaults.discountScheme.value,
        paymentTermsId: draft.paymentTermsId ?? defaults.paymentTerms.value,
        taxCategoryId: draft.taxCategoryId ?? defaults.taxCategory.value,
        taxTreatment: draft.taxTreatment ?? defaults.taxTreatment.value,
        currencyId: draft.currencyId ?? defaults.currency.value,
        tradeTermsId: draft.tradeTermsId ?? defaults.tradeTerms.value
      });
      setSaveMessage(defaults.validationMessages[0] ?? "Customer defaults applied to blank quote fields.");
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Customer defaults could not be loaded.");
    }
  };
  const openQuoteRecord = (record: QuoteSetupItem) => {
    if (record.source === "Live") {
      setSelectedId(null);
      setDraftQuoteId(record.quoteId);
      setDraft(quoteSetupToDraft(record));
      setReopenReason("");
      setSaveMessage(null);
      return;
    }

    setSelectedId(record.id);
  };

  return (
    <>
      <ListPageShell
        actions={
          <>
            <SourceBadge source={source} />
            <ErpActionBar
              primary={[{ disabled: Boolean(newDraftReason), label: "New quote draft", onClick: newDraftReason ? undefined : openNewDraft, reason: newDraftReason }]}
              secondary={[{ disabled: true, label: "Export quotes", reason: "Quote export is pending the approved reporting workflow." }]}
              testId="quote-action-bar"
            />
          </>
        }
        aside={<WorkbenchAside description="Quote review stays focused on estimate, customer, and release readiness." endpoint="/api/quotes" source={source} />}
        description="Quote and cost-estimate control for MTO/fabrication demand intake."
        filters={<FilterBar><input aria-label="Search quotes" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search quote, customer, spec" value={search} /><select aria-label="Quote status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Submitted">Submitted</option><option value="Draft">Draft</option></select></FilterBar>}
        title="Estimate / Quote List"
      >
        <KpiStrip items={[{ label: "Quotes", value: String(records.length) }, { label: "Submitted", value: String(records.filter((record) => record.status === "Submitted").length) }, { label: "Lines", value: String(records.reduce((total, record) => total + record.lineCount, 0)) }, { label: "Qty", value: String(records.reduce((total, record) => total + record.totalQuantity, 0)) }]} />
        <Card title="Quote queue" description="Estimate records stay tied to customer specification and priority.">
          <DataGrid ariaLabel="Quote list" columns={quoteColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={openQuoteRecord} records={records} rowLabel={(record) => `${record.quoteNo} quote`} virtualization={{ enabled: true }} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Quote queue records are review-only here; use New quote draft to author a governed commercial quote."
        footer={<ErpActionBar primary={[{ disabled: true, label: "Save quote draft", reason: "Selected queue records are review-only in this planning queue. Use New quote draft to create and save a live quote draft." }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected?.quoteNo ?? "Quote detail"}
      >
        {selected ? (
          <FormShell initialFingerprint={selected.id} title="Quote detail">
            <ErpLookupField disabled disabledReason="Customer selection is controlled from Customer Master." label="Customer" onChange={() => undefined} options={[{ label: selected.customerLabel, value: selected.customerLabel }]} value={selected.customerLabel} />
            <label><span>Spec reference</span><input defaultValue={selected.specRef} disabled title="Open a new quote draft to author commercial quote details." /></label>
            <ErpLookupField disabled disabledReason="Priority changes require quote workflow enablement." label="Priority" onChange={() => undefined} options={[{ label: selected.priorityCode, value: selected.priorityCode }]} value={selected.priorityCode} />
          </FormShell>
        ) : null}
      </ErpModalWorkspace>
      <ErpModalWorkspace
        description="Create a quote draft against a controlled customer, item, and order UOM before submitting it for downstream demand planning."
        footer={
          <ErpActionBar
            primary={[{ disabled: Boolean(saveReason) || saveMutation.isPending, label: saveMutation.isPending ? "Saving quote draft" : "Save quote draft", onClick: saveReason ? undefined : () => draft && saveMutation.mutate(draft), reason: saveReason }]}
            secondary={[
              { disabled: Boolean(releaseReason) || releaseMutation.isPending, label: releaseMutation.isPending ? "Releasing quote" : "Release quote", onClick: !releaseReason && draftQuoteId ? () => releaseMutation.mutate(draftQuoteId) : undefined, reason: releaseReason },
              { disabled: Boolean(convertReason) || convertMutation.isPending, label: convertMutation.isPending ? "Converting to order" : "Convert to order", onClick: !convertReason && draftQuoteId ? () => convertMutation.mutate(draftQuoteId) : undefined, reason: convertReason },
              { disabled: Boolean(reopenReasonText) || reopenMutation.isPending, label: reopenMutation.isPending ? "Reopening quote" : "Reopen quote", onClick: !reopenReasonText && draftQuoteId ? () => reopenMutation.mutate({ quoteId: draftQuoteId, reason: reopenReason }) : undefined, reason: reopenReasonText }
            ]}
            utility={[{ label: "Close", onClick: () => { setDraft(null); setDraftQuoteId(null); setReopenReason(""); setSaveMessage(null); }, variant: "quiet" }]}
          />
        }
        isOpen={Boolean(draft)}
        onClose={() => { setDraft(null); setDraftQuoteId(null); setReopenReason(""); setSaveMessage(null); }}
        panelClassName="ui-modal__panel--item-master"
        statusMeta={<>{draft ? <StatusBadge status={draft.status} /> : null}{saveMessage ? <ErpStatusChip tone={saveMessage.startsWith("Saved") ? "success" : "danger"}>{saveMessage}</ErpStatusChip> : null}</>}
        title={draftQuoteId ? `Quote ${draft?.quoteNo}` : "New quote draft"}
        validation={<ErpValidationSummary errors={validation} title="Quote draft checks" />}
      >
        {draft ? (
          <div className="modal-form-grid" data-testid="quote-draft-modal">
            <Card title="Quote header" description="Customer, validity, and commercial priority are controlled before quote save.">
              <ErpActionBar
                secondary={[{
                  disabled: quoteLocked || !isLive || !draft.customerId,
                  label: "Refresh customer defaults",
                  onClick: !quoteLocked && isLive && draft.customerId ? refreshQuoteCustomerDefaults : undefined,
                  reason: quoteLocked ? "Released or converted quote snapshots are locked." : !isLive ? "Live customer profile data is required to refresh defaults." : !draft.customerId ? "Select a customer before refreshing defaults." : undefined
                }]}
              />
              <div className="context-chip-row">
                <ErpStatusChip tone={draft.salesOwnerUserId ? "info" : "neutral"}>{draft.salesOwnerUserId ? "Sales owner set" : "Sales owner not defaulted"}</ErpStatusChip>
                <ErpStatusChip tone={draft.priceListId ? "info" : "neutral"}>{draft.priceListId ? "Price list set" : "Price list not defaulted"}</ErpStatusChip>
                <ErpStatusChip tone={draft.discountSchemeId ? "info" : "neutral"}>{draft.discountSchemeId ? "Discount scheme set" : "Discount scheme not defaulted"}</ErpStatusChip>
              </div>
              <FormShell initialFingerprint={`${draftQuoteId ?? "new"}-${draft.quoteNo}`} title="Header">
                <label><span>Quote number</span><input disabled={quoteLocked} onChange={(event) => setDraft({ ...draft, quoteNo: event.target.value })} value={draft.quoteNo} /></label>
                <ErpLookupField disabled={quoteLocked} disabledReason={quoteLocked ? "Released or converted quote snapshots are locked." : undefined} label="Customer" onChange={(value) => setDraft({ ...draft, customerId: value ? Number(value) : 0 })} options={customerOptions} required value={String(draft.customerId || "")} />
                <ErpLookupField disabled={quoteLocked} disabledReason={quoteLocked ? "Released or converted quote snapshots are locked." : undefined} label="Sales owner" onChange={(value) => {
                  const selectedOwner = salesOwnerOptions.find((option) => option.value === value);
                  setDraft({ ...draft, salesOwnerUserId: value ? Number(value) : null, salesOwnerName: selectedOwner?.label ?? null });
                }} options={salesOwnerOptions} value={draft.salesOwnerUserId ? String(draft.salesOwnerUserId) : ""} />
                <label><span>Quote date</span><input disabled={quoteLocked} onChange={(event) => setDraft({ ...draft, quoteDate: event.target.value })} type="date" value={draft.quoteDate} /></label>
                <label><span>Expiry date</span><input disabled={quoteLocked} onChange={(event) => setDraft({ ...draft, expiryDate: event.target.value || null })} type="date" value={draft.expiryDate ?? ""} /></label>
                <ErpLookupField disabled={quoteLocked} label="Priority" onChange={(value) => setDraft({ ...draft, priorityCode: value })} options={[{ label: "Low", value: "Low" }, { label: "Medium", value: "Medium" }, { label: "High", value: "High" }]} value={draft.priorityCode} />
                <ErpLookupField disabled={quoteLocked} label="Status" onChange={(value) => setDraft({ ...draft, status: value, commercialStatus: value === "Draft" ? "Draft" : draft.commercialStatus })} options={[{ label: "Draft", value: "Draft" }, { label: "Submitted", value: "Submitted" }]} value={draft.status} />
                <ErpLookupField disabled={quoteLocked} label="Price list" onChange={(value) => setDraft({ ...draft, priceListId: value ? Number(value) : null })} options={priceListOptions} value={draft.priceListId ? String(draft.priceListId) : ""} />
                <ErpLookupField disabled={quoteLocked} label="Discount scheme" onChange={(value) => setDraft({ ...draft, discountSchemeId: value ? Number(value) : null })} options={discountSchemeOptions} value={draft.discountSchemeId ? String(draft.discountSchemeId) : ""} />
                <ErpLookupField disabled={quoteLocked} label="Payment terms" onChange={(value) => setDraft({ ...draft, paymentTermsId: value ? Number(value) : null })} options={paymentTermOptions} value={draft.paymentTermsId ? String(draft.paymentTermsId) : ""} />
                <ErpLookupField disabled={quoteLocked} label="Tax treatment" onChange={(value) => setDraft({ ...draft, taxTreatment: value || null })} options={taxTreatmentOptions} value={draft.taxTreatment ?? ""} />
                <ErpLookupField disabled={quoteLocked} label="Tax category" onChange={(value) => setDraft({ ...draft, taxCategoryId: value ? Number(value) : null })} options={taxCategoryOptions} value={draft.taxCategoryId ? String(draft.taxCategoryId) : ""} />
                <ErpLookupField disabled={quoteLocked} label="Currency" onChange={(value) => setDraft({ ...draft, currencyId: value ? Number(value) : null })} options={currencyOptions} value={draft.currencyId ? String(draft.currencyId) : ""} />
                <ErpLookupField disabled={quoteLocked} label="Exchange rate" onChange={(value) => setDraft({ ...draft, exchangeRateId: value ? Number(value) : null })} options={exchangeRateOptions} value={draft.exchangeRateId ? String(draft.exchangeRateId) : ""} />
                <ErpLookupField disabled={quoteLocked} label="Trade terms" onChange={(value) => setDraft({ ...draft, tradeTermsId: value ? Number(value) : null })} options={tradeTermOptions} value={draft.tradeTermsId ? String(draft.tradeTermsId) : ""} />
                <label><span>Customer spec reference</span><input disabled={quoteLocked} onChange={(event) => setDraft({ ...draft, customerSpecRef: event.target.value })} value={draft.customerSpecRef ?? ""} /></label>
                <label className="form-span-2"><span>Internal remarks</span><textarea disabled={quoteLocked} onChange={(event) => setDraft({ ...draft, internalRemarks: event.target.value })} value={draft.internalRemarks ?? ""} /></label>
                <label className="form-span-2"><span>Customer-facing remarks</span><textarea disabled={quoteLocked} onChange={(event) => setDraft({ ...draft, customerFacingRemarks: event.target.value })} value={draft.customerFacingRemarks ?? ""} /></label>
                <label className="form-span-2"><span>Print remarks</span><textarea disabled={quoteLocked} onChange={(event) => setDraft({ ...draft, printRemarks: event.target.value })} value={draft.printRemarks ?? ""} /></label>
              </FormShell>
            </Card>
            <Card title="Quote lines" description="Add every customer demand line before saving the quote draft.">
              <ErpTransactionLineGrid
                addLabel="Add Line"
                ariaLabel="Quote line grid"
                columns={[
                  { key: "line", header: "Line", width: "72px", render: (line) => <ErpNumberField disabled label="Line no" onChange={() => undefined} value={line.lineNo} /> },
                  { key: "item", header: "Item", width: "190px", render: (line, index) => <ErpLookupField disabled={quoteLocked} label="Item" onChange={(value) => updateLine(index, { itemId: value ? Number(value) : 0 })} options={itemOptions} required value={String(line.itemId || "")} /> },
                  { key: "uom", header: "UOM", width: "150px", render: (line, index) => <ErpLookupField disabled={quoteLocked} label="Order UOM" onChange={(value) => updateLine(index, { orderUomId: value ? Number(value) : 0 })} options={uomOptions} required value={String(line.orderUomId || "")} /> },
                  { key: "qty", header: "Qty", width: "120px", render: (line, index) => <ErpDecimalField disabled={quoteLocked} label="Quantity" min={0.001} onChange={(value) => updateLine(index, { quantity: value ?? 0 })} required scale={3} value={line.quantity} /> },
                  { key: "price", header: "Price", width: "120px", render: (line, index) => <ErpMoneyField disabled={quoteLocked} label="Unit price" min={0} onChange={(value) => updateLine(index, { unitPrice: value ?? 0, priceSourceType: "ManualOverride" })} value={line.unitPrice} /> },
                  { key: "price-source", header: "Price source", width: "160px", render: (line, index) => <ErpLookupField disabled={quoteLocked} label="Price source" onChange={(value) => updateLine(index, { priceSourceType: value })} options={["Manual", "ManualOverride", "PriceList"].map(toOption)} value={line.priceSourceType ?? "Manual"} /> },
                  { key: "discount", header: "Disc %", width: "110px", render: (line, index) => <ErpDecimalField disabled={quoteLocked} label="Discount %" max={100} min={0} onChange={(value) => updateLine(index, { discountPercent: value ?? 0 })} scale={2} unit="%" value={line.discountPercent} /> },
                  { key: "tax-code", header: "Tax code", width: "150px", render: (line, index) => <ErpLookupField disabled={quoteLocked} label="Tax code" onChange={(value) => updateLine(index, { taxCodeId: value ? Number(value) : null })} options={taxCodeOptions} value={line.taxCodeId ? String(line.taxCodeId) : ""} /> },
                  { key: "tax", header: "Tax %", width: "110px", render: (line, index) => <ErpDecimalField disabled={quoteLocked} label="Tax %" max={100} min={0} onChange={(value) => updateLine(index, { taxPercent: value ?? 0, taxRateSnapshot: value ?? 0 })} scale={2} unit="%" value={line.taxPercent} /> },
                  { key: "remarks", header: "Line remarks", width: "210px", render: (line, index) => <label><span>Customer-facing line remarks</span><input disabled={quoteLocked} onChange={(event) => updateLine(index, { lineCustomerFacingRemarks: event.target.value })} value={line.lineCustomerFacingRemarks ?? ""} /></label> },
                  { key: "internal-remarks", header: "Internal", width: "180px", render: (line, index) => <label><span>Internal line remarks</span><input disabled={quoteLocked} onChange={(event) => updateLine(index, { lineInternalRemarks: event.target.value })} value={line.lineInternalRemarks ?? ""} /></label> },
                  { key: "override", header: "Override reason", width: "180px", render: (line, index) => <label><span>Override reason</span><input disabled={quoteLocked} onChange={(event) => updateLine(index, { overrideReason: event.target.value })} value={line.overrideReason ?? ""} /></label> },
                  { key: "make", header: "Make", width: "140px", render: (line, index) => <ErpLookupField disabled={quoteLocked} label="Make type" onChange={(value) => updateLine(index, { makeType: value })} options={[{ label: "Make", value: "Make" }, { label: "Buy", value: "Buy" }, { label: "Subcontract", value: "Subcontract" }]} value={line.makeType} /> },
                  { key: "date", header: "Promised", width: "140px", render: (line, index) => <label><span>Promised date</span><input disabled={quoteLocked} onChange={(event) => updateLine(index, { promisedDate: event.target.value || null })} type="date" value={line.promisedDate ?? ""} /></label> },
                  { key: "status", header: "Status", width: "140px", render: (line, index) => <ErpLookupField disabled={quoteLocked} label="Line status" onChange={(value) => updateLine(index, { status: value })} options={[{ label: "Draft", value: "Draft" }, { label: "Submitted", value: "Submitted" }]} value={line.status} /> },
                  { key: "actions", header: "Actions", width: "150px", render: (_line, index) => <ErpActionBar danger={[{ disabled: quoteLocked || draft.lines.length <= 1, label: "Remove Line", onClick: !quoteLocked && draft.lines.length > 1 ? () => removeQuoteLine(index) : undefined, reason: quoteLocked ? "Released or converted quote snapshots are locked." : draft.lines.length <= 1 ? "At least one quote line is required." : undefined }]} /> }
                ]}
                addDisabled={quoteLocked}
                addDisabledReason={quoteLocked ? "Released or converted quote snapshots are locked." : undefined}
                getRowId={(line, index) => `${line.lineNo}-${index}`}
                lines={draft.lines}
                onAddLine={addQuoteLine}
                testId="quote-line-grid"
              />
            </Card>
            <Card title="Pricing, tax, and charges" description="Line totals are calculated from all quote lines; unsupported charge workflows are disabled with reasons.">
              <ErpTransactionTotalsPanel
                items={[
                  { eyebrow: "Gross", label: "Line value", meta: "Qty x price", value: moneyLabel(quoteTotals?.gross ?? 0) },
                  { eyebrow: "Discount", label: "Line discount", meta: "All lines", value: moneyLabel(quoteTotals?.discount ?? 0) },
                  { eyebrow: "Taxable", label: "After discount", meta: "All lines", value: moneyLabel(quoteTotals?.taxable ?? 0) },
                  { eyebrow: "Tax", label: "Line tax", meta: "All lines", value: moneyLabel(quoteTotals?.tax ?? 0) },
                  { eyebrow: "Charges", label: "Freight / packing / other", meta: "Header charges", value: moneyLabel(quoteTotals?.charges ?? 0) },
                  { eyebrow: "Total", label: "Quote value", meta: draft.releasedAt ? "Released snapshot shown after save" : "Before server validation", tone: "strong", value: moneyLabel(draft.grandTotalAmount && quoteLocked ? draft.grandTotalAmount : quoteTotals?.total ?? 0) }
                ]}
              />
              <div className="item-master__editor-grid">
                <ErpMoneyField disabled={quoteLocked} label="Freight amount" min={0} onChange={(value) => setDraft({ ...draft, freightAmount: value ?? 0 })} value={draft.freightAmount ?? 0} />
                <ErpMoneyField disabled={quoteLocked} label="Packing amount" min={0} onChange={(value) => setDraft({ ...draft, packingAmount: value ?? 0 })} value={draft.packingAmount ?? 0} />
                <ErpMoneyField disabled={quoteLocked} label="Insurance amount" min={0} onChange={(value) => setDraft({ ...draft, insuranceAmount: value ?? 0 })} value={draft.insuranceAmount ?? 0} />
                <ErpMoneyField disabled={quoteLocked} label="Other charges" min={0} onChange={(value) => setDraft({ ...draft, otherChargesAmount: value ?? 0 })} value={draft.otherChargesAmount ?? 0} />
                <ErpMoneyField disabled={quoteLocked} label="Add / less amount" onChange={(value) => setDraft({ ...draft, addLessAmount: value ?? 0 })} value={draft.addLessAmount ?? 0} />
                <ErpMoneyField disabled={quoteLocked} label="Round-off amount" onChange={(value) => setDraft({ ...draft, roundOffAmount: value ?? 0 })} value={draft.roundOffAmount ?? 0} />
                {quoteCommercialStatus === "Released" ? <label className="form-span-2"><span>Reopen reason</span><input onChange={(event) => setReopenReason(event.target.value)} value={reopenReason} /></label> : null}
                <Tile eyebrow="Commercial status" label={quoteCommercialStatus} meta={`Revision ${draft.revisionNo ?? 1}`}>
                  {draft.releasedAt ? `Released ${draft.releasedAt}` : "Draft snapshot not released"}
                </Tile>
              </div>
            </Card>
          </div>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

export function SalesOrderListPage() {
  const { session, user } = useAuth();
  const live = hasLiveSession(session);
  const companyId = user?.activeContext.companyId ?? 0;
  const branchId = user?.activeContext.branchId ?? 0;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [draftOrderId, setDraftOrderId] = useState<number | null>(null);
  const [draft, setDraft] = useState<SalesOrderDraftState | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(() => buildMasterFilter(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), [deferredSearch, status, user?.activeContext.branchId, user?.activeContext.companyId]);
  const query = useApiQuery(queryKeys.salesPlanning.salesOrders(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), () => listSalesOrderSetup(session, filter), { staleTime: 60_000 });
  const customers = useApiQuery(queryKeys.partners.customers(companyId, branchId, "", "Active"), () => apiClient.partners.customers({ companyId, status: "Active" }), { enabled: live && companyId > 0, staleTime: 60_000 });
  const itemLookup = useApiQuery(queryKeys.masters.items(companyId, "", "Active"), () => apiClient.masters.itemLookup(companyId), { enabled: live && companyId > 0, staleTime: 60_000 });
  const uoms = useApiQuery(queryKeys.measurements.uoms(companyId, "", "Active"), () => apiClient.measurements.uoms({ companyId, status: "Active" }), { enabled: live && companyId > 0, staleTime: 60_000 });
  const usersQuery = useApiQuery(["platform", "sales-order-owner-users"], () => live ? apiClient.platform.users() : Promise.resolve([]), { enabled: live, staleTime: 60_000 });
  const priceListsQuery = useApiQuery(queryKeys.commercial.priceLists(companyId, "", "Active"), () => apiClient.commercial.priceLists({ companyId, pageSize: 100, status: "Active" }).then((response) => response.items), { enabled: live && companyId > 0, staleTime: 60_000 });
  const discountSchemesQuery = useApiQuery(queryKeys.commercial.discountSchemes(companyId, "", "Active"), () => apiClient.commercial.discountSchemes({ companyId, pageSize: 100, status: "Active" }).then((response) => response.items), { enabled: live && companyId > 0, staleTime: 60_000 });
  const taxCategoriesQuery = useApiQuery(queryKeys.commercial.taxCategories(companyId, "", "Active"), () => apiClient.commercial.taxCategories({ companyId, pageSize: 100, status: "Active" }).then((response) => response.items), { enabled: live && companyId > 0, staleTime: 60_000 });
  const currenciesQuery = useApiQuery(queryKeys.commercial.currencies(companyId, "", "Active"), () => apiClient.commercial.currencies({ companyId, pageSize: 100, status: "Active" }).then((response) => response.items), { enabled: live && companyId > 0, staleTime: 60_000 });
  const exchangeRatesQuery = useApiQuery(queryKeys.commercial.exchangeRates(companyId, "", "Active"), () => apiClient.commercial.exchangeRates({ companyId, pageSize: 100, status: "Active" }).then((response) => response.items), { enabled: live && companyId > 0, staleTime: 60_000 });
  const paymentTermsQuery = useApiQuery(queryKeys.commercial.paymentTerms(companyId, "", "Active"), () => apiClient.commercial.paymentTerms({ companyId, pageSize: 100, status: "Active" }).then((response) => response.items), { enabled: live && companyId > 0, staleTime: 60_000 });
  const tradeTermsQuery = useApiQuery(queryKeys.commercial.tradeTerms(companyId, "", "Active"), () => apiClient.commercial.tradeTerms({ companyId, pageSize: 100, status: "Active" }).then((response) => response.items), { enabled: live && companyId > 0, staleTime: 60_000 });
  const records = query.data ?? [];
  const source = records[0]?.source ?? (live ? "Live" : "Seeded");
  const customerOptions = (customers.data?.items ?? []).map((customer) => ({ label: `${customer.customerCode} / ${customer.customerName}`, value: String(customer.id) }));
  const itemOptions = (itemLookup.data ?? []).map((item) => ({ label: `${item.itemCode} / ${item.itemName}`, value: String(item.id) }));
  const uomOptions = (uoms.data?.items ?? []).map((uom) => ({ label: `${uom.uomCode} / ${uom.uomName}`, value: String(uom.id) }));
  const salesOwnerOptions = (usersQuery.data ?? [])
    .filter((userRecord) => userRecord.status === "Active" && directoryUserNumericId(userRecord.id) > 0)
    .map((userRecord) => ({ label: userRecord.displayName || userRecord.userName, value: String(directoryUserNumericId(userRecord.id)) }));
  const priceListOptions = (priceListsQuery.data ?? []).map((list) => ({ label: `${list.priceListCode} / ${list.priceListName}`, value: String(list.id) }));
  const discountSchemeOptions = (discountSchemesQuery.data ?? []).map((scheme) => ({ label: `${scheme.schemeCode} / ${scheme.schemeName}`, value: String(scheme.id) }));
  const taxCategoryOptions = (taxCategoriesQuery.data ?? []).map((tax) => ({ label: `${tax.taxCategoryCode} / ${tax.taxCategoryName}`, value: String(tax.id) }));
  const taxCodeOptions = (taxCategoriesQuery.data ?? []).flatMap((tax) => tax.taxCodes.map((code) => ({ label: `${code.taxCode} / ${code.ratePercent}%`, value: String(code.id) })));
  const currencyOptions = (currenciesQuery.data ?? []).map((currency) => ({ label: `${currency.currencyCode} / ${currency.currencyName}`, value: String(currency.id) }));
  const exchangeRateOptions = (exchangeRatesQuery.data ?? []).map((rate) => ({ label: `${rate.currencyCode} / ${rate.rateType} / ${rate.effectiveFrom}`, value: String(rate.id) }));
  const paymentTermOptions = (paymentTermsQuery.data ?? []).map((term) => ({ label: `${term.paymentTermsCode} / ${term.paymentTermsName}`, value: String(term.id) }));
  const tradeTermOptions = (tradeTermsQuery.data ?? []).map((term) => ({ label: `${term.tradeTermsCode} / ${term.tradeTermsName}`, value: String(term.id) }));
  const taxTreatmentOptions = ["Taxable", "Exempt", "ZeroRated", "OutOfScope"].map(toOption);
  const salesOrderTotals = draft ? calculateCommercialTotals(draft) : null;
  const salesOrderDefaultRefreshReason = draft?.sourceQuoteId
    ? "Sales orders converted from quote keep the released quote snapshot."
    : draft && draft.status !== "Draft"
      ? "Customer defaults can only be refreshed while the sales order is Draft."
      : !live
        ? "Live customer profile data is required to refresh defaults."
        : !draft?.customerId
          ? "Select a customer before refreshing defaults."
          : undefined;
  const validation = [
    draft && !draft.salesOrderNo.trim() ? "Sales order number is required." : "",
    draft && !draft.customerId ? "Customer is required." : "",
    draft && draft.lines.length === 0 ? "At least one sales order line is required." : "",
    ...(draft?.lines.flatMap((line, index) => [
      !line.itemId ? `Line ${index + 1} item is required.` : "",
      !line.orderUomId ? `Line ${index + 1} order UOM is required.` : "",
      line.quantity <= 0 ? `Line ${index + 1} quantity must be greater than zero.` : "",
      !line.promisedDate ? `Line ${index + 1} promised date is required.` : "",
      !line.requestedShipDate ? `Line ${index + 1} requested ship date is required.` : ""
    ]) ?? [])
  ].filter(Boolean) as string[];
  const saveMutation = useApiMutation(
    (request: SalesOrderUpsertRequest) =>
      draftOrderId ? apiClient.salesPlanning.updateSalesOrder(draftOrderId, request) : apiClient.salesPlanning.createSalesOrder(request),
    {
      onSuccess: async (saved) => {
        setDraftOrderId(saved.id);
        setDraft(salesOrderDtoToDraft(saved));
        setSaveMessage(`Saved ${saved.salesOrderNo}.`);
        await query.refetch();
      },
      onError: (error) => setSaveMessage(error.message)
    }
  );
  const saveReason = !live
    ? "Sales order save requires a live sales session."
    : validation.length > 0
      ? "Resolve validation issues before saving."
      : saveMutation.isPending
        ? "Sales order save is in progress."
        : undefined;
  const openNewDraft = () => {
    setDraftOrderId(null);
    setDraft(buildSalesOrderDraft(companyId, branchId));
    setSaveMessage(null);
  };
  const openEditDraft = (record: SalesOrderSetupItem) => {
    setDraftOrderId(record.source === "Live" ? record.salesOrderId : null);
    setDraft(toSalesOrderDraft(record));
    setSaveMessage(null);
  };
  const updateLine = (lineIndex: number, patch: Partial<SalesOrderUpsertRequest["lines"][number]>) => {
    setDraft((current) => current ? { ...current, lines: current.lines.map((line, index) => index === lineIndex ? { ...line, ...patch } : line) } : current);
  };
  const addLine = () => setDraft((current) => current ? { ...current, lines: [...current.lines, buildSalesOrderLine((current.lines.length + 1) * 10)] } : current);
  const removeLine = (lineIndex: number) => {
    setDraft((current) => {
      if (!current || current.lines.length <= 1) {
        return current;
      }

      return { ...current, lines: current.lines.filter((_, index) => index !== lineIndex).map((line, index) => ({ ...line, lineNo: (index + 1) * 10 })) };
    });
  };
  const refreshSalesOrderCustomerDefaults = async () => {
    if (!draft || !live || !companyId || !branchId || draft.sourceQuoteId || draft.status !== "Draft") {
      return;
    }

    try {
      const defaults = await apiClient.partners.customerCommercialDefaults(draft.customerId, {
        companyId,
        branchId,
        customerAddressId: draft.billToAddressId,
        documentDate: draft.orderDate
      });
      setDraft({
        ...draft,
        salesOwnerUserId: draft.salesOwnerUserId ?? defaults.salesOwner.value,
        salesOwnerName: draft.salesOwnerUserId ? draft.salesOwnerName : defaults.salesOwner.display,
        priceListId: draft.priceListId ?? defaults.priceList.value,
        discountSchemeId: draft.discountSchemeId ?? defaults.discountScheme.value,
        paymentTermsId: draft.paymentTermsId ?? defaults.paymentTerms.value,
        taxCategoryId: draft.taxCategoryId ?? defaults.taxCategory.value,
        taxTreatment: draft.taxTreatment ?? defaults.taxTreatment.value,
        currencyId: draft.currencyId ?? defaults.currency.value,
        tradeTermsId: draft.tradeTermsId ?? defaults.tradeTerms.value
      });
      setSaveMessage(defaults.validationMessages[0] ?? "Customer defaults applied to blank sales order fields.");
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : "Customer defaults could not be loaded.");
    }
  };

  return (
    <>
      <ListPageShell
        actions={
          <>
            <SourceBadge source={source} />
            <ErpActionBar
              primary={[{ disabled: !live, label: "New order draft", onClick: live ? openNewDraft : undefined, reason: live ? undefined : "Sales order drafting requires a live sales session." }]}
              secondary={[{ disabled: true, label: "Export orders", reason: "Sales order export is pending the approved reporting workflow." }]}
              testId="sales-order-action-bar"
            />
          </>
        }
        aside={<WorkbenchAside description="Sales order screens remain demand-entry surfaces and do not alter production release logic." endpoint="/api/sales-orders" source={source} />}
        description="Sales order list and detail entry point to manufacturing demand."
        filters={<FilterBar><input aria-label="Search sales orders" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search order, customer, quote" value={search} /><select aria-label="Sales order status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Released">Released</option><option value="At Risk">At Risk</option></select></FilterBar>}
        title="Sales Order List"
      >
        <KpiStrip items={[{ label: "Orders", value: String(records.length) }, { label: "At risk", value: String(records.filter((record) => record.status.includes("Risk")).length) }, { label: "Lines", value: String(records.reduce((total, record) => total + record.lineCount, 0)) }, { label: "Qty", value: String(records.reduce((total, record) => total + record.totalQuantity, 0)) }]} />
        <Card title="Manufacturing demand" description="Order lines, promise dates, attachments, and make type stay visible from the list.">
          <DataGrid ariaLabel="Sales order list" columns={salesOrderColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={openEditDraft} records={records} rowLabel={(record) => `${record.salesOrderNo} sales order`} virtualization={{ enabled: true }} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Create and maintain sales order demand lines before planning, production, and dispatch consume the order."
        footer={<ErpActionBar primary={[{ disabled: Boolean(saveReason), label: saveMutation.isPending ? "Saving order draft" : "Save order draft", onClick: saveReason ? undefined : () => draft && saveMutation.mutate({ ...draft, lines: draft.lines.map((line, index) => ({ ...line, lineNo: (index + 1) * 10 })) }), reason: saveReason }]} utility={[{ label: "Close", onClick: () => { setDraft(null); setDraftOrderId(null); }, variant: "quiet" }]} />}
        isOpen={Boolean(draft)}
        onClose={() => { setDraft(null); setDraftOrderId(null); }}
        statusMeta={<>{draft ? <StatusBadge status={draft.status} /> : null}{saveMessage ? <ErpStatusChip tone={saveMessage.startsWith("Saved") ? "success" : "danger"}>{saveMessage}</ErpStatusChip> : null}</>}
        title={draftOrderId ? `Sales order ${draft?.salesOrderNo}` : "New order draft"}
        validation={<ErpValidationSummary errors={validation} title="Sales order checks" />}
      >
        {draft ? <div className="modal-form-grid" data-testid="sales-order-draft-modal">
          <Card title="Sales order header" description="Customer, promise, and demand status drive downstream planning consumption.">
            <ErpActionBar
              secondary={[{
                disabled: Boolean(salesOrderDefaultRefreshReason),
                label: "Refresh customer defaults",
                onClick: !salesOrderDefaultRefreshReason ? refreshSalesOrderCustomerDefaults : undefined,
                reason: salesOrderDefaultRefreshReason
              }]}
            />
            <div className="context-chip-row">
              <ErpStatusChip tone={draft.sourceQuoteId ? "success" : draft.priceListId ? "info" : "neutral"}>{draft.sourceQuoteId ? "Quote snapshot copied" : draft.priceListId ? "Price list set" : "Price list not defaulted"}</ErpStatusChip>
              <ErpStatusChip tone={draft.salesOwnerUserId ? "info" : "neutral"}>{draft.salesOwnerUserId ? "Sales owner set" : "Sales owner not defaulted"}</ErpStatusChip>
            </div>
            <FormShell initialFingerprint={`${draftOrderId ?? "new"}-${draft.salesOrderNo}`} title="Header">
              <label><span>Sales order number</span><input onChange={(event) => setDraft({ ...draft, salesOrderNo: event.target.value })} value={draft.salesOrderNo} /></label>
              <ErpLookupField disabled={Boolean(draftOrderId)} disabledReason={draftOrderId ? "Customer cannot be changed after the sales order is saved." : undefined} label="Customer" onChange={(value) => setDraft({ ...draft, customerId: value ? Number(value) : 0 })} options={customerOptions} required value={String(draft.customerId || "")} />
              <ErpLookupField label="Sales owner" onChange={(value) => {
                const selectedOwner = salesOwnerOptions.find((option) => option.value === value);
                setDraft({ ...draft, salesOwnerUserId: value ? Number(value) : null, salesOwnerName: selectedOwner?.label ?? null });
              }} options={salesOwnerOptions} value={draft.salesOwnerUserId ? String(draft.salesOwnerUserId) : ""} />
              <label><span>Order date</span><input onChange={(event) => setDraft({ ...draft, orderDate: event.target.value })} type="date" value={draft.orderDate} /></label>
              <label><span>Promised date</span><input onChange={(event) => setDraft({ ...draft, promisedDate: event.target.value || null })} type="date" value={draft.promisedDate ?? ""} /></label>
              <ErpLookupField label="Priority" onChange={(value) => setDraft({ ...draft, priorityCode: value })} options={[{ label: "Low", value: "Low" }, { label: "Medium", value: "Medium" }, { label: "High", value: "High" }]} value={draft.priorityCode} />
              <ErpLookupField label="Status" onChange={(value) => setDraft({ ...draft, status: value })} options={[{ label: "Draft", value: "Draft" }, { label: "Released", value: "Released" }, { label: "At Risk", value: "At Risk" }]} value={draft.status} />
              <ErpLookupField label="Price list" onChange={(value) => setDraft({ ...draft, priceListId: value ? Number(value) : null })} options={priceListOptions} value={draft.priceListId ? String(draft.priceListId) : ""} />
              <ErpLookupField label="Discount scheme" onChange={(value) => setDraft({ ...draft, discountSchemeId: value ? Number(value) : null })} options={discountSchemeOptions} value={draft.discountSchemeId ? String(draft.discountSchemeId) : ""} />
              <ErpLookupField label="Payment terms" onChange={(value) => setDraft({ ...draft, paymentTermsId: value ? Number(value) : null })} options={paymentTermOptions} value={draft.paymentTermsId ? String(draft.paymentTermsId) : ""} />
              <ErpLookupField label="Tax treatment" onChange={(value) => setDraft({ ...draft, taxTreatment: value || null })} options={taxTreatmentOptions} value={draft.taxTreatment ?? ""} />
              <ErpLookupField label="Tax category" onChange={(value) => setDraft({ ...draft, taxCategoryId: value ? Number(value) : null })} options={taxCategoryOptions} value={draft.taxCategoryId ? String(draft.taxCategoryId) : ""} />
              <ErpLookupField label="Currency" onChange={(value) => setDraft({ ...draft, currencyId: value ? Number(value) : null })} options={currencyOptions} value={draft.currencyId ? String(draft.currencyId) : ""} />
              <ErpLookupField label="Exchange rate" onChange={(value) => setDraft({ ...draft, exchangeRateId: value ? Number(value) : null })} options={exchangeRateOptions} value={draft.exchangeRateId ? String(draft.exchangeRateId) : ""} />
              <ErpLookupField label="Trade terms" onChange={(value) => setDraft({ ...draft, tradeTermsId: value ? Number(value) : null })} options={tradeTermOptions} value={draft.tradeTermsId ? String(draft.tradeTermsId) : ""} />
              <label><span>Source quote</span><input disabled value={draft.sourceQuoteId ? `Quote ${draft.sourceQuoteId} / revision ${draft.sourceQuoteRevisionNo ?? "not set"}` : "Direct order"} /></label>
              <label className="form-span-2"><span>Internal remarks</span><textarea onChange={(event) => setDraft({ ...draft, internalRemarks: event.target.value })} value={draft.internalRemarks ?? ""} /></label>
              <label className="form-span-2"><span>Customer-facing remarks</span><textarea onChange={(event) => setDraft({ ...draft, customerFacingRemarks: event.target.value })} value={draft.customerFacingRemarks ?? ""} /></label>
              <label className="form-span-2"><span>Print remarks</span><textarea onChange={(event) => setDraft({ ...draft, printRemarks: event.target.value })} value={draft.printRemarks ?? ""} /></label>
            </FormShell>
          </Card>
          <Card title="Sales order lines" description="Add every customer demand line before releasing the order to planning.">
            <ErpTransactionLineGrid
              addLabel="Add Line"
              ariaLabel="Sales order line grid"
              columns={[
                { key: "line", header: "Line", width: "72px", render: (line) => <ErpNumberField disabled label="Line no" onChange={() => undefined} value={line.lineNo} /> },
                { key: "item", header: "Item", width: "190px", render: (line, index) => <ErpLookupField label="Item" onChange={(value) => updateLine(index, { itemId: value ? Number(value) : 0 })} options={itemOptions} required value={String(line.itemId || "")} /> },
                { key: "uom", header: "UOM", width: "150px", render: (line, index) => <ErpLookupField label="Order UOM" onChange={(value) => updateLine(index, { orderUomId: value ? Number(value) : 0 })} options={uomOptions} required value={String(line.orderUomId || "")} /> },
                { key: "qty", header: "Qty", width: "120px", render: (line, index) => <ErpDecimalField label="Quantity" min={0.001} onChange={(value) => updateLine(index, { quantity: value ?? 0 })} required scale={3} value={line.quantity} /> },
                { key: "price", header: "Price", width: "120px", render: (line, index) => <ErpMoneyField label="Unit price" min={0} onChange={(value) => updateLine(index, { unitPrice: value ?? 0, priceSourceType: "ManualOverride" })} value={line.unitPrice ?? 0} /> },
                { key: "discount", header: "Disc %", width: "110px", render: (line, index) => <ErpDecimalField label="Discount %" max={100} min={0} onChange={(value) => updateLine(index, { discountPercent: value ?? 0 })} scale={2} unit="%" value={line.discountPercent ?? 0} /> },
                { key: "tax-code", header: "Tax code", width: "150px", render: (line, index) => <ErpLookupField label="Tax code" onChange={(value) => updateLine(index, { taxCodeId: value ? Number(value) : null })} options={taxCodeOptions} value={line.taxCodeId ? String(line.taxCodeId) : ""} /> },
                { key: "tax", header: "Tax %", width: "110px", render: (line, index) => <ErpDecimalField label="Tax %" max={100} min={0} onChange={(value) => updateLine(index, { taxRateSnapshot: value ?? 0 })} scale={2} unit="%" value={line.taxRateSnapshot ?? 0} /> },
                { key: "remarks", header: "Remarks", width: "210px", render: (line, index) => <label><span>Customer-facing line remarks</span><input onChange={(event) => updateLine(index, { lineCustomerFacingRemarks: event.target.value })} value={line.lineCustomerFacingRemarks ?? ""} /></label> },
                { key: "override", header: "Override", width: "170px", render: (line, index) => <label><span>Override reason</span><input onChange={(event) => updateLine(index, { overrideReason: event.target.value })} value={line.overrideReason ?? ""} /></label> },
                { key: "make", header: "Make", width: "140px", render: (line, index) => <ErpLookupField label="Make type" onChange={(value) => updateLine(index, { makeType: value })} options={[{ label: "Make", value: "Make" }, { label: "Buy", value: "Buy" }, { label: "Subcontract", value: "Subcontract" }]} value={line.makeType} /> },
                { key: "promise", header: "Promised", width: "140px", render: (line, index) => <label><span>Promised date</span><input onChange={(event) => updateLine(index, { promisedDate: event.target.value || null })} type="date" value={line.promisedDate ?? ""} /></label> },
                { key: "ship", header: "Ship date", width: "140px", render: (line, index) => <label><span>Requested ship date</span><input onChange={(event) => updateLine(index, { requestedShipDate: event.target.value || null })} type="date" value={line.requestedShipDate ?? ""} /></label> },
                { key: "priority", header: "Priority", width: "130px", render: (line, index) => <ErpLookupField label="Line priority" onChange={(value) => updateLine(index, { priorityCode: value })} options={[{ label: "Low", value: "Low" }, { label: "Medium", value: "Medium" }, { label: "High", value: "High" }]} value={line.priorityCode} /> },
                { key: "status", header: "Status", width: "140px", render: (line, index) => <ErpLookupField label="Line status" onChange={(value) => updateLine(index, { status: value })} options={[{ label: "Draft", value: "Draft" }, { label: "Released", value: "Released" }, { label: "At Risk", value: "At Risk" }]} value={line.status} /> },
                { key: "actions", header: "Actions", width: "150px", render: (_line, index) => <ErpActionBar danger={[{ disabled: draft.lines.length <= 1, label: "Remove Line", onClick: draft.lines.length > 1 ? () => removeLine(index) : undefined, reason: draft.lines.length <= 1 ? "At least one sales order line is required." : undefined }]} /> }
              ]}
              getRowId={(line, index) => `${line.lineNo}-${index}`}
              lines={draft.lines}
              onAddLine={addLine}
              testId="sales-order-line-grid"
            />
          </Card>
          <Card title="Pricing, tax, and release contract" description="Commercial values are persisted on the sales order and copied exactly from a released quote when converted.">
            <ErpTransactionTotalsPanel
              items={[
                { eyebrow: "Gross", label: "Line value", meta: "Qty x price", value: moneyLabel(salesOrderTotals?.gross ?? 0) },
                { eyebrow: "Discount", label: "Line discount", meta: "All lines", value: moneyLabel(salesOrderTotals?.discount ?? 0) },
                { eyebrow: "Taxable", label: "After discount", meta: "All lines", value: moneyLabel(salesOrderTotals?.taxable ?? 0) },
                { eyebrow: "Tax", label: "Line tax", meta: "All lines", value: moneyLabel(salesOrderTotals?.tax ?? 0) },
                { eyebrow: "Charges", label: "Freight / packing / other", meta: "Header charges", value: moneyLabel(salesOrderTotals?.charges ?? 0) },
                { eyebrow: "Total", label: "Sales order value", meta: draft.sourceQuoteId ? "Quote snapshot copy" : "Before server validation", tone: "strong", value: moneyLabel(draft.grandTotalAmount && draft.sourceQuoteId ? draft.grandTotalAmount : salesOrderTotals?.total ?? 0) }
              ]}
            />
            <div className="item-master__editor-grid">
              <ErpMoneyField label="Freight amount" min={0} onChange={(value) => setDraft({ ...draft, freightAmount: value ?? 0 })} value={draft.freightAmount ?? 0} />
              <ErpMoneyField label="Packing amount" min={0} onChange={(value) => setDraft({ ...draft, packingAmount: value ?? 0 })} value={draft.packingAmount ?? 0} />
              <ErpMoneyField label="Insurance amount" min={0} onChange={(value) => setDraft({ ...draft, insuranceAmount: value ?? 0 })} value={draft.insuranceAmount ?? 0} />
              <ErpMoneyField label="Other charges" min={0} onChange={(value) => setDraft({ ...draft, otherChargesAmount: value ?? 0 })} value={draft.otherChargesAmount ?? 0} />
              <ErpMoneyField label="Add / less amount" onChange={(value) => setDraft({ ...draft, addLessAmount: value ?? 0 })} value={draft.addLessAmount ?? 0} />
              <ErpMoneyField label="Round-off amount" onChange={(value) => setDraft({ ...draft, roundOffAmount: value ?? 0 })} value={draft.roundOffAmount ?? 0} />
              <Tile eyebrow="Commercial source" label={draft.sourceQuoteId ? `Quote ${draft.sourceQuoteId}` : "Direct sales order"} meta={draft.sourceQuoteRevisionNo ? `Revision ${draft.sourceQuoteRevisionNo}` : "No released quote source"} />
            </div>
          </Card>
        </div> : null}
      </ErpModalWorkspace>
    </>
  );
}

export function BlanketOrderContractPage() {
  const { session, user } = useAuth();
  const live = hasLiveSession(session);
  const companyId = user?.activeContext.companyId ?? 0;
  const branchId = user?.activeContext.branchId ?? 0;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<BlanketOrderUpsertRequest | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(() => buildMasterFilter(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), [deferredSearch, status, user?.activeContext.branchId, user?.activeContext.companyId]);
  const query = useApiQuery(queryKeys.salesPlanning.blanketOrders(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), () => listBlanketOrderSetup(session, filter), { staleTime: 60_000 });
  const customers = useApiQuery(queryKeys.partners.customers(companyId, branchId, "", "Active"), () => apiClient.partners.customers({ companyId, status: "Active" }), { enabled: live && companyId > 0, staleTime: 60_000 });
  const items = useApiQuery(queryKeys.masters.items(companyId, "", "Active"), () => apiClient.masters.itemLookup(companyId), { enabled: live && companyId > 0, staleTime: 60_000 });
  const uoms = useApiQuery(queryKeys.measurements.uoms(companyId, "", "Active"), () => apiClient.measurements.uoms({ companyId, status: "Active" }), { enabled: live && companyId > 0, staleTime: 60_000 });
  const records = query.data ?? [];
  const selected = records.find((record) => record.id === selectedId) ?? null;
  const source = records[0]?.source ?? (live ? "Live" : "Seeded");
  const customerOptions = optionList(customers.data?.items, (customer) => customer.id, (customer) => `${customer.customerCode} / ${customer.customerName}`);
  const itemOptions = optionList(items.data, (item) => item.id, (item) => `${item.itemCode} / ${item.itemName}`);
  const uomOptions = optionList(uoms.data?.items, (uom) => uom.id, (uom) => `${uom.uomCode} / ${uom.uomName}`);
  const blanketErrors = [
    !draft?.blanketOrderNo.trim() ? "Blanket order number is required." : "",
    draft && !draft.customerId ? "Customer is required." : "",
    draft && draft.schedules.length === 0 ? "At least one schedule line is required." : "",
    ...(draft?.schedules ?? []).flatMap((line, index) => [
      !line.itemId ? `Schedule ${index + 1} item is required.` : "",
      !line.orderUomId ? `Schedule ${index + 1} UOM is required.` : "",
      line.quantity <= 0 ? `Schedule ${index + 1} quantity must be greater than zero.` : ""
    ])
  ].filter(Boolean);
  const saveReason = !draft
    ? "Open a blanket-order draft before saving."
    : !live
      ? "Live sales planning sign-in is required before saving blanket orders."
      : blanketErrors[0];
  const save = useApiMutation((request: BlanketOrderUpsertRequest) => apiClient.salesPlanning.createBlanketOrder(request), {
    onSuccess: async (record) => {
      setMessage(`Saved blanket order ${record.blanketOrderNo}.`);
      setDraft(null);
      await query.refetch();
    },
    onError: (error) => setMessage(error.message)
  });
  const openDraft = () => setDraft({ companyId, branchId, blanketOrderNo: `BLK-DRAFT-${Date.now().toString().slice(-6)}`, customerId: 0, startDate: todayIso(), endDate: addDaysIso(90), status: "Draft", schedules: [{ lineNo: 10, itemId: 0, scheduleDate: todayIso(), quantity: 1, orderUomId: 0, status: "Open" }] });
  const updateSchedule = (index: number, patch: Partial<BlanketOrderUpsertRequest["schedules"][number]>) => setDraft((current) => current ? { ...current, schedules: current.schedules.map((line, lineIndex) => lineIndex === index ? { ...line, ...patch } : line) } : current);
  const addSchedule = () => setDraft((current) => current ? { ...current, schedules: [...current.schedules, { lineNo: (current.schedules.length + 1) * 10, itemId: 0, scheduleDate: current.startDate, quantity: 1, orderUomId: 0, status: "Open" }] } : current);
  const removeSchedule = (index: number) => setDraft((current) => current ? { ...current, schedules: current.schedules.filter((_, lineIndex) => lineIndex !== index).map((line, lineIndex) => ({ ...line, lineNo: (lineIndex + 1) * 10 })) } : current);

  return (
    <>
      <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ label: "New blanket draft", onClick: openDraft }]} secondary={[{ disabled: true, label: "Export contracts", reason: "Contract export is pending the approved reporting workflow." }]} testId="blanket-order-action-bar" /></>} aside={<WorkbenchAside description="Blanket orders expose recurring demand schedules without releasing production." endpoint="/api/blanket-orders" source={source} />} description="Recurring demand and schedule releases by customer and period." filters={<FilterBar><input aria-label="Search blanket orders" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search contract, customer, release" value={search} /><select aria-label="Blanket order status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Active">Active</option><option value="Draft">Draft</option></select></FilterBar>} title="Blanket Order / Contract">
        {query.error ? <Card title="Live blanket-order data unavailable" description={query.error.message} /> : null}
        {message ? <Badge tone={message.toLowerCase().includes("saved") ? "success" : "danger"}>{message}</Badge> : null}
        <KpiStrip items={[{ label: "Contracts", value: String(records.length) }, { label: "Schedules", value: String(records.reduce((total, record) => total + record.scheduleCount, 0)) }, { label: "Qty", value: String(records.reduce((total, record) => total + record.totalQuantity, 0)) }, { label: "Active", value: String(records.filter((record) => record.status === "Active").length) }]} />
        <Card title="Blanket contract registry" description="Schedule releases remain reviewable before demand enters planning.">
          <DataGrid ariaLabel="Blanket order list" columns={blanketOrderColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => setSelectedId(record.id)} records={records} rowLabel={(record) => `${record.blanketOrderNo} blanket order`} virtualization={{ enabled: true }} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace description="Create a blanket contract with schedule lines that feed demand planning." footer={<ErpActionBar primary={[{ disabled: Boolean(saveReason) || save.isPending || blanketErrors.length > 0, label: save.isPending ? "Saving blanket draft" : "Save blanket draft", onClick: draft && !saveReason && blanketErrors.length === 0 ? () => save.mutate(draft) : undefined, reason: saveReason ?? blanketErrors[0] }]} secondary={[{ disabled: !live, label: "Add schedule line", onClick: live ? addSchedule : undefined, reason: live ? undefined : "Live sales planning sign-in is required before adding schedule lines." }]} utility={[{ label: "Close", onClick: () => setDraft(null), variant: "quiet" }]} />} isOpen={Boolean(draft)} onClose={() => setDraft(null)} title={draft?.blanketOrderNo ?? "Blanket draft"} validation={<ErpValidationSummary errors={blanketErrors} />}>
        {draft ? (
          <div className="modal-form-grid">
            <FormShell initialFingerprint={`${draft.blanketOrderNo}-header`} title="Blanket order controls">
              <label><span>Blanket order number</span><input disabled={!live} onChange={(event) => setDraft({ ...draft, blanketOrderNo: event.target.value })} value={draft.blanketOrderNo} /></label>
              <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live sales planning sign-in is required before selecting a customer."} label="Customer" onChange={(value) => setDraft({ ...draft, customerId: numberValue(value) })} options={customerOptions} required value={draft.customerId ? String(draft.customerId) : ""} />
              <label><span>Start date</span><input disabled={!live} onChange={(event) => setDraft({ ...draft, startDate: event.target.value })} type="date" value={dateControlValue(draft.startDate)} /></label>
              <label><span>End date</span><input disabled={!live} onChange={(event) => setDraft({ ...draft, endDate: event.target.value })} type="date" value={dateControlValue(draft.endDate)} /></label>
              <ErpLookupField disabled={!live} disabledReason={live ? undefined : "Live sales planning sign-in is required before changing status."} label="Status" onChange={(value) => setDraft({ ...draft, status: value })} options={["Draft", "Active", "Closed"].map(toOption)} value={draft.status} />
            </FormShell>
            <Card title="Schedule lines" description="Add every contract release bucket with governed item, UOM, date, and quantity controls.">
              <ErpTransactionLineGrid
                addDisabled={!live}
                addDisabledReason="Live sales planning sign-in is required before adding schedule lines."
                addLabel="Add schedule line"
                ariaLabel="Blanket schedule line grid"
                columns={[
                  { key: "line", header: "Line", width: "72px", render: (line) => <ErpNumberField disabled label="Line no" onChange={() => undefined} value={line.lineNo} /> },
                  { key: "item", header: "Item", width: "190px", render: (line, index) => <ErpLookupField disabled={!live} label="Item" onChange={(value) => updateSchedule(index, { itemId: numberValue(value) })} options={itemOptions} required value={line.itemId ? String(line.itemId) : ""} /> },
                  { key: "date", header: "Schedule date", width: "140px", render: (line, index) => <label><span>Schedule date</span><input disabled={!live} onChange={(event) => updateSchedule(index, { scheduleDate: event.target.value })} type="date" value={dateControlValue(line.scheduleDate)} /></label> },
                  { key: "qty", header: "Qty", width: "120px", render: (line, index) => <ErpDecimalField disabled={!live} label="Quantity" min={0.001} onChange={(value) => updateSchedule(index, { quantity: value ?? 0 })} value={line.quantity} /> },
                  { key: "uom", header: "UOM", width: "150px", render: (line, index) => <ErpLookupField disabled={!live} label="Order UOM" onChange={(value) => updateSchedule(index, { orderUomId: numberValue(value) })} options={uomOptions} required value={line.orderUomId ? String(line.orderUomId) : ""} /> },
                  { key: "status", header: "Status", width: "140px", render: (line, index) => <ErpLookupField disabled={!live} label="Schedule status" onChange={(value) => updateSchedule(index, { status: value })} options={["Open", "Released", "Closed"].map(toOption)} value={line.status} /> },
                  { key: "actions", header: "Actions", width: "150px", render: (_line, index) => <ErpActionBar danger={[{ disabled: !live || draft.schedules.length <= 1, label: "Remove Line", onClick: live && draft.schedules.length > 1 ? () => removeSchedule(index) : undefined, reason: !live ? "Live sales planning sign-in is required before removing schedule lines." : draft.schedules.length <= 1 ? "At least one schedule line is required." : undefined }]} /> }
                ]}
                getRowId={(line, index) => `${line.lineNo}-${index}`}
                lines={draft.schedules}
                onAddLine={addSchedule}
                testId="blanket-schedule-line-grid"
              />
            </Card>
          </div>
        ) : null}
      </ErpModalWorkspace>
      <ErpModalWorkspace description="Review saved blanket contract schedule and demand horizon." footer={<ErpActionBar primary={[{ disabled: true, label: "Edit blanket draft", reason: "Open a new blanket draft for new contract schedules; saved contract correction needs approval." }]} utility={[{ label: "Close", onClick: () => setSelectedId(null), variant: "quiet" }]} />} isOpen={Boolean(selected)} onClose={() => setSelectedId(null)} title={selected?.blanketOrderNo ?? "Blanket order detail"}>{selected ? <FormShell initialFingerprint={selected.id} title="Blanket order setup"><ErpLookupField disabled disabledReason="Customer selection is controlled from Customer Master." label="Customer" onChange={() => undefined} options={[{ label: selected.customerLabel, value: selected.customerLabel }]} value={selected.customerLabel} /><ErpLookupField disabled disabledReason="Contract horizon is controlled by the blanket-order schedule." label="Horizon" onChange={() => undefined} options={[{ label: selected.horizon, value: selected.horizon }]} value={selected.horizon} /><ErpLookupField disabled disabledReason="Next release is calculated from the blanket-order schedule." label="Next release" onChange={() => undefined} options={[{ label: selected.nextRelease, value: selected.nextRelease }]} value={selected.nextRelease} /></FormShell> : null}</ErpModalWorkspace>
    </>
  );
}

export function DemandForecastPage() {
  const { session, user } = useAuth();
  const live = hasLiveSession(session);
  const companyId = user?.activeContext.companyId ?? 0;
  const branchId = user?.activeContext.branchId ?? 0;
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [draft, setDraft] = useState<DemandForecastUpsertRequest | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(() => buildMasterFilter(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), [deferredSearch, status, user?.activeContext.branchId, user?.activeContext.companyId]);
  const query = useApiQuery(queryKeys.salesPlanning.forecasts(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), () => listDemandForecastSetup(session, filter), { staleTime: 60_000 });
  const items = useApiQuery(queryKeys.masters.items(companyId, "", "Active"), () => apiClient.masters.itemLookup(companyId), { enabled: live && companyId > 0, staleTime: 60_000 });
  const uoms = useApiQuery(queryKeys.measurements.uoms(companyId, "", "Active"), () => apiClient.measurements.uoms({ companyId, status: "Active" }), { enabled: live && companyId > 0, staleTime: 60_000 });
  const records = query.data ?? [];
  const source = records[0]?.source ?? (live ? "Live" : "Seeded");
  const itemOptions = optionList(items.data, (item) => item.id, (item) => `${item.itemCode} / ${item.itemName}`);
  const uomOptions = optionList(uoms.data?.items, (uom) => uom.id, (uom) => `${uom.uomCode} / ${uom.uomName}`);
  const forecastErrors = [
    !draft?.forecastCode.trim() ? "Forecast code is required." : "",
    !draft?.forecastName.trim() ? "Forecast name is required." : "",
    draft && draft.lines.length === 0 ? "At least one forecast line is required." : "",
    ...(draft?.lines ?? []).flatMap((line, index) => [
      !line.itemId ? `Line ${index + 1} item is required.` : "",
      !line.forecastUomId ? `Line ${index + 1} UOM is required.` : "",
      line.quantity <= 0 ? `Line ${index + 1} quantity must be greater than zero.` : "",
      line.forecastPeriodEnd < line.forecastPeriodStart ? `Line ${index + 1} period end must be after start.` : ""
    ])
  ].filter(Boolean);
  const saveReason = !draft
    ? "Open a forecast draft before saving."
    : !live
      ? "Live planning sign-in is required before saving forecasts."
      : forecastErrors[0];
  const save = useApiMutation((request: DemandForecastUpsertRequest) => apiClient.salesPlanning.createForecast(request), {
    onSuccess: async (record) => {
      setMessage(`Saved forecast ${record.forecastCode}.`);
      setDraft(null);
      await query.refetch();
    },
    onError: (error) => setMessage(error.message)
  });
  const openDraft = () => setDraft({ companyId, branchId, forecastCode: `FC-DRAFT-${Date.now().toString().slice(-6)}`, forecastName: "Demand forecast", periodType: "Monthly", status: "Draft", lines: [{ lineNo: 10, itemId: 0, forecastPeriodStart: todayIso(), forecastPeriodEnd: addDaysIso(30), quantity: 1, forecastUomId: 0 }] });
  const updateLine = (index: number, patch: Partial<DemandForecastUpsertRequest["lines"][number]>) => setDraft((current) => current ? { ...current, lines: current.lines.map((line, lineIndex) => lineIndex === index ? { ...line, ...patch } : line) } : current);
  const addLine = () => setDraft((current) => current ? { ...current, lines: [...current.lines, { lineNo: (current.lines.length + 1) * 10, itemId: 0, forecastPeriodStart: todayIso(), forecastPeriodEnd: addDaysIso(30), quantity: 1, forecastUomId: 0 }] } : current);
  const removeLine = (index: number) => setDraft((current) => current ? { ...current, lines: current.lines.filter((_, lineIndex) => lineIndex !== index).map((line, lineIndex) => ({ ...line, lineNo: (lineIndex + 1) * 10 })) } : current);

  return (
    <>
      <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ label: "New forecast", onClick: openDraft }]} secondary={[{ disabled: true, label: "Import forecast", reason: "Forecast import requires the approved import workflow." }]} testId="forecast-action-bar" /></>} aside={<WorkbenchAside description="Demand forecast stays a planning input and does not create sales orders automatically." endpoint="/api/forecasts" source={source} />} description="Manual or imported forecast by period, item, and planning horizon." filters={<FilterBar><input aria-label="Search forecasts" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search forecast, period, horizon" value={search} /><select aria-label="Forecast status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Approved">Approved</option><option value="Draft">Draft</option></select></FilterBar>} title="Demand Forecast">
        {query.error ? <Card title="Live forecast data unavailable" description={query.error.message} /> : null}
        {message ? <Badge tone={message.toLowerCase().includes("saved") ? "success" : "danger"}>{message}</Badge> : null}
        <KpiStrip items={[{ label: "Forecasts", value: String(records.length) }, { label: "Buckets", value: String(records.reduce((total, record) => total + record.bucketCount, 0)) }, { label: "Qty", value: String(records.reduce((total, record) => total + record.totalQuantity, 0)) }, { label: "Approved", value: String(records.filter((record) => record.status === "Approved").length) }]} />
        <Card title="Forecast registry" description="Forecast buckets are reviewable before MPS or MRP consumption.">
          <DataGrid ariaLabel="Demand forecast list" columns={forecastColumns} getRowId={(record) => record.id} isLoading={query.isLoading} records={records} rowLabel={(record) => `${record.forecastCode} forecast`} virtualization={{ enabled: true }} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace description="Create demand forecast buckets with governed item, UOM, date, and quantity controls." footer={<ErpActionBar primary={[{ disabled: Boolean(saveReason) || save.isPending || forecastErrors.length > 0, label: save.isPending ? "Saving forecast" : "Save forecast", onClick: draft && !saveReason && forecastErrors.length === 0 ? () => save.mutate(draft) : undefined, reason: saveReason ?? forecastErrors[0] }]} secondary={[{ disabled: !live, label: "Add Line", onClick: live ? addLine : undefined, reason: live ? undefined : "Live planning sign-in is required before adding forecast lines." }]} utility={[{ label: "Close", onClick: () => setDraft(null), variant: "quiet" }]} />} isOpen={Boolean(draft)} onClose={() => setDraft(null)} title={draft?.forecastCode ?? "Forecast draft"} validation={<ErpValidationSummary errors={forecastErrors} />}>
        {draft ? (
          <div className="modal-form-grid">
            <FormShell initialFingerprint={`${draft.forecastCode}-header`} title="Forecast controls">
              <label><span>Forecast code</span><input disabled={!live} onChange={(event) => setDraft({ ...draft, forecastCode: event.target.value })} value={draft.forecastCode} /></label>
              <label><span>Forecast name</span><input disabled={!live} onChange={(event) => setDraft({ ...draft, forecastName: event.target.value })} value={draft.forecastName} /></label>
              <ErpLookupField disabled={!live} label="Period type" onChange={(value) => setDraft({ ...draft, periodType: value })} options={["Weekly", "Monthly", "Quarterly"].map(toOption)} value={draft.periodType} />
              <ErpLookupField disabled={!live} label="Status" onChange={(value) => setDraft({ ...draft, status: value })} options={["Draft", "Approved", "Closed"].map(toOption)} value={draft.status} />
            </FormShell>
            <Card title="Forecast lines" description="Each line becomes planning demand for MPS and MRP review.">
              <ErpTransactionLineGrid
                addDisabled={!live}
                addDisabledReason="Live planning sign-in is required before adding forecast lines."
                addLabel="Add Line"
                ariaLabel="Demand forecast line grid"
                columns={[
                  { key: "line", header: "Line", width: "72px", render: (line) => <ErpNumberField disabled label="Line no" onChange={() => undefined} value={line.lineNo} /> },
                  { key: "item", header: "Item", width: "190px", render: (line, index) => <ErpLookupField disabled={!live} label="Item" onChange={(value) => updateLine(index, { itemId: numberValue(value) })} options={itemOptions} required value={line.itemId ? String(line.itemId) : ""} /> },
                  { key: "start", header: "Start", width: "140px", render: (line, index) => <label><span>Period start</span><input disabled={!live} onChange={(event) => updateLine(index, { forecastPeriodStart: event.target.value })} type="date" value={dateControlValue(line.forecastPeriodStart)} /></label> },
                  { key: "end", header: "End", width: "140px", render: (line, index) => <label><span>Period end</span><input disabled={!live} onChange={(event) => updateLine(index, { forecastPeriodEnd: event.target.value })} type="date" value={dateControlValue(line.forecastPeriodEnd)} /></label> },
                  { key: "qty", header: "Qty", width: "120px", render: (line, index) => <ErpDecimalField disabled={!live} label="Quantity" min={0.001} onChange={(value) => updateLine(index, { quantity: value ?? 0 })} value={line.quantity} /> },
                  { key: "uom", header: "UOM", width: "150px", render: (line, index) => <ErpLookupField disabled={!live} label="Forecast UOM" onChange={(value) => updateLine(index, { forecastUomId: numberValue(value) })} options={uomOptions} required value={line.forecastUomId ? String(line.forecastUomId) : ""} /> },
                  { key: "actions", header: "Actions", width: "150px", render: (_line, index) => <ErpActionBar danger={[{ disabled: !live || draft.lines.length <= 1, label: "Remove Line", onClick: live && draft.lines.length > 1 ? () => removeLine(index) : undefined, reason: !live ? "Live planning sign-in is required before removing forecast lines." : draft.lines.length <= 1 ? "At least one forecast line is required." : undefined }]} /> }
                ]}
                getRowId={(line, index) => `${line.lineNo}-${index}`}
                lines={draft.lines}
                onAddLine={addLine}
                testId="forecast-line-grid"
              />
            </Card>
          </div>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

function buildDraftMpsCode() {
  const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 12);
  return `MPS-DRAFT-${stamp}`;
}

function buildMpsDraft(companyId: number, branchId: number): MpsDraftState {
  const start = todayIso();
  const end = addDaysIso(30);

  return {
    mpsId: null,
    source: "Draft",
    companyId,
    branchId,
    mpsCode: buildDraftMpsCode(),
    planningHorizonStart: start,
    planningHorizonEnd: end,
    status: "Draft",
    lines: [
      {
        lineNo: 10,
        itemId: 0,
        periodStart: start,
        periodEnd: end,
        plannedQuantity: 1,
        planningUomId: 0
      }
    ]
  };
}

function toMpsDraft(record: MpsPlannerItem): MpsDraftState {
  return {
    mpsId: record.mpsId,
    source: record.source,
    companyId: record.companyId,
    branchId: record.branchId,
    mpsCode: record.mpsCode,
    planningHorizonStart: record.planningHorizonStart,
    planningHorizonEnd: record.planningHorizonEnd,
    status: record.status,
    lines: record.lines.map((line) => ({
      lineNo: line.lineNo,
      itemId: line.itemId,
      periodStart: line.periodStart,
      periodEnd: line.periodEnd,
      plannedQuantity: line.plannedQuantity,
      planningUomId: line.planningUomId
    }))
  };
}

function mpsValidation(draft: MpsDraftState | null) {
  if (!draft) {
    return [];
  }

  return [
    !draft.mpsCode.trim() ? "MPS code is required." : "",
    !draft.planningHorizonStart ? "Planning horizon start is required." : "",
    !draft.planningHorizonEnd ? "Planning horizon end is required." : "",
    draft.planningHorizonStart && draft.planningHorizonEnd && draft.planningHorizonEnd < draft.planningHorizonStart ? "Planning horizon end must be on or after the start date." : "",
    draft.lines.length === 0 ? "At least one MPS line is required." : "",
    ...draft.lines.flatMap((line, index) => {
      const label = `Line ${line.lineNo || index + 1}`;
      return [
        line.lineNo <= 0 ? `${label}: positive line number is required.` : "",
        !line.itemId ? `${label}: item is required.` : "",
        !line.periodStart ? `${label}: period start date is required.` : "",
        !line.periodEnd ? `${label}: period end date is required.` : "",
        line.periodStart && line.periodEnd && line.periodEnd < line.periodStart ? `${label}: period end must be on or after the start date.` : "",
        line.plannedQuantity <= 0 ? `${label}: planned quantity must be greater than zero.` : "",
        !line.planningUomId ? `${label}: planning UOM is required.` : ""
      ];
    })
  ].filter(Boolean);
}

export function MpsPlannerPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [draft, setDraft] = useState<MpsDraftState | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(() => buildMasterFilter(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), [deferredSearch, status, user?.activeContext.branchId, user?.activeContext.companyId]);
  const query = useApiQuery(queryKeys.salesPlanning.mps(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status), () => listMpsPlannerSetup(session, filter), { staleTime: 60_000 });
  const records = query.data ?? [];
  const source = records[0]?.source ?? "Seeded";
  const canSave = hasLiveSession(session);
  const itemQuery = useApiQuery(
    ["sales-planning", "mps-item-options", user?.activeContext.companyId ?? 0],
    () => (canSave ? apiClient.masters.itemLookup(user?.activeContext.companyId) : Promise.resolve([])),
    { staleTime: 60_000 }
  );
  const uomQuery = useApiQuery(
    queryKeys.measurements.uoms(user?.activeContext.companyId, "", "all"),
    () => (canSave ? apiClient.measurements.uoms({ companyId: user?.activeContext.companyId ?? undefined, pageSize: 100, status: "Active" }).then((response) => response.items) : Promise.resolve([])),
    { staleTime: 60_000 }
  );
  const itemOptionMap = new Map(records.flatMap((record) => record.lines.map((line) => [String(line.itemId), line.itemLabel])));
  (itemQuery.data ?? []).forEach((item) => itemOptionMap.set(String(item.id), `${item.itemCode} / ${item.itemName}`));
  const itemOptions = Array.from(itemOptionMap.entries()).map(([value, label]) => ({ label, value }));
  const uomOptionMap = new Map(records.flatMap((record) => record.lines.map((line) => [String(line.planningUomId), line.planningUomLabel])));
  (uomQuery.data ?? []).forEach((uom) => uomOptionMap.set(String(uom.id), `${uom.uomCode} / ${uom.uomName}`));
  const uomOptions = Array.from(uomOptionMap.entries()).map(([value, label]) => ({ label, value }));
  const validation = mpsValidation(draft);
  const saveReason = !draft
    ? "Open an MPS draft before saving."
    : !canSave
      ? "Live planning sign-in is required before saving MPS drafts."
      : validation[0];
  const editDisabledReason = draft && draft.source !== "Draft" && draft.source !== "Live"
    ? "Reference MPS rows are read-only. Open a new MPS draft to create a live schedule."
    : undefined;
  const canEdit = Boolean(draft && !editDisabledReason);
  const saveMutation = useApiMutation(
    (request: { mpsId: number | null; body: MasterProductionScheduleUpsertRequest }) => saveMpsDraft(session, request.mpsId, request.body),
    {
      onError: (error) => setActionMessage(error.message),
      onSuccess: (saved) => {
        setDraft(null);
        setActionMessage(`MPS ${saved.mpsCode} was saved.`);
      }
    }
  );
  const openNewMps = () => {
    if (!user?.activeContext.companyId || !user?.activeContext.branchId) {
      setActionMessage("Select a company and branch before creating an MPS draft.");
      return;
    }

    setDraft(buildMpsDraft(user.activeContext.companyId, user.activeContext.branchId));
    setActionMessage(null);
  };
  const updateDraft = (updater: (current: MpsDraftState) => MpsDraftState) => setDraft((current) => (current ? updater(current) : current));
  const updateLine = (index: number, patch: Partial<MpsDraftState["lines"][number]>) =>
    updateDraft((current) => ({
      ...current,
      lines: current.lines.map((line, lineIndex) => (lineIndex === index ? { ...line, ...patch } : line))
    }));
  const addLine = () =>
    updateDraft((current) => ({
      ...current,
      lines: [
        ...current.lines,
        {
          lineNo: Math.max(0, ...current.lines.map((line) => line.lineNo)) + 10,
          itemId: 0,
          periodStart: current.planningHorizonStart,
          periodEnd: current.planningHorizonEnd,
          plannedQuantity: 1,
          planningUomId: 0
        }
      ]
    }));
  const removeLine = (index: number) =>
    updateDraft((current) => ({
      ...current,
      lines: current.lines.filter((_, lineIndex) => lineIndex !== index)
    }));
  const saveDraft = () => {
    if (!draft || saveReason || validation.length > 0) {
      return;
    }

    saveMutation.mutate({
      mpsId: draft.mpsId,
      body: {
        companyId: draft.companyId,
        branchId: draft.branchId,
        mpsCode: draft.mpsCode,
        planningHorizonStart: draft.planningHorizonStart,
        planningHorizonEnd: draft.planningHorizonEnd,
        status: draft.status,
        lines: draft.lines
      }
    });
  };

  return (
    <>
      <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ label: "New MPS draft", onClick: openNewMps }]} secondary={[{ disabled: true, label: "Export MPS", reason: "MPS export is pending the approved reporting workflow." }]} testId="mps-action-bar" /></>} aside={<WorkbenchAside description="MPS planning is web setup/planning scope and does not execute shop-floor actions." endpoint="/api/mps" source={source} />} description="Master production schedule by item, period, and planning horizon." filters={<ErpFilterBar ariaLabel="MPS filters" onClear={() => { setSearch(""); setStatus("all"); }} testId="mps-filter-bar"><input aria-label="Search MPS" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search MPS, horizon, item" value={search} /><select aria-label="MPS status" onChange={(event) => setStatus(event.target.value)} value={status}><option value="all">Status: Any</option><option value="Firm">Firm</option><option value="Draft">Draft</option></select></ErpFilterBar>} title="MPS Planner">
        <KpiStrip items={[{ label: "Plans", value: String(records.length) }, { label: "Lines", value: String(records.reduce((total, record) => total + record.lineCount, 0)) }, { label: "Planned qty", value: String(records.reduce((total, record) => total + record.plannedQuantity, 0)) }, { label: "Firm", value: String(records.filter((record) => record.status === "Firm").length) }]} />
        <Card title="MPS planning board" description="Schedule buckets remain visible without entering MRP console scope.">
          <ErpGrid ariaLabel="MPS planner list" columns={mpsColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={(record) => { setDraft(toMpsDraft(record)); setActionMessage(null); }} records={records} rowLabel={(record) => `${record.mpsCode} mps`} testId="mps-grid" virtualization={{ enabled: true }} />
        </Card>
        {actionMessage ? <Card title="MPS action status" description={actionMessage}><StatusBadge status={actionMessage.includes("saved") ? "Completed" : "Review"} /></Card> : null}
      </ListPageShell>
      <ErpModalWorkspace
        description="Create and maintain MPS schedule buckets with governed item, UOM, date, and quantity controls."
        footer={<ErpActionBar primary={[{ disabled: Boolean(saveReason) || saveMutation.isPending || validation.length > 0, label: saveMutation.isPending ? "Saving MPS draft" : "Save MPS draft", onClick: saveReason || validation.length > 0 ? undefined : saveDraft, reason: saveReason ?? validation[0] }]} secondary={[{ disabled: !canEdit, label: "Add schedule line", onClick: canEdit ? addLine : undefined, reason: editDisabledReason }]} utility={[{ label: "Close", onClick: () => setDraft(null), variant: "quiet" }]} />}
        isOpen={Boolean(draft)}
        onClose={() => setDraft(null)}
        panelClassName="ui-modal__panel--item-master"
        title={draft?.mpsCode || "MPS draft"}
        validation={<ErpValidationSummary errors={validation} title="MPS checks" />}
      >
        {draft ? (
          <>
            <FormShell initialFingerprint={`${draft.mpsId ?? "draft"}-${draft.source}`} title="MPS setup">
              <label><span>MPS code</span><input disabled={!canEdit} onChange={(event) => updateDraft((current) => ({ ...current, mpsCode: event.target.value }))} value={draft.mpsCode} /></label>
              <label><span>Planning horizon start</span><input disabled={!canEdit} onChange={(event) => updateDraft((current) => ({ ...current, planningHorizonStart: event.target.value }))} type="date" value={dateControlValue(draft.planningHorizonStart)} /></label>
              <label><span>Planning horizon end</span><input disabled={!canEdit} onChange={(event) => updateDraft((current) => ({ ...current, planningHorizonEnd: event.target.value }))} type="date" value={dateControlValue(draft.planningHorizonEnd)} /></label>
              <ErpLookupField disabled={!canEdit} disabledReason={editDisabledReason} label="MPS status" onChange={(value) => updateDraft((current) => ({ ...current, status: value }))} options={[{ label: "Draft", value: "Draft" }, { label: "Firm", value: "Firm" }, { label: "Frozen", value: "Frozen" }]} value={draft.status} />
            </FormShell>
            <Card title="Schedule lines" description="Each line uses controlled Item Master, planning UOM, date, and quantity fields.">
              <ErpTransactionLineGrid
                addDisabled={!canEdit}
                addDisabledReason={editDisabledReason}
                addLabel="Add schedule line"
                ariaLabel="MPS schedule line grid"
                columns={[
                  { key: "line", header: "Line", width: "86px", render: (line, index) => <ErpNumberField disabled={!canEdit} disabledReason={editDisabledReason} label="Line number" min={1} onChange={(value) => updateLine(index, { lineNo: value ?? 0 })} value={line.lineNo} /> },
                  { key: "item", header: "Item", width: "190px", render: (line, index) => <ErpLookupField disabled={!canEdit} disabledReason={editDisabledReason} label="Item" onChange={(value) => updateLine(index, { itemId: value ? Number(value) : 0 })} options={itemOptions} required value={String(line.itemId || "")} /> },
                  { key: "start", header: "Period start", width: "140px", render: (line, index) => <label><span>Period start</span><input disabled={!canEdit} onChange={(event) => updateLine(index, { periodStart: event.target.value })} type="date" value={dateControlValue(line.periodStart)} /></label> },
                  { key: "end", header: "Period end", width: "140px", render: (line, index) => <label><span>Period end</span><input disabled={!canEdit} onChange={(event) => updateLine(index, { periodEnd: event.target.value })} type="date" value={dateControlValue(line.periodEnd)} /></label> },
                  { key: "qty", header: "Planned qty", width: "130px", render: (line, index) => <ErpDecimalField disabled={!canEdit} disabledReason={editDisabledReason} label="Planned quantity" min={0} onChange={(value) => updateLine(index, { plannedQuantity: value ?? 0 })} scale={3} value={line.plannedQuantity} /> },
                  { key: "uom", header: "UOM", width: "150px", render: (line, index) => <ErpLookupField disabled={!canEdit} disabledReason={editDisabledReason} label="Planning UOM" onChange={(value) => updateLine(index, { planningUomId: value ? Number(value) : 0 })} options={uomOptions} required value={String(line.planningUomId || "")} /> },
                  { key: "actions", header: "Actions", width: "150px", render: (_line, index) => <ErpActionBar danger={[{ disabled: !canEdit || draft.lines.length <= 1, label: "Remove Line", onClick: canEdit && draft.lines.length > 1 ? () => removeLine(index) : undefined, reason: draft.lines.length <= 1 ? "At least one MPS line is required." : editDisabledReason }]} /> }
                ]}
                getRowId={(line, index) => `${line.lineNo}-${index}`}
                lines={draft.lines}
                onAddLine={addLine}
                testId="mps-line-grid"
              />
            </Card>
          </>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}

export function AvailableToPromisePage() {
  const { session, user } = useAuth();
  const live = hasLiveSession(session);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AvailablePromiseItem | null>(null);
  const [simulatedDate, setSimulatedDate] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(() => buildMasterFilter(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, "all"), [deferredSearch, user?.activeContext.branchId, user?.activeContext.companyId]);
  const query = useApiQuery(queryKeys.salesPlanning.availableToPromise(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch), () => listAvailablePromiseSetup(session, filter), { staleTime: 60_000 });
  const records = query.data ?? [];
  const source = records[0]?.source ?? (live ? "Live" : "Deferred");
  const openSimulation = (record: AvailablePromiseItem | null = records[0] ?? null) => {
    setSelected(record);
    setSimulatedDate(record?.suggestedPromiseDate ?? todayIso());
    setMessage(null);
  };
  const commitMutation = useApiMutation<void, SalesOrderDto>(
    async () => {
      if (!selected?.sourceOrder) {
        throw new Error("Open a live sales order promise before committing.");
      }

      const draft = salesOrderDtoToDraft(selected.sourceOrder);
      const nextDate = simulatedDate || selected.suggestedPromiseDate || todayIso();
      return apiClient.salesPlanning.updateSalesOrder(selected.sourceOrder.id, {
        ...draft,
        promisedDate: nextDate,
        lines: draft.lines.map((line, index) => {
          const sourceLine = selected.sourceOrder?.lines[index];
          return sourceLine?.id === selected.salesOrderLineId
            ? { ...line, promisedDate: nextDate, requestedShipDate: line.requestedShipDate ?? nextDate }
            : line;
        })
      });
    },
    {
      onSuccess: async (record) => {
        setMessage(`Committed promise for ${record.salesOrderNo}.`);
        await query.refetch();
      },
      onError: (error) => setMessage(error.message)
    }
  );
  const commitReason = !live
    ? "Live sales planning sign-in is required before committing a promise."
    : !selected?.sourceOrder
      ? "Select a live sales order promise before committing."
      : !simulatedDate
        ? "Choose a committed promise date before saving."
        : commitMutation.isPending
          ? "Promise commit is in progress."
          : undefined;

  return (
    <>
      <ListPageShell actions={<><SourceBadge source={source} /><ErpActionBar primary={[{ disabled: records.length === 0, label: "Run what-if", onClick: records.length > 0 ? () => openSimulation(records[0]) : undefined, reason: records.length === 0 ? "No order-promise rows match the current filter." : undefined }]} secondary={[{ disabled: true, label: "Export promise check", reason: "Promise export is pending the approved reporting workflow." }]} testId="available-promise-action-bar" /></>} aside={<WorkbenchAside description="Promise rows use live sales orders and stock balances when signed in; review mode uses planning examples only." endpoint="/api/sales-orders + /api/inventory" source={source} />} description="Committed date review using material and capacity signals." filters={<FilterBar><input aria-label="Search available to promise" onChange={(event) => startTransition(() => setSearch(event.target.value))} placeholder="Search order, customer, item, signal" value={search} /></FilterBar>} title="Available to Promise / Order Promise">
        <KpiStrip items={[{ label: "Checks", value: String(records.length) }, { label: "At risk", value: String(records.filter((record) => record.promiseStatus.includes("Risk")).length) }, { label: "Promiseable", value: String(records.filter((record) => record.promiseStatus === "Promiseable").length) }, { label: "Live", value: String(records.filter((record) => record.source === "Live").length) }]} />
        <Card title="Promise workbench" description="Material and capacity signals are visible for order-promise review.">
          <DataGrid ariaLabel="Available to promise list" columns={promiseColumns} getRowId={(record) => record.id} isLoading={query.isLoading} onRowSelect={openSimulation} records={records} rowLabel={(record) => `${record.orderRef} promise`} virtualization={{ enabled: true }} />
        </Card>
      </ListPageShell>
      <ErpModalWorkspace
        description="Simulate material availability and commit a promised date back to the sales order when live data is available."
        footer={<ErpActionBar primary={[{ disabled: Boolean(commitReason), label: commitMutation.isPending ? "Committing promise" : "Commit promise", onClick: commitReason ? undefined : () => commitMutation.mutate(undefined), reason: commitReason }]} utility={[{ label: "Close", onClick: () => setSelected(null), variant: "quiet" }]} />}
        isOpen={Boolean(selected)}
        onClose={() => setSelected(null)}
        statusMeta={<>{selected ? <StatusBadge status={selected.promiseStatus} /> : null}{message ? <ErpStatusChip tone={message.startsWith("Committed") ? "success" : "danger"}>{message}</ErpStatusChip> : null}</>}
        title={selected?.orderRef ?? "Promise simulation"}
      >
        {selected ? (
          <div className="modal-form-grid">
            <Card title="Order promise" description="Review requested demand, current stock availability, and the proposed promise date.">
              <FormShell initialFingerprint={`${selected.id}-${selected.suggestedPromiseDate}`} title="What-if controls">
                <ErpLookupField disabled disabledReason="Order reference comes from the selected sales order line." label="Sales order line" onChange={() => undefined} options={[{ label: selected.orderRef, value: selected.id }]} value={selected.id} />
                <ErpLookupField disabled disabledReason="Customer comes from the selected sales order." label="Customer" onChange={() => undefined} options={[{ label: selected.customerLabel, value: selected.customerLabel }]} value={selected.customerLabel} />
                <ErpLookupField disabled disabledReason="Item comes from the selected sales order line." label="Item" onChange={() => undefined} options={[{ label: selected.itemLabel, value: selected.itemLabel }]} value={selected.itemLabel} />
                <ErpDecimalField disabled label="Requested quantity" min={0} onChange={() => undefined} value={selected.requestedQuantity} />
                <ErpDecimalField disabled label="Available quantity" min={0} onChange={() => undefined} value={selected.availableQuantity} />
                <ErpDecimalField disabled label="Shortage quantity" min={0} onChange={() => undefined} value={selected.shortageQuantity} />
                <label><span>Committed promise date</span><input disabled={!live} onChange={(event) => setSimulatedDate(event.target.value)} type="date" value={dateControlValue(simulatedDate)} /></label>
              </FormShell>
            </Card>
            <Card title="Readiness signals" description="Material and capacity signals explain whether the promise is ready to commit.">
              <Tile label="Requested">{selected.requestedDate}</Tile>
              <Tile label="Current promise">{selected.promisedDate}</Tile>
              <Tile label="Suggested promise">{selected.suggestedPromiseDate}</Tile>
              <Tile label="Material">{selected.materialSignal}</Tile>
              <Tile label="Capacity">{selected.capacitySignal}</Tile>
            </Card>
          </div>
        ) : null}
      </ErpModalWorkspace>
    </>
  );
}
