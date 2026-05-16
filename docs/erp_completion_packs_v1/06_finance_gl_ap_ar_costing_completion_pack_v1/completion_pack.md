# Finance / GL / AP / AR / Costing Completion Pack v1

    ## Mission

    Close ERP financial truth: chart of accounts, tax, AP/AR, journal posting, inventory valuation, landed cost, COGS/WIP costing, payment schedules, commercial price/discount/tax propagation, and period controls.

    ## Pack Classification

    - Pack number: 06
    - Folder: `finance_gl_ap_ar_costing_completion_pack_v1`
    - Wave: Wave 1
    - Completion level expected: P0 real implementation for touched scope, P1/P2 only if explicitly marked out of scope with reason.

    ## Modules in Scope

    - Chart of accounts
- Tax engine
- AP invoice and matching
- AR invoice and receipts
- GL journals
- Cost centers
- Inventory valuation
- Landed cost
- WIP/COGS costing
- Credit/debit notes
- Period close

    ## Business Decisions to Confirm

    Codex can start with conservative defaults, but these decisions must be captured in the final report.

    - Valuation method: weighted average, FIFO, standard cost, batch actual, or hybrid?
- GL posting depth: full ledger now or subledger/accounting bridge with export?
- GST/tax scope: Indian GST only, export/SEZ rules, TDS/TCS, multi-country later?
- Are quote/SO price overrides allowed, and who approves them?

    ## Conservative Defaults if No Decision Is Provided

    - Use accounting bridge/subledger with COA mapping first; full GL posting where repo already supports it.
- Use weighted average for inventory unless item explicitly has standard cost.
- Use effective-dated price lists, discount schemes, tax codes, and charge rules with locked document snapshots.
- Use maker/checker for manual journals, credit notes, debit notes, tax override, and period reopening.

    ## Core Data Entities / Tables to Inspect or Add

    The exact names should follow repository conventions. Do not blindly create duplicate tables if equivalent entities already exist.

    - chart_account
- fiscal_period
- tax_code
- tax_rate
- price_list
- price_list_line
- discount_scheme
- commercial_charge
- ap_invoice
- ar_invoice
- payment_schedule
- gl_journal
- subledger_entry
- inventory_valuation_layer
- cost_rollup
- landed_cost_doc
- sales_commission_owner

    ## Transaction Workflows to Implement or Complete

    - Quote/SO commercial calculation
- PO/GRN/supplier invoice matching
- AP liability and payment schedule
- AR invoice and receipt allocation
- Inventory receipt/issue valuation
- Landed cost allocation
- Production WIP issue/receipt costing
- Journal posting and reversal
- Credit/debit note

    ## Required Screens / UI Surfaces

    - Finance workspace
- COA and fiscal period setup
- Tax/price/discount/charge setup
- AP invoice/matching workbench
- AR invoice/receipt workbench
- Journal entry grid
- Inventory valuation report
- Cost rollup screen
- Commercial audit screen for quote/SO/invoice

    ## Cross-Module Contracts

    - Sales: salesman/owner, internal remarks, external remarks, price list, discount, tax, freight/add-less/round-off must be present and persisted in quote/SO.
- Procurement: AP liability, GRN/supplier invoice match, landed cost, vendor return debit.
- Inventory: valuation layers, adjustment approvals, COGS.
- Production: WIP, scrap/rework cost, output receipt valuation.
- Reports: trial balance, AP aging, AR aging, tax summary, margin by order/item/customer/salesperson.
- Dispatch: invoice/dispatch charge and tax consistency.

    ## Non-Negotiable Fixes for This Pack

    - Quote and sales order must have salesperson/sales owner and remarks fields; if already in customer master they must still snapshot onto document header/line where needed.
- Price and discount must be picked from effective-dated rules, snapshotted, override-audited, and recalculated only when user explicitly refreshes pricing.
- Tax must calculate from tax code, place/supply/customer/item/HSN/GST category where configured, charges inclusion, rounding, and document date.
- Revisions of quotes, SOs, POs, BOM/routing, and released documents must apply to linked transactions through explicit revision references, not silent latest-version use.
- Every posting must produce a traceable subledger/accounting entry or explicit in-scope blocked reason.

    ## Implementation Requirements

    ### Backend

    - Add or update migrations/schema/entities following current repo conventions.
    - Implement service-layer methods rather than hiding business rules in UI components.
    - Add validation for lifecycle status, role, numeric ranges, required fields, cross-entity references, and effective dates.
    - Add audit trail for state-changing actions.
    - Add idempotency where external/mobile/offline or retryable operations are involved.
    - Ensure failure paths return actionable error messages.

    ### Frontend

    - Use existing ERP layout, form, selector, modal, toast, and transaction-grid components.
    - Use governed selectors for governed fields.
    - Use numeric controls for numeric fields.
    - Keep save/reopen behavior reliable after refresh.
    - Show blocked actions with exact prerequisite, not vague text.
    - Preserve existing responsive/mobile behavior.

    ### Documents / Attachments / Reports

    - Use the shared attachment/document-output engine if available.
    - If not available and the feature is P0, implement the minimum real metadata/output path required for this pack.
    - Generated outputs must record template/version, requester, filters/entity, file metadata, and reissue/export log.

    ### Security and Audit

    - Enforce role-based access for create/edit/approve/post/cancel/reopen/export/send actions.
    - Store actor, timestamp, reason, prior state, next state, and related entity references for state transitions.
    - Do not leak restricted finance/customer/supplier/service data in reports, integrations, AI, or exports.

    ## Acceptance Tests Required

    - Create quote with customer price list, discount, tax, charges, remarks, salesperson; convert/order or save SO; verify snapshots.
- Change price list after SO; verify old SO remains locked unless repriced with audit.
- Create GRN→supplier invoice 3-way match; post AP liability/payment schedule/subledger.
- Create production material issue/receipt and verify WIP/cost movement or bridge entries.
- Allocate landed cost by quantity/value/manual split and verify inventory valuation impact.
- Run tax summary and margin report; verify totals reconcile to documents.

    ## P0 Completion Gate

    This pack is not P0-complete until:

    - all P0 screens open without runtime errors;
    - every P0 action is real or explicitly outside P0;
    - all added fields persist and reopen;
    - all line grids calculate and save all lines;
    - linked transactions carry correct source references and revisions;
    - attachments/documents/reports are not fake;
    - tests/audits are run and reported;
    - a residual gap report is produced.