# Seed Bootstrap Plan

## Execution Order

1. Run all DDL packs in the order documented by `/database/README.md`.
2. Run `database/seed/001_minimum_platform_seed.sql`.
3. Run `database/seed/002_minimum_org_seed.sql`.
4. Run `database/seed/003_minimum_masters_seed.sql`.

## Seed Intent

| Script | Purpose | Id strategy |
| --- | --- | --- |
| `001_minimum_platform_seed.sql` | Adds minimum translation, notification template, integration provider, and draft-only AI registry rows. | Natural-code idempotency; no fixed identities required. |
| `002_minimum_org_seed.sql` | Adds company, branches, departments, warehouses, bins, and shifts aligned to `BootstrapIdentityDirectory`. | Fixed identities where auth/data-scope grants already reference ids. |
| `003_minimum_masters_seed.sql` | Adds minimum UOM/profile, item groups, raw/FG items, customer, supplier, lead time, work center, operation, machine, routing, and BOM seed. | Fixed identities only for cross-script runnable references. |

## Bootstrap Identity Alignment

The existing live auth users are still defined in code. The organization seed therefore uses these ids:

| Runtime id | Seeded object |
| --- | --- |
| Company `1` | `ACME` / Acme Manufacturing |
| Branch `11` | `ACME-N` / Acme North Plant |
| Branch `12` | `ACME-S` / Acme South Plant |
| Warehouse `101` | North Raw Material Store |
| Warehouse `102` | North WIP Store |
| Warehouse `201` | South Finished Goods Dispatch |
| Department `301` | Production |
| Department `302` | Planning |
| Department `401` | Quality Control |

## Minimum Runnable Business Data

| Seed object | Why it exists |
| --- | --- |
| `PCS`, `KG`, `STD-COUNT` | Lets item, production, receipt, dispatch, and inventory flows reference real measurement ids. |
| `RM-PLATE-001`, `FG-BRACKET-001` | Gives planning, BOM, work order, receipt, quality, dispatch, and traceability APIs a non-empty item foundation. |
| `CUST-DEMO` and address | Lets sales order, dispatch, and dashboard reads be exercised without inventing commercial V2 scope. |
| `SUP-DEMO` and lead time | Lets supplier/procurement/planning reads be exercised without adding supplier-compliance features. |
| `FAB`, `CUT`, `CUT-01`, `RT-BRACKET`, `BOM-BRACKET` | Gives the preserved engineering and production backbone a minimal route/BOM substrate. |

## Constraints

- Seeds are idempotent and additive.
- Seeds do not delete or overwrite existing business data.
- Seeds do not introduce HR, payroll, full accounting, landed cost, costing finalization, or future prompt-chain features.
- If a customer database already uses one of the fixed bootstrap ids for a different record, the script skips the conflicting insert rather than resetting data.
