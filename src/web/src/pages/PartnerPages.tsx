import { startTransition, useDeferredValue, useMemo, useState } from "react";
import type { CustomerUpsertRequest, SupplierUpsertRequest } from "../api/contracts";
import { queryKeys, useApiQuery } from "../api/hooks";
import { useAuth } from "../auth/AuthContext";
import {
  buildMasterFilter,
  canPersistMasterData,
  createCustomerAddressDraft,
  createCustomerDraft,
  createSupplierAddressDraft,
  createSupplierDraft,
  getCustomerPartnerWorkspace,
  getSupplierPartnerWorkspace,
  listCustomerAddressSetup,
  listCustomerSetup,
  listSupplierAddressSetup,
  listSupplierLeadTimeSetup,
  listSupplierSetup,
  updateCustomerAddressCore,
  updateCustomerCore,
  updateCustomerPartnerWorkspace,
  updateSupplierAddressCore,
  updateSupplierCore,
  updateSupplierPartnerWorkspace,
  type CustomerAddressSetupItem,
  type CustomerPartnerWorkspaceSetup,
  type CustomerSetupItem,
  type MasterDataSource,
  type PartnerContactPointSetupItem,
  type PartnerDocumentSetupItem,
  type SupplierAddressSetupItem,
  type SupplierLeadTimeSetupItem,
  type SupplierPartnerWorkspaceSetup,
  type SupplierSetupItem
} from "../masters/masterDataAdapters";
import { Badge } from "../ui/Badge";
import { Card } from "../ui/Card";
import type { DataGridColumn } from "../ui/DataGrid";
import {
  ErpActionBar,
  ErpEmptyState,
  ErpFileActionState,
  ErpFilterBar,
  ErpGrid,
  ErpLookupField,
  ErpModalWorkspace,
  ErpNumberField,
  ErpStatusChip,
  ErpValidationSummary
} from "../ui/ErpComponents";
import { FormShell } from "../ui/FormShell";
import { ListPageShell } from "../ui/ListPageShell";
import { Tile } from "../ui/Tile";
import { KpiStrip } from "../ui/boards";

type PartnerEditorMode = "closed" | "create" | "edit";
type SaveTone = "info" | "success" | "warn" | "danger" | "neutral";

interface PartnerContactPoint {
  id: string;
  contactName: string;
  role: string;
  channel: string;
  detail: string;
  site: string;
  status: string;
}

interface PartnerDocumentRow {
  id: string;
  document: string;
  owner: string;
  status: string;
}

interface CustomerReferenceRow {
  id: string;
  customer: string;
  itemReference: string;
  drawingRevision: string;
  approvalStatus: string;
}

interface SupplierReferenceRow {
  id: string;
  supplier: string;
  itemReference: string;
  leadTime: string;
  complianceStatus: string;
}

const CUSTOMER_SECTIONS = [
  "Core Info",
  "Legal/Tax",
  "Sites / Bill-to / Ship-to",
  "Contacts",
  "Contact Points",
  "Credit Profile",
  "Terms & Commercial",
  "Dispatch Preferences",
  "Catalog / Visibility",
  "Customer Item References",
  "Documents",
  "Audit / History"
];

const SUPPLIER_SECTIONS = [
  "Core Info",
  "Legal/Tax",
  "Sites / Addresses",
  "Contacts",
  "Contact Points",
  "Terms & Commercial",
  "Supplier Categories / Capability",
  "Lead-Time Rules",
  "Approved Items / Vendor References",
  "Compliance Documents",
  "Documents",
  "Audit / History"
];

const customerTypeOptions = ["Domestic", "Export", "OEM", "Distributor"].map(toOption);
const supplierTypeOptions = ["Material", "Subcontract", "Service", "Logistics"].map(toOption);
const lifecycleOptions = ["Draft", "Active", "On Hold", "Inactive"].map(toOption);
const paymentTermOptions = ["NET15", "NET30", "NET45", "Advance", "COD", "Pending"].map(toOption);
const currencyOptions = ["INR", "USD", "EUR"].map(toOption);
const taxCategoryOptions = ["Registered GST", "Unregistered", "Export", "Pending"].map(toOption);
const creditStatusOptions = ["Clear", "Credit watch", "Commercial setup pending", "On hold"].map(toOption);
const customerRegionOptions = ["Any region", "Pune", "Nashik", "Mumbai", "Export"].map(toOption);
const contactRoleOptions = ["Commercial", "Accounts", "Dispatch", "Quality", "Compliance", "Plant contact"].map(toOption);
const communicationChannelOptions = ["Email", "Phone", "Portal", "WhatsApp"].map(toOption);
const complianceStatusOptions = ["Approved", "Pending", "Expiring", "Blocked"].map(toOption);
const preferredSupplierOptions = ["Any", "Preferred", "Standard"].map(toOption);
const leadTimeReadyOptions = ["Any", "Ready", "Pending"].map(toOption);
const dispatchPreferenceOptions = ["Standard dispatch", "Appointment required", "Dock booking", "Customer pickup"].map(toOption);
const supplierCapabilityOptions = ["Material supplier", "Subcontract capable", "Service provider", "Logistics partner"].map(toOption);

const documentDisabledReason = "Binary upload storage is not enabled. Document metadata can be saved now.";
const saveDisabledReason = "Sign in with partner master write access to save this record.";

function toOption(value: string) {
  return { label: value, value };
}

function uniqueOptions(values: string[], defaults: string[] = []) {
  return Array.from(new Set([...defaults, ...values].filter(Boolean))).map(toOption);
}

function SourceBadge({ source }: { source: MasterDataSource }) {
  const tone = source === "Live" ? "success" : source === "Deferred" ? "info" : "neutral";
  return <ErpStatusChip tone={tone}>{source === "Live" ? "Setup complete" : "Review mode"}</ErpStatusChip>;
}

function PartnerAside({ description, source }: { description: string; source: MasterDataSource }) {
  return (
    <Card title="Commercial workspace guidance" description={description}>
      <div className="notification-item">
        <strong>Account controls</strong>
        <p>Partner records stay aligned with the active company, branch, and commercial governance.</p>
        <div className="context-chip-row">
          <SourceBadge source={source} />
          <Badge tone="info">Commercial setup</Badge>
        </div>
      </div>
    </Card>
  );
}

function parseCreditDays(value: string) {
  const match = value.match(/\d+/);
  return match ? Number(match[0]) : null;
}

function creditDaysLabel(days: number | null) {
  return days ? `${days} days` : "Not set";
}

function valueOrNull(value: string) {
  const trimmed = value.trim();
  return trimmed && trimmed !== "Pending" && trimmed !== "Not set" ? trimmed : null;
}

function customerCreditStatus(customer: CustomerSetupItem) {
  if (customer.status === "On Hold") {
    return "On hold";
  }

  if (customer.paymentTermsCode === "Pending" || customer.taxRegistrationNo === "Pending") {
    return "Commercial setup pending";
  }

  if (customer.exposureLabel.toLowerCase().includes("watch") || customer.exposureLabel.toLowerCase().includes("risk")) {
    return "Credit watch";
  }

  return "Clear";
}

function customerCatalogStatus(customer: CustomerSetupItem) {
  return customer.customerType === "Export" || customer.code.includes("ENKAY") ? "Enabled" : "Restricted";
}

function customerHasContact(addresses: CustomerAddressSetupItem[]) {
  return addresses.some((address) => address.contactName !== "Not captured" || address.contactEmail !== "Not captured");
}

function customerHasShipTo(addresses: CustomerAddressSetupItem[]) {
  return addresses.some((address) => address.defaultUsage.includes("Shipping") || address.addressType.toLowerCase().includes("ship"));
}

function customerRegion(addresses: CustomerAddressSetupItem[]) {
  return addresses[0]?.city.split(",")[0]?.trim() || "Any region";
}

function supplierComplianceStatus(supplier: SupplierSetupItem) {
  if (supplier.status === "On Hold") {
    return "Blocked";
  }

  return supplier.taxRegistrationNo === "Pending" ? "Pending" : "Approved";
}

function supplierLeadTimeSignal(leadTimes: SupplierLeadTimeSetupItem[]) {
  if (leadTimes.length === 0) {
    return "Pending";
  }

  const priority = Math.min(...leadTimes.map((leadTime) => leadTime.priorityRank));
  return priority <= 1 ? "Ready" : "Review";
}

function supplierPreferredStatus(supplier: SupplierSetupItem) {
  return supplier.code.includes("INOX") || supplier.supportsSubcontracting ? "Preferred" : "Standard";
}

function buildCustomerDraft(companyId: number | null | undefined, branchName: string | null | undefined): CustomerSetupItem {
  return {
    id: "customer-draft",
    customerId: 0,
    companyId: companyId ?? 1,
    code: "",
    name: "",
    shortName: "",
    customerType: "Domestic",
    defaultBranch: branchName ?? "Current branch",
    taxRegistrationNo: "Pending",
    paymentTermsCode: "NET30",
    creditDays: "0 days",
    exposureLabel: "Draft customer pending activation review",
    status: "Draft",
    source: "Deferred"
  };
}

function buildSupplierDraft(companyId: number | null | undefined, branchName: string | null | undefined): SupplierSetupItem {
  return {
    id: "supplier-draft",
    supplierId: 0,
    companyId: companyId ?? 1,
    code: "",
    name: "",
    supplierType: "Material",
    supportsSubcontracting: false,
    defaultBranch: branchName ?? "Current branch",
    taxRegistrationNo: "Pending",
    paymentTermsCode: "NET30",
    delayScore: "Lead-time setup pending",
    status: "Draft",
    source: "Deferred"
  };
}

function buildCustomerWorkspaceDraft(customer: CustomerSetupItem, addresses: CustomerAddressSetupItem[] = []): CustomerPartnerWorkspaceSetup {
  return {
    profile: {
      legalName: customer.name,
      taxCategory: customer.taxRegistrationNo === "Pending" ? "Pending" : "Registered GST",
      currencyCode: "INR",
      creditStatus: customer.status === "On Hold" ? "On hold" : "Clear",
      creditLimitAmount: null,
      creditHoldRule: customer.status === "On Hold" ? "Manager review" : "Standard release",
      paymentTermsCode: customer.paymentTermsCode,
      commercialSegment: customer.customerType === "Export" ? "Strategic" : "Standard",
      orderReleaseControl: "Standard",
      dispatchPreference: customerHasShipTo(addresses) ? "Standard dispatch" : "Appointment required",
      dispatchInstruction: customerHasShipTo(addresses) ? "Use default ship-to contact" : "Ship-to site pending",
      catalogVisible: customerCatalogStatus(customer) === "Enabled",
      catalogSegment: customerCatalogStatus(customer) === "Enabled" ? "Strategic catalog" : "Standard catalog",
      status: customer.status
    },
    contactPoints: [],
    itemReferences: [],
    documents: [],
    auditEvents: [],
    source: "Deferred"
  };
}

