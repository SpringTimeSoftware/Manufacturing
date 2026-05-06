# Superseded Prompt Map

## Decision Rules

- `Valid`: keep the prompt output as part of the baseline.
- `Amend`: keep the prompt intent, but rerun or patch it against the V2 schema and contract model.
- `Superseded`: use the old output only as a salvage reference; the prompt content is replaced by the remediation chain.

## Preservation Rule

- Preserve the manufacturing execution backbone wherever possible.
- The strongest assets that should survive the rebaseline are `P030`, `P036` through `P043`, `P057`, `P062`, and `P063`.

## Valid

| Prompt(s) | Covered titles | Decision | Why it stays |
| --- | --- | --- | --- |
| `P000-P014` | Start-here, scope, repository, deployment, design, glossary, security, demo, coding standards, observability, offline, baseline, DB conventions, organization schema, warehouse/bin schema | `Valid` | These prompts establish stack, deployment, visual language, security model, and core organization structure that V2 still requires. |
| `P016-P017` | UOM classes, units, conversions, measurement profiles, formulas, catch-weight schema | `Valid` | The measurement foundation is strong and should be extended, not replaced. |
| `P022-P025` | Resources, operations, routings, BOM, revision, ECO, alternate item schema | `Valid` | Engineering and production-resource prompts remain structurally sound and map cleanly into V2. |
| `P032-P049` | Helper views, MRP/BOQ/capacity/WO/job-card SQL logic, dashboards, solution bootstrap, base wiring, auth, scope, EF/Dapper, validation | `Valid` | These prompts describe salvageable execution and platform patterns. They need richer master inputs, not a wholesale reset. |
| `P053` | Health checks, configuration, and secrets | `Valid` | Operational hosting and IIS deployment rules stay intact. |
| `P057` | BOM, routing, and ECO APIs | `Valid` | Keep the engineering API shape and retrofit it to the richer item-reference model only where needed. |
| `P062-P063` | Work-order APIs, job-card and downtime APIs | `Valid` | These are the key manufacturing execution prompts that must be preserved and only regression-tested against V2 master data. |

## Need Amendment

| Prompt(s) | Covered titles | Decision | Why it needs amendment | R prompt anchor |
| --- | --- | --- | --- | --- |
| `P015` | Language, translation, settings, numbering, workflow schema | `Amend` | V2 adds item texts, customer contact preferences, template settings, and localization verification beyond the current settings scope. | `R009` |
| `P027-P029` | Planning schema, procurement schema, inventory schema | `Amend` | Replenishment policy, customer/vendor item references, packaging-aware stock semantics, and valuation hooks must be added without discarding the existing planning and inventory shell. | `R008`, `R010` |
| `P031` | Quality, dispatch, notification, AI, and audit schema | `Amend` | Generic attachments and notifications must be upgraded for controlled documents, print templates, contact points, and consent-aware delivery. | `R009` |
| `P050-P052` | Audit logging and attachment service, notification outbox, localization service | `Amend` | Reuse the services, but align them to item media semantics, consent routing, and entity-level multilingual texts. | `R009`, `R013` |
| `P054` | Organization APIs | `Amend` | The APIs stay, but V2 requires setup verification for company, branch, warehouse, bin, language, and localization integrity. | `R009` |
| `P059-P061` | MPS/MRP/BOQ APIs, purchase/subcontract APIs, inventory/traceability APIs | `Amend` | These APIs must consume replenishment policy, richer supplier references, packaging semantics, and advanced barcode/valuation hooks. | `R008`, `R010`, `R013` |

## Superseded

| Prompt(s) | Covered titles | Decision | Why it is superseded | Replacement R prompts | Salvage note |
| --- | --- | --- | --- | --- | --- |
| `P018-P021` | Item core schema, item variant/barcode schema, customer schema, supplier schema | `Superseded` | These four prompts created the shallow master-data model that the V2 gap scan explicitly rejects. | `R002-R006` | Reuse naming, status conventions, and company scoping only. |
| `P026` | Quote, sales order, blanket order, and forecast schema | `Superseded` | The commercial document shell exists, but its underlying pricing, discount, tax, currency, customer-site, and credit assumptions are no longer valid. | `R007`, `R013` | Keep document numbering and demand-flow concepts. |
| `P055-P056` | Measurement/item APIs, customer/supplier/resource APIs | `Superseded` | These APIs encode the shallow V1 master model directly into contracts and validations. | `R013-R016` | Keep pagination, audit, and scope patterns only. |
| `P058` | Quote, sales order, and forecast APIs | `Superseded` | The current API contracts bypass pricing, credit, tax, terms, and customer-site rules that V2 treats as mandatory. | `R013-R016` | Keep envelope, paging, and branch-scope enforcement patterns. |

## Prompt-by-Prompt Outcome Summary

| Prompt(s) | Outcome |
| --- | --- |
| `P000-P017` | Keep, with only `P015` amended. |
| `P018-P021` | Superseded by V2 master-data remediation. |
| `P022-P025` | Keep. |
| `P026` | Superseded by V2 commercial remediation. |
| `P027-P031` | Amend. |
| `P032-P054` | Keep, except `P050-P052` and `P054` which need amendment. |
| `P055-P056` | Superseded by V2 API remediation. |
| `P057` | Keep. |
| `P058` | Superseded by V2 API remediation. |
| `P059-P061` | Amend. |
| `P062-P063` | Keep and preserve. |
