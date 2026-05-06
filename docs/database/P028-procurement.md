# P028 Purchase Requisition, Purchase Order, and Subcontract Schema

All tables inherit common columns from `/docs/database/conventions.md` unless noted otherwise.

## Tables

### `procurement.PurchaseRequisitions`

Purpose: procurement demand header from planning or manual request.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `BranchId` | FK to `org.Branches` |
| `PurchaseRequisitionNo` | unique within company |
| `SourceDocumentType` | `BOQ`, `MRP`, `Manual`, `WorkOrder` |
| `SourceDocumentId` | nullable |
| `Status` | canonical PR status |

Unique constraints:

- `UX_PurchaseRequisitions_CompanyId_PurchaseRequisitionNo`

### `procurement.PurchaseRequisitionLines`

Purpose: buy or subcontract demand lines.

| Column | Notes |
| --- | --- |
| `PurchaseRequisitionId` | FK to `procurement.PurchaseRequisitions` |
| `LineNo` | ordering |
| `ItemId` | FK to `master.Items` |
| `RequiredQuantity` | decimal |
| `OrderUomId` | FK to `measure.Uoms` |
| `NeedByDate` | date |
| `SourceBoqRequirementLineId` | nullable FK to `planning.BoqRequirementLines` |
| `LinkedWorkOrderId` | nullable FK to `production.WorkOrders` added after P030 |
| `Status` | `Open`, `Approved`, `Converted`, `Cancelled`, `Closed` |

Unique constraints:

- `UX_PurchaseRequisitionLines_PurchaseRequisitionId_LineNo`

### `procurement.RequestsForQuote`

Purpose: RFQ header for grouped requisition follow-up.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `BranchId` | nullable FK |
| `RfqNo` | unique within company |
| `SupplierId` | nullable FK to `master.Suppliers` |
| `SourcePurchaseRequisitionId` | nullable FK |
| `Status` | `Draft`, `Sent`, `Quoted`, `Closed`, `Cancelled` |

Unique constraints:

- `UX_RequestsForQuote_CompanyId_RfqNo`

### `procurement.PurchaseOrders`

Purpose: supplier-facing order header.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `BranchId` | FK to `org.Branches` |
| `PurchaseOrderNo` | unique within company |
| `SupplierId` | FK to `master.Suppliers` |
| `OrderAddressId` | nullable FK to `master.SupplierAddresses` |
| `Status` | canonical PO status |
| `ExpectedReceiptDate` | nullable |

Unique constraints:

- `UX_PurchaseOrders_CompanyId_PurchaseOrderNo`

### `procurement.PurchaseOrderLines`

Purpose: purchasable item or service lines.

| Column | Notes |
| --- | --- |
| `PurchaseOrderId` | FK to `procurement.PurchaseOrders` |
| `LineNo` | ordering |
| `ItemId` | FK to `master.Items` |
| `PurchaseRequisitionLineId` | nullable FK |
| `OrderedQuantity` | decimal |
| `OrderUomId` | FK to `measure.Uoms` |
| `ExpectedDate` | date |
| `LinkedWorkOrderId` | nullable FK to `production.WorkOrders` |
| `SourceBoqRequirementLineId` | nullable FK |
| `Status` | `Open`, `PartiallyReceived`, `Received`, `Closed`, `Cancelled` |

Unique constraints:

- `UX_PurchaseOrderLines_PurchaseOrderId_LineNo`

### `procurement.SubcontractOrders`

Purpose: outside-processing order and tracking header.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `BranchId` | FK to `org.Branches` |
| `SubcontractOrderNo` | unique within company |
| `SupplierId` | FK to `master.Suppliers` |
| `WorkOrderId` | nullable FK to `production.WorkOrders` |
| `OperationId` | nullable FK to `resource.Operations` |
| `Status` | canonical subcontract status |
| `ExpectedReturnDate` | nullable |

Unique constraints:

- `UX_SubcontractOrders_CompanyId_SubcontractOrderNo`

## Relationship Summary

- `PurchaseRequisitions` 1:n `PurchaseRequisitionLines`
- `PurchaseOrders` 1:n `PurchaseOrderLines`
- `PurchaseRequisitionLines` link back to planning outputs and later work-order context