function buildSupplierWorkspaceDraft(supplier: SupplierSetupItem): SupplierPartnerWorkspaceSetup {
  return {
    profile: {
      legalName: supplier.name,
      taxCategory: supplier.taxRegistrationNo === "Pending" ? "Pending" : "Registered GST",
      currencyCode: "INR",
      paymentTermsCode: supplier.paymentTermsCode,
      preferredStatus: supplierPreferredStatus(supplier),
      complianceStatus: supplierComplianceStatus(supplier),
      capabilitySummary: supplier.supportsSubcontracting ? "Subcontract capable" : supplier.supplierType,
      qualityRating: null,
      procurementReleaseControl: supplierComplianceStatus(supplier) === "Approved" ? "Standard" : "Compliance review",
      leadTimeReviewDays: null,
      status: supplier.status
    },
    contactPoints: [],
    vendorReferences: [],
    documents: [],
    auditEvents: [],
    source: "Deferred"
  };
}

function customerValidation(customer: CustomerSetupItem, addresses: CustomerAddressSetupItem[], mode: PartnerEditorMode) {
  const issues: string[] = [];

  if (!customer.code.trim()) {
    issues.push("Customer code is required before saving a draft.");
  }

  if (!customer.name.trim()) {
    issues.push("Customer name is required before saving a draft.");
  }

  if (!customer.shortName.trim()) {
    issues.push("Short name is required for quick lookup and dispatch documents.");
  }

  if (!customer.customerType) {
    issues.push("Customer type must be selected.");
  }

  if (!customer.paymentTermsCode || customer.paymentTermsCode === "Pending") {
    issues.push("Payment terms must be selected.");
  }

  if (mode !== "create" && !customerHasShipTo(addresses)) {
    issues.push("At least one ship-to site is required before activation.");
  }

  if (customer.taxRegistrationNo === "Pending") {
    issues.push("Tax registration must be reviewed before activation.");
  }

  return issues;
}

function supplierValidation(supplier: SupplierSetupItem, addresses: SupplierAddressSetupItem[], leadTimes: SupplierLeadTimeSetupItem[], mode: PartnerEditorMode) {
  const issues: string[] = [];

  if (!supplier.code.trim()) {
    issues.push("Supplier code is required before saving a draft.");
  }

  if (!supplier.name.trim()) {
    issues.push("Supplier name is required before saving a draft.");
  }

  if (!supplier.supplierType) {
    issues.push("Supplier type must be selected.");
  }

  if (!supplier.paymentTermsCode || supplier.paymentTermsCode === "Pending") {
    issues.push("Payment terms must be selected.");
  }

  if (mode !== "create" && addresses.length === 0) {
    issues.push("At least one supplier site is required before activation.");
  }

  if (mode !== "create" && leadTimes.length === 0) {
    issues.push("Lead-time coverage is required before procurement planning uses this supplier.");
  }

  if (supplier.taxRegistrationNo === "Pending") {
    issues.push("Tax registration or compliance status must be reviewed before approval.");
  }

  return issues;
}

function coreSaveErrors(issues: string[]) {
  return issues.filter((issue) => issue.includes("required") || issue.includes("must be selected"));
}

function contactColumns(): DataGridColumn<PartnerContactPoint>[] {
  return [
    { key: "name", header: "Contact", render: (record) => <strong>{record.contactName}</strong> },
    { key: "role", header: "Role", width: "18%", render: (record) => record.role },
    { key: "channel", header: "Channel", width: "16%", render: (record) => record.channel },
    { key: "detail", header: "Contact point", render: (record) => record.detail },
    { key: "site", header: "Site", width: "16%", render: (record) => record.site },
    {
      key: "status",
      header: "Status",
      width: "12%",
      render: (record) => <ErpStatusChip tone={record.status === "Active" ? "success" : "warn"}>{record.status}</ErpStatusChip>
    }
  ];
}

const documentColumns: DataGridColumn<PartnerDocumentRow>[] = [
  { key: "document", header: "Document", render: (record) => <strong>{record.document}</strong> },
  { key: "owner", header: "Owner", width: "22%", render: (record) => record.owner },
  {
    key: "status",
    header: "Status",
    width: "18%",
    render: (record) => <ErpStatusChip tone={record.status === "Ready" ? "success" : "warn"}>{record.status}</ErpStatusChip>
  }
];

const customerReferenceColumns: DataGridColumn<CustomerReferenceRow>[] = [
  { key: "customer", header: "Customer", render: (record) => <strong>{record.customer}</strong> },
  { key: "itemReference", header: "Customer item code", width: "24%", render: (record) => record.itemReference },
  { key: "drawingRevision", header: "Drawing / revision", width: "22%", render: (record) => record.drawingRevision },
  {
    key: "approval",
    header: "Approval",
    width: "18%",
    render: (record) => <ErpStatusChip tone={record.approvalStatus === "Approved" ? "success" : "warn"}>{record.approvalStatus}</ErpStatusChip>
  }
];

const supplierReferenceColumns: DataGridColumn<SupplierReferenceRow>[] = [
  { key: "supplier", header: "Supplier", render: (record) => <strong>{record.supplier}</strong> },
  { key: "itemReference", header: "Vendor item code", width: "24%", render: (record) => record.itemReference },
  { key: "leadTime", header: "Lead time", width: "18%", render: (record) => record.leadTime },
  {
    key: "compliance",
    header: "Compliance",
    width: "18%",
    render: (record) => <ErpStatusChip tone={record.complianceStatus === "Ready" ? "success" : "warn"}>{record.complianceStatus}</ErpStatusChip>
  }
];

function partnerContactRows(contacts: PartnerContactPointSetupItem[], addresses: Array<CustomerAddressSetupItem | SupplierAddressSetupItem>): PartnerContactPoint[] {
  return contacts.map((contact) => ({
    id: contact.id,
    contactName: contact.contactName,
    role: contact.role,
    channel: contact.channel,
    detail: contact.detail,
    site: addresses.find((address) => address.addressId === contact.addressId)?.code ?? "Account",
    status: contact.status
  }));
}

function partnerDocumentRows(documents: PartnerDocumentSetupItem[], owner: string): PartnerDocumentRow[] {
  return documents.map((document) => ({
    id: document.id,
    document: document.title || document.documentType,
    owner,
    status: document.approvalStatus
  }));
}

function customerWorkspaceReferences(customer: CustomerSetupItem, workspace: CustomerPartnerWorkspaceSetup): CustomerReferenceRow[] {
  return workspace.itemReferences.map((reference) => ({
    id: reference.id,
    customer: customer.code,
    itemReference: reference.customerItemCode,
    drawingRevision: reference.drawingRevision || "Not set",
    approvalStatus: reference.approvalStatus
  }));
}

function supplierWorkspaceReferences(supplier: SupplierSetupItem, workspace: SupplierPartnerWorkspaceSetup): SupplierReferenceRow[] {
  return workspace.vendorReferences.map((reference) => ({
    id: reference.id,
    supplier: supplier.code,
    itemReference: reference.vendorItemCode,
    leadTime: reference.leadTimeDays ? `${reference.leadTimeDays} days` : "Not set",
    complianceStatus: reference.complianceStatus
  }));
}

const auditColumns: DataGridColumn<{ id: string; event: string; actor: string; occurredOn: string; outcome: string }>[] = [
  { key: "event", header: "Event", render: (record) => <strong>{record.event}</strong> },
  { key: "actor", header: "Actor", width: "20%", render: (record) => record.actor },
  { key: "occurred", header: "When", width: "24%", render: (record) => record.occurredOn },
  { key: "outcome", header: "Outcome", width: "18%", render: (record) => <ErpStatusChip tone="success">{record.outcome}</ErpStatusChip> }
];

function buildCustomerColumns(addresses: CustomerAddressSetupItem[]): DataGridColumn<CustomerSetupItem>[] {
  return [
    { key: "code", header: "Customer code", width: "14%", render: (record) => <strong>{record.code}</strong> },
    {
      key: "name",
      header: "Customer name",
      render: (record) => (
        <div>
          <strong>{record.name}</strong>
          <div className="muted">{record.shortName || "Short name pending"}</div>
        </div>
      )
    },
    { key: "type", header: "Legal/type", width: "16%", render: (record) => record.customerType },
    { key: "terms", header: "Terms", width: "12%", render: (record) => record.paymentTermsCode },
    {
      key: "credit",
      header: "Credit status",
      width: "16%",
      render: (record) => {
        const status = customerCreditStatus(record);
        return <ErpStatusChip tone={status === "Clear" ? "success" : status === "Credit watch" ? "warn" : "neutral"}>{status}</ErpStatusChip>;
      }
    },
    {
      key: "contacts",
      header: "Contacts",
      width: "12%",
      render: (record) => {
        const count = addresses.filter((address) => address.customerId === record.customerId && address.contactName !== "Not captured").length;
        return <ErpStatusChip tone={count > 0 ? "success" : "warn"}>{count > 0 ? `${count} ready` : "Pending"}</ErpStatusChip>;
      }
    },
    {
      key: "sites",
      header: "Sites/addresses",
      width: "14%",
      render: (record) => {
        const count = addresses.filter((address) => address.customerId === record.customerId).length;
        return <ErpStatusChip tone={count > 0 ? "success" : "warn"}>{count > 0 ? `${count} site${count === 1 ? "" : "s"}` : "Pending"}</ErpStatusChip>;
      }
    },
    {
      key: "status",
      header: "Status",
      width: "10%",
      render: (record) => <ErpStatusChip tone={record.status === "Active" ? "success" : "warn"}>{record.status}</ErpStatusChip>
    }
  ];
}

const customerAddressColumns: DataGridColumn<CustomerAddressSetupItem>[] = [
  { key: "code", header: "Site", width: "14%", render: (record) => <strong>{record.code}</strong> },
  { key: "type", header: "Type", width: "16%", render: (record) => record.addressType },
  { key: "city", header: "City/region", width: "20%", render: (record) => record.city },
  {
    key: "contact",
    header: "Contact",
    render: (record) => (
      <div>
        <strong>{record.contactName}</strong>
        <div className="muted">{record.contactEmail}</div>
      </div>
    )
  },
  { key: "usage", header: "Usage", width: "18%", render: (record) => record.defaultUsage }
];

