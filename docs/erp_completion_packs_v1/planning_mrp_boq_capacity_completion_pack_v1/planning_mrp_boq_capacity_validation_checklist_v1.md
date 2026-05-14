# Planning / MPS / MRP / BOQ / Capacity Validation Checklist v1

Use this checklist after Codex implementation.

## Workbook and pack

- [ ] Workbook exists at `C:\StsPackages\Manufacturing_ERP\docs\erp_completion_packs_v1\planning_mrp_boq_capacity_completion_pack_v1\planning_mrp_boq_capacity_benchmark_workbook_v1.xlsx`
- [ ] `Vendor_Benchmark` has 178 rows with Source_ID and Source_URL
- [ ] `Target_Field_Catalog` has 547 field rules
- [ ] `Current_Mapping` is updated with UI/API/DB/current status
- [ ] `Gap_Template` is updated with severity, owner and evidence
- [ ] `Action_Contract`, `Workflow_Contract`, `Test_Cases`, `Anti_Patterns`, `Screenshot_Gates`, `Completion_Gates` are not deleted or diluted

## Functional validation

- [ ] Plan definition create/edit/save/reopen works
- [ ] MPS grid supports 3+ lines, Add Line, Remove Line, edit all, validate all, save all, reopen all
- [ ] Forecast import is real or disabled with reason
- [ ] Forecast consumption/reduction shows before/after impact
- [ ] MRP run dialog has all required parameters
- [ ] MRP execution creates run history and snapshots
- [ ] Snapshot compare/delta works
- [ ] BOQ/net requirements show multilevel BOM path and gross/net/shortage/projected balance
- [ ] Pegging drilldown uses real demand/supply IDs
- [ ] Planned purchase/work/transfer orders are type-specific
- [ ] Manual planned order creation validates item/location/type/dates/qty
- [ ] Firm planned order survives rerun and nets correctly
- [ ] Conversion to PR/PO/WO/transfer creates real target document or is disabled with reason
- [ ] Bulk conversion validates all selected rows and shows per-row result
- [ ] Exception workbench has typed exceptions and actionable suggestions
- [ ] Shortage actions have lifecycle and target document/action
- [ ] Capacity board shows available/required/overload/slack/source operations
- [ ] Machine board and stage board are real or disabled with reason for unsupported actions
- [ ] Audit trail shows before/after values for critical actions

## Lookup/numeric truth

- [ ] Item, UOM, plant, warehouse, bin, MRP area, customer, supplier, supplier site are lookup-backed
- [ ] BOM, routing, operation, stage, work center, machine, resource, operator/skill are lookup-backed
- [ ] planner, reason code, status, priority, severity, planning rule group, coverage group, procurement type are lookup-backed
- [ ] Quantity, conversion, lot, safety stock, lead time, setup/run/queue/move/capacity values are numeric controls and server validated
- [ ] Date/time fields use date/time controls and server validation
- [ ] Invalid free-text and invalid decimals fail before save

## Anti-pattern scans

- [ ] No `lines[0]` or `firstLine` planning save logic
- [ ] No first-line-only totals
- [ ] No card-per-line desktop editable planning grids
- [ ] No fake upload/export/print/send actions
- [ ] No numeric planning fields as unrestricted text
- [ ] No governed master-linked planning fields as free text
- [ ] No silent seeded/demo operational data in live mode
- [ ] No right drawer for deep create/edit planning workspaces

## Evidence

- [ ] Required screenshots captured under `review/screenshots`
- [ ] Test output saved under `review/test_output`
- [ ] Scan logs saved under `review/scan_logs`
- [ ] API contract summary exists
- [ ] DB migration summary exists
- [ ] Manual QA checklist exists
- [ ] Commit hash exists
- [ ] P0 completion gates are all PASS

