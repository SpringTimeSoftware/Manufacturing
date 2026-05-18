# FINANCE-GL-AP-AR-COSTING-COMPLETION-PACK-06 Output

Status: COMPLETE for Pack 06 finance foundation scope
Date: 2026-05-17
Branch: main

## Preflight

- Confirmed branch: `main`.
- Pack 05 accepted dirty files were checkpointed before Pack 06: `0b30318 Complete dispatch logistics POD pack`.
- Worktree was clean after the Pack 05 checkpoint and before Pack 06 implementation.
- Current dirty files are Pack 06 finance work plus generated IIS host web assets from `npm.cmd run build:host`.
- No Wave 2, Reports/Dashboard Builder, Integrations, Mobile, UDF, or Service pack work was started.

## Pre-Implementation Finance Audit

Found before coding:

- Chart of Accounts: not found.
- Account groups/classes: not found as governed posting accounts.
- Fiscal years/periods and period locks: not found.
- GL journal header/lines/post/reversal: not found.
- AP subledger: partial only through `finance.AccountsPayableLiabilities`.
- AR invoice/subledger: not found.
- Tax ledger: not found.
- Inventory valuation: not found.
- WIP/COGS costing: not found.
- Landed cost accounting: not found.
- Debit/credit notes: not found.
- Bank/payment execution: not found.
- Existing AP posting bridge used string account codes in `ProcurementService.PostSupplierInvoiceAsync`.
- Finance UI routes/pages were not implemented.

## Files Inspected

- `docs/erp_completion_packs_v1/06_finance_gl_ap_ar_costing_completion_pack_v1/README.md`
- `docs/erp_completion_packs_v1/06_finance_gl_ap_ar_costing_completion_pack_v1/completion_pack.md`
- `docs/erp_completion_packs_v1/06_finance_gl_ap_ar_costing_completion_pack_v1/acceptance_gates_and_tests.md`
- `docs/erp_completion_packs_v1/06_finance_gl_ap_ar_costing_completion_pack_v1/business_decisions_needed.md`
- `src/server/STS.Mfg.Domain/Procurement/ProcureToPayEntities.cs`
- `src/server/STS.Mfg.Infrastructure/Procurement/ProcurementService.cs`
- `src/server/STS.Mfg.Infrastructure/Inventory/InventoryPostingService.cs`
- `src/server/STS.Mfg.Infrastructure/Dispatch/DispatchService.cs`
- `src/server/STS.Mfg.Infrastructure/Production/ProductionOutputService.cs`
- `src/server/STS.Mfg.Infrastructure/Persistence/MfgDbContext.cs`
- `src/web/src/app/router.tsx`
- `src/web/src/layout/navigation.ts`
- `src/web/src/layout/AppShell.tsx`
- `database/README.md`

## Files Changed

- `07-governance/entity_field_schema_matrix.csv`
- `07-governance/screen_field_violation_matrix.csv`
- `07-ux-governance/action_truth_matrix.csv`
- `database/README.md`
- `docs/final-audit/07_screen_issue_register.csv`
- `src/server/STS.Mfg.Application/Contracts/Procurement/ProcurementContracts.cs`
- `src/server/STS.Mfg.Domain/Procurement/ProcureToPayEntities.cs`
- `src/server/STS.Mfg.Host/wwwroot/index.html`
- `src/server/STS.Mfg.Infrastructure/DependencyInjection.cs`
- `src/server/STS.Mfg.Infrastructure/Inventory/InventoryPostingService.cs`
- `src/server/STS.Mfg.Infrastructure/Persistence/Configurations/ProcurementEntityConfigurations.cs`
- `src/server/STS.Mfg.Infrastructure/Persistence/MfgDbContext.cs`
- `src/server/STS.Mfg.Infrastructure/Procurement/ProcurementService.cs`
- `src/web/src/api/contracts.ts`
- `src/web/src/api/http.ts`
- `src/web/src/app/router.tsx`
- `src/web/src/layout/AppShell.tsx`
- `src/web/src/layout/NavigationCompleteness.test.tsx`
- `src/web/src/layout/WS08FinanceExclusion.test.tsx`
- `src/web/src/layout/WS11ReleaseHardening.test.tsx`
- `src/web/src/layout/navigation.ts`
- `tests/server/STS.Mfg.Tests/InventoryPolicyServiceTests.cs`

Generated IIS host asset changes:

- `src/server/STS.Mfg.Host/wwwroot/assets/index-C0Yc9vOx.js` removed by build asset rotation.
- `src/server/STS.Mfg.Host/wwwroot/assets/index-D-cc2LL3.js` added by build asset rotation.

## Files Created