function buildSupplierColumns(addresses: SupplierAddressSetupItem[], leadTimes: SupplierLeadTimeSetupItem[]): DataGridColumn<SupplierSetupItem>[] {
  return [
    { key: "code", header: "Supplier code", width: "14%", render: (record) => <strong>{record.code}</strong> },
    {
      key: "name",
      header: "Supplier name",
      render: (record) => (
        <div>
          <strong>{record.name}</strong>
          <div className="muted">{supplierPreferredStatus(record)}</div>
        </div>
      )
    },
    {
      key: "type",
      header: "Supplier type/category",
      width: "18%",
      render: (record) => <ErpStatusChip tone={record.supportsSubcontracting ? "info" : "neutral"}>{record.supplierType}</ErpStatusChip>
    },
    { key: "terms", header: "Terms", width: "12%", render: (record) => record.paymentTermsCode },
    {
      key: "compliance",
      header: "Compliance",
      width: "14%",
      render: (record) => {
        const status = supplierComplianceStatus(record);
        return <ErpStatusChip tone={status === "Approved" ? "success" : "warn"}>{status}</ErpStatusChip>;
      }
    },
    {
      key: "leadTime",
      header: "Lead-time signal",
      width: "15%",
      render: (record) => {
        const signal = supplierLeadTimeSignal(leadTimes.filter((leadTime) => leadTime.supplierId === record.supplierId));
        return <ErpStatusChip tone={signal === "Ready" ? "success" : signal === "Review" ? "warn" : "neutral"}>{signal}</ErpStatusChip>;
      }
    },
    {
      key: "contacts",
      header: "Contacts",
      width: "12%",
      render: (record) => {
        const count = addresses.filter((address) => address.supplierId === record.supplierId && address.contactName !== "Not captured").length;
        return <ErpStatusChip tone={count > 0 ? "success" : "warn"}>{count > 0 ? `${count} ready` : "Pending"}</ErpStatusChip>;
      }
    },
    {
      key: "status",
      header: "Status",
      width: "10%",
      render: (record) => <ErpStatusChip tone={record.status === "Active" ? "success" : "warn"}>{record.status}</ErpStatusChip>
    }
  ];
}

const supplierAddressColumns: DataGridColumn<SupplierAddressSetupItem>[] = [
  { key: "code", header: "Site", width: "14%", render: (record) => <strong>{record.code}</strong> },
  { key: "type", header: "Type", width: "16%", render: (record) => record.addressType },
  { key: "city", header: "City/region", width: "20%", render: (record) => record.city },
  {
    key: "contact",
    header: "Contact",
    render: (record) => (
      <div>
        <strong>{record.contactName}</strong>
        <div className="muted">{record.contactEmail}</div>
      </div>
    )
  },
  {
    key: "default",
    header: "Default",
    width: "14%",
    render: (record) => <ErpStatusChip tone={record.isDefaultOrderAddress ? "success" : "neutral"}>{record.isDefaultOrderAddress ? "Order" : "Reference"}</ErpStatusChip>
  }
];

const leadTimeColumns: DataGridColumn<SupplierLeadTimeSetupItem>[] = [
  { key: "item", header: "Item / group", render: (record) => <strong>{record.itemLabel}</strong> },
  { key: "days", header: "Lead time", width: "16%", render: (record) => `${record.leadTimeDays} days` },
  { key: "policy", header: "Policy", width: "22%", render: (record) => record.orderPolicy },
  {
    key: "subcontract",
    header: "Route",
    width: "16%",
    render: (record) => <ErpStatusChip tone={record.isSubcontractLeadTime ? "info" : "neutral"}>{record.isSubcontractLeadTime ? "Subcontract" : "Purchase"}</ErpStatusChip>
  }
];

function PartnerActionBar({
  entity,
  onCreate,
  testId
}: {
  entity: "customer" | "supplier";
  onCreate: () => void;
  testId: string;
}) {
  const label = entity === "customer" ? "customer" : "supplier";
  return (
    <ErpActionBar
      primary={[{ label: `New ${label} draft`, onClick: onCreate }]}
      secondary={[{ disabled: true, label: `Export ${label}s`, reason: "Export will be available through the governed export review." }]}
      testId={testId}
    />
  );
}

function PartnerModalFooter({
  canSave,
  entity,
  isSaving,
  onClose,
  onSave
}: {
  canSave: boolean;
  entity: "customer" | "supplier";
  isSaving: boolean;
  onClose: () => void;
  onSave: (mode: "draft" | "continue") => void;
}) {
  return (
    <ErpActionBar
      primary={[
        {
          disabled: !canSave || isSaving,
          label: isSaving ? "Saving..." : "Save Draft",
          onClick: () => onSave("draft"),
          reason: !canSave ? saveDisabledReason : undefined
        },
        {
          disabled: !canSave || isSaving,
          label: "Save & Continue",
          onClick: () => onSave("continue"),
          reason: !canSave ? saveDisabledReason : undefined
        }
      ]}
      secondary={[{ disabled: true, label: "Review Audit", reason: `${entity === "customer" ? "Customer" : "Supplier"} audit review needs recorded change history.` }]}
      utility={[{ label: "Close", onClick: onClose, variant: "quiet" }]}
    />
  );
}

function SaveMessage({ message, tone }: { message: string | null; tone: SaveTone }) {
  if (!message) {
    return null;
  }

  return <ErpStatusChip tone={tone}>{message}</ErpStatusChip>;
}

interface CustomerEditorProps {
  addresses: CustomerAddressSetupItem[];
  canSave: boolean;
  customer: CustomerSetupItem;
  customers: CustomerSetupItem[];
  isSaving: boolean;
  mode: PartnerEditorMode;
  onAddAddress: () => void;
  onAddContact: () => void;
  onAddDocument: () => void;
  onAddressChange: <K extends keyof CustomerAddressSetupItem>(addressId: string, key: K, value: CustomerAddressSetupItem[K]) => void;
  onChange: <K extends keyof CustomerSetupItem>(key: K, value: CustomerSetupItem[K]) => void;
  onClose: () => void;
  onSave: (mode: "draft" | "continue") => void;
  onWorkspaceChange: (workspace: CustomerPartnerWorkspaceSetup) => void;
  saveMessage: string | null;
  saveTone: SaveTone;
  workspace: CustomerPartnerWorkspaceSetup;
}

