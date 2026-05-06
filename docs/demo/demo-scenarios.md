# Demo Scenarios

## Objective

These scenarios make the product demoable, testable, and seedable across web, mobile, dashboards, and print flows.

## Demo Tenant

- Tenant: `STS Precision Fabricators`
- Profile: fabricated metal and light industrial assembly manufacturer
- Demand mix: MTO plus selective MTS replenishment
- Plants: one manufacturing branch, one dispatch area, multiple warehouses and bins

## Scenario 1: Make-to-Order Fabricated Assembly

### Narrative

Customer `Apex Process Systems` orders a fabricated ozone skid assembly for a committed delivery date. Planning must validate BOM revision, create material demand, release a work order, and execute through job cards.

### Flow

1. Sales coordinator confirms the order.
2. Planning manager checks the approved BOM revision and routing.
3. MRP run identifies standard buy items and in-house fabrication demand.
4. Work order is released.
5. Job cards are created for laser cutting, bending, welding, assembly, and final inspection.
6. Operators report progress and downtime from mobile.
7. QC inspector records in-process and final checks.
8. Dispatch manager packs and ships the order.

### Proof Surfaces

- `W051`, `W052`, `W060`, `W066`, `W080`, `W082`, `W108`, `W057`
- Mobile: `M006`, `M008`, `M009`, `M014`, `M016`, `M019`

## Scenario 2: Mixed UOM Sheet / Weight Item

### Narrative

The factory produces sheet-based enclosures where raw material is stocked by sheet, planned by piece, and monitored by theoretical weight for costing and scrap visibility.

### Flow

1. Item master uses a dimensional measurement profile.
2. BOM consumes sheet items with length, width, and thickness parameters.
3. Planning runs BOQ and shows sheet shortage versus available stock.
4. Storekeeper issues material by sheet and lot.
5. Production reports good, reject, and scrap with actual weight reference.
6. Inventory and traceability screens show dual-UOM visibility.

### Proof Surfaces

- `W031`, `W041`, `W066`, `W086`, `W088`, `W094`, `W097`
- Mobile: `M010`, `M017`

## Scenario 3: Outside-Processing Flow

### Narrative

A partially fabricated subassembly requires powder coating by an outside processor before final assembly.

### Flow

1. Planning creates a subcontract recommendation from BOQ and routing.
2. Purchase manager issues a subcontract PO.
3. Storekeeper issues semi-finished stock to the vendor.
4. Vendor return is tracked against due date and quality inspection.
5. Final assembly resumes after subcontract receipt.

### Proof Surfaces

- `W071`, `W074`, `W075`, `W094`, `W101`, `W108`
- Mobile: `M010`, `M011`, `M016`

## Scenario 4: Overdue Order Due To Supplier And Machine Blockage

### Narrative

One high-priority customer order slips because a bought-out control panel arrives late and a welding machine suffers breakdown during the same week.

### Flow

1. Order is initially planned and work order partially released.
2. Supplier delay prevents material readiness for one operation.
3. Another operation is blocked by machine downtime.
4. Stage-wise and order-delivery dashboards show the order as at risk.
5. AI summary explains the deterministic risk reasons without changing status logic.

### Proof Surfaces

- `W057`, `W068`, `W084`, `W092`, `W108`, `W113`
- Mobile: `M014`, `M020`, `M021`

## Demo Coverage Expectations

- At least one order must complete successfully end-to-end.
- At least one order must become overdue for dashboard proof.
- At least one item must use mixed-unit or formula-based measurement.
- At least one order must include outside processing.
