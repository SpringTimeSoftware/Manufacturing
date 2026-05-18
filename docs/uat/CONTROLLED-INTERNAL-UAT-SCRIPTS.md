# Controlled Internal UAT Scripts

Purpose: run role-wise controlled internal UAT using real UAT master data. Record every failed step in `docs/uat/UAT-BLOCKER-REGISTER.md`.

Severity:
- P0: blocks UAT continuation.
- P1: blocks workflow acceptance.
- P2: workaround acceptable with written approval.
- P3: cosmetic or enhancement.

Evidence required for every script:
- Screenshot of start screen, transaction workspace, posted/released status, and report/output ledger where applicable.
- Document numbers and source references created.
- User role and device/provider/runtime used.

## 1. Admin Setup UAT

Objective: prove company, branch, users, roles, permissions, device trust, and core setup screens are usable.

Prerequisite master data: company, branch, fiscal year/period, test users, roles, warehouses, bins.

User role: Admin / Super Admin.

Steps:
1. Sign in as UAT Admin.
2. Confirm active company/branch context.
3. Create or verify sales, procurement, warehouse, production, quality, dispatch, finance, service, report, integration, mobile, and UDF users.
4. Assign role permissions for each workflow owner.
5. Verify warehouse/bin, fiscal period, and report permission screens.
6. Register one mobile device and mark it trusted; mark another revoked if available.

Expected result:
- Users and roles persist.
- Unauthorized actions are hidden or disabled with reasons.
- Trusted/revoked device status is visible.

Data records to create:
- UAT role set.
- UAT users per domain.
- UAT mobile device registration.

Pass/fail criteria:
- PASS if all users can sign in and access only assigned domains.
- P0 if login or role access blocks all scripts.
- P1 if one domain role cannot execute its workflow.

## 2. Sales-to-Cash UAT

Objective: prove customer defaults, quote commercial snapshot, quote-to-SO exact copy, dispatch, POD, AR invoice, GL/AR/tax, report output, send ledger, and UDF continuity.

Prerequisite master data:
- Customer with commercial defaults.
- Active price list, discount scheme, payment terms, tax code/rate, currency, sales owner.
- Stock-controlled item with bin/lot/serial/PCID policy as applicable.
- Open fiscal period and finance posting profiles.
- Dispatch staging bin.
- Email provider sandbox or missing-config boundary.
- UDF placement for customer/quote/SO/dispatch if included in UAT.

User roles: Sales, Dispatch, Warehouse, Finance, Report Viewer, Integration Admin.

Steps:
1. Create or open customer with sales owner, price list, discount, tax, payment terms, currency, and UDF values.
2. Create quote for the customer.
3. Verify salesperson, internal remarks, customer-facing/print remarks, price list, discount scheme, tax treatment, payment terms, currency, freight/packing/insurance/other/add-less/round-off, and line remarks.
4. Add at least three quote lines; include item, UOM, quantity, price/discount/tax, and line UDF where configured.
5. Save quote and reopen.
6. Release quote.
7. Attempt to mutate released commercial fields; verify lock or reopen/audit requirement.
8. Convert quote to SO.
9. Verify SO source quote id/revision and exact commercial snapshot values.
10. Create dispatch/shipment from SO.
11. Pick/pack/ship using required bin/lot/serial/PCID selectors.
12. Record POD with receiver/date/remarks and evidence metadata if available.
13. Create AR invoice from eligible dispatch/POD.
14. Post or verify AR/GL/tax entries from persisted invoice snapshot.
15. Run quote/SO/dispatch/AR report and verify generated output history.
16. Send or queue email/WhatsApp/SMS if sandbox credentials exist; otherwise verify clear missing-config block.
17. Verify UDF values remain visible/reportable and no commercial recalculation occurs after release.

Expected result:
- Quote release stores immutable snapshot.
- SO exact-copies released quote values.
- Dispatch uses shared inventory validation.
- POD persists.
- AR invoice uses dispatch/SO snapshot and creates ledger entries.
- Report output is durable and download-audited.
- Send action creates outbound ledger or blocks with credential reason.

Data records to create:
- Customer UAT-S2C.
- Quote UAT-Q-001.
- SO UAT-SO-001.
- Dispatch UAT-DISP-001.
- POD UAT-POD-001.
- AR invoice UAT-AR-001.

Pass/fail criteria:
- P0 if quote release, exact conversion, inventory posting, or AR posting fails.
- P1 if UDF/report/send evidence is missing.
- P2 if provider send is blocked due missing sandbox credentials with clear reason.

## 3. Procure-to-Pay UAT

