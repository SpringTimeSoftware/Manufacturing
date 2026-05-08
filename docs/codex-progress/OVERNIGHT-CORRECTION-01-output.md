# OVERNIGHT-CORRECTION-01 Output

Date: 2026-05-08
Branch: main

## Scope Completed

- Executed the repo-native `MASTER_COMPLETION_SYSTEM_PLAN.md` as the active system correction plan for the main branch.
- Scanned 81 guarded web routes plus the dashboard index route for field, action, data, layout, and wording truth exposure.
- Replaced remaining generic production-facing workspace labels on touched planning, master-data, measurement, organization, partner, and platform context pages with business-specific labels.
- Updated the field governance standard with explicit content-truth rules for generic visible workspace labels.
- Extended the entity field schema matrix to 116 governed field rules with attachment, notification, and approval workflow references.
- Extended the screen field violation matrix to 130 tracked findings, including the new content-truth corrections.
- Extended the final audit issue register to 50 issues with the OVERNIGHT-CORRECTION-01 fixed wording issues.
- Reverified action-truth evidence for quote draft creation and live notification/approval loading.
- Captured screenshot evidence under `docs/codex-review-screens/OVERNIGHT-CORRECTION-01/`.
- Generated the review pack under `artifacts/review-packs/OVERNIGHT-CORRECTION-01-review-pack.zip`.

## Counts

- Screens scanned: 81 guarded web routes plus the dashboard index route.
- Lookup violations fixed in this run family: 6.
- Numeric field violations fixed in this run family: 1.
- Dead or misleading actions removed, disabled, or wired in this run family: 3.
- Upload truth issues fixed in this run: 0 new; existing disabled file-action governance remains in place.
- Seeded/live truth issues fixed in this run family: 40.
- Scroll issues fixed in this run: 0 new; existing modal and capacity scroll governance remains in place.
- Content wording issues fixed in this run: 6.

## Evidence Updated

- `MASTER_COMPLETION_SYSTEM_PLAN.md`
- `docs/design/erp-field-governance-standards.md`
- `07-governance/entity_field_schema_matrix.csv`
- `07-governance/screen_field_violation_matrix.csv`
- `07-ux-governance/action_truth_matrix.csv`
- `docs/final-audit/07_screen_issue_register.csv`
- `docs/codex-progress/README.md`
- `docs/codex-review-screens/OVERNIGHT-CORRECTION-01/`

## Screenshot Evidence

Folder: `docs/codex-review-screens/OVERNIGHT-CORRECTION-01/`

- `sales-quotes.png`
- `sales-quotes-draft-modal.png`
- `item-master.png`
- `item-groups.png`
- `measurement-uom-classes.png`
- `organization-companies.png`
- `partners-customers.png`
- `partners-suppliers.png`
- `platform-context-switch.png`
- `production-work-orders.png`
- `quality-ncr.png`
- `dispatch-pack-lists.png`

Screenshot note: captured through a demo-authenticated Super Admin browser context so protected routes render without relying on live operational fallback.

## Validation Results

- `npm run typecheck` - PASS
- `npm test` - PASS, 36 files / 152 tests
- `npm run build` - PASS, with existing Vite large chunk warning
- `npm run build:host` - PASS
- `dotnet build src/server/STS.Mfg.sln` - PASS after stopping a stale local `STS.Mfg.Host` process that locked debug DLLs; final run 0 warnings / 0 errors
- `dotnet test src/server/STS.Mfg.sln --no-build` - PASS, 20 tests
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release` - PASS, with existing Vite large chunk warning during web build

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
