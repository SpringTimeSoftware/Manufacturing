# START HERE — Inventory / Warehouse / Traceability Completion Pack v1

You are working in the Manufacturing ERP repository.

Repository:
https://github.com/SpringTimeSoftware/Manufacturing

Local path:
C:\StsPackages\Manufacturing_ERP

Pack folder:
C:\StsPackages\Manufacturing_ERP\docs\erp_completion_packs_v1\inventory_warehouse_traceability_completion_pack_v1

Binding workbook:
C:\StsPackages\Manufacturing_ERP\docs\erp_completion_packs_v1\inventory_warehouse_traceability_completion_pack_v1\inventory_warehouse_traceability_benchmark_workbook_v1.xlsx

Completion spec:
C:\StsPackages\Manufacturing_ERP\docs\erp_completion_packs_v1\inventory_warehouse_traceability_completion_pack_v1\inventory_warehouse_traceability_completion_spec_v1.md

## Non-negotiable rule

The workbook is the contract. Do not infer ERP depth from headings. Do not implement representative/sample-only rows. Every P0 field, action, workflow, test, screenshot, anti-pattern scan, and completion gate must be handled with evidence.

## Required execution sequence

1. Scan the current repo:
   - ASP.NET Core / C# backend/API/host
   - React + TypeScript web app
   - SQL Server schema/migrations/data access
   - tests
   - seeded/demo data
   - menus/routes/screens
   - mobile/barcode/offline code if present

2. Before implementation, update the workbook:
   - Fill `Current_Mapping`
   - Fill `Gap_Template`
   - Identify screens/components/API endpoints/DB tables/tests for each inventory/warehouse area
   - Mark missing areas explicitly

3. Write failing tests first:
   - field lookup truth tests
   - numeric/date truth tests
   - movement line grid save/reopen tests
   - API validation tests
   - stock ledger/on-hand reconciliation tests
   - lot/serial/license plate integrity tests
   - cycle count/physical inventory workflow tests
   - traceability tests
   - barcode scan validation tests where visible
   - RBAC/maker-checker tests
   - no seeded operational data tests
   - anti-pattern scan tests

4. Implement or retrofit the module:
   - inventory dashboard with real KPIs
   - on-hand by item/warehouse/bin/lot/serial/license plate/status
   - warehouse master
   - zone/aisle/rack/shelf/bin master
   - item warehouse controls
   - stock ledger and movement history
   - material issue
   - material return
   - stock transfer
   - bin-to-bin movement
   - stock adjustment with reason/approval
   - quality hold/release status control
   - cycle count plan/work/mobile entry/variance/approval/posting
   - physical inventory document/freeze/count/post/close
   - lot/batch master and balance
   - serial master and lifecycle
   - license plate / handling unit / PCID pack/unpack/split/merge/move
   - forward and backward traceability
   - recall impact report
   - mobile barcode scan validation where visible
   - attachments/photos/barcode label print/export where visible
   - RBAC/audit trail

5. Enforce lookup truth:
   These must not be free text:
   - item/product
   - item revision
   - UOM
   - site/plant
   - warehouse
   - zone
   - aisle/rack/shelf/bin/locator
   - inventory status
   - quality status
   - lot/batch
   - serial
   - license plate / handling unit / PCID
   - owner/consignment partner
   - supplier
   - customer
   - production order/job
   - GRN/PO/dispatch/source document
   - QC inspection
   - NCR
   - CoA
   - reason code
   - barcode template
   - GL/cost account
   - user/operator/approver/role

6. Enforce numeric/date truth:
   These must not be unrestricted text:
   - physical quantity
   - available quantity
   - reserved quantity
   - allocated quantity
   - picked quantity
   - blocked quantity
   - hold quantity
   - count quantity
   - variance quantity
   - variance %
   - unit cost
   - stock value
   - weight
   - volume
   - capacity
   - min/max/reorder/safety stock
   - UOM conversion factor
   - lead time
   - stock age days
   - expiry/manufacture/retest dates
   - scan timestamp
   - posting date

7. Enforce desktop transaction line grid standard:
   Stock documents must use compact editable grids on desktop:
   - material issue
   - material return
   - stock transfer
   - bin movement
   - adjustment
   - cycle count
   - physical inventory
   - quality hold/release
   - scrap/rework
   - production receipt
   - license plate pack/unpack

   Required:
   - header
   - compact editable line grid
   - Add Line
   - Remove Line
   - edit all lines
   - validate all lines
   - save all lines
   - reopen all lines
   - totals/variance from all lines

   Reject:
   - `lines[0]`
   - `firstLine`
   - one-line-only saves
   - card-per-line desktop entry
   - totals from first line only
   - no Add Line
   - no Remove Line

8. Implement real action truth:
   Every visible action must be one of:
   - working
   - disabled with reason
   - hidden by RBAC/status

   Visible dead actions are P0 failures.

9. Implement upload/barcode/export truth:
   Every visible upload/photo/barcode/print/export action must be real or disabled with reason. No fake upload, fake barcode scan, fake PDF, placeholder export, or dummy label.

10. Protect live data:
   Authenticated live mode must not silently show seeded/demo operational stock, lots, serials, movement ledgers, count documents, or dashboard KPIs.

11. Capture evidence:
   - All `Screenshot_Gates`
   - Test logs
   - Build/lint/typecheck logs
   - Anti-pattern scan logs
   - API/DB evidence for stock ledger, on-hand, traceability, and count posting
   - Updated workbook evidence columns
   - Review pack

12. Finalize:
   - Do not commit until every P0 `Completion_Gates` row passes.
   - Commit and push with a clear summary only after evidence is complete.
   - Create the review pack in the repo under the pack/review evidence folder.

## Required anti-pattern scans

Run scans for these patterns and variants:

- `lines[0]`
- `firstLine`
- `First quote line`
- first stock line only
- no Add Line
- no Remove Line
- card-per-line desktop transaction
- fake upload
- fake barcode
- fake export
- placeholder PDF
- demo inventory
- seeded on-hand
- hardcoded lot
- hardcoded serial
- quantity as string
- unit cost as string
- free text warehouse
- free text bin
- free text UOM
- free text reason
- dead button
- disabled button without reason
- right drawer deep edit
- hardcoded dashboard KPI
- trace only current stock
- orphan serial
- orphan license plate
- expired lot selectable
- blocked stock available

## Required final response from Codex

Return:
1. Summary of implemented inventory/warehouse/traceability areas.
2. Workbook updates made.
3. Tests added/updated and pass/fail logs.
4. Screenshots captured.
5. Anti-pattern scan results.
6. Review pack path.
7. Commit SHA.
8. Any remaining P1/P2 gaps with reasons.

Do not summarize the pack instead of executing it.
Do not claim complete without evidence.