function CustomerEditor({
  addresses,
  canSave,
  customer,
  customers,
  isSaving,
  mode,
  onAddAddress,
  onAddContact,
  onAddDocument,
  onAddressChange,
  onChange,
  onClose,
  onSave,
  onWorkspaceChange,
  saveMessage,
  saveTone,
  workspace
}: CustomerEditorProps) {
  const validationIssues = customerValidation(customer, addresses, mode);
  const contactPoints = partnerContactRows(workspace.contactPoints, addresses);
  const documentRows = partnerDocumentRows(workspace.documents, "Commercial");
  const referenceRows = customerWorkspaceReferences(customer, workspace);
  const creditStatus = customerCreditStatus(customer);
  const catalogStatus = customerCatalogStatus(customer);
  const firstAddress = addresses[0];
  const firstContact = workspace.contactPoints[0];
  const updateProfile = <K extends keyof CustomerPartnerWorkspaceSetup["profile"]>(key: K, value: CustomerPartnerWorkspaceSetup["profile"][K]) =>
    onWorkspaceChange({ ...workspace, profile: { ...workspace.profile, [key]: value } });
  const updateContact = <K extends keyof PartnerContactPointSetupItem>(key: K, value: PartnerContactPointSetupItem[K]) => {
    if (!firstContact) {
      return;
    }
    onWorkspaceChange({
      ...workspace,
      contactPoints: workspace.contactPoints.map((contact) => (contact.id === firstContact.id ? { ...contact, [key]: value } : contact))
    });
  };

  return (
    <ErpModalWorkspace
      description="Customer master workspace for legal identity, sites, contacts, terms, dispatch preferences, references, documents, and audit review."
      footer={<PartnerModalFooter canSave={canSave} entity="customer" isSaving={isSaving} onClose={onClose} onSave={onSave} />}
      isOpen
      onClose={onClose}
      panelClassName="ui-modal__panel--item-master"
      statusMeta={
        <div className="item-master__modal-titlebar">
          <div>
            <strong>{mode === "create" ? "Draft Customer" : customer.name || "Customer detail"}</strong>
            <p>{customer.code || "Customer code pending"}</p>
          </div>
          <div className="context-chip-row">
            <ErpStatusChip tone={customer.status === "Active" ? "success" : "warn"}>{customer.status}</ErpStatusChip>
            <ErpStatusChip tone={creditStatus === "Clear" ? "success" : creditStatus === "Credit watch" ? "warn" : "neutral"}>{creditStatus}</ErpStatusChip>
            <ErpStatusChip tone={catalogStatus === "Enabled" ? "info" : "neutral"}>{catalogStatus}</ErpStatusChip>
            <SaveMessage message={saveMessage} tone={saveTone} />
          </div>
        </div>
      }
      title={mode === "create" ? "Draft Customer" : customer.name || "Customer detail"}
      validation={<ErpValidationSummary errors={validationIssues} maxVisible={4} title="Activation blockers" />}
    >
      <div className="item-master__panel-grid">
        <Card title={CUSTOMER_SECTIONS[0]} description="Customer identity, type, lifecycle, and operating branch.">
          <FormShell initialFingerprint={`${customer.id}-${mode}`} title="Customer setup">
            <label>
              <span>Customer code</span>
              <input onChange={(event) => onChange("code", event.target.value)} value={customer.code} />
            </label>
            <label>
              <span>Customer name</span>
              <input onChange={(event) => onChange("name", event.target.value)} value={customer.name} />
            </label>
            <label>
              <span>Short name</span>
              <input onChange={(event) => onChange("shortName", event.target.value)} value={customer.shortName} />
            </label>
            <ErpLookupField label="Customer type" onChange={(value) => onChange("customerType", value)} options={uniqueOptions(customers.map((record) => record.customerType), customerTypeOptions.map((option) => option.value))} required value={customer.customerType} />
            <ErpLookupField label="Lifecycle status" onChange={(value) => onChange("status", value)} options={lifecycleOptions} required value={customer.status} />
          </FormShell>
        </Card>

        <Card title={CUSTOMER_SECTIONS[1]} description="Legal identity, tax classification, currency, and registration readiness.">
          <div className="item-master__editor-grid">
            <label className="item-master__editor-field">
              <span>Legal name</span>
              <input onChange={(event) => onChange("name", event.target.value)} value={customer.name} />
            </label>
            <ErpLookupField label="Tax category" onChange={() => undefined} options={taxCategoryOptions} value={customer.taxRegistrationNo === "Pending" ? "Pending" : "Registered GST"} />
            <ErpLookupField label="Profile tax category" onChange={(value) => updateProfile("taxCategory", value)} options={taxCategoryOptions} value={workspace.profile.taxCategory} />
            <label className="item-master__editor-field">
              <span>Tax registration</span>
              <input onChange={(event) => onChange("taxRegistrationNo", event.target.value)} value={customer.taxRegistrationNo} />
            </label>
            <ErpLookupField label="Currency" onChange={(value) => updateProfile("currencyCode", value)} options={currencyOptions} value={workspace.profile.currencyCode} />
          </div>
        </Card>

        <Card title={CUSTOMER_SECTIONS[2]} description="Billing, shipping, and dispatch-ready site records for customer operations.">
          <ErpActionBar secondary={[{ label: "Add customer site", onClick: onAddAddress }]} />
          {firstAddress ? (
            <div className="item-master__editor-grid">
              <label className="item-master__editor-field">
                <span>Site code</span>
                <input onChange={(event) => onAddressChange(firstAddress.id, "code", event.target.value)} value={firstAddress.code} />
              </label>
              <ErpLookupField label="Site type" onChange={(value) => onAddressChange(firstAddress.id, "addressType", value)} options={["Billing", "Shipping", "Operational", "Bill-to", "Ship-to"].map(toOption)} value={firstAddress.addressType} />
              <label className="item-master__editor-field">
                <span>Address line</span>
                <input onChange={(event) => onAddressChange(firstAddress.id, "addressLine1", event.target.value)} value={firstAddress.addressLine1} />
              </label>
              <label className="item-master__editor-field">
                <span>City</span>
                <input onChange={(event) => onAddressChange(firstAddress.id, "city", event.target.value)} value={firstAddress.city} />
              </label>
              <label className="item-master__editor-field">
                <span>Contact name</span>
                <input onChange={(event) => onAddressChange(firstAddress.id, "contactName", event.target.value)} value={firstAddress.contactName} />
              </label>
              <label className="item-master__editor-field">
                <span>Contact email</span>
                <input onChange={(event) => onAddressChange(firstAddress.id, "contactEmail", event.target.value)} value={firstAddress.contactEmail} />
              </label>
            </div>
          ) : null}
          <ErpGrid
            ariaLabel="Customer detail sites"
            columns={customerAddressColumns}
            emptyState={{
              title: "No customer sites ready",
              description: "Add bill-to and ship-to sites before customer activation."
            }}
            getRowId={(record) => record.id}
            records={addresses}
            rowLabel={(record) => `${record.code} customer address`}
          />
        </Card>

        <Card title={CUSTOMER_SECTIONS[3]} description="Commercial, accounts, dispatch, and quality contacts linked to customer sites.">
          <ErpActionBar secondary={[{ label: "Add contact point", onClick: onAddContact }]} />
          <ErpGrid
            ariaLabel="Customer contacts"
            columns={contactColumns()}
            emptyState={{
              title: "No customer contacts ready",
              description: "Add site contacts before releasing customer orders."
            }}
            getRowId={(record) => record.id}
            records={contactPoints}
            rowLabel={(record) => `${record.contactName} customer contact`}
          />
        </Card>

        <Card title={CUSTOMER_SECTIONS[4]} description="Controlled communication channel setup for operational contacts.">
          <div className="item-master__editor-grid">
            <ErpLookupField label="Contact role" onChange={(value) => updateContact("role", value)} options={contactRoleOptions} value={firstContact?.role ?? "Commercial"} />
            <ErpLookupField label="Communication channel" onChange={(value) => updateContact("channel", value)} options={communicationChannelOptions} value={firstContact?.channel ?? "Email"} />
            <label className="item-master__editor-field">
              <span>Contact name</span>
              <input disabled={!firstContact} onChange={(event) => updateContact("contactName", event.target.value)} value={firstContact?.contactName ?? ""} />
            </label>
            <label className="item-master__editor-field">
              <span>Primary contact point</span>
              <input disabled={!firstContact} onChange={(event) => updateContact("detail", event.target.value)} value={firstContact?.detail ?? ""} />
            </label>
          </div>
        </Card>

        <Card title={CUSTOMER_SECTIONS[5]} description="Operational credit controls without introducing accounting ledger behavior.">
          <div className="item-master__editor-grid">
            <ErpLookupField label="Credit status" onChange={(value) => updateProfile("creditStatus", value)} options={creditStatusOptions} value={workspace.profile.creditStatus ?? creditStatus} />
            <ErpNumberField
              label="Credit days"
              min={0}
              onChange={(value) => onChange("creditDays", creditDaysLabel(value))}
              unit="days"
              value={parseCreditDays(customer.creditDays)}
            />
            <ErpLookupField label="Credit hold rule" onChange={(value) => updateProfile("creditHoldRule", value)} options={["Standard release", "Manager review", "Dispatch hold"].map(toOption)} value={workspace.profile.creditHoldRule ?? "Standard release"} />
          </div>
        </Card>

        <Card title={CUSTOMER_SECTIONS[6]} description="Payment terms, commercial classification, and order release controls.">
          <div className="item-master__editor-grid">
            <ErpLookupField label="Payment terms" onChange={(value) => onChange("paymentTermsCode", value)} options={uniqueOptions(customers.map((record) => record.paymentTermsCode), paymentTermOptions.map((option) => option.value))} required value={customer.paymentTermsCode} />
            <ErpLookupField label="Customer commercial segment" onChange={(value) => updateProfile("commercialSegment", value)} options={["Standard", "Strategic", "Project", "Aftermarket"].map(toOption)} value={workspace.profile.commercialSegment ?? "Standard"} />
            <ErpLookupField label="Order release control" onChange={(value) => updateProfile("orderReleaseControl", value)} options={["Standard", "Credit review", "Advance payment"].map(toOption)} value={workspace.profile.orderReleaseControl ?? "Standard"} />
          </div>
        </Card>

        <Card title={CUSTOMER_SECTIONS[7]} description="Dispatch route, appointment, and document preferences for shipping execution.">
          <div className="item-master__editor-grid">
            <ErpLookupField label="Dispatch preference" onChange={(value) => updateProfile("dispatchPreference", value)} options={dispatchPreferenceOptions} value={workspace.profile.dispatchPreference ?? "Standard dispatch"} />
            <ErpLookupField label="Default branch" onChange={() => undefined} options={[toOption(customer.defaultBranch)]} value={customer.defaultBranch} />
            <label className="item-master__editor-field">
              <span>Dispatch instruction</span>
              <input onChange={(event) => updateProfile("dispatchInstruction", event.target.value)} value={workspace.profile.dispatchInstruction ?? ""} />
            </label>
          </div>
        </Card>

        <Card title={CUSTOMER_SECTIONS[8]} description="Customer-facing catalog eligibility and visibility controls.">
          <div className="utility-grid">
            <Tile eyebrow="Catalog" label="Visibility" meta={customer.customerType}>
              {catalogStatus}
            </Tile>
            <Tile eyebrow="Pricing view" label="Customer segment" meta={customer.paymentTermsCode}>
              {customer.code.includes("ENKAY") ? "Strategic catalog" : "Standard catalog"}
            </Tile>
          </div>
        </Card>

        <Card title={CUSTOMER_SECTIONS[9]} description="Customer item codes, drawing revisions, and approval status.">
          <ErpGrid
            ariaLabel="Customer item references"
            columns={customerReferenceColumns}
            emptyState={{
              title: "No customer item references approved",
              description: "Approved item references will appear here after commercial and engineering review."
            }}
            getRowId={(record) => record.id}
            records={referenceRows}
            rowLabel={(record) => `${record.itemReference} customer item reference`}
          />
        </Card>

        <Card title={CUSTOMER_SECTIONS[10]} description="Tax, commercial, and dispatch documents for customer readiness.">
          <ErpActionBar secondary={[{ label: "Add document metadata", onClick: onAddDocument }]} />
          <ErpFileActionState disabledReason={documentDisabledReason} enabled={false} label="Upload customer document" />
          <ErpGrid
            ariaLabel="Customer documents"
            columns={documentColumns}
            emptyState={{
              title: "No customer documents attached",
              description: "Document records will appear when document control is enabled for partner masters."
            }}
            getRowId={(record) => record.id}
            records={documentRows}
            rowLabel={(record) => `${record.document} customer document`}
          />
        </Card>

        <Card title={CUSTOMER_SECTIONS[11]} description="Governance and change history for customer master maintenance.">
          {workspace.auditEvents.length > 0 ? (
            <ErpGrid ariaLabel="Customer audit history" columns={auditColumns} getRowId={(record) => record.id} records={workspace.auditEvents} rowLabel={(record) => `${record.event} audit event`} />
          ) : (
            <ErpEmptyState title="No audit events available" description="Customer change history will appear after governed edits are recorded." />
          )}
        </Card>
      </div>
    </ErpModalWorkspace>
  );
}

interface SupplierEditorProps {
  addresses: SupplierAddressSetupItem[];
  canSave: boolean;
  isSaving: boolean;
  leadTimes: SupplierLeadTimeSetupItem[];
  mode: PartnerEditorMode;
  onAddAddress: () => void;
  onAddContact: () => void;
  onAddDocument: () => void;
  onAddressChange: <K extends keyof SupplierAddressSetupItem>(addressId: string, key: K, value: SupplierAddressSetupItem[K]) => void;
  onChange: <K extends keyof SupplierSetupItem>(key: K, value: SupplierSetupItem[K]) => void;
  onClose: () => void;
  onSave: (mode: "draft" | "continue") => void;
  onWorkspaceChange: (workspace: SupplierPartnerWorkspaceSetup) => void;
  saveMessage: string | null;
  saveTone: SaveTone;
  supplier: SupplierSetupItem;
  suppliers: SupplierSetupItem[];
  workspace: SupplierPartnerWorkspaceSetup;
}