Objective: prove supplier/RFQ/quote comparison/PO/GRN/supplier invoice/AP/tax/valuation reporting.

Prerequisite master data:
- Approved supplier with contacts/sites/tax/payment terms.
- Item, UOM, warehouse, receiving bin, tax setup.
- Finance posting profiles for AP, GRIR, input tax, inventory.
- Open fiscal period.

User roles: Procurement, Warehouse, Quality if inspection required, Finance.

Steps:
1. Create RFQ for at least two suppliers and two material lines.
2. Send RFQ if integration provider exists; otherwise confirm disabled/missing-config reason.
3. Record supplier quotation responses with price, discount, tax, lead time, and remarks.
4. Run quote comparison and select winning supplier with reason.
5. Convert selected quote to PO.
6. Receive against PO through GRN.
7. Trigger incoming QC if required.
8. Create supplier invoice and perform matching.
9. Post AP invoice where mappings and period allow.
10. Verify AP subledger, GL, input tax ledger, and inventory valuation.
11. Run GRN/AP/valuation reports.

Expected result:
- RFQ/quotation/PO lines persist and reopen.
- AP posting uses governed posting profiles.
- No hardcoded account fallback.
- Reports read persisted data.

Data records to create:
- RFQ UAT-RFQ-001.
- Supplier quotes UAT-SQ-A/B.
- PO UAT-PO-001.
- GRN UAT-GRN-001.
- Supplier invoice UAT-AP-001.

Pass/fail criteria:
- P0 if PO/GRN/AP posting cannot complete with valid setup.
- P1 if quote comparison or valuation/report evidence fails.
- P2 if supplier send is blocked by missing provider credentials with clear reason.

## 4. Inventory Traceability UAT

Objective: prove tracking dimensions, source/revision snapshots, quality hold blocking, and reports.

Prerequisite master data:
- Stock-controlled item with configured bin/lot/serial/PCID policy.
- Active warehouse/bin, lot/serial/PCID records or receipt process.
- Quality status policy.

User roles: Warehouse, Quality.

Steps:
1. Post or identify receipt stock with item, warehouse, bin, lot, serial, PCID, status.
2. Perform stock transfer with required tracking dimensions.
3. Perform material issue with required tracking dimensions.
4. Put stock on QualityHold/Blocked.
5. Attempt issue/dispatch/service spare issue from held/blocked stock.
6. Verify server-side rejection and clear reason.
7. Inspect movement ledger for source document, source line, item revision, and tracking grain.
8. Run stock balance and movement report.

Expected result:
- Required bin/lot/serial/PCID cannot be skipped.
- Held/blocked stock cannot be consumed or dispatched.
- Ledger stores source/revision snapshots.

Data records to create:
- Movement UAT-INV-ISSUE-001.
- Transfer UAT-INV-XFER-001.
- Hold transaction UAT-QHOLD-001.

Pass/fail criteria:
- P0 if server allows required tracking to be skipped or held stock to issue.
- P1 if reports do not show tracking grain.

## 5. Production Execution UAT

Objective: prove BOM/routing/work order/job card/material issue/receipt/scrap/rework and costing foundation evidence.

Prerequisite master data:
- Released BOM and routing.
- Work center, machine, production warehouse/WIP policy.
- Inventory for material issue.
- Finance valuation/WIP mappings.

User roles: Production, Warehouse, Finance.

Steps:
1. Create work order from released BOM/routing.
2. Release work order and generate job card.
3. Issue materials to work order using inventory validation.
4. Start/complete job card operation where implemented.
5. Record production receipt.
6. Record scrap/rework if in pilot scope; otherwise verify disabled reason.
7. Verify stock movement, WIP/valuation/cost ledger foundation.
8. Run work order/job card/production issue/receipt reports.

Expected result:
- Work order references released source revisions.
- Material issue/receipt posts through shared inventory service.
- Cost/valuation evidence exists or valuation-pending status is clear.

Pass/fail criteria:
- P0 if material issue or receipt bypasses inventory validation.
- P1 if job card/source revision evidence is missing.

## 6. Quality/NCR/COA UAT

Objective: prove inspection, NCR, CAPA, disposition, COA, and dispatch gate readiness.

Prerequisite master data:
- QC plan and characteristics.
- NCR/CAPA/disposition categories.
- Item/customer COA and final QC policy where applicable.

User roles: Quality, Dispatch.

Steps:
1. Record incoming or final inspection results.
2. Create NCR from failed result.
3. Add CAPA and disposition.
4. Release or block stock per disposition.
5. Generate COA from inspection evidence.
6. Issue/reissue COA.
7. Attempt dispatch where COA/final QC is missing; verify block/warn per policy.
8. Run quality/NCR/COA reports.

