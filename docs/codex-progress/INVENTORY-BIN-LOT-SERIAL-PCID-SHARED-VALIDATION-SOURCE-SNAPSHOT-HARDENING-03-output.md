# INVENTORY / BIN / LOT / SERIAL / PCID SHARED VALIDATION AND SOURCE SNAPSHOT HARDENING - 03

Date: 2026-05-16

Status: COMPLETE for the shared inventory validation foundation scope.

This phase did not start Dispatch/POD, Quality/NCR/COA, Mobile, Finance, Reports, Integrations, UDF, or Service packs. Changes were limited to the shared inventory policy, stock movement validation/posting, tracking dimensions, source snapshots, and the existing inventory movement UI/API surfaces needed to consume that foundation.

## Pre-Implementation Audit Findings

Files and areas inspected:

- `src/server/STS.Mfg.Domain/Inventory/InventoryEntities.cs`
- `src/server/STS.Mfg.Domain/Masters/MasterEntities.cs`
- `src/server/STS.Mfg.Infrastructure/Inventory/InventoryService.cs`
- `src/server/STS.Mfg.Infrastructure/Inventory/InventoryPostingService.cs`
- `src/server/STS.Mfg.Infrastructure/Procurement/ProcurementService.cs`
- `src/server/STS.Mfg.Infrastructure/Production/ProductionOutputService.cs`
- `src/server/STS.Mfg.Infrastructure/Quality/QualityService.cs`
- `src/server/STS.Mfg.Infrastructure/Dispatch/DispatchService.cs`
- `src/server/STS.Mfg.Api/Controllers/InventoryControllers.cs`
- `src/server/STS.Mfg.Infrastructure/Persistence/MfgDbContext.cs`
- `src/server/STS.Mfg.Infrastructure/Persistence/Configurations/InventoryEntityConfigurations.cs`
- `src/web/src/pages/InventoryPages.tsx`
- `src/web/src/inventory/inventoryAdapters.ts`
- `src/web/src/api/contracts.ts`
- `src/web/src/api/http.ts`
- `database/README.md`

Current implementation found before coding:

- Stock balance grain existed at company, branch, item, variant, warehouse, bin, lot, serial, and quantity buckets. It did not include PCID/license plate and did not carry stock status as a normalized dimension beyond quantity buckets.
- Stock transaction grain existed at company, branch, item, variant, from/to warehouse, from/to bin, lot, serial, quantity, inventory state, transaction type, source document type, and source document id. It did not persist source line, source document number, revision/version, work order, sales order, purchase order line, quality document, item revision, BOM revision, routing revision, engineering document revision, or PCID.
- Warehouse-only stock existed through nullable `BinId`. There was no central server-side rule requiring bins when the item/warehouse context required bin tracking.
- Lot and serial tables existed, and `ItemInventoryPolicy` already had lot/serial tracking modes. Movement posting did not centrally enforce required lot/serial dimensions from policy.
- No PCID/license plate table or content model was found.
- Quality-hold and blocked quantities existed in stock balances, and lot/serial status existed, but issuing/dispatch-like paths did not consistently block non-available stock centrally.
- `InventoryPostingService` already backed GRN receipt, production output, quality hold/release, and dispatch shipment posting. Direct web inventory issue/return/transfer still had duplicated stock mutation in `InventoryService` instead of using the same central posting layer.
- Movement posting used append-oriented transactions, but source/revision snapshot fields were missing.
- Live authenticated web inventory adapters already avoided silent seeded fallback by throwing live-data unavailable errors.

Exact gaps found:

- Missing item policy fields: `IsStockControlled`, `RequiresBin`, `IsPcidTracked`.
- Missing PCID tables: not found before this phase.
- Missing balance dimension: `PcidId`.
- Missing stock transaction snapshot fields: source line/no/revision/version, item/BOM/routing/document revisions, work order, sales order line, purchase order line, quality document, and PCID.
- Missing shared API contract for tracking-policy lookup, available stock by tracking grain, valid bins/lots/serials/PCIDs, and movement validation preview.
- Missing shared validation service methods for bin, lot, serial, PCID, stock status, available quantity, and revision/source validation.
- Direct inventory issue/return/transfer paths could mutate balances without the central posting/validation service.

## Implementation Summary

Added and wired shared services:

- `src/server/STS.Mfg.Application/Abstractions/Inventory/IInventoryPolicyService.cs`
- `src/server/STS.Mfg.Infrastructure/Inventory/InventoryPolicyService.cs`

