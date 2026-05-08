# STS Manufacturing ERP — Master Completion System Plan

## Purpose

This is a repo-native completion plan for Codex. It is intentionally structured as a system, not a single giant rambling prompt. The goal is to finish the Manufacturing ERP project from its current merged state into a product that is:

- internally coherent,
- action-truth compliant,
- field-truth compliant,
- data-truth compliant,
- layout-truth compliant,
- smoke-testable,
- role-UAT capable,
- and ready for controlled pilot hardening.

This plan is written so Codex can execute with minimal manual intervention. It must still stop on real blockers, validation failures, or missing infrastructure. It must not stop merely because one screen family improved. It must drive all touched work to a governed end state.

## Operating assumptions

- Repository: `SpringTimeSoftware/Manufacturing`
- Stack: ASP.NET Core, SQL Server, React web, React Native mobile, IIS publish-folder deployment.
- Governance files already exist, including:
  - `AGENTS.md`
  - `docs/codex-progress/README.md`
  - `docs/design/erp-ui-interaction-standards.md`
  - `docs/design/erp-field-governance-standards.md`
  - `07-governance/entity_field_schema_matrix.csv`
  - `07-ux-governance/action_truth_matrix.csv`
  - `07-ux-governance/master_lookup_field_rules.md`
  - `docs/final-audit/*`
- Current state is beyond prototype but not yet pilot-ready.
- The project must now be finished by system-level enforcement and completion waves, not by random screen patching.

## Non-negotiable global truths

These truths apply to every phase and every touched screen.

### 1. Action truth
No visible action may remain dead.

Every visible touched action must end as one of:
- **WORKING**
- **DISABLED WITH REASON**
- **HIDDEN**

Applicable action classes include but are not limited to:
- New
- New Draft
- Create
- Edit
- Save
- Save Draft
- Save & Continue
- Upload
- Download
- Export
- Print
- Preview
- Clone
- Run
- Rebuild
- Convert
- Approve
- Reject
- Release
- Hold
- Reopen
- Review Audit
- Mark Read
- Open workspace
- Add site
- Add contact
- Add line
- Remove line
- Add media
- Set primary
- Retire
- Assign
- Bind device
- Sync

If an action depends on selected rows, workflow state, approval state, upload/storage readiness, or integration/provider readiness, the action must visibly communicate that truth.

### 2. Field truth
All governed master-linked fields must use the appropriate governed control.

Allowed governed controls:
- lookup
- controlled select
- governed search-select
- grid selection workspace
- date/date-range control
- numeric/decimal/money controls
- controlled switch/checkbox/toggle for boolean state

Governed value types that must not use unrestricted free text where a source exists include:
- company
- branch
- department
- shift
- warehouse
- bin
- item group
- item subgroup
- item attribute
- item variant/template
- UOM
- UOM conversion source/target
- customer
- customer site
- customer contact
- supplier
- supplier site
- supplier contact
- price list
- discount scheme
- tax category
- tax code
- currency
- payment term
- trade term
- BOM
- routing
- work center
- machine
- tool/resource
- operator
- QC plan
- inspection template
- reason code
- approval workflow
- numbering scheme
- notification template
- integration provider
- AI provider/model
- dispatch carrier/service if present

Free text is allowed only for genuine text/narrative fields such as:
- descriptions
- notes
- remarks
- comments
- search text
- external references
- one-off narrative fields

### 3. Numeric truth
All measurable or quantitative values must use governed numeric controls.

Numeric classes include:
- quantity
- quantity per
- minimum quantity
- maximum quantity
- reorder point
- safety stock
- MOQ
- lead time days
- cycle time
- setup minutes
- run minutes
- teardown minutes
- overlap percentage
- scrap percentage
- net weight
- gross weight
- length
- width
- height
- thickness
- volume
- conversion factor
- price
- discount amount
- discount percentage
- tax percentage
- exchange rate
- overload minutes
- utilization percentage
- shift output
- production receipt quantity
- scrap quantity
- rework quantity

Each numeric field must have:
- correct control type
- precision/scale
- min/max where relevant
- unit or currency if relevant
- validation messages

### 4. Data truth
In live authenticated mode, the application must not silently display fake operational data as if it were live.

Applies to:
- notifications
- approvals
- dashboards
- work queues
- risk cards
- planning alerts
- production alerts
- dispatch alerts
- AI operational summaries
- operational counts and badges

Allowed live-mode states:
- real live data
- explicit empty state
- explicit temporary unavailable state

Seed/demo data is allowed only in explicit demo-only mode.

### 5. Layout truth
Deep create/edit/detail workspaces must use either:
- a centered modal workspace, or
- a full-page workspace

Not allowed:
- right drawers for deep editors
- giant empty panels with no content strategy
- long content cut off without scroll
- validation summaries consuming all prime space

