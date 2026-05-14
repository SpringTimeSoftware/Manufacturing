# BOM / Routing / ECO / Engineering Documents Completion Specification V1

## Purpose

This specification defines the completion standard for the engineering data layer:

- BOM Library
- BOM Detail / Editor
- BOM Comparison
- Routing Library
- Routing Editor
- Operation Standards
- Alternate Items
- Engineering Documents
- ECO / Change Order
- Impact Analysis
- Planning/Production handoff from released BOM/routing

The purpose is not to create static screens. The purpose is to make engineering data usable for planning, costing, production, quality, and traceability.

## Definition of Done

This pack is complete only when all P0 engineering/product-data workflows are either:

- implemented and tested,
- or explicitly blocked with a business-safe reason and no misleading active action.

A screen is not complete if it only displays shallow rows, static seed data, one-line editors, or disabled controls without a real reason.

## Mandatory UX Standard

Desktop BOM/routing/ECO line entry must use compact editable grids/tables.

Card-per-line desktop entry is a failure condition for:

- BOM component lines
- BOM operation links
- routing operation lines
- ECO affected object lines
- impact analysis rows

Cards may be used only for:

- mobile
- read-only summary
- row expansion/detail
- approval preview

## BOM Detail / Editor Requirements

### Header

Must include:

- BOM number
- parent item lookup
- parent revision
- BOM name
- BOM type
- BOM usage
- plant/branch
- base quantity
- base UOM
- alternative BOM
- status
- effective from/to
- change number / ECO
- approval route

### Component Line Grid

Must include:

- line no
- component item lookup
- component revision
- description/spec
- quantity per
- component UOM
- scrap %
- issue method
- line type
- operation link
- warehouse
- bin
- lot/serial requirement
- substitute group
- effective from/to
- line status
- remarks
- actions

Required actions:

- Add component line
- Remove component line
- Duplicate line
- Open component item
- Add substitute/alternate
- Save draft
- Submit
- Approve
- Release
- Clone revision
- View audit
- Compare revision
- Print/export if supported, otherwise disabled with reason

### Rules

- Released BOM cannot be edited directly.
- Revisions/effectivity must be respected.
- Component item, UOM, operation link, warehouse, bin, substitute group, reason code must be governed selectors.
- Quantity and scrap must be numeric.
- Save/reopen must preserve all lines.
- BOM cannot be planning-ready until valid and released.

## Routing Requirements

### Header

Must include:

- routing number
- output item lookup
- routing revision
- routing name
- plant/branch
- default BOM
- status
- effective from/to
- change number / ECO

### Operation Grid

Must include:

- operation sequence
- operation standard lookup
- operation name
- work center lookup
- machine lookup
- setup minutes
- run minutes / unit
- teardown minutes
- queue time
- move time
- overlap %
- yield %
- QC checkpoint flag
- outside processing flag
- supplier if outside processing
- control key
- cost category
- operation status
- actions

Required actions:

- Add operation
- Remove operation
- Duplicate operation
- Reorder operation
- Save draft
- Submit
- Approve
- Release
- Clone revision
- View audit

### Rules

- Operation lines must be grid/table based.
- No stacked operation cards for desktop.
- Work center/machine/resource fields must be selectors.
- Setup/run/teardown/queue/move/overlap/yield must be numeric.
- Released routing cannot be edited directly.
- Routing must be version/effectivity controlled.

## Operation Standards

Must provide reusable operation definitions with:

- operation code
- operation name
- default work center
- default setup minutes
- default run minutes
- QC required
- skill/resource requirement
- active flag
- audit

Operation standards must be selectable from routing operation rows. Routing operations must not depend on loose text when an operation standard exists.

## Alternate Items

Must include:

- parent item
- alternate item
- substitution type
- priority
- conversion factor
- effectivity
- reason code
- approval status

Alternates must not be loose text.

## Engineering Documents

Must include:

- document number
- document type
- title
- linked item / BOM / routing / ECO
- revision
- file upload or disabled reason
- current document flag
- approval/release/obsolete status
- audit

Upload must be real or disabled with reason. No fake upload action.

## ECO / Change Order

Must support:

- ECO number
- change type
- reason
- priority
- requested by
- owner
- affected item/BOM/routing/document
- proposed effective date
- impact summary
- affected object grid
- approval status
- implementation status

Required workflow:

1. Create ECO draft
2. Add affected objects
3. Run/review impact analysis
4. Submit for approval
5. Approve/reject/request changes
6. Implement with effective date
7. Lock old revision and activate new revision where applicable

ECO cannot be only an approval list. It must carry affected object and impact data.

## Impact Analysis

Must include where possible:

- where-used BOMs
- open work orders
- open sales orders
- open purchase orders
- stock on hand
- planning impact
- quality impact
- cost impact
- document impact

If impact data is not available, the action must be disabled with reason.

## Anti-Patterns

This pack fails if:

- BOM/routing line entry is card-per-line on desktop.
- code saves only `components[0]` or `operations[0]`.
- released structures are directly editable.
- release/approve buttons are fake.
- item/UOM/work center/machine selectors are free text.
- numeric fields are unrestricted text.
- ECO has no affected-object grid.
- ECO approval can happen without impact review or waiver.
- document upload appears active without a storage workflow.
- linked-record actions open blank/generic routes.
- BOM comparison is static/fake.

## Required Tests

Tests must prove:

- BOM can add/remove/save/reopen multiple component lines.
- BOM release locks direct edit.
- BOM clone/new revision preserves lines.
- Routing can add/remove/save/reopen multiple operation lines.
- Routing release locks direct edit.
- ECO requires affected object and impact review.
- ECO implementation creates/activates new revision/effectivity.
- Engineering document upload is real or disabled with reason.
- Operation standard and work center are selectors.
- No desktop card-line editor remains for engineering line entry.

## Required Screenshots

Capture:

- BOM Library
- BOM Editor with component grid
- BOM component line add/remove
- BOM released/locked state
- Routing Library
- Routing Editor with operation grid
- Routing add/remove operation
- Operation Standards
- Alternate Items
- Engineering Documents
- ECO create/detail
- ECO impact analysis
- ECO approval/implementation or disabled reason

If a screen scrolls, max three screenshots: top, middle, bottom.

## Validation

Run:

```text
npm run typecheck
npm test
npm run build
npm run build:host
dotnet build src/server/STS.Mfg.sln
dotnet test src/server/STS.Mfg.sln --no-build
dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release
```

If audit scripts exist, run `npm run audit:erp-completion`.
