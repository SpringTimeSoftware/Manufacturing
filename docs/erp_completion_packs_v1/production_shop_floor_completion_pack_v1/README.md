# production_shop_floor_completion_pack_v1

This pack is the **Production / Shop Floor / Work Order / Job Card / MES-lite Completion Pack** for the Manufacturing ERP project.

It is designed to run after:

1. `transaction_line_grid_standardization_pack_v1`
2. `bom_routing_eco_engineering_documents_completion_pack_v1`
3. `planning_mrp_boq_capacity_completion_pack_v1`

## Scope

This pack covers:

- Production order / work order creation, release, hold, resume, cancellation, correction and close.
- Planned-order / demand handoff into production order execution.
- Work order header, copied BOM/component requirements, copied routing/operation execution lines.
- Job card / traveler generation, print logs, document visibility, barcode/QR scan behavior.
- Shop-floor dispatch board by plant, work area, work center and machine.
- Operator terminal / production floor execution flow.
- Material issue, backflush, return, shortage action and substitute consumption.
- Operation confirmations with yield, scrap, rework, reject, setup time, labor time and machine time.
- Labor/machine registrations, time approval and cost transfer states.
- Machine status, downtime and OEE input capture.
- Production receipt, partial receipt, WIP/cost status and work order close gating.
- Lot/serial/bin/warehouse traceability handoff required for the later inventory/traceability pack.
- Quality/inspection/NCR handoff required for the later quality pack.
- RBAC, no dead actions, no fake seeded live data, no fake upload/document actions.
- Screenshot, test, scan and review-pack evidence gates.

## Files

- `production_shop_floor_benchmark_workbook_v1.xlsx`
- `production_shop_floor_completion_spec_v1.md`
- `production_shop_floor_codex_execution_prompt_v1.md`
- `START_HERE_CODEX_PROMPT.txt`
- `production_shop_floor_validation_checklist_v1.md`
- `production_shop_floor_invalid_output_rules_v1.md`
- `production_shop_floor_pack_manifest.json`
- `anti_pattern_scan_queries.txt`

## Workbook counts

| Area | Count |
|---|---:|
| Vendor benchmark rows | 200 |
| Target field rules | 374 |
| Action contract rows | 105 |
| Workflow contract rows | 44 |
| Test cases | 494 |
| Lookup / numeric truth rows | 331 |
| Anti-pattern rows | 30 |
| Screenshot gates | 25 |
| Completion gates | 25 |
| Invalid output rules | 40 |

## Source-backed benchmark references

- SAP_PROD_LIFECYCLE: Executing the Various Steps of Production Order Processing — https://learning.sap.com/courses/manage-production-orders-in-sap-s-4hana-manufacturing/executing-the-various-steps-of-production-order-processing
- SAP_GOODS_ISSUE: Posting Goods Issues for Production Orders — https://learning.sap.com/courses/manage-production-orders-in-sap-s-4hana-manufacturing/posting-goods-issues-for-production-orders
- SAP_CONFIRMATION: Posting Confirmations for Production Orders — https://learning.sap.com/courses/manage-production-orders-in-sap-s-4hana-manufacturing/posting-confirmations-for-production-orders
- ORACLE_EXECUTION: Overview of Production Execution Tasks — https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/25a/faumf/overview-of-production-execution-tasks.html
- ORACLE_DISPATCH: How You Review a Dispatch List — https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/faumf/how-you-review-a-dispatch-list.html
- ORACLE_DISPATCH_API: Work Order Dispatch Lists REST Endpoints — https://docs.oracle.com/en/cloud/saas/supply-chain-and-manufacturing/26b/fasrp/api-manufacturing-work-order-dispatch-lists.html
- MS_REGISTRATION: Registration for manufacturing execution — https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/registration-manufacturing-execution
- MS_PFE_CONFIG: Configure the production floor execution interface — https://learn.microsoft.com/en-us/dynamics365/supply-chain/production-control/production-floor-execution-configure
- NETSUITE_ROUTING: Manufacturing Routing and Work Orders — https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/section_N2346224.html
- NETSUITE_WIP: Manufacturing Work In Process (WIP) — https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_N2335392.html
- NETSUITE_WIP_ROUTINGS: NetSuite WIP and Routings Data Sheet — https://www.netsuite.com/portal/collateral/public/ds-ns-wip-and-routings.pdf
- EPICOR_PRODUCTION: Kinetic Production Management — https://www.epicor.com/en/products/enterprise-resource-planning-erp/kinetic/production-management/
- EPICOR_MANUFACTURING: Manufacturing ERP Software for Modern Operations — https://www.epicor.com/en/solutions/industries/manufacturing/

## Completion rule

Do not call this module complete unless:

- `Current_Mapping` is filled from repo scan.
- `Gap_Template` is filled before implementation.
- P0 tests are written first and passing after implementation.
- All visible actions are working, disabled with reason, or hidden.
- Governed fields are lookups, not free text.
- Numeric/date/time fields are typed and validated, not text.
- Material/component and operation transaction lines support multi-line compact editable grids on desktop.
- No `lines[0]`, `firstLine`, one-line-only save, card-per-line desktop transaction edit, fake upload, fake print, fake seeded operational data or UI-only status change remains.
- Required screenshots, scan logs, test logs and API/DB evidence are included in the review pack.