Workspace requirements:
- sticky header
- sticky footer/action bar
- internal scroll
- compact/collapsible validation summary
- first meaningful fields visible without excessive scrolling
- consistent spacing and control heights

### 6. Content truth
Production-facing UI must not contain internal or scaffold wording.

Remove or replace terms such as:
- adapter
- fallback
- mock
- seeded
- source status
- workspace data
- governed setup
- reference UI
- React
- TypeScript
- prompt IDs
- backend reachable
- guarded demo shell

### 7. Upload truth
Upload/media/document actions may only appear as active if the underlying workflow truly works.

Possible states:
- upload enabled and working
- metadata-only state with clear messaging
- disabled with business-safe reason
- hidden if not applicable

### 8. Proof gate
No phase is complete until:
- validations pass
- screenshots are captured
- matrices are updated
- review pack is generated

---

# Completion phases

The project should now be finished in system-driven phases.

## Phase 0 — Project-wide governance enforcement (already started)
Objective:
- centralize field/action/data/layout truth
- eliminate repeated screen-by-screen rediscovery of the same issue class

Artifacts:
- field governance standards
- UI interaction standards
- action truth matrix
- field schema matrix
- screen violation matrix

Stop condition:
- governance artifacts exist and are applied to shared components

## Phase 1 — Runtime UAT and seed repair
Objective:
- remove role-critical runtime failures
- ensure live authenticated sessions do not show silent seeded operational data
- make role-wise UAT realistic

Work items:
- role identity seed completeness
- seeded reference data realism
- runtime 500 repairs
- localhost/live smoke stability
- role-based navigation proof
- environment/runbook coherence

Acceptance:
- localhost smoke passes for all critical read paths
- role logins pass
- no fake live operational fallbacks in authenticated mode

## Phase 2 — Platform, security, audit, and admin completion
Objective:
- complete the platform/admin/security foundation needed before pilot-level closure

Scope:
- login/auth/session hardening
- users
- roles and permissions
- numbering
- workflow setup
- translations/language
- notifications
- approvals
- tenant settings
- context switching
- attachments authorization
- audit viewer
- rate limiting
- provider secret governance

Acceptance:
- no dead admin actions
- audit read path works or is clearly disabled
- attachment authorization behavior is truthful
- rate limiting exists for critical endpoints

## Phase 3 — Master data completion
Objective:
- complete the master data layer as a governed foundation

Scope:
- Item Master depth
- item taxonomy (groups, subgroups, attributes, variants, reason codes)
- barcode and packaging
- media/document truth
- customer master
- supplier master
- lead-time governance
- commercial references needed by downstream flows
- lookup-source truth everywhere

Acceptance:
- no free-text governed fields in master data screens where sources exist
- all major deep editors use governed modal/full-page workspace
- document/media actions truthful

## Phase 4 — Commercial and partner commercial depth
Objective:
- complete pricing, discounting, tax/currency/terms, and partner commercial controls

Scope:
- price lists
- price list lines
- discount schemes and rules
- tax category / tax code
- currency / exchange-rate setup
- trade/payment terms
- customer/supplier commercial tabs

Acceptance:
- commercial screens are not just present, but persistent and governed
- no dead create/save actions
- lookup/select enforcement for commercial masters

## Phase 5 — Engineering and planning depth
Objective:
- finish BOM/routing/ECO/planning authoring and ensure all visible actions are truthful

Scope:
- BOM list/detail/editor
- BOM revision/history
- BOM tree/comparison
- routing
- operation standards
- alternate items
- engineering documents
- MPS / MRP
- BOQ / Requirements
- capacity planning
- machine board / occupancy as planning views

Acceptance:
- touched engineering/planning actions are working/disabled/hidden
- authoring workflows are governed, not fake

## Phase 6 — Production and execution depth
Objective:
- close operational transaction truth

Scope:
- work orders
- job cards
- shift production
- material issue/return/transfer
- downtime
- production receipt
- scrap/by-product
- rework
- QC/NCR/hold-release
- dispatch pack/proof
- mobile execution screens

Acceptance:
- no dead operational buttons
- production posting truth exists or actions are honestly disabled

## Phase 7 — Inventory, quality, dispatch, and documents completion
Objective:
- complete traceability, stock governance, quality disposition, dispatch handoff, and document truth

Scope:
- stock balances and movement review
- cycle count
- traceability
- QC plan/inspection/NCR disposition
- dispatch planning/shipment/pack list/proof
- attachments/documents where tied to execution flows

Acceptance:
- document/media actions truthful
- no fake review/approval/disposition actions
- role workflows coherent

## Phase 8 — Mobile hardening
Objective:
- move mobile from scaffold/demo-oriented state to governed execution support

Scope:
- mobile login/context
- approvals/notifications
- job card execution
- material scan
- downtime
- QC capture
- dispatch proof
- shift handover
- sync/offline behaviors

