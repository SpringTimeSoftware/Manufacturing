# Runnable Foundation Cutline

## Now Runnable After This Wave

| Domain | Cutline result |
| --- | --- |
| Platform audit/localization/notification outbox | SQL-backed foundation exists; auth remains bootstrap-code backed. |
| Platform admin runtime | User/role visibility, permission matrix reads, workflow/numbering reads, tenant-setting reads, notification inbox, approval workbench, and password-recovery request capture now have SQL-backed foundation endpoints. |
| Organization setup | Company, branch, department, warehouse, bin, and shift APIs have SQL-backed tables and seeds. |
| Measurement setup | UOM classes, UOMs, conversions, profiles, and formulas have SQL-backed tables and minimum measurement seed. |
| Master compatibility | Item, item UOM, barcode, customer, supplier, address, and supplier lead-time tables exist for completed compatibility services. |
| Resource and engineering backbone | Work centers, machines, operations, routings, BOMs, revisions, lines, operations, alternate items, and ECO tables exist. |
| Sales/planning/procurement/inventory | Completed backend APIs have EF table support for quotes, sales orders, forecasts, MPS, MRP, BOQ, PR, PO, subcontract, stock, lots, serials, and cycle counts. |
| Manufacturing execution | Work orders, operations, job cards, job-card events, downtime, production receipts, scrap, and rework tables exist. |
| Quality and dispatch | P065/P066 tables remain present and are now supported by upstream base tables. |
| Integration and AI draft registry | P067 tables remain present and platform seed adds draft-safe registry rows. |

## Still Partial

| Domain | Reason |
| --- | --- |
| Auth administration | Login is runnable and user/role visibility is SQL-backed, but credential validation and user/role mutation still remain bootstrap-code or future prompt-chain work. |
| Dashboard/reporting | EF reads are runnable, but heavy stored-procedure optimization and full report breadth remain later work. |
| Web beyond P083 | Prompt chain is intentionally paused for this runtime-alignment wave; P084 and later screens were not executed. |

## Still Demo-Only Or Blocked

| Area | Cutline |
| --- | --- |
| Forgot password completion | Request capture exists; signed reset completion and external delivery remain future work. |
| Notification delivery sync | Inbox read/acknowledgment exists; external delivery reconciliation remains on outbox/provider work. |
| Approval workflow engine | Decision capture exists; full workflow routing and mutation remain future work. |
| User/role/permission writes | Read foundation exists; write administration remains future prompt-chain work. |
| Workflow/numbering/tenant settings writes | Read foundation exists; save/mutation flows remain future prompt-chain work. |
| Costing and landed cost | Guardrails block finalization here. |
| HR/payroll/full accounting | Out of V1 scope. |

## Next Recommended Path

If validation passes, resume the normal prompt chain at:

`/02-prompts/P084_uom-class-and-conversion-screens.md`

Do not execute `P084` inside this runtime-alignment wave. Resume that prompt only when the normal prompt chain is explicitly restarted.
