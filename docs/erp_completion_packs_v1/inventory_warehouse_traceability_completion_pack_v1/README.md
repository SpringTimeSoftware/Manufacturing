# inventory_warehouse_traceability_completion_pack_v1

This is the next Manufacturing ERP completion pack after Planning/MRP/BOQ/Capacity and Production/Shop Floor.

## Use this first

Give Codex the plain text file:

```text
inventory_warehouse_traceability_completion_pack_v1\START_HERE_CODEX_PROMPT.txt
```

Recommended repo placement:

```text
C:\StsPackages\Manufacturing_ERP\docs\erp_completion_packs_v1\inventory_warehouse_traceability_completion_pack_v1
```

## Files

- `START_HERE_CODEX_PROMPT.txt` — plain text prompt to paste into Codex
- `inventory_warehouse_traceability_benchmark_workbook_v1.xlsx` — binding benchmark and implementation workbook
- `inventory_warehouse_traceability_completion_spec_v1.md` — detailed completion specification
- `inventory_warehouse_traceability_codex_execution_prompt_v1.md` — markdown version of Codex prompt
- `inventory_warehouse_traceability_validation_checklist_v1.md` — validation checklist
- `inventory_warehouse_traceability_invalid_output_rules_v1.md` — invalid output rules
- `anti_pattern_scan_queries.txt` — scan commands and patterns
- `inventory_warehouse_traceability_review_pack_template_v1.md` — review pack template
- `inventory_warehouse_traceability_pack_manifest.json` — artifact manifest

## Workbook sheets

- Index
- Source_References
- Vendor_Benchmark
- Target_Field_Catalog
- Inventory_Ledger_Rules
- Warehouse_Bin_Rules
- Traceability_Rules
- Counting_Adjustment_Rules
- Mobile_Barcode_Rules
- Action_Contract
- Workflow_Contract
- Lookup_Numeric_Truth
- Current_Mapping
- Gap_Template
- Test_Cases
- Anti_Patterns
- Screenshot_Gates
- Completion_Gates
- Invalid_Output_Rules
- Review_Pack_Template

## Counts

- Vendor benchmark rows: 250
- Target field rules: 505
- Action contract rows: 164
- Workflow contract rows: 44
- Lookup / numeric truth rows: 420
- Test cases: 753
- Anti-pattern rows: 40
- Screenshot gates: 28
- Completion gates: 26
- Invalid output rules: 42

## Completion standard

Codex must not call the module complete until:

- Current mapping is filled.
- Gap template is filled.
- P0 fields are implemented or explicitly dispositioned.
- Lookup truth and numeric truth are enforced.
- Stock documents use compact editable desktop line grids.
- No visible actions are dead.
- No fake upload/barcode/export/print actions remain.
- Stock ledger, on-hand, lot/serial/LP traceability, count, and status workflows are tested.
- Screenshots, test logs, scan logs, and review evidence are captured.