function SupplierEditor({
  addresses,
  canSave,
  isSaving,
  leadTimes,
  mode,
  onAddAddress,
  onAddContact,
  onAddDocument,
  onAddressChange,
  onChange,
  onClose,
  onSave,
  onWorkspaceChange,
  saveMessage,
  saveTone,
  supplier,
  suppliers,
  workspace
}: SupplierEditorProps) {
  const validationIssues = supplierValidation(supplier, addresses, leadTimes, mode);
  const contactPoints = partnerContactRows(workspace.contactPoints, addresses);
  const documentRows = partnerDocumentRows(workspace.documents, "Procurement");
  const referenceRows = supplierWorkspaceReferences(supplier, workspace);
  const complianceStatus = supplierComplianceStatus(supplier);
  const leadTimeSignal = supplierLeadTimeSignal(leadTimes);
  const firstAddress = addresses[0];
  const firstContact = workspace.contactPoints[0];
  const updateProfile = <K extends keyof SupplierPartnerWorkspaceSetup["profile"]>(key: K, value: SupplierPartnerWorkspaceSetup["profile"][K]) =>
    onWorkspaceChange({ ...workspace, profile: { ...workspace.profile, [key]: value } });
  const updateContact = <K extends keyof PartnerContactPointSetupItem>(key: K, value: PartnerContactPointSetupItem[K]) => {
    if (!firstContact) {
      return;
    }
    onWorkspaceChange({
      ...workspace,
      contactPoints: workspace.contactPoints.map((contact) => (contact.id === firstContact.id ? { ...contact, [key]: value } : contact))
    });
  };

  return (
    <ErpModalWorkspace
      description="Supplier master workspace for legal identity, sites, contacts, terms, capabilities, lead times, compliance, documents, and audit review."
      footer={<PartnerModalFooter canSave={canSave} entity="supplier" isSaving={isSaving} onClose={onClose} onSave={onSave} />}
      isOpen
      onClose={onClose}
      panelClassName="ui-modal__panel--item-master"
      statusMeta={
        <div className="item-master__modal-titlebar">
          <div>
            <strong>{mode === "create" ? "Draft Supplier" : supplier.name || "Supplier detail"}</strong>
            <p>{supplier.code || "Supplier code pending"}</p>
          </div>
          <div className="context-chip-row">
            <ErpStatusChip tone={supplier.status === "Active" ? "success" : "warn"}>{supplier.status}</ErpStatusChip>
            <ErpStatusChip tone={complianceStatus === "Approved" ? "success" : "warn"}>{complianceStatus}</ErpStatusChip>
            <ErpStatusChip tone={leadTimeSignal === "Ready" ? "success" : leadTimeSignal === "Review" ? "warn" : "neutral"}>{leadTimeSignal}</ErpStatusChip>
            <SaveMessage message={saveMessage} tone={saveTone} />
          </div>
        </div>
      }
      title={mode === "create" ? "Draft Supplier" : supplier.name || "Supplier detail"}
      validation={<ErpValidationSummary errors={validationIssues} maxVisible={4} title="Activation blockers" />}
    >
      <div className="item-master__panel-grid">
        <Card title={SUPPLIER_SECTIONS[0]} description="Supplier identity, category, lifecycle, and branch context.">
          <FormShell initialFingerprint={`${supplier.id}-${mode}`} title="Supplier setup">
            <label>
              <span>Supplier code</span>
              <input onChange={(event) => onChange("code", event.target.value)} value={supplier.code} />
            </label>
            <label>
              <span>Supplier name</span>
              <input onChange={(event) => onChange("name", event.target.value)} value={supplier.name} />
            </label>
            <ErpLookupField label="Supplier type/category" onChange={(value) => onChange("supplierType", value)} options={uniqueOptions(suppliers.map((record) => record.supplierType), supplierTypeOptions.map((option) => option.value))} required value={supplier.supplierType} />
            <ErpLookupField label="Lifecycle status" onChange={(value) => onChange("status", value)} options={lifecycleOptions} required value={supplier.status} />
          </FormShell>
        </Card>

        <Card title={SUPPLIER_SECTIONS[1]} description="Legal identity, tax classification, and supplier registration readiness.">
          <div className="item-master__editor-grid">
            <label className="item-master__editor-field">
              <span>Legal name</span>
              <input onChange={(event) => onChange("name", event.target.value)} value={supplier.name} />
            </label>
            <ErpLookupField label="Tax category" onChange={(value) => updateProfile("taxCategory", value)} options={taxCategoryOptions} value={workspace.profile.taxCategory} />
            <label className="item-master__editor-field">
              <span>Tax registration</span>
              <input onChange={(event) => onChange("taxRegistrationNo", event.target.value)} value={supplier.taxRegistrationNo} />
            </label>
            <ErpLookupField label="Currency" onChange={(value) => updateProfile("currencyCode", value)} options={currencyOptions} value={workspace.profile.currencyCode} />
          </div>
        </Card>

        <Card title={SUPPLIER_SECTIONS[2]} description="Order, remittance, subcontract, and operational supplier sites.">
          <ErpActionBar secondary={[{ label: "Add supplier site", onClick: onAddAddress }]} />
          {firstAddress ? (
            <div className="item-master__editor-grid">
              <label className="item-master__editor-field">
                <span>Site code</span>
                <input onChange={(event) => onAddressChange(firstAddress.id, "code", event.target.value)} value={firstAddress.code} />
              </label>
              <ErpLookupField label="Site type" onChange={(value) => onAddressChange(firstAddress.id, "addressType", value)} options={["Order", "Remittance", "Subcontract", "Operational"].map(toOption)} value={firstAddress.addressType} />
              <label className="item-master__editor-field">
                <span>Address line</span>
                <input onChange={(event) => onAddressChange(firstAddress.id, "addressLine1", event.target.value)} value={firstAddress.addressLine1} />
              </label>
              <label className="item-master__editor-field">
                <span>City</span>
                <input onChange={(event) => onAddressChange(firstAddress.id, "city", event.target.value)} value={firstAddress.city} />
              </label>
              <label className="item-master__editor-field">
                <span>Contact name</span>
                <input onChange={(event) => onAddressChange(firstAddress.id, "contactName", event.target.value)} value={firstAddress.contactName} />
              </label>
              <label className="item-master__editor-field">
                <span>Contact email</span>
                <input onChange={(event) => onAddressChange(firstAddress.id, "contactEmail", event.target.value)} value={firstAddress.contactEmail} />
              </label>
            </div>
          ) : null}
          <ErpGrid
            ariaLabel="Supplier detail sites"
            columns={supplierAddressColumns}
            emptyState={{
              title: "No supplier sites ready",
              description: "Add order and remittance sites before supplier approval."
            }}
            getRowId={(record) => record.id}
            records={addresses}
            rowLabel={(record) => `${record.code} supplier address`}
          />
        </Card>

        <Card title={SUPPLIER_SECTIONS[3]} description="Procurement, quality, compliance, and plant contacts for supplier operations.">
          <ErpActionBar secondary={[{ label: "Add contact point", onClick: onAddContact }]} />
          <ErpGrid
            ariaLabel="Supplier contacts"
            columns={contactColumns()}
            emptyState={{
              title: "No supplier contacts ready",
              description: "Add supplier contacts before releasing purchase orders."
            }}
            getRowId={(record) => record.id}
            records={contactPoints}
            rowLabel={(record) => `${record.contactName} supplier contact`}
          />
        </Card>

        <Card title={SUPPLIER_SECTIONS[4]} description="Controlled communication channel setup for supplier contacts.">
          <div className="item-master__editor-grid">
            <ErpLookupField label="Contact role" onChange={(value) => updateContact("role", value)} options={contactRoleOptions} value={firstContact?.role ?? "Commercial"} />
            <ErpLookupField label="Communication channel" onChange={(value) => updateContact("channel", value)} options={communicationChannelOptions} value={firstContact?.channel ?? "Email"} />
            <label className="item-master__editor-field">
              <span>Contact name</span>
              <input disabled={!firstContact} onChange={(event) => updateContact("contactName", event.target.value)} value={firstContact?.contactName ?? ""} />
            </label>
            <label className="item-master__editor-field">
              <span>Primary contact point</span>
              <input disabled={!firstContact} onChange={(event) => updateContact("detail", event.target.value)} value={firstContact?.detail ?? ""} />
            </label>
          </div>
        </Card>

        <Card title={SUPPLIER_SECTIONS[5]} description="Payment terms, preferred status, currency, and procurement release controls.">
          <div className="item-master__editor-grid">
            <ErpLookupField label="Payment terms" onChange={(value) => onChange("paymentTermsCode", value)} options={uniqueOptions(suppliers.map((record) => record.paymentTermsCode), paymentTermOptions.map((option) => option.value))} required value={supplier.paymentTermsCode} />
            <ErpLookupField label="Preferred supplier" onChange={(value) => updateProfile("preferredStatus", value)} options={preferredSupplierOptions} value={workspace.profile.preferredStatus ?? supplierPreferredStatus(supplier)} />
            <ErpLookupField label="Procurement release control" onChange={(value) => updateProfile("procurementReleaseControl", value)} options={["Standard", "Compliance review", "Quality approval"].map(toOption)} value={workspace.profile.procurementReleaseControl ?? "Standard"} />
          </div>
        </Card>

        <Card title={SUPPLIER_SECTIONS[6]} description="Supplier category, subcontract capability, and operational capability signals.">
          <div className="item-master__editor-grid">
            <ErpLookupField
              label="Supplier capability"
              onChange={(value) => onChange("supportsSubcontracting", value === "Subcontract capable")}
              options={supplierCapabilityOptions}
              value={supplier.supportsSubcontracting ? "Subcontract capable" : "Material supplier"}
            />
            <ErpLookupField label="Compliance status" onChange={(value) => updateProfile("complianceStatus", value)} options={complianceStatusOptions} value={workspace.profile.complianceStatus ?? complianceStatus} />
            <ErpLookupField label="Default branch" onChange={() => undefined} options={[toOption(supplier.defaultBranch)]} value={supplier.defaultBranch} />
          </div>
        </Card>

        <Card title={SUPPLIER_SECTIONS[7]} description="Lead-time rules used for procurement and planning visibility.">
          <ErpGrid
            ariaLabel="Supplier detail lead times"
            columns={leadTimeColumns}
            emptyState={{
              title: "No lead-time rules ready",
              description: "Lead-time rows are required before procurement planning relies on this supplier."
            }}
            getRowId={(record) => record.id}
            records={leadTimes}
            rowLabel={(record) => `${record.itemLabel} supplier lead time`}
          />
        </Card>

        <Card title={SUPPLIER_SECTIONS[8]} description="Approved item references, vendor item codes, and compliance readiness.">
          <ErpGrid
            ariaLabel="Supplier approved items"
            columns={supplierReferenceColumns}
            emptyState={{
              title: "No approved item references",
              description: "Approved vendor references will appear after item and supplier review."
            }}
            getRowId={(record) => record.id}
            records={referenceRows}
            rowLabel={(record) => `${record.itemReference} supplier item reference`}
          />
        </Card>

        <Card title={SUPPLIER_SECTIONS[9]} description="Compliance document status and approval readiness.">
          <ErpActionBar secondary={[{ label: "Add compliance metadata", onClick: onAddDocument }]} />
          <ErpFileActionState disabledReason={documentDisabledReason} enabled={false} label="Upload compliance document" />
          <ErpGrid
            ariaLabel="Supplier compliance documents"
            columns={documentColumns}
            emptyState={{
              title: "No compliance documents attached",
              description: "Compliance document records will appear when document control is enabled for partner masters."
            }}
            getRowId={(record) => record.id}
            records={documentRows}
            rowLabel={(record) => `${record.document} supplier compliance document`}
          />
        </Card>

        <Card title={SUPPLIER_SECTIONS[10]} description="General supplier documents and commercial attachments.">
          <ErpActionBar secondary={[{ label: "Add document metadata", onClick: onAddDocument }]} />
          <ErpFileActionState disabledReason={documentDisabledReason} enabled={false} label="Upload supplier document" />
          {documentRows.length > 0 ? (
            <ErpGrid ariaLabel="Supplier documents" columns={documentColumns} getRowId={(record) => record.id} records={documentRows} rowLabel={(record) => `${record.document} supplier document`} />
          ) : (
            <ErpEmptyState title="No supplier documents attached" description="Document metadata will appear here after it is saved." />
          )}
        </Card>

        <Card title={SUPPLIER_SECTIONS[11]} description="Governance and change history for supplier master maintenance.">
          {workspace.auditEvents.length > 0 ? (
            <ErpGrid ariaLabel="Supplier audit history" columns={auditColumns} getRowId={(record) => record.id} records={workspace.auditEvents} rowLabel={(record) => `${record.event} audit event`} />
          ) : (
            <ErpEmptyState title="No audit events available" description="Supplier change history will appear after governed edits are recorded." />
          )}
        </Card>
      </div>
    </ErpModalWorkspace>
  );
}

