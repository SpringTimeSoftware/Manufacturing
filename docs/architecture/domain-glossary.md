# Domain Glossary

## Objective

This glossary defines the core business vocabulary used across backend, SQL, web, mobile, dashboards, and documents.

## Core Documents

| Term | Meaning |
| --- | --- |
| Quote | Commercial estimate or quotation before order commitment. |
| Sales Order | Confirmed customer demand that drives planning and delivery commitments. |
| Blanket Order | Long-running customer agreement with scheduled or released demand. |
| Demand Forecast | Planner-maintained or imported demand bucket used for MTS planning. |
| BOM | Bill of materials defining components and standard production relationships for an item. |
| BOM Revision | Controlled version of a BOM used for approval, traceability, and change history. |
| ECO | Engineering change order controlling revision changes and downstream impact. |
| Routing | Standard operation sequence for producing an item. |
| Operation Standard | Setup, run, teardown, overlap, skill, and QC rules for an operation. |
| MPS | Master production schedule that buckets planned production by period. |
| MRP Run | One execution of material planning logic that explodes demand and computes supply recommendations. |
| BOQ Requirement | Net requirement result line after stock, demand, and supply netting, with recommended action such as BUY, MAKE, or TRANSFER. |
| PR | Purchase requisition created from planning or manual demand. |
| PO | Purchase order issued to a supplier for direct or subcontract supply. |
| Subcontract Order | Outside-processing or vendor-executed production step tied to issued material and expected return. |
| Work Order | Internal production order authorizing manufacturing of planned quantity. |
| Job Card | Operation-level execution record derived from a work order. |
| Material Issue | Stock movement that sends material to a work order or job card. |
| Material Return | Reverse movement that returns unused material to stock. |
| Production Receipt | Record that receives completed WIP or FG output into inventory. |
| Scrap Entry | Record of lost material or output that will not continue through normal production. |
| Rework Order | Controlled loop for correcting nonconforming output. |
| Inspection | Recorded QC activity at incoming, in-process, or final stage. |
| NCR | Non-conformance record for rejected or deviating material/process/output. |
| Pack List | Packing structure and readiness record before shipment. |
| Shipment | Dispatch record for goods leaving the plant toward the customer. |

## Quantity Terms

| Term | Meaning |
| --- | --- |
| Planned Quantity | Quantity intended by the plan, work order, or schedule. |
| Required Quantity | Quantity needed to satisfy demand or operation input requirement. |
| Reserved Quantity | Stock blocked for a specific downstream demand or document. |
| Available Quantity | Stock that can be committed after subtracting holds and reservations. |
| Issued Quantity | Quantity moved from stock into production or subcontract use. |
| Consumed Quantity | Quantity actually used by production logic or confirmed material consumption. |
| Returned Quantity | Quantity issued earlier but moved back into stock. |
| Produced Quantity | Total output reported against a work order or job card before quality split. |
| Good Quantity | Accepted output allowed to continue or receive into stock. |
| Reject Quantity | Output that failed quality and is not accepted in current form. |
| Scrap Quantity | Output or material lost permanently without recovery into normal flow. |
| Rework Quantity | Quantity routed to corrective processing before final acceptance. |
| Pending Quantity | Remaining quantity not yet completed or fulfilled. |
| Open Quantity | Quantity still awaiting action on a commercial, procurement, or production document. |

## Measurement Terms

| Term | Meaning |
| --- | --- |
| Stock UOM | Primary unit used to store inventory balances. |
| Purchase UOM | Unit used on supplier-facing purchase documents. |
| Sales UOM | Unit used on customer-facing commercial documents. |
| Production UOM | Unit used by manufacturing planning and execution. |
| QC UOM | Unit used while recording inspection results or tolerance values. |
| Catch Weight | Dual-UOM behavior where planned and actual physical/commercial units both matter. |
| Measurement Profile | Rule set describing how an item behaves across count, weight, length, area, volume, or formula-based quantities. |

## Planning and Risk Terms

| Term | Meaning |
| --- | --- |
| Shortage | Gap between required quantity and available or expected supply. |
| Availability Window | Time period in which material or capacity becomes usable. |
| Capacity Bucket | Time-bounded machine or work-center capacity record. |
| Order Risk | Deterministic risk state based on due date, production progress, shortages, supplier delay, QC pending, and dispatch readiness. |
| Stage Blocker | Condition preventing movement from one functional stage to the next. |

## Production Resource Terms

| Term | Meaning |
| --- | --- |
| Work Center | Capacity grouping or cell used for planning and load analysis. |
| Machine | Individual production asset that can execute job cards. |
| Tool / Die / Mould | Constrained resource required by certain operations. |
| Shift | Scheduled operating period for people and machines. |
| Handover | Structured shift-to-shift note and exception transfer. |

## Traceability Terms

| Term | Meaning |
| --- | --- |
| Lot | Traceability batch used for grouped inventory identity. |
| Serial | Unique item-level traceability identifier. |
| Genealogy | Forward and backward trace view connecting source materials to produced output and downstream shipment. |
| Quarantine | Status where stock is blocked pending inspection or disposition. |

## AI and Integration Terms

| Term | Meaning |
| --- | --- |
| AI Run | Logged execution of an approved AI prompt template against allowed data. |
| Prompt Template | Controlled AI instruction set approved for summaries, drafting, translation, or assistance. |
| Outbox | Reliable queue of notifications or integrations awaiting delivery. |
| Provider | Configured external service for AI, email, SMS, WhatsApp, storage, or webhook delivery. |