Expected result:
- Quality actions persist.
- COA output/register is durable.
- Dispatch gate respects quality status/policy.

Pass/fail criteria:
- P0 if failed quality stock can dispatch when policy blocks it.
- P1 if COA issue/reissue/report evidence fails.

## 7. Dispatch/POD UAT

Objective: prove dispatch advice/shipment, pick/pack/ship, POD, logistics fields, and stock issue.

Prerequisite master data:
- Eligible SO and available stock.
- Dispatch staging bin, carrier/logistics values if used.
- POD policy.

User roles: Dispatch, Warehouse.

Steps:
1. Create shipment/dispatch from open SO line.
2. Verify customer, ship-to, SO/source references, commercial snapshot, logistics fields.
3. Pick required quantities using bin/lot/serial/PCID.
4. Pack shipment; ensure pack cannot exceed picked.
5. Ship; ensure ship cannot exceed packed.
6. Record POD; ensure POD cannot occur before shipment.
7. Record short/damage quantity if applicable.
8. Verify stock issue ledger and SO dispatch balance.
9. Run dispatch/POD reports.

Expected result:
- No local-only pick/pack/ship/POD state.
- Stock issue uses shared inventory service.
- POD persists and updates status.

Pass/fail criteria:
- P0 if ship posts without inventory validation or exceeds eligible quantity.
- P1 if POD/report evidence fails.

## 8. Finance/GL/AP/AR/Tax/Valuation UAT

Objective: prove finance foundation with governed accounts, periods, journals, AP, AR, tax, valuation, and reversal rules.

Prerequisite master data:
- COA and posting profiles.
- Fiscal periods.
- AP/AR source documents.
- Tax setup.

User role: Finance.

Steps:
1. Create balanced GL journal and post.
2. Try unbalanced journal; verify failure.
3. Try posting into closed period; verify block.
4. Post AP invoice from supplier invoice.
5. Create AR invoice from dispatch/POD.
6. Verify tax ledger uses document snapshot.
7. Verify valuation entries link stock movements.
8. Run GL/AP/AR/tax/valuation reports.

Expected result:
- Posted journals cannot mutate.
- Reversal creates reversing entries.
- Postings use mapped account IDs.

Pass/fail criteria:
- P0 if unbalanced or closed-period posting succeeds.
- P1 if ledger/report reconciliation fails.

## 9. Reports/Dashboard UAT

Objective: prove registered reports, run history, generated output, permissions, dashboard widgets, and drilldowns.

Prerequisite master data:
- Report definitions active.
- Report permissions assigned.
- Source transactions created by other UAT scripts.

User roles: Report Viewer, Finance Report Viewer, Admin.

Steps:
1. Open report catalog.
2. Run sales, inventory, quality, dispatch, finance, service reports.
3. Verify parameters and invalid date range validation.
4. Verify generated output history and download audit.
5. Open dashboard builder and persisted dashboard.
6. Verify widgets read live datasets and stale/empty states are clear.
7. Verify unauthorized finance report access is blocked.

Expected result:
- Reports read persisted data.
- Generated output records persist.
- Dashboard widgets use registered datasets.

Pass/fail criteria:
- P0 if report download exposes unauthorized data.
- P1 if generated output/run history is missing.

## 10. Integrations/Send/Outbound Ledger UAT

Objective: prove provider truth, outbound ledger, webhook, CRM mapping, and AI review gate.

Prerequisite master data:
- Provider registry configured or intentionally missing for block tests.
- Credential references, templates, recipients.
- Report/generated output to attach where applicable.

User role: Integration Admin.

Steps:
1. Configure sandbox email provider with credential reference.
2. Send quotation/dispatch/invoice/COA/report output where credentials exist.
3. Verify outbound message status, provider message id or failure reason.
4. Test WhatsApp approved template or missing-template block.
5. Test SMS sender configuration or missing-config block.
6. Configure webhook endpoint and dispatch event.
7. Record inbound callback/signature verification if available.
8. Configure CRM mapping and run sync; create conflict scenario.
9. Create AI draft and verify review required before apply/send.

Expected result:
- No fake sent state.
- Missing credentials/config block clearly.
- CRM external ID mappings persist.
- AI cannot auto-post/send.

Pass/fail criteria:
- P0 if fake provider success appears.
- P1 if outbound ledger or failure reason is missing.

## 11. Mobile Scan/Offline/Sync UAT

Objective: prove device trust, scan source, camera/photo metadata, offline queue, idempotent sync, conflict, and live workflow linkage.

