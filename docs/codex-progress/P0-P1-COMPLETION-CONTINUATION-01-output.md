# P0-P1-COMPLETION-CONTINUATION-01 Output

Date: 2026-05-14
Branch: main

## Implemented

- Quote line pricing/tax contract: backend domain, DTOs, EF mapping, SQL DDL, web unit price/discount/tax controls, and multiline save preservation.
- Purchase Order line pricing/tax contract: backend domain, DTOs, EF mapping, SQL DDL, web unit price/discount/tax controls, and multiline save preservation.
- Sales Order drafting: live centered workspace with governed customer/item/UOM selectors, multiline add/remove, numeric quantity/date controls, and create/update API calls.
- Procure-to-pay foundation: GRN, GRN lines, supplier invoice, invoice lines, AP liability, and accounting posting bridge with additive SQL, backend contracts/controllers/services, match/post actions, and PO receiving workspace.
- Material issue/return/stock transfer posting: live posting workspaces with governed item/location selectors, numeric quantities, line add/remove, and API calls.
- Production receipt/scrap/rework: live posting workspaces with governed selectors, numeric quantities, receipt/scrap/rework create calls, and rework release action.
- Work Order lifecycle: live create workspace, readiness-gated release, re-release, close, and job-card generation wiring from the Work Orders workspace.
- Job Card lifecycle: generation from released work orders is wired; execution start/pause/resume/quantity/complete remains live through existing APIs.
- Production receipt line depth: receipt posting now supports Add Line, Remove Line, governed per-line item/UOM/location controls, and save-all-lines payloads.
- Inventory reservation/traceability: stock rows can open traceability and create live stock reservations with governed stock context and numeric reservation quantity.
- Quality inspection/NCR: inspection capture supports multiple parameter lines, governed QC plan/source/result controls, numeric observations, and optional NCR creation.
- Dispatch closeout: pack-list create, shipment preparation, and shipment close actions are wired to dispatch APIs.
- Blanket order schedules: live schedule authoring supports governed customer/item/UOM controls, multiple schedule lines, add/remove, and save.
- Demand forecast lines: live forecast authoring supports date-bucket lines, governed item/UOM controls, numeric quantities, add/remove, and save.
- ATP simulation/commit: live ATP rows compute demand against stock, open what-if review, and commit promised-date updates through the sales-order API.
- Subcontract receive-back: live receipt creation validates received quantity, captures QC result/status, and closes the subcontract order when received or posted.
- Integration provider depth: provider connection and credential-reference maintenance are wired; provider configuration check is active and surfaces missing config as health feedback.
- Regression tests added for Work Order draft save, release, job-card generation, and existing Job Card completion.

## Tracking Updates

- Updated `MARKET_V2_P0_P1_CLOSURE_REPORT.md`.
- Updated `MARKET_V2_REMAINING_BLOCKERS.csv`.
- Updated `MARKET_V2_EXECUTION_QUEUE.csv`.
- Updated `docs/codex-progress/README.md`.

## Remaining P0

- Release hardening: performance proof, backup/restore rehearsal, role UAT, and production hardening evidence.

## Remaining P1

- MRP/capacity planning depth.
- Report/dashboard builder and signed export depth.
- Provider live credential verification for Email, WhatsApp, SMS, CRM, and webhooks.
- Mobile barcode/camera/offline/device trust.

## Validation Results

- `npm run typecheck`: PASS
- `npm test`: PASS, 54 files / 209 tests
- `npm --prefix src/web test -- src/pages/WS07MobileIntegrationsAiReporting.test.tsx`: PASS
- `npm run audit:erp-completion`: PASS after production receipt line-depth correction.
- `npm run build`: PASS
- `npm run build:host`: PASS
- `dotnet build src/server/STS.Mfg.sln`: PASS
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 37 tests
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: PASS after clearing stale Release static-web-asset cache from a previous hashed web asset.

## Review Pack

- `artifacts/review-packs/MARKET-BENCHMARK-V2-MASTER-COMPLETION-review-pack.zip`
