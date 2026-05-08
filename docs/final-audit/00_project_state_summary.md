# FINAL-AUDIT-02 Project State Summary

Date: 2026-05-08
Branch audited: `main`

## Audit Basis

This report audits the current `main` branch after the merged Engineering/Planning and Production/Execution lane work. Merge commits `6298df5` and `62a38aa` are counted because they are already part of `main`; any future unmerged branch work is not counted.

Evidence read for this pass:

- `AGENTS.md`
- `docs/codex-progress/README.md`
- `00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `00-blueprint/screen_inventory.csv`
- `00-blueprint/api_inventory.csv`
- `00-blueprint/db_entities.csv`
- `03-manifests/prompt_index.csv`
- `06-v2-screen-rework/*`
- `07-ux-governance/action_truth_matrix.csv`
- `docs/design/erp-ui-interaction-standards.md`
- `07-ux-governance/master_lookup_field_rules.md`
- `database/README.md`
- `docs/release/production-readiness-review.md`
- `docs/security/production-security-hardening-review.md`
- `docs/uat/*`
- current `src/` and `tests/`

## Current Overall State

The project has a broad Manufacturing ERP skeleton with real architecture across ASP.NET Core, SQL Server DDL packs, React web, React Native mobile, IIS publish output, API controllers, adapters, tests, and documentation. It is not a finished ERP product.

The blueprint target is broad: 95 web screens, 24 mobile screens, 63 API groups, and 109 DB entities. The current main branch contains 81 guarded web routes, 21 API controller files, 16 web adapter modules, 16 mobile screen/source files under `src/mobile/src`, 34 web test files, and 5 server test source files. This is substantial coverage for a generated product foundation.

The strongest evidence against UAT or pilot readiness is the V2 screen audit and UAT evidence:

- V2 screen audit: 78 screens are `SHALLOW`, 32 are `DEMO-LIKE`, and 9 are `MISSING`.
- Action truth matrix expected-state totals: 41 actions are `WORKING`; 203 actions are `DISABLED WITH REASON`. Current-state rows still include 4 legacy `unknown` entries that are expected to remain disabled with reason.
- UAT role results before this long-run were 10 of 10 roles `PARTIAL`; no role had full acceptance signoff. The LONG-RUN-01 rerun remains 10 of 10 roles `PARTIAL`, but the blocker class changed: 10 of 10 role logins and 55 of 55 representative API probes now pass, while workflow depth and pilot controls still prevent full role acceptance.
- LONG-RUN-01 repaired and re-probed the most severe runtime blockers found by the prior audit: missing live identities for `SalesCoordinator`, `PurchaseManager`, and `PlantHead`; HTTP 500 failures for warehouses, customers, suppliers, job cards, downtime, and machine board; PlatformAdmin provider-read authorization for integration/AI provider endpoints; missing `DEMO-LOT-001` traceability proof data; and missing seeded pack-list print proof. The role/API probe returned HTTP 200 for every targeted route in this pass.
- Remaining UAT gaps are now mostly workflow depth, mobile live execution, irreversible transaction proof, and pilot controls rather than basic read-route crashes.

## Readiness Judgment

Current product classification: **DEMO-READY for a controlled web demo; not UAT-ready or pilot-ready**.

It is suitable for engineering review, architecture review, internal navigation walkthroughs, and a controlled stakeholder demo of the current web surfaces with seeded data. It is not ready for role-wise UAT signoff or customer pilot.

The reason is not lack of surface area. The reason is depth: too many screens are shallow, many actions are intentionally disabled, key workflows are not transaction-complete, and mobile is seeded/offline-concept rather than live execution. The hard runtime blockers from FINAL-AUDIT-01 were repaired in LONG-RUN-01, but that only moves the product from internal-only to controlled-demo readiness.

## Demo-Ready / Internal-Only / Pilot-Ready Judgment

| Level | Judgment | Reason |
| --- | --- | --- |
| Internal-only | Yes | Navigation, screen coverage, API contracts, DB packs, docs, and repaired runtime reads are enough for internal product/engineering walkthroughs. |
| Demo-ready | Yes, controlled web demo only | The app can demonstrate breadth and selected seeded flows after LONG-RUN-01 runtime repairs. Disabled actions, shallow editors, missing screens, and mobile demo-only behavior must be framed clearly. |
| UAT-ready | No | Role-wise UAT still lacks full PASS evidence because transaction depth, irreversible workflows, mobile live execution, and pilot controls remain incomplete. |
| Pilot-ready | No | Production transactions, inventory traceability, QC hold/release, dispatch proof, mobile sync, audit, security, and integrations are not pilot-grade. |

## Strongest Completed Areas

1. Architecture and repository shape: modular server projects, web app, mobile app, database packs, docs, and tests are in place.
2. IIS deployment path: React build and host publish model are documented and implemented.
3. Web navigation breadth: many target routes exist and are guarded through the app shell.
4. Manufacturing backbone: BOM, routing, MRP, BOQ, work orders, job cards, machine board, occupancy, quality, dispatch, and dashboards exist as product surfaces.
5. Engineering/planning depth has improved relative to the first audit baseline, especially around BOM/routing/operation/MRP/BOQ UI behavior and action truth.
6. Master data has more V2 extension tables and deeper item/customer/supplier/commercial UI than the initial skeleton.
7. Action truth governance exists: visible actions are cataloged and many unsupported actions are now disabled with explicit reasons rather than silently dead.
8. Security review exists and identifies concrete pilot blockers instead of hiding them.
9. UAT artifacts exist and are honest about role-wise partial status.
10. Test harness coverage exists for web pages, auth, shell, adapters, key flow render checks, and server rules.

## Weakest Areas

1. End-to-end transactional completion: sales/order-to-plan-to-work-order-to-job-card-to-QC-to-dispatch is not proven with live seed data and write flows.
2. Mobile execution: mobile screens use seeded/local data and do not prove live assignments, scan validation, media upload, device trust, offline replay, or conflict-safe sync.
3. Transaction reliability: LONG-RUN-01 repaired the known read-route 500s, but write/post/transition flows are not yet proven end to end.
4. Production execution depth: work orders, job cards, shift entry, material issue/return, receipts, scrap, rework, downtime, machine status, and timelines are still partial.
5. Inventory and traceability: stock ledger, lot/serial/catch-weight, reservations, hold status, movement drilldown, and trace packs are not pilot-complete.
6. Quality/NCR depth: QC plan versioning, parameter capture, hold/release, NCR lifecycle, root cause, disposition, and evidence are partial.
7. Dispatch/proof depth: pack lists, shipments, labels, loading proof, delivery proof, customer refs, and print templates are partial.
8. Documents/media: attachments exist conceptually, but cross-module document control, versioning, proof media, authorization tests, and audit are incomplete.
9. Integrations and AI: backend concepts exist, but first-class provider/admin UI, secret rotation, real adapters, report catalog, import repair, and AI review workflows are missing or partial.
10. Audit viewer and global search are missing first-class production screens.

## Top Blockers To Finish

1. Convert high-risk disabled actions into real audited workflows or hide them until implemented.
2. Build realistic guarded seed/reset data for complete order-to-cash and plan-to-produce scenarios.
3. Finish master data dependencies needed by production transactions: item tracking, UOM, resource, partner, commercial, document, and QC policy depth.
4. Complete transaction-safe production execution with server validation and audit.
5. Complete inventory movement ledger, reservations, lot/serial/catch-weight, and traceability.
6. Complete QC hold/release, inspection parameter results, NCR lifecycle, and source linkage.
7. Complete dispatch proof, print pack, label templates, and shipment closure.
8. Complete mobile device trust, live task assignment, scan validation, media upload, offline replay, and conflict handling.
9. Complete audit viewer and attachment authorization tests.
10. Add rate limiting and production security hardening controls.
11. Complete integration/AI provider UI, secret governance, and real adapter binding.
12. Add report catalog, parameterized exports, document template governance, and print audit.
13. Expand automated regression coverage for role-critical endpoints, posting workflows, and data-scope behavior.
14. Rerun smoke, role-wise UAT, security, performance, and publish gates after all critical workflows are live.
