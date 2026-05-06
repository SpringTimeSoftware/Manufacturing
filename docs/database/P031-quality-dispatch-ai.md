# P031 Quality, Dispatch, Notification, AI, and Audit Schema

All tables inherit common columns from `/docs/database/conventions.md` unless noted otherwise.

## Quality Tables

### `quality.InspectionPlans`

Purpose: inspection template header.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `PlanCode` | unique within company |
| `PlanName` | display name |
| `InspectionType` | `Incoming`, `InProcess`, `Final` |
| `ItemId` | nullable FK to `master.Items` |
| `OperationId` | nullable FK to `resource.Operations` |
| `Status` | `Active`, `Inactive` |

### `quality.InspectionRecords`

Purpose: actual inspection header linked to transaction context.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `BranchId` | FK to `org.Branches` |
| `InspectionNo` | unique within company |
| `InspectionPlanId` | nullable FK |
| `SourceDocumentType` | `PurchaseReceipt`, `JobCard`, `ProductionReceipt`, `Shipment` |
| `SourceDocumentId` | nullable |
| `LotId` | nullable FK to `inventory.Lots` |
| `SerialId` | nullable FK to `inventory.Serials` |
| `Status` | canonical inspection status |

Unique constraints:

- `UX_InspectionRecords_CompanyId_InspectionNo`

### `quality.InspectionResults`

Purpose: measured or pass/fail rows under an inspection.

| Column | Notes |
| --- | --- |
| `InspectionRecordId` | FK to `quality.InspectionRecords` |
| `LineNo` | ordering |
| `ParameterCode` | measured parameter |
| `ExpectedValue` | nullable |
| `ActualValue` | nullable |
| `ResultStatus` | `Pass`, `Fail`, `Info` |

Unique constraints:

- `UX_InspectionResults_InspectionRecordId_LineNo`

### `quality.NonConformances`

Purpose: NCR header with disposition and rework linkage.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `BranchId` | FK to `org.Branches` |
| `NcrNo` | unique within company |
| `SourceDocumentType` | context source |
| `SourceDocumentId` | nullable |
| `LotId` | nullable FK |
| `SerialId` | nullable FK |
| `Disposition` | `Rework`, `Scrap`, `UseAsIs`, `ReturnToSupplier`, `Hold` |
| `Status` | canonical NCR status |

Unique constraints:

- `UX_NonConformances_CompanyId_NcrNo`

## Dispatch Tables

### `dispatch.PackLists`

Purpose: packing header before shipment.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `BranchId` | FK to `org.Branches` |
| `PackListNo` | unique within company |
| `SalesOrderId` | nullable FK to `sales.SalesOrders` |
| `Status` | canonical pack-list status |

Unique constraints:

- `UX_PackLists_CompanyId_PackListNo`

### `dispatch.PackListLines`

Purpose: packed item lines and package structure.

| Column | Notes |
| --- | --- |
| `PackListId` | FK to `dispatch.PackLists` |
| `LineNo` | ordering |
| `SalesOrderLineId` | nullable FK |
| `ItemId` | FK to `master.Items` |
| `LotId` | nullable FK |
| `SerialId` | nullable FK |
| `PackedQuantity` | decimal |
| `PackUomId` | FK to `measure.Uoms` |

Unique constraints:

- `UX_PackListLines_PackListId_LineNo`

### `dispatch.Shipments`

Purpose: dispatch/shipment header.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `BranchId` | FK to `org.Branches` |
| `ShipmentNo` | unique within company |
| `PackListId` | nullable FK |
| `CustomerId` | FK to `master.Customers` |
| `DispatchDate` | date |
| `VehicleRef` | nullable |
| `Status` | canonical shipment status |

Unique constraints:

- `UX_Shipments_CompanyId_ShipmentNo`

### `dispatch.ShipmentLines`

Purpose: shipped item lines.