Prerequisite master data:
- Trusted mobile device and user scope.
- Items/bins/lots/serials/PCIDs.
- Mobile tasks for inventory, dispatch/POD, quality, service.

User roles: Mobile operator, Technician.

Steps:
1. Register device and mark trusted.
2. Sign in on mobile runtime.
3. Scan item/bin/lot/serial/PCID using hardware scanner.
4. Scan using camera where available.
5. Use manual fallback and verify it is labelled manual.
6. Queue offline inventory/dispatch/POD/service operation.
7. Restore network and sync.
8. Retry duplicate sync; verify idempotent result.
9. Create conflict by changing stock/status/document before sync.
10. Revoke device and verify sync/post block.

Expected result:
- Scan source, device id, timestamp, and user persist.
- Offline queue states are visible.
- Conflicts are not silently overwritten.

Pass/fail criteria:
- P0 if mobile posting bypasses server validation.
- P1 if offline conflict/idempotency fails.
- P2 if camera binary upload remains disabled with clear reason.

## 12. UDF/Customization UAT

Objective: prove UDF definitions, placements, typed values, validation, lifecycle locking, report/export inclusion, integration/mobile exposure controls.

Prerequisite master data:
- UDF admin user.
- UDF definitions/placements for customer, quote, SO, dispatch, service.

User roles: UDF Admin, Sales, Dispatch, Service, Report Viewer.

Steps:
1. Create text, numeric, date, select, and lookup UDF definitions.
2. Place UDFs on customer, quote header/line, SO, dispatch, service ticket.
3. Save values and reopen each screen.
4. Configure one required UDF and verify lifecycle transition block.
5. Release/post/close document and verify UDF mutation lock or reopen/amendment behavior.
6. Run report/export with configured UDF columns.
7. Verify hidden/sensitive UDF is not exposed to unauthorized report/integration/mobile path.

Expected result:
- Typed UDF values persist.
- Required UDF blocks configured lifecycle.
- Sensitive/hidden UDF access is permission-controlled.

Pass/fail criteria:
- P0 if UDF values are local-only or bypass server validation.
- P1 if required/lifecycle/report behavior fails.

## 13. Service/Warranty/AMC UAT

Objective: prove installed asset, warranty entitlement, AMC, service ticket, field visit, spare issue/return, warranty claim, service charge/invoice handoff, service report, notification boundary, mobile service task, and UDFs.

Prerequisite master data:
- Customer, item/serial, installed asset source reference.
- Warranty policy and AMC contract.
- Technician/team user.
- Service spare item with inventory policy.
- Finance setup for service charge/tax.
- Service UDF placements.

User roles: Service, Technician, Warehouse, Finance, Integration Admin.

Steps:
1. Create installed asset linked to customer/item/serial/source document.
2. Create warranty policy and resolve entitlement.
3. Create active AMC contract and verify active/expired behavior.
4. Create service ticket and assign technician/team.
5. Schedule and complete field-service visit with diagnosis/resolution/evidence metadata.
6. Issue spare to service ticket using bin/lot/serial/PCID.
7. Return spare where applicable.
8. Create warranty claim; approve or reject with reason.
9. Create service charge and mark invoice-ready.
10. Verify AR handoff boundary or invoice creation per configured policy.
11. Run service ticket/asset/claim/spare/charge reports.
12. Send service notification if provider exists; otherwise verify missing-config block.
13. Verify mobile service task live/queued state.
14. Verify service UDF values persist and report.

Expected result:
- Service workflow persists end to end.
- Spare issue/return uses shared inventory validation.
- Warranty/AMC decision snapshots persist.
- No fake service notification or mobile success state.

Pass/fail criteria:
- P0 if spare issue bypasses inventory or warranty entitlement is faked.
- P1 if ticket/visit/claim/charge/report persistence fails.

## UAT Execution Summary

| Script | Owner | Planned date | Result | Blocker IDs |
| --- | --- | --- | --- | --- |
| Admin setup |  |  | Pending |  |
| Sales-to-Cash |  |  | Pending |  |
| Procure-to-Pay |  |  | Pending |  |
| Inventory traceability |  |  | Pending |  |
| Production execution |  |  | Pending |  |
| Quality/NCR/COA |  |  | Pending |  |
| Dispatch/POD |  |  | Pending |  |
| Finance |  |  | Pending |  |
| Reports/Dashboard |  |  | Pending |  |
| Integrations |  |  | Pending |  |
| Mobile |  |  | Pending |  |
| UDF/Customization |  |  | Pending |  |
| Service/Warranty/AMC |  |  | Pending |  |