- `database/ddl/20-commercial/110_finance_gl_ap_ar_costing_completion.sql`
- `docs/codex-progress/FINANCE-GL-AP-AR-COSTING-COMPLETION-PACK-06-output.md`
- `docs/codex-review-screens/FINANCE-GL-AP-AR-COSTING-COMPLETION-PACK-06/`
- `src/server/STS.Mfg.Api/Controllers/FinanceControllers.cs`
- `src/server/STS.Mfg.Application/Abstractions/Finance/IFinanceService.cs`
- `src/server/STS.Mfg.Application/Contracts/Finance/FinanceContracts.cs`
- `src/server/STS.Mfg.Domain/Finance/FinanceEntities.cs`
- `src/server/STS.Mfg.Infrastructure/Finance/FinanceService.cs`
- `src/server/STS.Mfg.Infrastructure/Persistence/Configurations/FinanceEntityConfigurations.cs`
- `src/web/src/pages/FinancePages.tsx`
- `tests/server/STS.Mfg.Tests/FinanceGlApArCostingServiceTests.cs`
- `tests/web/finance/FinanceGlApArCostingCompletion.test.tsx`

## Migration / Database Changes

Added guarded additive DDL:

- `database/ddl/20-commercial/110_finance_gl_ap_ar_costing_completion.sql`

Tables added:

- `finance.ChartOfAccounts`
- `finance.FiscalPeriods`
- `finance.PostingProfiles`
- `finance.GeneralLedgerJournals`
- `finance.GeneralLedgerJournalLines`
- `finance.AccountsReceivableInvoices`
- `finance.AccountsReceivableInvoiceLines`
- `finance.AccountsReceivableLedgerEntries`
- `finance.TaxLedgerEntries`
- `finance.InventoryValuationEntries`

Columns added to `finance.AccountingPostings`:

- `DebitAccountId`
- `CreditAccountId`
- `PostingProfileId`
- `FiscalPeriodId`
- `JournalId`
- `MappingSource`

Seeded governed setup for company `1`:

- Posting accounts: AR, Inventory, GRIR, Input Tax, AP, Output Tax, Sales Revenue, COGS.
- Open fiscal period covering May 2026.
- Posting profiles: `AP_INVOICE_INVENTORY`, `AP_INVOICE_INPUT_TAX`, `AR_INVOICE_REVENUE`, `AR_INVOICE_OUTPUT_TAX`.

No existing documents are assigned fake accounting, owner, tax, valuation, or invoice data.

## APIs / Services Added or Modified

Added `IFinanceService` and `FinanceService` with:

- Governed COA create/list.
- Fiscal period create/list and period lock validation.
- Posting profile create/list with valid posting account checks.
- GL journal create/post/reverse with balance enforcement.
- Supplier invoice posting through governed profiles.
- AR invoice creation from dispatch/shipment commercial snapshots.
- AR invoice posting to AR subledger, GL, output tax ledger, and valuation status.
- Tax ledger and inventory valuation list APIs.

Added `FinanceControllers` endpoints:

- `GET/POST /api/finance/chart-of-accounts`
- `GET/POST /api/finance/fiscal-periods`
- `GET/POST /api/finance/posting-profiles`
- `GET/POST /api/finance/journals`
- `POST /api/finance/journals/{id}/post`
- `POST /api/finance/journals/{id}/reverse`
- `GET /api/finance/ar-invoices`
- `POST /api/finance/ar-invoices/from-shipment`
- `POST /api/finance/ar-invoices/{id}/post`
- `GET /api/finance/tax-ledger`
- `GET /api/finance/inventory-valuation`

Modified procurement posting:

- `ProcurementService.PostSupplierInvoiceAsync` now delegates to `IFinanceService.PostSupplierInvoiceAsync`.
- Old AP liability DTO compatibility is preserved.
- `AccountingPosting` now stores mapped account IDs and mapping source in addition to legacy account code display fields.

Modified inventory posting:

- `InventoryPostingService` now creates `finance.InventoryValuationEntries` with `Valuation Pending` status for new shared stock postings, preserving source document and stock-transaction linkage for receipt, issue, transfer, quality state change, production, and dispatch movements.

## UI Screens Changed

Added finance navigation and pages:

- `/finance/chart-of-accounts`
- `/finance/fiscal-periods`
- `/finance/posting-profiles`
- `/finance/gl-journals`
- `/finance/ap-invoices`
- `/finance/ar-invoices`
- `/finance/inventory-valuation`
- `/finance/tax-ledger`
- `/finance/boundaries`

UI behavior:

- COA, fiscal periods, posting profiles, GL journals, AP, AR, valuation, and tax ledger are live API-backed.
- GL journal lines use compact transaction grids with account selectors and debit/credit numeric controls.
- AR invoice creation uses governed currency selector and server-side shipment snapshot copy.
- AP/AR post actions call live APIs.
- Bank/payment execution, detailed landed cost allocation, debit note, and credit note flows are visible only as disabled-with-reason boundaries; no fake enabled actions were added.

## Tests Added / Updated

Added:

- `tests/server/STS.Mfg.Tests/FinanceGlApArCostingServiceTests.cs`
- `tests/web/finance/FinanceGlApArCostingCompletion.test.tsx`

Updated:

- `tests/server/STS.Mfg.Tests/InventoryPolicyServiceTests.cs`
- `src/web/src/layout/NavigationCompleteness.test.tsx`
- `src/web/src/layout/WS08FinanceExclusion.test.tsx`
- `src/web/src/layout/WS11ReleaseHardening.test.tsx`

Coverage added:

- COA posting account rules.
- Closed period blocking.
- Balanced/unbalanced journal behavior.
- Journal reversal.
- Posting profile deterministic mapping and missing mapping errors.
- AP supplier invoice posting to AP subledger, GL postings, input tax ledger, and inventory valuation.
- AR invoice from shipment exact commercial snapshot copy.
- AR invoice posting to AR subledger, GL journal, output tax ledger, and valuation pending.
- Stock movement valuation pending rows from shared inventory posting.
- Finance UI action truth and governed controls.
- Finance routes are now release-critical and no longer excluded.

## Validation Results

- `npm.cmd run typecheck`: PASS.
- `npm.cmd test`: PASS, 69 test files / 255 tests. Non-blocking existing React `act(...)` warnings were emitted by `NotificationProvider` tests.
- `npm.cmd run audit:erp-completion`: PASS.
- `npm.cmd run build`: PASS. Vite chunk-size warning remains non-blocking.
- `npm.cmd run build:host`: PASS.
- `dotnet build src/server/STS.Mfg.sln`: PASS, 0 warnings / 0 errors after valuation warning fix.
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 71 tests.
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: PASS. Publish output: `src/server/STS.Mfg.Host/bin/Release/net9.0/publish/`.

Targeted regression coverage included:

- Commercial contract hardening tests: covered by full web/server suites.
- Customer commercial/defaulting tests: covered by full web/server suites.
- Inventory/bin/lot/serial/PCID tests: covered by `InventoryPolicyServiceTests` and full web suite.
- Quality/NCR/COA tests: covered by full web suite and server suite.
- Dispatch/POD tests: covered by `DispatchLogisticsPodServiceTests` and full web suite.

## Screenshots

Stored under:

- `docs/codex-review-screens/FINANCE-GL-AP-AR-COSTING-COMPLETION-PACK-06/`

Captured:

- `01-chart-of-accounts.png`
- `02-fiscal-periods.png`
- `03-posting-profiles.png`
- `04-gl-journals.png`
- `05-ar-invoices.png`
- `06-inventory-valuation.png`
- `07-tax-ledger.png`
- `08-finance-boundaries.png`
- `09-ap-invoices.png`

## Governance Updates

Updated:

- `07-ux-governance/action_truth_matrix.csv`
- `07-governance/entity_field_schema_matrix.csv`
- `07-governance/screen_field_violation_matrix.csv`
- `docs/final-audit/07_screen_issue_register.csv`
- `database/README.md`

## Hardcoded Account Check

The old production posting path no longer posts to fixed string accounts such as `InventoryClearing`, `AccountsPayable`, or `InputTax`. Posting uses governed account IDs from `finance.PostingProfiles`.

Remaining fixed strings are:

- governed posting keys such as `AP_INVOICE_INVENTORY`;
- seeded chart-of-account codes in DDL;
- test fixtures proving old hardcoded account strings are not used.

## Old AP Bridge Preservation

The prior AP liability/accounting evidence is preserved:

- `finance.AccountsPayableLiabilities` remains mapped.
- `finance.AccountingPostings` remains compatible.
- New finance columns are nullable and additive.
- Supplier invoice posting now goes through governed finance service and writes mapped account IDs, fiscal period, journal, and mapping source.

## Classification

Closed in this phase:

- Chart of Accounts.
- Fiscal periods and module locks.
- GL journals, balance validation, posting, reversal.
- AP subledger posting from supplier invoice.
- AR invoice/subledger from dispatch/shipment.
- Posting profiles/account mapping.
- Hardcoded AP account removal from posting path.
- Tax ledger from AP/AR document snapshots.
- Inventory valuation foundation from stock movements plus AP/AR postings.
- COGS/dispatch valuation foundation as valuation-pending when cost is not determined.
- Finance UI/action truth for implemented surfaces.

Partially closed / foundation only:

- WIP: stock movements now create valuation-pending entries, but detailed labor/overhead absorption remains later costing depth.
- COGS: dispatch/AR valuation foundation exists; full COGS GL posting waits for resolved cost policy.
- Landed cost: finance boundary is truthful; detailed allocation/accounting remains later P2P costing depth.
- Debit note and credit note: finance boundary is truthful; source-specific note workflows remain later.
- Payment schedule: AP/AR due-date and subledger foundation exists; payment execution/allocation remains later.
- Vendor return/customer return accounting: blocked until return source packs expose finalized posted facts.

Still open for later packs:

- Bank/payment execution and treasury provider integration.
- Detailed production variance and overhead costing.
- Finance reports/dashboard builder.
- Payment-provider integration readiness.

## Safety to Proceed

Pack 04 Quality and Pack 05 Dispatch regressions pass in the full test suite. Phase 01 commercial hardening, Phase 02 customer defaulting, and Phase 03 inventory validation regressions pass in the full test suite. It is safe to proceed to Pack 07 Reports/Dashboard Builder after Pack 06 is reviewed.

## Review Pack

Review pack path:

- `artifacts/review-packs/FINANCE-GL-AP-AR-COSTING-COMPLETION-PACK-06-review-pack.zip`
