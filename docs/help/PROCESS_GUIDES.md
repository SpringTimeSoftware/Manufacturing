# Process Guides

Run: HELP-SYSTEM-AND-ACTION-COMPLETION-01

## Customer Order To Planning

Purpose: Shows how customer demand becomes planned material and production recommendations.

1. Confirm the customer account, sites, payment terms, tax treatment, and commercial controls.
2. Confirm item master, UOM, price list, discount, and tax setup for the ordered item.
3. Review customer demand and delivery risk.
4. Run or review MPS/MRP to create BUY, MAKE, and TRANSFER recommendations.
5. Use BOQ Requirements and MRP Results to review shortages and planned actions.

Related screens: Customers, Price Lists, Sales Orders, MPS Planner, MRP Run Console, BOQ Requirements.

## Planning To Production

Purpose: Shows how planned MAKE recommendations move into work orders and job cards.

1. Confirm item, BOM, routing, work center, machine, and capacity readiness.
2. Review MRP recommendations and capacity conflicts.
3. Create or review work orders only when engineering and material readiness allow it.
4. Use job cards to supervise released operation tasks and execution progress.

Related screens: BOM Library, Routings, Capacity Planning, Work Orders, Job Cards.

## Production To Quality

Purpose: Shows how production output is reviewed against QC requirements and exceptions.

1. Review job-card progress and output quantities.
2. Open production receipt context for accepted, rejected, and pending quantities.
3. Apply the item QC and traceability policy.
4. Review inspection results and create or review NCR records where the source fails quality requirements.

Related screens: Job Cards, Production Receipt, QC Plans, Inspections, NCR / Deviation.

## Quality To Dispatch

Purpose: Shows how only acceptable stock proceeds toward pack, shipment, and delivery proof.

1. Confirm inspection, hold, and NCR state before dispatch planning.
2. Review available inventory and traceability context.
3. Prepare pack list and label context where enabled.
4. Review shipment, loading proof, dispatch documents, and customer references.

Related screens: Quality, Inventory Balances, Pack Lists, Dispatch Planning, Shipment / Delivery, Print Pack.

## Master Setup Flow

Purpose: Shows the order in which core setup should be completed before transactions use the records.

1. Set organization, branch, warehouse, bin, shift, and resource basics.
2. Set UOM classes, conversions, and measurement profiles.
3. Set item groups, attributes, classifications, items, variants, and barcodes.
4. Set customers, suppliers, terms, and supplier lead-time coverage.
5. Review activation blockers before using records in planning or execution.

Related screens: Companies, Branches, UOM Classes, Items, Customers, Suppliers, Work Centers, Machines.

## Commercial Setup Flow

Purpose: Shows how currency, tax, terms, price, and discount setup supports customer and supplier transactions.

1. Confirm currencies, precision, tax categories, payment terms, and trade terms.
2. Create price lists with governed currency, UOM, item, and quantity breaks.
3. Create discount schemes with controlled applicability and numeric break values.
4. Link customer and supplier records to the approved commercial setup.
5. Review disabled action reasons before attempting lifecycle or approval changes.

Related screens: Tax, Currency & Terms, Price Lists, Discount Schemes, Customers, Suppliers.