Implemented service methods:

- `ResolveRequiredTrackingAsync`
- `GetAvailableQuantityAsync`
- `ListValidBinsAsync`
- `ListValidLotsAsync`
- `ListValidSerialsAsync`
- `ListValidPcidsAsync`
- `ValidateMovementAsync`

Hardened `InventoryPostingService` so central stock posting validates every receipt, issue, transfer, and state-change line through the shared policy service before balance mutation.

Changed direct web inventory operations in `InventoryService`:

- `IssueStockAsync` now delegates to `InventoryPostingService.IssueAsync`.
- `ReturnStockAsync` now delegates to `InventoryPostingService.ReceiveAsync`.
- `TransferStockAsync` now delegates to `InventoryPostingService.TransferAsync`.
- Reservation validates source dimensions through `IInventoryPolicyService.ValidateMovementAsync`.

Added relational transaction protection for receipt posting where new lot/serial IDs must be generated before ledger and balance rows can reference them. Failed receipt lines now roll back generated lot/serial rows, balance changes, PCID updates, and ledger rows within the relational transaction.

## Database / DDL

New additive DDL:

- `database/ddl/20-commercial/080_inventory_tracking_policy_snapshot_hardening.sql`

Tables changed:

- `master.ItemInventoryPolicies`
  - `IsStockControlled`
  - `RequiresBin`
  - `IsPcidTracked`

- `inventory.StockBalances`
  - `PcidId`

- `inventory.StockTransactions`
  - `PcidId`
  - `SourceDocumentNo`
  - `SourceDocumentLineId`
  - `SourceDocumentRevisionNo`
  - `SourceDocumentVersionNo`
  - `ItemRevisionId`
  - `EngineeringDocumentRevisionId`
  - `BomRevisionId`
  - `RoutingId`
  - `RoutingRevisionId`
  - `WorkOrderId`
  - `ProductionOrderId`
  - `SalesOrderId`
  - `SalesOrderLineId`
  - `PurchaseOrderId`
  - `PurchaseOrderLineId`
  - `QualityDocumentId`
  - `LegacyTrackingIncomplete`

New tables:

- `inventory.LicensePlates`
  - `Id`
  - `CompanyId`
  - `BranchId`
  - `PcidNo`
  - `LicensePlateType`
  - `WarehouseId`
  - `BinId`
  - `Status`
  - audit columns

- `inventory.LicensePlateContents`
  - `Id`
  - `CompanyId`
  - `LicensePlateId`
  - `ItemId`
  - `ItemVariantId`
  - `LotId`
  - `SerialId`
  - `Quantity`
  - `InventoryState`
  - `Status`
  - audit columns

Backward compatibility:

- All new columns are nullable or guarded additive fields.
- Existing stock balances and transactions are not assigned fake bins, lots, serials, PCIDs, stock statuses, or source revisions.
- Existing warehouse-only stock remains visible; new posting validation does not silently treat it as bin-qualified stock.
- `database/README.md` was updated with the new DDL in deployment order.

## APIs / Contracts

Updated contracts:

- `StockBalanceDto` includes `PcidId`.
- `StockTransactionDto` includes PCID and source/revision snapshot fields.
- Stock issue/return/transfer line requests include `PcidId`, `PcidNo`, and source/revision snapshot fields.

Added contracts:

- `InventoryTrackingPolicyRequest`
- `InventoryTrackingPolicyDto`
- `InventoryAvailableStockRequest`
- `InventoryAvailableStockDto`
- `InventoryDimensionQuery`
- `InventoryDimensionOptionDto`
- `StockMovementValidationLineRequest`
- `StockMovementValidationRequest`
- `StockMovementValidationLineResultDto`
- `StockMovementValidationResultDto`

Added API controller:

- `InventoryPolicyController` in `src/server/STS.Mfg.Api/Controllers/InventoryControllers.cs`

New endpoints:

- `GET /api/inventory/policy/tracking`
- `GET /api/inventory/policy/available`
- `GET /api/inventory/policy/valid-bins`
- `GET /api/inventory/policy/valid-lots`
- `GET /api/inventory/policy/valid-serials`
- `GET /api/inventory/policy/valid-pcids`
- `POST /api/inventory/policy/validate-movement`

Web API client additions:

