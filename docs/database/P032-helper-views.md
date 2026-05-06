# P032 Master Data Validation Views and Helper Functions

## Objective

These helper views and scalar/table-valued functions provide consistent lookup and validation behavior for stored procedures and read models.

## View and Function Design Rules

- Helper views are read-only and side-effect free.
- Functions return deterministic results for the same inputs and committed database state.
- Write procedures should prefer helper views/functions over duplicating validation joins.
- Dashboard or procedure callers should prefer views when the join logic is stable and reused across modules.

## Recommended Views

### `reporting.vw_ActiveItems`

Purpose: expose only active, non-deleted items with key master defaults.

Output columns:

- `ItemId`
- `CompanyId`
- `ItemCode`
- `ItemName`
- `ItemType`
- `MeasurementProfileId`
- `StockUomId`
- `DefaultWarehouseId`
- `DefaultBinId`
- `TraceabilityMode`
- `IsCatchWeightItem`
- `IsQcRequired`

Side effects: none  
Idempotency: yes

### `reporting.vw_ReleasedBomRevisions`

Purpose: one-stop lookup for effective released BOM revisions.

Output columns:

- `BomId`
- `BomRevisionId`
- `CompanyId`
- `ItemId`
- `RevisionCode`
- `EffectiveFrom`
- `EffectiveTo`
- `RoutingId`

Rules:

- only `Released` revisions
- effective date window respected

Side effects: none  
Idempotency: yes

### `reporting.vw_BranchWarehouseDefaults`

Purpose: branch-level default receiving and issue warehouse/bin resolution.

Output columns:

- `CompanyId`
- `BranchId`
- `ReceivingWarehouseId`
- `ReceivingBinId`
- `IssueWarehouseId`
- `IssueBinId`
- `DispatchWarehouseId`

Side effects: none  
Idempotency: yes

### `reporting.vw_ActiveMachines`

Purpose: machine lookup with status and planning availability flags.

Output columns:

- `MachineId`
- `CompanyId`
- `BranchId`
- `WorkCenterId`
- `MachineCode`
- `MachineName`
- `CurrentStatus`
- `IsUnderMaintenance`
- `IsSchedulingEnabled`

Side effects: none  
Idempotency: yes

### `reporting.vw_ItemScopeLookup`

Purpose: permission-friendly item lookup for UI selectors and procedure validation.

Output columns:

- `CompanyId`
- `BranchId`
- `ItemId`
- `ItemCode`
- `ItemName`
- `Status`
- `ItemGroupId`
- `DefaultMakeType`

Side effects: none  
Idempotency: yes

## Recommended Functions

### `measure.fn_GetEffectiveBomRevisionId`

Type: scalar function

Input params:

- `@CompanyId BIGINT`
- `@ItemId BIGINT`
- `@AsOfDate DATE`

Returns:

- `BomRevisionId BIGINT`

Behavior:

- resolves the single effective released BOM revision for the item and date
- returns `NULL` when no valid revision exists

Side effects: none  
Idempotency: yes

### `org.fn_GetBranchDefaultWarehouseBin`

Type: inline table-valued function

Input params:

- `@CompanyId BIGINT`
- `@BranchId BIGINT`
- `@UsageType NVARCHAR(30)` with values like `Receive`, `Issue`, `Dispatch`

Returns columns:

- `WarehouseId`
- `BinId`

Side effects: none  
Idempotency: yes

### `measure.fn_ResolveItemUomFactor`

Type: inline table-valued function

Input params:

- `@ItemId BIGINT`
- `@ItemVariantId BIGINT = NULL`
- `@FromUomId BIGINT`
- `@ToUomId BIGINT`

Returns columns:

- `ConversionMode`
- `FactorNumerator`
- `FactorDenominator`
- `MeasurementFormulaId`

Behavior:

- resolves variant override first
- falls back to base item UOM behavior
- returns no row when conversion is unsupported

Side effects: none  
Idempotency: yes

### `platform.fn_UserHasScopedAccess`

Type: scalar function or inline TVF depending performance choice

Input params:

- `@UserId BIGINT`
- `@CompanyId BIGINT`
- `@BranchId BIGINT = NULL`
- `@WarehouseId BIGINT = NULL`
- `@DepartmentId BIGINT = NULL`

Returns:

- `BIT`

Behavior:

- resolves role/scope mapping for procedure prechecks
- should be used sparingly in row-by-row contexts; pre-resolved scope filters are preferred for set queries

Side effects: none  
Idempotency: yes

## Where Views Should Replace Raw Joins

- item selectors in planning, sales, inventory, and production screens
- released BOM resolution in MRP and WO release logic
- branch default warehouse/bin lookup in issue/receipt procedures
- machine and work-center availability selectors in scheduling screens
- scoped pick-list/read-only UI queries that would otherwise repeat 5 to 8 joins

## Where Raw Procedure Joins Are Still Preferred

- heavy transactional procedures that need lock hints or temp-table staging
- dashboard queries with dynamic bucketing and aggregation not worth embedding in a static view
- security-sensitive queries where caller-specific temp scope tables are more efficient than generic views
