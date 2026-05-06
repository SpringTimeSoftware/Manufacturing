# P026 Quote, Sales Order, Blanket Order, and Forecast Schema

All tables inherit common columns from `/docs/database/conventions.md` unless noted otherwise.

## Tables

### `sales.Quotes`

Purpose: commercial estimate header before order commitment.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `BranchId` | FK to `org.Branches` |
| `QuoteNo` | unique within company |
| `CustomerId` | FK to `master.Customers` |
| `CustomerAddressId` | nullable FK to bill-to or ship-to |
| `QuoteDate` | date |
| `ExpiryDate` | nullable |
| `PriorityCode` | `Low`, `Normal`, `High`, `Critical` |
| `Status` | canonical quote status |
| `CustomerSpecRef` | optional external specification reference |

Unique constraints:

- `UX_Quotes_CompanyId_QuoteNo`

### `sales.QuoteLines`

Purpose: quoted item or service lines.

| Column | Notes |
| --- | --- |
| `QuoteId` | FK to `sales.Quotes` |
| `LineNo` | ordering |
| `ItemId` | FK to `master.Items` |
| `ItemVariantId` | nullable FK |
| `OrderUomId` | FK to `measure.Uoms` |
| `Quantity` | requested quantity |
| `MakeType` | `MTS`, `MTO`, `ETO`, `Mixed` |
| `PromisedDate` | nullable |
| `PriorityCode` | line priority override |
| `CustomerSpecRef` | optional spec reference |
| `Status` | `Open`, `Won`, `Lost`, `Cancelled` |

Unique constraints:

- `UX_QuoteLines_QuoteId_LineNo`

### `sales.SalesOrders`

Purpose: confirmed customer demand header.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `BranchId` | FK to `org.Branches` |
| `SalesOrderNo` | unique within company |
| `CustomerId` | FK to `master.Customers` |
| `BillToAddressId` | nullable FK |
| `ShipToAddressId` | nullable FK |
| `OrderDate` | date |
| `PromisedDate` | header-level default |
| `PriorityCode` | default priority |
| `Status` | canonical sales-order status |
| `SourceQuoteId` | nullable FK |

Unique constraints:

- `UX_SalesOrders_CompanyId_SalesOrderNo`

### `sales.SalesOrderLines`

Purpose: order lines driving planning and execution.

| Column | Notes |
| --- | --- |
| `SalesOrderId` | FK to `sales.SalesOrders` |
| `LineNo` | ordering |
| `ItemId` | FK to `master.Items` |
| `ItemVariantId` | nullable FK |
| `OrderUomId` | FK to `measure.Uoms` |
| `Quantity` | ordered quantity |
| `MakeType` | `MTS`, `MTO`, `ETO`, `Mixed` |
| `PromisedDate` | line-level date |
| `PriorityCode` | line priority |
| `CustomerSpecRef` | optional |
| `RequestedShipDate` | nullable |
| `Status` | `Open`, `Planned`, `InProduction`, `PartiallyDispatched`, `Closed`, `Cancelled` |

Unique constraints:

- `UX_SalesOrderLines_SalesOrderId_LineNo`

### `sales.BlanketOrders`

Purpose: long-term agreement header.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `BranchId` | nullable FK |
| `BlanketOrderNo` | unique within company |
| `CustomerId` | FK to `master.Customers` |
| `StartDate` | date |
| `EndDate` | date |
| `Status` | canonical blanket-order status |

Unique constraints:

- `UX_BlanketOrders_CompanyId_BlanketOrderNo`

### `sales.BlanketOrderSchedules`

Purpose: release schedule lines under blanket order demand.

| Column | Notes |
| --- | --- |
| `BlanketOrderId` | FK to `sales.BlanketOrders` |
| `LineNo` | ordering |
| `ItemId` | FK to `master.Items` |
| `ScheduleDate` | due bucket |
| `Quantity` | planned quantity |
| `OrderUomId` | FK to `measure.Uoms` |
| `Status` | `Open`, `Released`, `Closed`, `Cancelled` |

Unique constraints:

- `UX_BlanketOrderSchedules_BlanketOrderId_LineNo`

### `sales.DemandForecasts`

Purpose: forecast header by scenario or planning cycle.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `BranchId` | nullable FK |
| `ForecastCode` | unique within company |
| `ForecastName` | display name |
| `PeriodType` | `Daily`, `Weekly`, `Monthly` |
| `Status` | `Draft`, `Approved`, `Superseded` |

Unique constraints:

- `UX_DemandForecasts_CompanyId_ForecastCode`

### `sales.DemandForecastLines`

Purpose: item-period forecast values.

| Column | Notes |
| --- | --- |
| `DemandForecastId` | FK to `sales.DemandForecasts` |
| `LineNo` | ordering |
| `ItemId` | FK to `master.Items` |
| `ForecastPeriodStart` | bucket start |
| `ForecastPeriodEnd` | bucket end |
| `Quantity` | forecast quantity |
| `ForecastUomId` | FK to `measure.Uoms` |

Unique constraints:

- `UX_DemandForecastLines_DemandForecastId_LineNo`

## Relationship Summary

- `Quotes` 1:n `QuoteLines`
- `SalesOrders` 1:n `SalesOrderLines`
- `BlanketOrders` 1:n `BlanketOrderSchedules`
- `DemandForecasts` 1:n `DemandForecastLines`