- `apiClient.inventory.trackingPolicy`
- `apiClient.inventory.availableStock`
- `apiClient.inventory.validBins`
- `apiClient.inventory.validLots`
- `apiClient.inventory.validSerials`
- `apiClient.inventory.validPcids`

## UI Changes

Updated existing inventory movement UI only:

- `src/web/src/pages/InventoryPages.tsx`

Changes:

- Existing material issue, material return, and stock transfer drafts now carry `pcidId` through request payloads.
- PCID/license plate selector now uses live stock-balance PCID options when available.
- PCID selector remains disabled with a clear reason when no PCID/license plate records are available.
- Selecting item, warehouse, or bin clears PCID so local-only stale PCID state is not posted against a changed context.

No new operational inventory module was created in this phase.

## Tests Added / Updated

Added:

- `tests/server/STS.Mfg.Tests/InventoryPolicyServiceTests.cs`

Backend test coverage:

- Bin-managed policy requires governed bin, lot, and serial before posting.
- Quality-held stock cannot be issued.
- Failed multi-line issue does not create partial stock transactions.
- PCID and source/revision snapshots persist on transfer.
- Receipt into an empty active PCID is allowed and creates license-plate content.
- Required revision references are validated explicitly and no latest/current fallback is used.

Updated:

- `tests/web/inventory-warehouse-traceability/InventoryWarehouseTraceabilityCompletion.test.tsx`

Web test coverage:

- Live stock posting shows governed lot, serial, and PCID selectors.
- Multiline add/remove remains compact-grid based.
- PCID is posted in issue payloads when available.
- Traceability uses linked route context.
- Inventory UI remains free of first-line and desktop card-line anti-patterns.

## Validation Results

Commands run:

- `dotnet build src/server/STS.Mfg.sln --no-restore`
  - Result: PASS, 0 warnings, 0 errors.

- `dotnet test src/server/STS.Mfg.sln --no-build --filter FullyQualifiedName~InventoryPolicyServiceTests`
  - Result: PASS, 5 passed, 0 failed.

- `npm.cmd run typecheck`
  - Result: PASS.

- `npm.cmd test -- tests/web/inventory-warehouse-traceability/InventoryWarehouseTraceabilityCompletion.test.tsx --runInBand`
  - Result: PASS, 4 tests passed.

- `npm.cmd test`
  - First run: FAIL due one timeout in `QuoteSalesOrderForecastAtpCompletion.test.tsx`; 66 files passed, 1 file timed out.
  - Targeted rerun: PASS, `QuoteSalesOrderForecastAtpCompletion.test.tsx` 3 tests passed.
  - Full rerun: PASS, 67 files passed, 243 tests passed.

- `npm.cmd run build`
  - Result: PASS. Vite emitted the existing chunk-size warning only.

- `dotnet build src/server/STS.Mfg.sln`
  - Result: PASS, 0 warnings, 0 errors.

- `dotnet test src/server/STS.Mfg.sln --no-build`
  - Result: PASS, 54 passed, 0 failed.

- `dotnet test src/server/STS.Mfg.sln --no-build --filter "FullyQualifiedName~CommercialCalculationServiceTests|FullyQualifiedName~SalesPlanningCommercialContractTests"`
  - Result: PASS, 12 passed, 0 failed.

- `npm.cmd test -- tests/web/quote-sales-order/QuoteSalesOrderForecastAtpCompletion.test.tsx tests/web/transaction-line-depth/QuoteMultilineFlow.test.tsx tests/web/transaction-line-depth/SalesOrderMultilineFlow.test.tsx tests/web/partner-master/CustomerDealerDistributorCompletion.test.tsx --runInBand`
  - Result: PASS, 4 files passed, 7 tests passed.

- `npm.cmd run audit:erp-completion`
  - Result: PASS.
  - `audit:transaction-lines`: passed.
  - `audit:transaction-line-grid`: passed.
  - `audit:governed-fields`: passed.
  - `audit:numeric-fields`: passed.
  - `audit:action-truth`: passed.
  - `audit:live-data-truth`: passed.
  - `audit:upload-truth`: passed.
  - `audit:menu-route-truth`: passed.

Phase 01 and Phase 02 regression status:

- Commercial calculation and Quote/SO contract tests still pass.
- Customer commercial/defaulting coverage inside `SalesPlanningCommercialContractTests` still passes.
- Quote/SO web regression targets still pass.
- Customer/dealer/distributor web regression target still passes.

