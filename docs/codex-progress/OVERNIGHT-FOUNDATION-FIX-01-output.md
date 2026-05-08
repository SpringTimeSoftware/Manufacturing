# OVERNIGHT-FOUNDATION-FIX-01 Output

Date: 2026-05-08
Branch: main

## Scope Completed

- Extended the global field governance standard with stricter live-vs-demo data handling, disabled governed review controls, and production wording rules.
- Extended the entity field schema matrix to 111 governed field rules, including organization, MPS, MRP, BOQ, and platform admin fields.
- Extended the screen field violation matrix to 124 tracked findings, including the overnight live-data, quote draft, planning, blanket order, supplier lead-time, and inventory balance corrections.
- Created the final-audit screen issue register for fixed and remaining project-wide issues.
- Removed silent seeded fallback from live authenticated adapters for additional master data, organization, engineering, procurement, dashboard, planning, and platform admin surfaces.
- Corrected the Sales Quotes New quote draft path so it opens a centered governed draft workspace and saves valid live drafts through the quote API.
- Replaced additional generic review inputs with governed lookup/number controls in supplier lead times, inventory balances, blanket orders, MPS, and MRP selected-run details.
- Replaced user-facing Reference view wording with Review mode on touched page surfaces.

## Counts

- Screens scanned: 66 guarded web routes plus the dashboard index route.
- Lookup violations fixed in this pass: 6.
- Numeric field violations fixed in this pass: 1.
- Dead or misleading actions removed, disabled, or wired in this pass: 3.
- Upload truth issues fixed in this pass: 0 new; existing disabled file-action governance remains in place.
- Seeded/live truth issues fixed in this pass: 40.
- Scroll issues fixed in this pass: 0 new; existing modal and capacity scroll governance remains in place.

## Evidence Updated

- `docs/design/erp-field-governance-standards.md`
- `07-governance/entity_field_schema_matrix.csv`
- `07-governance/screen_field_violation_matrix.csv`
- `07-ux-governance/action_truth_matrix.csv`
- `docs/final-audit/07_screen_issue_register.csv`
- `docs/codex-review-screens/OVERNIGHT-FOUNDATION-FIX-01/`

## Screenshot Evidence

Folder: `docs/codex-review-screens/OVERNIGHT-FOUNDATION-FIX-01/`

- `sales-quotes.png`
- `sales-quote-draft-modal.png`
- `supplier-lead-times.png`
- `supplier-lead-time-detail-modal.png`
- `inventory-balances.png`
- `inventory-balance-detail-modal.png`
- `sales-blanket-orders.png`
- `sales-blanket-order-detail-modal.png`
- `planning-mps.png`
- `planning-mps-detail-modal.png`
- `planning-mrp-run-console.png`
- `planning-mrp-selected-run.png`
- `dashboard-order-delivery.png`
- `platform-user-directory.png`

Screenshot note: captured through a demo-authenticated headless Chrome context with `/api/auth/me` mocked to preserve route access while keeping page data in explicit demo mode.

## Validation Results

- `npm run typecheck` - PASS
- `npm test` - PASS, 36 files / 152 tests
- `npm run build` - PASS, with existing Vite large chunk warning
- `npm run build:host` - PASS
- `dotnet build src/server/STS.Mfg.sln` - PASS, 0 warnings / 0 errors
- `dotnet test src/server/STS.Mfg.sln --no-build` - PASS, 20 tests
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release` - PASS, with existing Vite large chunk warning during web build

## Review Pack

- Created: `artifacts/review-packs/OVERNIGHT-FOUNDATION-FIX-01-review-pack.zip`

## Top Remaining Blockers

1. Production SQL/runtime readiness still needs live environment evidence after deployment.
2. Attachment storage and authorization must be completed before upload actions can be enabled.
3. Organization setup still needs deeper API-backed lookup sources for country, tax, calendar, manager, warehouse, bin, work-center, and crew values.
4. Measurement conversions and profiles still need full decimal model migration.
5. Item taxonomy and reason-code setup need centralized controlled lookup sources across dependent screens.
6. Commercial approval/versioning depth remains partial for price lists, discounts, tax, exchange rates, payment terms, and currencies.
7. Quote approval, conversion, and line pricing workflow remain partial after quote draft creation was wired.
8. Blanket order and MPS edit workflows remain partial.
9. MRP execution depth remains partial beyond the existing live run/detail flows.
10. BOQ conversion depth remains partial.
11. Production receipt, scrap, and rework posting/costing workflows remain disabled.
12. Work order and job card lifecycle actions remain partial.
13. Inventory issue, return, transfer, putaway, and traceability posting workflows remain disabled or partial.
14. QC plan authoring, inspection entry, NCR creation, disposition, and hold-release workflows remain disabled or partial.
15. Dispatch pack, shipment, carrier, proof, and print workflows remain disabled or partial.
16. Platform workflow authoring, tenant policy depth, role cloning, and user lifecycle remain partial.
17. Audit export is client-scoped and needs server-side retention/export depth.
18. Dashboard endpoint readiness needs validation against production SQL.
19. Mobile execution command handlers remain disabled until offline queue workflows are enabled.
20. Vite still reports the existing large chunk warning during web builds and host publish.

## Next Recommended Wave

MASTER-LOOKUP-SOURCE-01: complete central API-backed lookup sources and decimal model migrations for organization, measurement, item taxonomy, reason codes, planning calendars, and partner references before enabling the next set of create/post workflows.