Acceptance:
- no fake mobile actions
- mobile validation/tooling installed if required for release readiness

## Phase 9 — Release, security, proof, and packaging
Objective:
- make the project evidence-backed for release decisions

Scope:
- production hardening review updates
- security review updates
- UAT reruns
- screenshot evidence refresh
- final review pack
- release gate decision

Acceptance:
- release gates updated
- final status judged honestly: internal-only / demo-ready / UAT-ready / pilot-ready

---

# Domain-by-domain requirements

## Platform/Admin
Must have:
- working login/logout/session recovery
- role-aware menus
- Super Admin route completeness for implemented screens
- user list/detail lifecycle
- role/permission matrix
- numbering/workflow setup
- notification center truth
- approval workbench truth
- tenant/platform settings depth
- attachment authorization truth
- audit viewer or disabled reason

## Organization/Setup
Must have:
- company/branch/department/warehouse/bin/shift governance
- work center/machine/tool/resource setup
- no free-text master-linked relationship fields where source exists
- site/address hierarchies truthful

## Master Data
Must have:
- item master with governed tabs/sections
- images/media/doc truth
- packaging and physical specs as numeric/governed fields
- item taxonomy via lookup not free text
- customer/supplier master persistence
- sites/contacts/terms/audit/document truth

## Commercial
Must have:
- price list create/edit/save truth
- discount rule/scheme truth
- tax/currency/term truth
- applicable lookup controls
- no fake approval buttons

## Engineering
Must have:
- BOM create/edit/save truth
- routing create/edit/save truth
- ECO truth
- alternate-item truth
- engineering document truth
- all controlled lookups enforced

## Planning
Must have:
- MRP/MPS/BOQ/capacity actions honest
- version/run/rebuild/export actions truthful
- no empty top actions that mislead users

## Production / Inventory / Quality / Dispatch
Must have:
- transaction truth
- no fake posting actions
- clear disabled reasons when workflows are incomplete
- document/proof truth
- QC/NCR truth

## Mobile
Must have:
- action truth
- live-vs-seeded truth
- no fake workflow buttons
- governed offline/sync affordances

---

# Required matrices and reports

Codex must update/create these during completion waves:

1. `07-ux-governance/action_truth_matrix.csv`
2. `07-governance/entity_field_schema_matrix.csv`
3. `07-governance/screen_field_violation_matrix.csv`
4. `docs/final-audit/07_screen_issue_register.csv`
5. `docs/codex-progress/<wave>-output.md`
6. screenshot evidence folder for the wave
7. final review pack zip for the wave

---

# Screenshot evidence rules

For every touched primary screen:
- capture at least one screenshot
- if the page scrolls, max 3 screenshots:
  - top
  - middle
  - bottom
- if a modal/workspace is touched:
  - capture overview
  - capture lower section only if needed
- do not loop indefinitely
- no more than 3 screenshots per route unless explicitly required

---

# Validation rules

For every completion wave:

Web:
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run build:host`

Backend when touched:
- `dotnet build src/server/STS.Mfg.sln`
- `dotnet test src/server/STS.Mfg.sln --no-build`
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`

Database when touched:
- update `database/README.md`
- document exact DDL/seed apply order

---

# Review pack contents

Every serious wave must generate one review pack zip that includes:
- current wave output markdown
- updated action truth matrix
- updated governance matrices
- screenshot folder
- changed DDL/seed/DB README if any
- changed release/security/UAT docs if any

---

# Codex stop conditions

Codex may stop only if:
- validation fails
- a critical blocker appears
- the next step would require inventing a large speculative module outside current scope
- the entire requested completion phase and proof artifacts are done

Codex must NOT stop merely because:
- one screen was improved
- one domain looks cleaner
- one matrix was updated

---

# Final completion definitions

## Internal-only
The app can be demonstrated internally, but still depends on partial workflows, disabled actions, weak runtime proof, or seeded/demo behavior in too many areas.

## Demo-ready
The app can be shown to a customer in a controlled web demo with known limitations, but not used for serious end-to-end UAT.

## UAT-ready
Most critical role-based flows can be validated honestly without fake data or dead actions; remaining limitations are documented and acceptable.

## Pilot-ready
The app has action truth, field truth, data truth, layout truth, security hardening, and proof sufficient for limited real-world pilot use.

---

# Current expected near-term path

1. Merge completed lane work into `main`
2. Run refreshed final audit on `main`
3. Run runtime/UAT/seed repair if not already complete
4. Run platform/security/audit/admin completion
5. Run remaining domain completion waves in roadmap order
6. Re-run final audit and release gates

---

# What Codex must never do again

- leave dead visible buttons
- leave governed values as free text where source exists
- leave numeric fields as plain text
- silently show seeded operational data in live auth mode
- leave deep editors in right drawers
- stop after fixing one example of a systemic problem