| Column | Notes |
| --- | --- |
| `ShipmentId` | FK to `dispatch.Shipments` |
| `LineNo` | ordering |
| `PackListLineId` | nullable FK |
| `SalesOrderLineId` | nullable FK |
| `ItemId` | FK to `master.Items` |
| `LotId` | nullable FK |
| `SerialId` | nullable FK |
| `ShippedQuantity` | decimal |
| `ShipUomId` | FK to `measure.Uoms` |

Unique constraints:

- `UX_ShipmentLines_ShipmentId_LineNo`

## Notification, Attachment, AI, and Audit Tables

### `platform.NotificationTemplates`

| Column | Notes |
| --- | --- |
| `TemplateCode` | unique code |
| `ChannelType` | `Email`, `Sms`, `WhatsApp`, `InApp` |
| `TemplateBody` | message body |
| `CompanyId` | nullable scope |
| `Status` | `Active`, `Inactive` |

### `platform.Notifications`

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `BranchId` | nullable FK |
| `NotificationTemplateId` | nullable FK |
| `ChannelType` | channel |
| `RecipientRef` | user/contact target |
| `RelatedDocumentType` | nullable |
| `RelatedDocumentId` | nullable |
| `DeliveryStatus` | `Queued`, `Sent`, `Delivered`, `Failed`, `Acknowledged` |

### `platform.Attachments`

| Column | Notes |
| --- | --- |
| `CompanyId` | nullable FK |
| `RelatedDocumentType` | owner type |
| `RelatedDocumentId` | owner ID |
| `FileName` | original file name |
| `ContentType` | MIME type |
| `StoragePath` | externalized path or blob key |
| `UploadedByUserId` | uploader |

### `platform.AuditLogs`

| Column | Notes |
| --- | --- |
| `CompanyId` | nullable FK |
| `BranchId` | nullable FK |
| `EntityType` | audited entity |
| `EntityId` | row id |
| `ActionCode` | action |
| `BeforeSnapshot` | nullable JSON |
| `AfterSnapshot` | nullable JSON |
| `ReasonCode` | nullable |
| `CorrelationId` | nullable |

### `ai.AiProviders`

| Column | Notes |
| --- | --- |
| `ProviderCode` | unique code |
| `ProviderName` | display name |
| `ProviderType` | `OpenAI`, `Gemini`, `Other` |
| `Status` | `Active`, `Inactive` |

### `ai.AiModels`

| Column | Notes |
| --- | --- |
| `AiProviderId` | FK to `ai.AiProviders` |
| `ModelCode` | unique within provider |
| `ModelName` | display name |
| `CapabilityFlags` | JSON or token list |
| `Status` | `Active`, `Inactive` |

### `ai.AiPromptTemplates`

| Column | Notes |
| --- | --- |
| `CompanyId` | nullable FK |
| `TemplateCode` | unique within scope |
| `TemplateName` | display name |
| `PromptPurpose` | `Summary`, `DraftMessage`, `Translate`, `Assistant` |
| `TemplateBody` | prompt text |
| `Status` | `Active`, `Inactive` |

### `ai.AiRuns`

| Column | Notes |
| --- | --- |
| `CompanyId` | nullable FK |
| `AiProviderId` | FK to `ai.AiProviders` |
| `AiModelId` | FK to `ai.AiModels` |
| `AiPromptTemplateId` | nullable FK |
| `RelatedDocumentType` | nullable |
| `RelatedDocumentId` | nullable |
| `RunStatus` | `Started`, `Completed`, `Failed`, `Approved`, `Rejected` |
| `TokenUsageJson` | nullable |

## Linkage Notes

- Inspections and NCRs can link to job cards, lots, serials, production receipts, or purchase receipts.
- Pack lists and shipments link back to sales orders and traceable inventory identifiers.
- Notifications, attachments, AI runs, and audit logs use generic document linkage fields so they can attach to many modules without duplicating schemas.
