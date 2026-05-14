# BOM / Routing / ECO / Engineering Documents Completion Pack V1

This pack is the detailed completion contract for the engineering/product-data layer of the Manufacturing ERP.

It must be run after:
1. Item / Product Master
2. Customer / Dealer / Distributor Master
3. Supplier / Vendor Master
4. Transaction Line Grid Standardization
5. Quote / Sales Order / Forecast / ATP
6. Procure-to-Pay

## Files

- `BOM_ROUTING_ECO_ENGINEERING_DOCUMENTS_BENCHMARK_V1.xlsx`
  - source-backed benchmark, target field catalog, screen DoD, action contract, workflow contract, tests, anti-patterns, current mapping template, gap template, execution queue.

- `BOM_ROUTING_ECO_ENGINEERING_DOCUMENTS_COMPLETION_SPEC.md`
  - completion rules for BOM, routing, operation standards, alternates, engineering documents, ECO, and impact analysis.

- `BOM_ROUTING_ECO_ENGINEERING_DOCUMENTS_CODEX_PROMPT.txt`
  - strict Codex execution prompt.

## Core rule

Engineering structures are not complete unless BOM/routing/ECO behavior is real:

- BOM must support multiline component grid, operation links, revision/effectivity, approval/release, clone/new revision, save/reopen.
- Routing must support multiline operation grid, work center/machine/resource/time/QC/OSP fields, approval/release, save/reopen.
- ECO must support affected object grid, impact analysis, approval, implementation/effectivity.
- Engineering documents must be real upload/version/current-document workflow or disabled with reason.
- Desktop line entry must use compact editable grids/tables, not stacked cards.
- Released structures must be locked; changes must go through clone/revision/ECO.

Do not mark this pack complete unless validation, tests, screenshots, and the review pack are produced.
