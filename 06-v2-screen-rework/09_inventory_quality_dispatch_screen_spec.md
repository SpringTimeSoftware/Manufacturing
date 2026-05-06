# Inventory, Quality, And Dispatch Screen Specification

## Inventory Principles

Inventory screens must be live, traceable, and scan-aware. They must enforce item tracking rules, warehouse/bin policy, QC hold status, and source transaction linkage. Demo balances or free-text movements are not acceptable for pilot.

## Inventory Screen Specifications

| Screen | Required Behavior | Required Actions | Validation | API/DB Dependencies | Current Gaps | Acceptance Criteria |
| --- | --- | --- | --- | --- | --- | --- |
| Stock View | Real-time stock by item, warehouse, bin, lot, serial, catch-weight, reserved, available, QC hold, blocked. | Filter, drill to movements, export, open item/lot. | Quantities reconcile with movement ledger. | `/api/inventory`, inventory balance/movement tables. | Live basis exists, needs lot/serial/catch-weight depth and transaction drilldown. | Storekeeper trusts balance without spreadsheet reconciliation. |
| Inventory Movement | Unified view of issue, return, transfer, receipt, adjustment, count, hold/release. | Filter, open source transaction, export. | All movements link to source and audit. | Inventory movement tables and source APIs. | Needs unified viewer and audit depth. | Every stock change is traceable. |
| Transfers | Inter-bin/warehouse movement and putaway. | Create transfer, scan source/destination, approve if restricted, complete. | Cannot move blocked/QC-held stock without role and reason. | `/api/stock-transfers`, warehouse/bin/inventory. | Web exists; mobile scan depth needs live sync. | Transfer updates stock and movement ledger atomically. |
| Cycle Count | Count plan, count sheet, recount, variance approval, posting. | Start count, enter count, submit, approve variance, post adjustment. | Freeze policy by bin/item/count; variance thresholds route approval. | `/api/cycle-counts`, inventory. | Needs stronger count lifecycle and mobile support. | Cycle count has audit and variance approval. |
| Lot/Serial Traceability | Forward/backward trace from supplier receipt/production to dispatch and customer. | Search lot/serial/item/order, export trace pack. | Lot/serial required by item rules. | `/api/traceability`, inventory, production, quality, dispatch. | Screen exists but needs full chain and document proof. | Trace pack can answer where-used and where-sent. |

## Quality Screen Specifications

| Screen | Required Behavior | Required Actions | Validation | API/DB Dependencies | Current Gaps | Acceptance Criteria |
| --- | --- | --- | --- | --- | --- | --- |
| QC Plans | Inspection plan by item/category/supplier/operation/customer with parameters, sample size, acceptance rules. | Create plan, version, approve, retire. | Active plan required where item/category policy says so. | `/api/quality/plans`, item and operation data. | Basic plan screen exists; needs parameter library and versioning. | Released plans drive incoming, in-process, and final inspections. |
| QC Inspection | Incoming, in-process, and final inspections with parameter results, pass/fail, measurements, defects, photos. | Start, save draft, pass, fail, hold, release, create NCR. | Required parameters and lot/serial references enforced. | `/api/quality/inspections`, inventory, production, dispatch. | Current pages are shallow variants of one component. | Inspection updates hold/release and links to source. |
| NCR | Non-conformance with source, defect, severity, containment, disposition, rework/scrap, approval. | Create, assign, hold, disposition, close. | Required root cause/disposition before close. | `/api/quality/ncrs`, rework/scrap/inventory. | Needs deeper lifecycle and role gates. | NCR fully links quality, inventory hold, rework, scrap, and audit. |
| Hold/Release | QC hold queue by lot/item/source with reason and release authority. | Hold, release, reject, rework, attach proof. | Release requires authorized role and completed inspection/NCR. | Quality and inventory status tables. | Partly implied, not first-class enough. | Held stock cannot be issued/dispatch unless policy allows. |

## Dispatch And Document Screen Specifications

| Screen | Required Behavior | Required Actions | Validation | API/DB Dependencies | Current Gaps | Acceptance Criteria |
| --- | --- | --- | --- | --- | --- | --- |
| Pack List | Pack hierarchy, items, lots, labels, weights, customer refs, missing docs. | Create pack, add/remove lines, print labels, confirm pack. | Packed qty cannot exceed released/available qty. | `/api/dispatch/pack-lists`, inventory, labels, customer refs. | Present but needs packaging/customer reference depth. | Pack list is complete and printable with traceable lots. |
| Shipment | Dispatch plan, vehicle, LR/tracking, carrier, route, proof, delivery status. | Assign vehicle, load, dispatch, deliver, close. | Cannot dispatch QC-held or unpacked stock. | `/api/dispatch/shipments`, pack list, inventory, customer site. | Present but needs proof and document lifecycle depth. | Shipment links pack, stock, proof, and customer address. |
| Dispatch Proof | Mobile proof capture for loading/delivery. | Scan packs, capture photo, seal, vehicle, signature if configured. | Proof required by customer/site policy. | `/api/dispatch/proof`, media, shipment. | Mobile screen exists but live sync/dependency depth is incomplete. | Proof appears on shipment audit. |
| Print Pack | Traveler, labels, pack list, checklist, summaries. | Generate, preview, print, download, audit. | Template/version selected by document type and branch/customer. | `/api/reports/*`, document template system deferred. | Print pack exists but template/localization system is incomplete. | Output is consistent, traceable, and uses approved template. |
| Traveler | WO/job traveler with route, operations, materials, QC, barcode, documents. | Generate and reprint. | Traveler version ties to WO/BOM/routing revision. | Reports/work order/job card/attachments. | Needs template and document-control depth. | Traveler can be used on shop floor without missing instructions. |
| Labels | Item, bin, pack, dispatch labels with barcode/QR, customer/vendor refs, lot/serial. | Preview, print, reprint, audit. | Barcode uniqueness and template compatibility enforced. | Barcode, label template, item, pack, bin tables. | Label setup is not deep enough. | Labels scan correctly in mobile flows. |

## Scan And Proof Rules

- Scan screens must validate expected item, lot/serial, bin, document, and action context.
- Photo/media proof must store source transaction, actor, timestamp, device, and purpose.
- Exceptions require reason codes and role-based approval where configured.
