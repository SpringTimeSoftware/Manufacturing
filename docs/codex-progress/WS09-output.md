# WS09 Procure-to-Pay Deepening Output

Date: 2026-05-13

Status: PARTIAL / BLOCKED FOR FULL P2P SCOPE

WS09 completed the implemented V1 procurement slice and stopped at the documented blockers where the remaining plan would require new RFQ, GRN, vendor return, landed-cost, or AP/accounting modules outside the current implemented scope.

## Screens Completed

- Purchase Requisition List / Detail (`/procurement/requisitions`)
- Purchase Order List / Detail (`/procurement/purchase-orders`)
- Subcontract / Outside Processing Plan (`/procurement/subcontract-plan`)

## Implementation Summary

- Added procurement write contracts for purchase requisitions, purchase orders, and subcontract orders.
- Added web API client methods for create/update/approve flows.
- Expanded procurement adapters so rows retain governed IDs needed by create/edit workspaces.
- Reworked PR, PO, and subcontract pages so New actions open centered modal workspaces.
- Wired live Save and Approve actions to procurement APIs.
- Disabled unsupported receipt/export/print actions with explicit business reasons.
- Enforced governed selectors for supplier, item, UOM, work order, operation, source type, and status.
- Enforced decimal/date/numeric controls for quantities, source IDs, expected receipt dates, need-by dates, and expected return dates.
- Tightened live-data truth so live authenticated procurement API failure shows an unavailable state instead of seeded operational rows.

## Actions Wired / Disabled / Hidden

- Wired: 9
  - New PR draft, Save requisition, Approve selected
  - New PO draft, Save purchase order, Approve PO
  - New outside plan, Save outside plan, Approve outside plan
- Disabled with reason: 5
  - Export PR queue
  - Export PO follow-up
  - Receive against PO
  - Print send-out note
  - Receive back
- Hidden: 0

## Field Governance

- Lookup/select controls fixed: source type, status, item, UOM, supplier, work order, operation.
- Numeric/date controls fixed: source document ID, required quantity, ordered quantity, need-by date, expected receipt date, expected line date, expected return date.
- Touched governed-field violations remaining: 0.
- Touched numeric/date-field violations remaining: 0.

## Remaining Blockers

- RFQ creation: no table/API/route exists; introducing it would be a new procurement module.
- Supplier quote entry: no supplier quotation table/API/route exists.
- Quote comparison: depends on RFQ and supplier quote data sources.
- GRN / PO receipt: no GRN table/API/route exists; receiving workflow and inventory posting design required.
- Purchase invoice / 3-way match: crosses into AP/full accounting scope excluded from V1.
- Payment schedule: AP/accounting scope excluded from V1.
- Vendor returns / claims: no return-to-vendor workflow or inventory/quality claim model exists.
- Landed cost: affects inventory valuation/accounting and requires a scope decision.

## Validation Results

- `npm run typecheck`: PASS
- `npm test`: PASS, 47 test files / 187 tests
- `npm run build`: PASS
- `npm run build:host`: PASS
- `dotnet build src/server/STS.Mfg.sln`: PASS
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 37 tests
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: PASS

## Screenshot Evidence

Folder: `docs/codex-review-screens/WS09/`

- `purchase-requisitions-top.png`
- `purchase-requisition-create-modal.png`
- `purchase-orders-top.png`
- `purchase-order-create-modal-disabled-receive.png`
- `subcontract-plan-top.png`
- `subcontract-create-modal.png`
- `capture-summary.json`

## Review Pack

Path: `artifacts/review-packs/WS09-review-pack.zip`