## Closed In This Phase

- Bin enforcement foundation: closed for new shared posting and validation paths.
- Lot/batch enforcement foundation: closed for new shared posting and validation paths.
- Serial enforcement foundation: closed for new shared posting and validation paths.
- PCID/license plate foundation: closed at minimal shared model, validation, content, movement history, and UI/API selector level.
- Stock status and quality hold blocking: closed for shared validation and central posting paths. Outgoing issue/dispatch-like movements from non-available stock are blocked unless the flow is a state-change flow.
- Available quantity by tracking grain: closed for warehouse/bin/lot/serial/PCID/status grain through `IInventoryPolicyService`.
- Movement ledger auditability: closed for new source and revision snapshot fields plus append-oriented stock transactions.
- Movement transactional posting: closed for central posting; receipt posting now protects generated lot/serial IDs inside a relational transaction.
- Source document references: closed for stock transaction snapshot fields and request contracts.
- Revision snapshots: closed for validation and persistence of explicit item/BOM/routing/document revision references; no latest/current fallback is used by the shared service.

## Partially Closed / Foundation Only

- Dispatch pick/pack/ship readiness: shared validation and dispatch posting can consume the foundation, but full dispatch operational depth remains a later pack.
- Quality NCR/COA dispatch gate readiness: stock-status blocking and quality source fields are available, but NCR/COA workflow depth remains a later pack.
- Mobile barcode/offline readiness: server policy APIs are ready for mobile validation; native barcode/offline sync depth remains a later pack.
- Inventory valuation readiness: movement grain is strengthened, but valuation layers, accounting/subledger, and costing remain later scope.
- Inventory reporting readiness: traceable movement fields exist, but report builder/dashboard depth remains later scope.
- Split/merge PCID: intentionally not implemented; documented as later WMS depth.
- Expiry/FEFO/FIFO allocation: expiry blocking exists where lot/serial expiry is present; full FEFO/FIFO allocator remains later WMS/planning scope.

## Still Open For Later Packs

- Full Dispatch/POD closeout.
- Full Quality/NCR/COA depth.
- Mobile barcode camera and offline sync.
- Inventory valuation and accounting bridge.
- Advanced WMS PCID split/merge/pack/unpack workflows.
- Reservation/allocation engine depth beyond validation of existing reservations.
- Report/dashboard builder for inventory traceability and stock aging.

## Files Changed

- `database/README.md`
- `database/ddl/20-commercial/080_inventory_tracking_policy_snapshot_hardening.sql`
- `src/server/STS.Mfg.Api/Controllers/InventoryControllers.cs`
- `src/server/STS.Mfg.Application/Abstractions/Inventory/IInventoryPolicyService.cs`
- `src/server/STS.Mfg.Application/Contracts/Inventory/InventoryContracts.cs`
- `src/server/STS.Mfg.Domain/Inventory/InventoryEntities.cs`
- `src/server/STS.Mfg.Domain/Masters/MasterEntities.cs`
- `src/server/STS.Mfg.Infrastructure/DependencyInjection.cs`
- `src/server/STS.Mfg.Infrastructure/Dispatch/DispatchService.cs`
- `src/server/STS.Mfg.Infrastructure/Inventory/InventoryPolicyService.cs`
- `src/server/STS.Mfg.Infrastructure/Inventory/InventoryPostingService.cs`
- `src/server/STS.Mfg.Infrastructure/Inventory/InventoryService.cs`
- `src/server/STS.Mfg.Infrastructure/Persistence/Configurations/InventoryEntityConfigurations.cs`
- `src/server/STS.Mfg.Infrastructure/Persistence/MfgDbContext.cs`
- `src/server/STS.Mfg.Infrastructure/Production/ProductionOutputService.cs`
- `src/web/src/api/contracts.ts`
- `src/web/src/api/http.ts`
- `src/web/src/inventory/inventoryAdapters.ts`
- `src/web/src/pages/InventoryPages.tsx`
- `tests/server/STS.Mfg.Tests/InventoryPolicyServiceTests.cs`
- `tests/web/inventory-warehouse-traceability/InventoryWarehouseTraceabilityCompletion.test.tsx`

## Recommended Next Pack

Recommended next pack: Dispatch / POD / logistics closeout or Quality / NCR / COA, because both can now rely on the shared stock movement policy service for bin, lot, serial, PCID, status, and source snapshot enforcement.
