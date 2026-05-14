# Transaction Line Grid Standard Completion Specification V1

## 1. Purpose

This specification defines the universal line-entry design and functional contract for desktop ERP transactions.

It exists because transaction screens such as Quote, Sales Order, Purchase Order, GRN, Material Issue, Production Receipt, Quality Inspection, and Dispatch cannot be commercially usable if each line item is rendered as a large vertical card.

A manufacturing ERP must support fast entry of many lines. Users may enter 10, 50, 100, or 200 lines. The UI must remain usable.

## 2. Applies to

This standard applies to every desktop transaction screen that can contain multiple rows.

### Commercial

- Quote / Estimate
- Sales Order
- Sales Invoice if present
- Blanket Order
- Demand Forecast
- ATP / Order Promise if it has demand lines

### Procurement

- Purchase Requisition
- RFQ
- Supplier Quotation
- Supplier Quote Comparison
- Purchase Order
- Subcontract / Outside Processing PO
- GRN / Goods Receipt
- Purchase Invoice / 2-way or 3-way match
- Vendor Return
- Landed Cost allocation

### Inventory / Warehouse

- Material Issue
- Material Return
- Stock Transfer
- Bin Transfer
- Putaway
- Cycle Count
- Reservation / allocation

### Production

- Work Order component/operation lines
- Job Card material/labor/event lines
- Production Receipt
- Scrap / Rework
- Downtime/event lines where applicable

### Quality

- Inspection result lines
- NCR action/disposition lines
- Hold/release lines

### Dispatch / Logistics

- Packing List
- Delivery Challan
- Gate Pass
- Shipment / Delivery
- Proof of Delivery

### Finance

- Journal lines
- AR/AP invoice lines
- cost allocation lines
- COGS/WIP allocation grids where present

## 3. Desktop transaction line entry standard

### Required layout

A desktop transaction editor must contain:

1. Header / document context section
2. Compact editable line grid
3. Add Line / Add Row
4. Row-level remove action
5. Optional row detail expansion
6. Totals / calculation panel
7. Sticky footer action bar

### Prohibited layout

The following is prohibited for desktop line entry:

- one full form card per line,
- repeated vertical blocks such as `Line 1`, `Line 2`, `Line 3`,
- long scrolling form with each line occupying a full screen height,
- single-line editor for a transaction that requires multiple lines,
- line array in data model but only one line editable in UI.

## 4. Required grid behavior

The grid must support:

- inline cell editing,
- row append,
- row remove,
- optional row duplicate,
- row sequence / line number,
- row validation,
- all-line save,
- save and reopen proof,
- keyboard-friendly entry where practical,
- compact visual density,
- horizontal scroll if necessary,
- fixed/sticky header for large lists.

## 5. Required commercial columns

For Quote, Sales Order, Sales Invoice, Blanket Order, or equivalent:

- Line No
- Item / Service
- Description / Specification
- HSN/SAC if applicable
- UOM
- Quantity
- Available / Stock Status if applicable
- Unit Price / Rate
- Discount %
- Discount Amount
- Tax Category / Tax %
- Promise / Delivery Date
- Warehouse / Ship-from if applicable
- Line Total
- Actions

## 6. Required procurement columns

For PR, RFQ, Supplier Quote, PO:

- Line No
- Item / Material
- Description / Specification
- UOM
- Quantity
- Required Date
- Supplier / Preferred Supplier where applicable
- Unit Price
- Discount
- Tax Category
- Delivery Location / Warehouse
- Cost Center / Department if applicable
- Line Total
- Actions

## 7. Required GRN / receipt columns

- PO Line
- Item
- UOM
- Ordered Qty
- Received Qty
- Accepted Qty
- Rejected Qty
- Pending Qty
- Warehouse
- Bin
- Lot / Serial
- QC Required
- Status
- Actions

## 8. Required inventory movement columns

- Item
- UOM
- Required Qty
- Issue / Return / Transfer Qty
- Source Warehouse
- Source Bin
- Destination Warehouse
- Destination Bin
- Lot / Serial
- Available Qty
- Reason Code
- Actions

## 9. Required production receipt / scrap / rework columns

- Work Order / Job Card
- Item
- UOM
- Good Qty
- Scrap Qty
- Rework Qty
- Lot / Serial
- Warehouse
- Bin
- QC Required
- Reason Code
- Actions

## 10. Required dispatch / packing columns

- Sales Order Line
- Item
- UOM
- Ordered Qty
- Packed Qty
- Dispatched Qty
- Balance Qty
- Package / Carton
- Lot / Serial
- Weight
- Actions

## 11. Totals and calculations

Commercial/procurement transaction editors must support or truthfully block:

- subtotal,
- line discount,
- header discount,
- taxable value,
- tax summary by tax category,
- freight,
- packing,
- insurance,
- other charges,
- add/less,
- round-off,
- grand total.

Round-off modes must be one of:

- no rounding,
- nearest,
- floor,
- ceiling,

or the option must be disabled with a clear reason.

## 12. Save/reopen rule

A transaction line editor is not complete unless tests prove:

1. user adds at least three lines,
2. user edits values on each line,
3. user removes the middle line,
4. save draft persists all remaining lines,
5. reopening the transaction displays all remaining lines,
6. totals are based on all lines.

## 13. Anti-pattern rules

The implementation fails if it contains:

- `lines[0]`,
- `firstLine`,
- `First quote line`,
- `index === 0` for line updates,
- no `addLine`,
- no `removeLine`,
- single editable line for multiline transaction,
- active save that persists only one line,
- card-per-line desktop design.

## 14. Relationship to older packs

This pack supersedes the line-entry sections in earlier completion packs.

Earlier packs remain useful for domain-specific business requirements, but their transaction-line UI/behavior requirements must be replaced by this standard.

## 15. Evidence

Each transaction pack must produce:

- screenshots of line grid,
- screenshots after add line,
- screenshots after remove line,
- screenshots of saved/reopened transaction,
- tests,
- audit result,
- validation result.