export function CustomerListDetailPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [customerType, setCustomerType] = useState("all");
  const [region, setRegion] = useState("all");
  const [creditStatus, setCreditStatus] = useState("all");
  const [paymentTerms, setPaymentTerms] = useState("all");
  const [hasContacts, setHasContacts] = useState("all");
  const [hasShipTo, setHasShipTo] = useState("all");
  const [editorMode, setEditorMode] = useState<PartnerEditorMode>("closed");
  const [editorDraft, setEditorDraft] = useState<CustomerSetupItem | null>(null);
  const [workspaceDraft, setWorkspaceDraft] = useState<CustomerPartnerWorkspaceSetup | null>(null);
  const [addressDrafts, setAddressDrafts] = useState<CustomerAddressSetupItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveTone, setSaveTone] = useState<SaveTone>("info");
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(
    () => buildMasterFilter(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    [deferredSearch, status, user?.activeContext.branchId, user?.activeContext.companyId]
  );
  const customersQuery = useApiQuery(
    queryKeys.partners.customers(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listCustomerSetup(session, filter),
    { staleTime: 60_000 }
  );
  const addressesQuery = useApiQuery(
    queryKeys.partners.customerAddresses(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listCustomerAddressSetup(session, filter),
    { staleTime: 60_000 }
  );
  const customers = customersQuery.data ?? [];
  const addresses = addressesQuery.data ?? [];
  const source = customers[0]?.source ?? addresses[0]?.source ?? "Seeded";
  const canSave = canPersistMasterData(session);
  const customerColumns = useMemo(() => buildCustomerColumns(addresses), [addresses]);
  const filteredCustomers = useMemo(
    () =>
      customers.filter((customer) => {
        const customerAddresses = addresses.filter((address) => address.customerId === customer.customerId);
        const matchesType = customerType === "all" || customer.customerType === customerType;
        const matchesRegion = region === "all" || customerRegion(customerAddresses).includes(region);
        const matchesCredit = creditStatus === "all" || customerCreditStatus(customer) === creditStatus;
        const matchesTerms = paymentTerms === "all" || customer.paymentTermsCode === paymentTerms;
        const matchesContacts = hasContacts === "all" || (hasContacts === "yes" ? customerHasContact(customerAddresses) : !customerHasContact(customerAddresses));
        const matchesShipTo = hasShipTo === "all" || (hasShipTo === "yes" ? customerHasShipTo(customerAddresses) : !customerHasShipTo(customerAddresses));
        return matchesType && matchesRegion && matchesCredit && matchesTerms && matchesContacts && matchesShipTo;
      }),
    [addresses, creditStatus, customerType, customers, hasContacts, hasShipTo, paymentTerms, region]
  );
  const selectedPersistedAddresses = editorDraft ? addresses.filter((address) => address.customerId === editorDraft.customerId) : addresses;
  const selectedAddresses = [
    ...selectedPersistedAddresses.filter((address) => !addressDrafts.some((draft) => draft.id === address.id)),
    ...addressDrafts.filter((address) => !editorDraft || address.customerId === editorDraft.customerId)
  ];

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setCustomerType("all");
    setRegion("all");
    setCreditStatus("all");
    setPaymentTerms("all");
    setHasContacts("all");
    setHasShipTo("all");
  };

  const openCreateEditor = () => {
    const draft = buildCustomerDraft(user?.activeContext.companyId, user?.activeContext.branchName);
    setEditorMode("create");
    setEditorDraft(draft);
    setWorkspaceDraft(buildCustomerWorkspaceDraft(draft));
    setAddressDrafts([]);
    setSaveMessage(null);
    setSaveTone("info");
  };

  const openEditEditor = (record: CustomerSetupItem) => {
    const recordAddresses = addresses.filter((address) => address.customerId === record.customerId);
    setEditorMode("edit");
    setEditorDraft(record);
    setWorkspaceDraft(buildCustomerWorkspaceDraft(record, recordAddresses));
    setAddressDrafts([]);
    setSaveMessage(null);
    setSaveTone("info");
    void getCustomerPartnerWorkspace(session, record, recordAddresses).then(setWorkspaceDraft);
  };

  const closeEditor = () => {
    setEditorMode("closed");
    setEditorDraft(null);
    setWorkspaceDraft(null);
    setAddressDrafts([]);
    setSaveMessage(null);
  };

  const updateEditor = <K extends keyof CustomerSetupItem>(key: K, value: CustomerSetupItem[K]) => {
    setEditorDraft((current) => (current ? { ...current, [key]: value } : current));
  };

  const addCustomerAddress = () => {
    if (!editorDraft) {
      return;
    }

    const nextAddress: CustomerAddressSetupItem = {
      id: `customer-address-draft-${Date.now()}`,
      addressId: 0,
      customerId: editorDraft.customerId,
      code: selectedAddresses.length === 0 ? "SHIP-01" : `SITE-${selectedAddresses.length + 1}`,
      addressType: "Shipping",
      addressLine1: "",
      addressLine2: "",
      city: "",
      stateOrProvince: "",
      postalCode: "",
      countryCode: "IN",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      isDefaultBilling: selectedAddresses.length === 0,
      isDefaultShipping: true,
      defaultUsage: selectedAddresses.length === 0 ? "Billing + Shipping" : "Shipping",
      status: "Draft",
      source: "Deferred"
    };
    setAddressDrafts((current) => [...current, nextAddress]);
  };

  const updateCustomerAddress = <K extends keyof CustomerAddressSetupItem>(addressId: string, key: K, value: CustomerAddressSetupItem[K]) => {
    setAddressDrafts((current) => {
      const existingDraft = current.find((address) => address.id === addressId);
      if (existingDraft) {
        return current.map((address) => (address.id === addressId ? { ...address, [key]: value } : address));
      }

      const persisted = selectedPersistedAddresses.find((address) => address.id === addressId);
      return persisted ? [...current, { ...persisted, [key]: value }] : current;
    });
  };

  const addCustomerContact = () => {
    if (!workspaceDraft) {
      return;
    }

    const primaryAddress = selectedAddresses[0];
    setWorkspaceDraft({
      ...workspaceDraft,
      contactPoints: [
        ...workspaceDraft.contactPoints,
        {
          id: `customer-contact-draft-${Date.now()}`,
          contactPointId: 0,
          addressId: primaryAddress?.addressId || null,
          contactName: primaryAddress?.contactName && primaryAddress.contactName !== "Not captured" ? primaryAddress.contactName : "",
          role: "Commercial",
          channel: "Email",
          detail: primaryAddress?.contactEmail && primaryAddress.contactEmail !== "Not captured" ? primaryAddress.contactEmail : "",
          isPrimary: workspaceDraft.contactPoints.length === 0,
          consentStatus: "Business communication",
          escalationLevel: workspaceDraft.contactPoints.length === 0 ? "Primary" : "Standard",
          status: "Draft"
        }
      ]
    });
  };

  const addCustomerDocument = () => {
    if (!workspaceDraft) {
      return;
    }

    setWorkspaceDraft({
      ...workspaceDraft,
      documents: [
        ...workspaceDraft.documents,
        {
          id: `customer-document-draft-${Date.now()}`,
          documentId: 0,
          documentType: "Commercial",
          title: "Customer document metadata",
          documentNo: "",
          revisionCode: "Draft",
          fileName: "",
          approvalStatus: "Draft",
          visibilityScope: "Internal",
          effectiveFrom: "",
          effectiveTo: "",
          expiresOn: "",
          status: "Draft"
        }
      ]
    });
  };

  const saveCustomer = async (mode: "draft" | "continue") => {
    if (!editorDraft || isSaving) {
      return;
    }

    const issues = coreSaveErrors(customerValidation(editorDraft, selectedAddresses, editorMode));
    if (issues.length > 0) {
      setSaveTone("danger");
      setSaveMessage(issues[0]);
      return;
    }

    const request: CustomerUpsertRequest = {
      companyId: editorDraft.companyId || user?.activeContext.companyId || 1,
      customerCode: editorDraft.code.trim(),
      customerName: editorDraft.name.trim(),
      shortName: valueOrNull(editorDraft.shortName),
      customerType: editorDraft.customerType,
      defaultBranchId: user?.activeContext.branchId ?? null,
      defaultLanguageId: null,
      taxRegistrationNo: valueOrNull(editorDraft.taxRegistrationNo),
      paymentTermsCode: valueOrNull(editorDraft.paymentTermsCode),
      creditDays: parseCreditDays(editorDraft.creditDays),
      status: editorDraft.status || "Draft"
    };

    try {
      setIsSaving(true);
      const saved = editorMode === "create" ? await createCustomerDraft(session, request) : await updateCustomerCore(session, editorDraft.customerId, request);
      for (const address of selectedAddresses) {
        const [city, stateFromCity] = address.city.split(",").map((part) => part.trim());
        const addressRequest = {
          companyId: saved.companyId,
          customerId: saved.customerId,
          addressCode: address.code.trim() || "SITE-01",
          addressType: address.addressType || "Shipping",
          addressLine1: address.addressLine1.trim() || "Address pending",
          addressLine2: address.addressLine2 || null,
          city: city || "Pending",
          stateOrProvince: address.stateOrProvince || stateFromCity || "Pending",
          postalCode: address.postalCode || "Pending",
          countryCode: address.countryCode || "IN",
          contactName: valueOrNull(address.contactName),
          contactEmail: valueOrNull(address.contactEmail),
          contactPhone: valueOrNull(address.contactPhone),
          isDefaultBilling: address.isDefaultBilling,
          isDefaultShipping: address.isDefaultShipping,
          status: address.status || "Draft"
        };
        if (address.addressId > 0) {
          await updateCustomerAddressCore(session, address.addressId, addressRequest);
        } else {
          await createCustomerAddressDraft(session, addressRequest);
        }
      }
      const profileToSave = workspaceDraft ?? buildCustomerWorkspaceDraft(saved, selectedAddresses);
      const savedWorkspace = await updateCustomerPartnerWorkspace(session, saved.customerId, {
        ...profileToSave,
        profile: {
          ...profileToSave.profile,
          legalName: profileToSave.profile.legalName || saved.name,
          paymentTermsCode: saved.paymentTermsCode,
          status: saved.status
        }
      });
      setEditorDraft(saved);
      setWorkspaceDraft(savedWorkspace);
      setEditorMode("edit");
      await customersQuery.refetch();
      await addressesQuery.refetch();
      setAddressDrafts([]);
      setSaveTone("success");
      setSaveMessage(mode === "continue" ? "Customer draft saved. Continue editing the record." : "Customer draft saved.");
    } catch (error) {
      setSaveTone("danger");
      setSaveMessage(error instanceof Error ? error.message : "Customer draft could not be saved.");
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
            <PartnerActionBar entity="customer" onCreate={openCreateEditor} testId="customer-master-action-bar" />
          </>
        }
        aside={
          <PartnerAside
            description="Customer account, contact, credit, terms, and address setup stays compatible with completed sales and dispatch references."
            source={source}
          />
        }
        description="Customer list/detail workspace for account terms, credit context, tax references, sites, contacts, and dispatch readiness."
        filters={
          <ErpFilterBar ariaLabel="Customer master filters" onClear={clearFilters} testId="customer-master-filter-bar">
            <input
              aria-label="Search customers"
              onChange={(event) => startTransition(() => setSearch(event.target.value))}
              placeholder="Search customer, type, city, or tax reference"
              value={search}
            />
            <select aria-label="Customer status" onChange={(event) => setStatus(event.target.value)} value={status}>
              <option value="all">Status: Any</option>
              {lifecycleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select aria-label="Customer type filter" onChange={(event) => setCustomerType(event.target.value)} value={customerType}>
              <option value="all">Type: Any</option>
              {uniqueOptions(customers.map((record) => record.customerType), customerTypeOptions.map((option) => option.value)).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select aria-label="Customer city or region filter" onChange={(event) => setRegion(event.target.value)} value={region}>
              <option value="all">Region: Any</option>
              {customerRegionOptions.filter((option) => option.value !== "Any region").map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select aria-label="Customer credit status filter" onChange={(event) => setCreditStatus(event.target.value)} value={creditStatus}>
              <option value="all">Credit: Any</option>
              {creditStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select aria-label="Customer payment terms filter" onChange={(event) => setPaymentTerms(event.target.value)} value={paymentTerms}>
              <option value="all">Terms: Any</option>
              {uniqueOptions(customers.map((record) => record.paymentTermsCode), paymentTermOptions.map((option) => option.value)).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select aria-label="Customer has contacts filter" onChange={(event) => setHasContacts(event.target.value)} value={hasContacts}>
              <option value="all">Contacts: Any</option>
              <option value="yes">Contacts ready</option>
              <option value="no">Contacts pending</option>
            </select>
            <select aria-label="Customer has ship-to filter" onChange={(event) => setHasShipTo(event.target.value)} value={hasShipTo}>
              <option value="all">Ship-to: Any</option>
              <option value="yes">Ship-to ready</option>
              <option value="no">Ship-to pending</option>
            </select>
          </ErpFilterBar>
        }
        title="Customer List & Detail"
      >
        <KpiStrip
          items={[
            { label: "Total customers", value: String(customers.length) },
            { label: "Active customers", value: String(customers.filter((record) => record.status === "Active").length) },
            { label: "Credit watch", value: String(customers.filter((record) => customerCreditStatus(record) !== "Clear").length) },
            { label: "Sites ready", value: String(customers.filter((record) => addresses.some((address) => address.customerId === record.customerId)).length) },
            { label: "Contacts ready", value: String(customers.filter((record) => customerHasContact(addresses.filter((address) => address.customerId === record.customerId))).length) },
            { label: "Catalog enabled", value: String(customers.filter((record) => customerCatalogStatus(record) === "Enabled").length) }
          ]}
        />
        <div className="split-panels">
          <Card title="Customer accounts" description="Dense partner account list for commercial, credit, site, and contact readiness review.">
            <ErpGrid
              ariaLabel="Customer list"
              columns={customerColumns}
              emptyState={{
                title: "No customers match the current filters",
                description: "Adjust search, status, type, region, credit, terms, contact, or ship-to filters."
              }}
              getRowId={(record) => record.id}
              isLoading={customersQuery.isLoading}
              onRowSelect={openEditEditor}
              records={filteredCustomers}
              rowLabel={(record) => `${record.code} customer`}
              testId="customer-master-grid"
              virtualization={{ enabled: true }}
            />
          </Card>
          <Card title="Customer sites and contacts" description="Bill-to, ship-to, and operational contacts for selected or filtered customer context.">
            <ErpGrid
              ariaLabel="Customer address list"
              columns={customerAddressColumns}
              emptyState={{
                title: "No customer sites match the current filters",
                description: "Select another customer or adjust filters."
              }}
              getRowId={(record) => record.id}
              isLoading={addressesQuery.isLoading}
              records={selectedAddresses}
              rowLabel={(record) => `${record.code} customer address`}
              virtualization={{ enabled: true }}
            />
          </Card>
        </div>
      </ListPageShell>

      {editorDraft && editorMode !== "closed" ? (
        <CustomerEditor
          addresses={selectedAddresses}
          canSave={canSave}
          customer={editorDraft}
          customers={customers}
          isSaving={isSaving}
          mode={editorMode}
          onAddAddress={addCustomerAddress}
          onAddContact={addCustomerContact}
          onAddDocument={addCustomerDocument}
          onAddressChange={updateCustomerAddress}
          onChange={updateEditor}
          onClose={closeEditor}
          onSave={(nextMode) => void saveCustomer(nextMode)}
          onWorkspaceChange={(workspace) => setWorkspaceDraft(workspace)}
          saveMessage={saveMessage}
          saveTone={saveTone}
          workspace={workspaceDraft ?? buildCustomerWorkspaceDraft(editorDraft, selectedAddresses)}
        />
      ) : null}
    </>
  );
}

export function SupplierListDetailPage() {
  const { session, user } = useAuth();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [supplierType, setSupplierType] = useState("all");
  const [complianceStatus, setComplianceStatus] = useState("all");
  const [preferredSupplier, setPreferredSupplier] = useState("all");
  const [paymentTerms, setPaymentTerms] = useState("all");
  const [leadTimeReady, setLeadTimeReady] = useState("all");
  const [editorMode, setEditorMode] = useState<PartnerEditorMode>("closed");
  const [editorDraft, setEditorDraft] = useState<SupplierSetupItem | null>(null);
  const [workspaceDraft, setWorkspaceDraft] = useState<SupplierPartnerWorkspaceSetup | null>(null);
  const [addressDrafts, setAddressDrafts] = useState<SupplierAddressSetupItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveTone, setSaveTone] = useState<SaveTone>("info");
  const deferredSearch = useDeferredValue(search);
  const filter = useMemo(
    () => buildMasterFilter(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    [deferredSearch, status, user?.activeContext.branchId, user?.activeContext.companyId]
  );
  const suppliersQuery = useApiQuery(
    queryKeys.partners.suppliers(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listSupplierSetup(session, filter),
    { staleTime: 60_000 }
  );
  const addressesQuery = useApiQuery(
    queryKeys.partners.supplierAddresses(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listSupplierAddressSetup(session, filter),
    { staleTime: 60_000 }
  );
  const leadTimesQuery = useApiQuery(
    queryKeys.partners.supplierLeadTimes(user?.activeContext.companyId, user?.activeContext.branchId, deferredSearch, status),
    () => listSupplierLeadTimeSetup(session, filter),
    { staleTime: 60_000 }
  );
  const suppliers = suppliersQuery.data ?? [];
  const addresses = addressesQuery.data ?? [];
  const leadTimes = leadTimesQuery.data ?? [];
  const source = suppliers[0]?.source ?? addresses[0]?.source ?? leadTimes[0]?.source ?? "Seeded";
  const canSave = canPersistMasterData(session);
  const supplierColumns = useMemo(() => buildSupplierColumns(addresses, leadTimes), [addresses, leadTimes]);
  const filteredSuppliers = useMemo(
    () =>
      suppliers.filter((supplier) => {
        const supplierLeadTimes = leadTimes.filter((leadTime) => leadTime.supplierId === supplier.supplierId);
        const matchesType = supplierType === "all" || supplier.supplierType === supplierType;
        const matchesCompliance = complianceStatus === "all" || supplierComplianceStatus(supplier) === complianceStatus;
        const matchesPreferred = preferredSupplier === "all" || supplierPreferredStatus(supplier) === preferredSupplier;
        const matchesTerms = paymentTerms === "all" || supplier.paymentTermsCode === paymentTerms;
        const matchesLeadTime = leadTimeReady === "all" || (leadTimeReady === "Ready" ? supplierLeadTimes.length > 0 : supplierLeadTimes.length === 0);
        return matchesType && matchesCompliance && matchesPreferred && matchesTerms && matchesLeadTime;
      }),
    [complianceStatus, leadTimeReady, leadTimes, paymentTerms, preferredSupplier, supplierType, suppliers]
  );
  const selectedPersistedAddresses = editorDraft ? addresses.filter((address) => address.supplierId === editorDraft.supplierId) : addresses;
  const selectedAddresses = [
    ...selectedPersistedAddresses.filter((address) => !addressDrafts.some((draft) => draft.id === address.id)),
    ...addressDrafts.filter((address) => !editorDraft || address.supplierId === editorDraft.supplierId)
  ];
  const selectedLeadTimes = editorDraft ? leadTimes.filter((leadTime) => leadTime.supplierId === editorDraft.supplierId) : leadTimes;

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
    setSupplierType("all");
    setComplianceStatus("all");
    setPreferredSupplier("all");
    setPaymentTerms("all");
    setLeadTimeReady("all");
  };

  const openCreateEditor = () => {
    const draft = buildSupplierDraft(user?.activeContext.companyId, user?.activeContext.branchName);
    setEditorMode("create");
    setEditorDraft(draft);
    setWorkspaceDraft(buildSupplierWorkspaceDraft(draft));
    setAddressDrafts([]);
    setSaveMessage(null);
    setSaveTone("info");
  };

  const openEditEditor = (record: SupplierSetupItem) => {
    const recordAddresses = addresses.filter((address) => address.supplierId === record.supplierId);
    setEditorMode("edit");
    setEditorDraft(record);
    setWorkspaceDraft(buildSupplierWorkspaceDraft(record));
    setAddressDrafts([]);
    setSaveMessage(null);
    setSaveTone("info");
    void getSupplierPartnerWorkspace(session, record, recordAddresses).then(setWorkspaceDraft);
  };

  const closeEditor = () => {
    setEditorMode("closed");
    setEditorDraft(null);
    setWorkspaceDraft(null);
    setAddressDrafts([]);
    setSaveMessage(null);
  };

  const updateEditor = <K extends keyof SupplierSetupItem>(key: K, value: SupplierSetupItem[K]) => {
    setEditorDraft((current) => (current ? { ...current, [key]: value } : current));
  };

  const addSupplierAddress = () => {
    if (!editorDraft) {
      return;
    }

    const nextAddress: SupplierAddressSetupItem = {
      id: `supplier-address-draft-${Date.now()}`,
      addressId: 0,
      supplierId: editorDraft.supplierId,
      code: selectedAddresses.length === 0 ? "ORDER-01" : `SITE-${selectedAddresses.length + 1}`,
      addressType: "Order",
      addressLine1: "",
      city: "",
      stateOrProvince: "",
      postalCode: "",
      countryCode: "IN",
      contactName: "",
      contactEmail: "",
      contactPhone: "",
      isDefaultOrderAddress: selectedAddresses.length === 0,
      status: "Draft",
      source: "Deferred"
    };
    setAddressDrafts((current) => [...current, nextAddress]);
  };

  const updateSupplierAddress = <K extends keyof SupplierAddressSetupItem>(addressId: string, key: K, value: SupplierAddressSetupItem[K]) => {
    setAddressDrafts((current) => {
      const existingDraft = current.find((address) => address.id === addressId);
      if (existingDraft) {
        return current.map((address) => (address.id === addressId ? { ...address, [key]: value } : address));
      }

      const persisted = selectedPersistedAddresses.find((address) => address.id === addressId);
      return persisted ? [...current, { ...persisted, [key]: value }] : current;
    });
  };

  const addSupplierContact = () => {
    if (!workspaceDraft) {
      return;
    }

    const primaryAddress = selectedAddresses[0];
    setWorkspaceDraft({
      ...workspaceDraft,
      contactPoints: [
        ...workspaceDraft.contactPoints,
        {
          id: `supplier-contact-draft-${Date.now()}`,
          contactPointId: 0,
          addressId: primaryAddress?.addressId || null,
          contactName: primaryAddress?.contactName && primaryAddress.contactName !== "Not captured" ? primaryAddress.contactName : "",
          role: "Commercial",
          channel: "Email",
          detail: primaryAddress?.contactEmail && primaryAddress.contactEmail !== "Not captured" ? primaryAddress.contactEmail : "",
          isPrimary: workspaceDraft.contactPoints.length === 0,
          consentStatus: "Business communication",
          escalationLevel: workspaceDraft.contactPoints.length === 0 ? "Primary" : "Standard",
          status: "Draft"
        }
      ]
    });
  };

  const addSupplierDocument = () => {
    if (!workspaceDraft) {
      return;
    }

    setWorkspaceDraft({
      ...workspaceDraft,
      documents: [
        ...workspaceDraft.documents,
        {
          id: `supplier-document-draft-${Date.now()}`,
          documentId: 0,
          documentType: "Compliance",
          title: "Supplier document metadata",
          documentNo: "",
          revisionCode: "Draft",
          fileName: "",
          approvalStatus: "Draft",
          visibilityScope: "Internal",
          effectiveFrom: "",
          effectiveTo: "",
          expiresOn: "",
          status: "Draft"
        }
      ]
    });
  };

  const saveSupplier = async (mode: "draft" | "continue") => {
    if (!editorDraft || isSaving) {
      return;
    }

    const issues = coreSaveErrors(supplierValidation(editorDraft, selectedAddresses, selectedLeadTimes, editorMode));
    if (issues.length > 0) {
      setSaveTone("danger");
      setSaveMessage(issues[0]);
      return;
    }

    const request: SupplierUpsertRequest = {
      companyId: editorDraft.companyId || user?.activeContext.companyId || 1,
      supplierCode: editorDraft.code.trim(),
      supplierName: editorDraft.name.trim(),
      supplierType: editorDraft.supplierType,
      supportsSubcontracting: editorDraft.supportsSubcontracting,
      defaultBranchId: user?.activeContext.branchId ?? null,
      defaultLanguageId: null,
      taxRegistrationNo: valueOrNull(editorDraft.taxRegistrationNo),
      paymentTermsCode: valueOrNull(editorDraft.paymentTermsCode),
      status: editorDraft.status || "Draft"
    };

    try {
      setIsSaving(true);
      const saved = editorMode === "create" ? await createSupplierDraft(session, request) : await updateSupplierCore(session, editorDraft.supplierId, request);
      for (const address of selectedAddresses) {
        const [city, stateFromCity] = address.city.split(",").map((part) => part.trim());
        const addressRequest = {
          companyId: saved.companyId,
          supplierId: saved.supplierId,
          addressCode: address.code.trim() || "ORDER-01",
          addressType: address.addressType || "Order",
          addressLine1: address.addressLine1.trim() || "Address pending",
          city: city || "Pending",
          stateOrProvince: address.stateOrProvince || stateFromCity || "Pending",
          postalCode: address.postalCode || "Pending",
          countryCode: address.countryCode || "IN",
          contactName: valueOrNull(address.contactName),
          contactEmail: valueOrNull(address.contactEmail),
          contactPhone: valueOrNull(address.contactPhone),
          isDefaultOrderAddress: address.isDefaultOrderAddress,
          status: address.status || "Draft"
        };
        if (address.addressId > 0) {
          await updateSupplierAddressCore(session, address.addressId, addressRequest);
        } else {
          await createSupplierAddressDraft(session, addressRequest);
        }
      }
      const profileToSave = workspaceDraft ?? buildSupplierWorkspaceDraft(saved);
      const savedWorkspace = await updateSupplierPartnerWorkspace(session, saved.supplierId, {
        ...profileToSave,
        profile: {
          ...profileToSave.profile,
          legalName: profileToSave.profile.legalName || saved.name,
          paymentTermsCode: saved.paymentTermsCode,
          status: saved.status
        }
      });
      setEditorDraft(saved);
      setWorkspaceDraft(savedWorkspace);
      setEditorMode("edit");
      await suppliersQuery.refetch();
      await addressesQuery.refetch();
      setAddressDrafts([]);
      setSaveTone("success");
      setSaveMessage(mode === "continue" ? "Supplier draft saved. Continue editing the record." : "Supplier draft saved.");
    } catch (error) {
      setSaveTone("danger");
      setSaveMessage(error instanceof Error ? error.message : "Supplier draft could not be saved.");
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
            <PartnerActionBar entity="supplier" onCreate={openCreateEditor} testId="supplier-master-action-bar" />
          </>
        }
        aside={
          <PartnerAside
            description="Supplier account, contact, compliance, and lead-time references support procurement and planning review."
            source={source}
          />
        }
        description="Supplier list/detail workspace for compliance-ready account context, addresses, subcontract capability, contacts, and lead-time coverage."
        filters={
          <ErpFilterBar ariaLabel="Supplier master filters" onClear={clearFilters} testId="supplier-master-filter-bar">
            <input
              aria-label="Search suppliers"
              onChange={(event) => startTransition(() => setSearch(event.target.value))}
              placeholder="Search supplier, type, city, or lead time"
              value={search}
            />
            <select aria-label="Supplier status" onChange={(event) => setStatus(event.target.value)} value={status}>
              <option value="all">Status: Any</option>
              {lifecycleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select aria-label="Supplier type/category filter" onChange={(event) => setSupplierType(event.target.value)} value={supplierType}>
              <option value="all">Type: Any</option>
              {uniqueOptions(suppliers.map((record) => record.supplierType), supplierTypeOptions.map((option) => option.value)).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select aria-label="Supplier compliance status filter" onChange={(event) => setComplianceStatus(event.target.value)} value={complianceStatus}>
              <option value="all">Compliance: Any</option>
              {complianceStatusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select aria-label="Preferred supplier filter" onChange={(event) => setPreferredSupplier(event.target.value)} value={preferredSupplier}>
              <option value="all">Preferred: Any</option>
              {preferredSupplierOptions.filter((option) => option.value !== "Any").map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select aria-label="Supplier payment terms filter" onChange={(event) => setPaymentTerms(event.target.value)} value={paymentTerms}>
              <option value="all">Terms: Any</option>
              {uniqueOptions(suppliers.map((record) => record.paymentTermsCode), paymentTermOptions.map((option) => option.value)).map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select aria-label="Supplier lead-time ready filter" onChange={(event) => setLeadTimeReady(event.target.value)} value={leadTimeReady}>
              <option value="all">Lead-time: Any</option>
              {leadTimeReadyOptions.filter((option) => option.value !== "Any").map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </ErpFilterBar>
        }
        title="Supplier List & Detail"
      >
        <KpiStrip
          items={[
            { label: "Total suppliers", value: String(suppliers.length) },
            { label: "Active suppliers", value: String(suppliers.filter((record) => record.status === "Active").length) },
            { label: "Approved suppliers", value: String(suppliers.filter((record) => supplierComplianceStatus(record) === "Approved").length) },
            { label: "Compliance pending", value: String(suppliers.filter((record) => supplierComplianceStatus(record) !== "Approved").length) },
            { label: "Lead-time coverage", value: String(suppliers.filter((record) => leadTimes.some((leadTime) => leadTime.supplierId === record.supplierId)).length) },
            { label: "Contacts ready", value: String(suppliers.filter((record) => addresses.some((address) => address.supplierId === record.supplierId && address.contactName !== "Not captured")).length) }
          ]}
        />
        <div className="split-panels">
          <Card title="Supplier accounts" description="Dense supplier list for terms, compliance, contact, and lead-time readiness review.">
            <ErpGrid
              ariaLabel="Supplier list"
              columns={supplierColumns}
              emptyState={{
                title: "No suppliers match the current filters",
                description: "Adjust search, status, type, compliance, preferred, terms, or lead-time filters."
              }}
              getRowId={(record) => record.id}
              isLoading={suppliersQuery.isLoading}
              onRowSelect={openEditEditor}
              records={filteredSuppliers}
              rowLabel={(record) => `${record.code} supplier`}
              testId="supplier-master-grid"
              virtualization={{ enabled: true }}
            />
          </Card>
          <Card title="Supplier sites and lead-time preview" description="Order sites, contacts, and lead-time coverage for selected or filtered supplier context.">
            <ErpGrid
              ariaLabel="Supplier address list"
              columns={supplierAddressColumns}
              emptyState={{
                title: "No supplier sites match the current filters",
                description: "Select another supplier or adjust filters."
              }}
              getRowId={(record) => record.id}
              isLoading={addressesQuery.isLoading}
              records={selectedAddresses}
              rowLabel={(record) => `${record.code} supplier address`}
              virtualization={{ enabled: true }}
            />
            <ErpGrid
              ariaLabel="Supplier lead time preview"
              columns={leadTimeColumns}
              emptyState={{
                title: "No lead-time rows match the current filters",
                description: "Supplier lead-time rows appear after procurement planning setup."
              }}
              getRowId={(record) => record.id}
              isLoading={leadTimesQuery.isLoading}
              records={selectedLeadTimes}
              rowLabel={(record) => `${record.itemLabel} supplier lead time`}
              virtualization={{ enabled: true }}
            />
          </Card>
        </div>
      </ListPageShell>

      {editorDraft && editorMode !== "closed" ? (
        <SupplierEditor
          addresses={selectedAddresses}
          canSave={canSave}
          isSaving={isSaving}
          leadTimes={selectedLeadTimes}
          mode={editorMode}
          onAddAddress={addSupplierAddress}
          onAddContact={addSupplierContact}
          onAddDocument={addSupplierDocument}
          onAddressChange={updateSupplierAddress}
          onChange={updateEditor}
          onClose={closeEditor}
          onSave={(nextMode) => void saveSupplier(nextMode)}
          onWorkspaceChange={(workspace) => setWorkspaceDraft(workspace)}
          saveMessage={saveMessage}
          saveTone={saveTone}
          supplier={editorDraft}
          suppliers={suppliers}
          workspace={workspaceDraft ?? buildSupplierWorkspaceDraft(editorDraft)}
        />
      ) : null}
    </>
  );
}
