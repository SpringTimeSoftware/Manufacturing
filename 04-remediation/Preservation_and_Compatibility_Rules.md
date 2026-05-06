# Preservation and Compatibility Rules

## Prompt Groups That Remain Valid

| Prompt group | Covered titles | Rule |
| --- | --- | --- |
| `P000-P014` | Start-here, scope, repository, deployment, design, glossary, security, demo, coding standards, observability, offline, baseline, DB conventions, organization schema, warehouse/bin schema | Preserve as valid baseline work. |
| `P016-P017` | UOM classes, units, conversions, measurement profiles, formulas, catch-weight schema | Preserve as valid baseline work. |
| `P022-P025` | Resources, operations, routings, BOM, revision, ECO, alternate-item schema | Preserve as valid baseline work. |
| `P032-P049` | Helper views, MRP/BOQ/capacity/WO/job-card SQL logic, dashboards, solution bootstrap, base wiring, auth, scope, EF/Dapper, validation | Preserve as valid baseline work. |
| `P053` | Health checks, configuration, and secrets | Preserve as valid baseline work. |
| `P057` | BOM, routing, and ECO APIs | Preserve as valid baseline work. |
| `P062-P063` | Work-order APIs, job-card and downtime APIs | Preserve as valid baseline work. |

## Prompt Groups That Are Amended

| Prompt group | Covered titles | Rule |
| --- | --- | --- |
| `P015` | Language, translation, settings, numbering, workflow schema | Amend for item texts, consent-aware settings, template controls, and localization verification. |
| `P027-P029` | Planning schema, procurement schema, inventory schema | Amend for replenishment policy, packaging-aware inventory semantics, vendor references, and valuation hooks. |
| `P031` | Quality, dispatch, notification, AI, and audit schema | Amend for controlled documents, print templates, contact points, and consent-aware delivery. |
| `P050-P052` | Audit logging and attachment service, notification outbox, localization service | Amend for item-media semantics, multilingual entity texts, and template-aware delivery. |
| `P054` | Organization APIs | Amend for company, branch, warehouse, bin, language, and localization setup verification. |
| `P059-P061` | MPS/MRP/BOQ APIs, purchase/subcontract APIs, inventory/traceability APIs | Amend for replenishment policy, richer supplier references, packaging semantics, and valuation hooks. |

## Prompt Groups That Are Superseded

| Prompt group | Covered titles | Rule |
| --- | --- | --- |
| `P018-P021` | Item core schema, item variant/barcode schema, customer schema, supplier schema | Superseded by `R002-R006`. Use only as salvage reference for naming, status, and scoping conventions. |
| `P026` | Quote, sales order, blanket order, and forecast schema | Superseded by `R007` and `R013`. Keep numbering and demand-flow concepts only. |
| `P055-P056` | Measurement/item APIs, customer/supplier/resource APIs | Superseded by `R013-R016`. Keep pagination, audit, and scope patterns only. |
| `P058` | Quote, sales order, and forecast APIs | Superseded by `R013-R016`. Keep envelope, paging, and branch-scope enforcement patterns only. |

## Compatibility Policy for Preserved P057, P062, and P063 Code

- Preserve the existing `P057`, `P062`, and `P063` runtime surfaces as the current engineering and manufacturing execution baseline.
- Preserve their route shapes, shared API envelope, authorization and data-scope enforcement, audit behavior, lifecycle actions, and execution intent unless a V2 schema adapter is required.
- If a V2 schema or contract change breaks a direct dependency on shallow V1 master data, introduce a compatibility adapter, bridge mapping, or versioned contract first. Do not destroy or bypass the preserved execution flow to fit old assumptions.
- Re-verify `P057`, `P062`, and `P063` against the V2 master and commercial contracts before opening `P064`.

## Non-Destructive Migration Principle

- Treat existing repo assets as preservable by default.
- Use additive tables, mappings, adapters, compatibility DTOs, views, and staged cutovers before destructive replacement.
- Replace business shapes only where the V2 delta matrix explicitly marks `REPLACE`, and do so through compatibility-led migration rather than silent breakage.
- Preserve historical identifiers, numbering, audit trails, execution history, and existing progress evidence unless a later remediation prompt explicitly defines a safe migration path.

## Historical Documentation Rule

- Retain old docs in the repo, even when their behavior is superseded.
- Mark obsolete guidance as superseded or salvage-reference material; do not delete it.
- Do not delete historical `/docs/codex-progress/` outputs.
- R-series outputs extend the project history; they do not overwrite or erase P-series outputs.
