# Observed UI Issues

## 1. Item Master / Draft Item Popup
Route: `/masters/items`

### Current Issue
The modal has too much non-working content at the top:

- A full-width “Draft Item / New item code pending” card.
- Status pills placed inside a separate top card.
- A large “Item detail editor” section.
- A large validation summary that permanently pushes the actual Core Info fields downward.

### Why It Is a Problem
The user opens the Item Master popup to enter item fields. Instead, nearly half the visible modal height is consumed by metadata and validation cards. The actual fields are not visible enough.

### Required Direction
- Remove the separate large “Draft Item / New item code pending” card.
- Move item status pills into a compact modal header/right toolbar.
- Keep “Item detail editor” concept, but make it compact.
- Convert validation summary into a collapsed/expandable compact strip.
- Show actual Core Info fields much earlier.

---

## 2. Quote Draft Popup Top Area
Route: `/sales/quotes`

### Current Issue
The quote popup loses major screen height to:

- Large title/subtitle area.
- Full-row Draft badge.
- Large “Quote draft checks” validation panel.
- Large “Quote header” explanatory area.
- Customer-default chips and refresh-defaults content placed in an oversized section.

### Why It Is a Problem
The user cannot reach actual quote header fields quickly. The modal visually looks like a report/dashboard instead of a transaction entry screen.

### Required Direction
- Use compact modal title row.
- Merge Draft badge, validation issue count, and default-status chips into a compact toolbar/strip.
- Replace the large validation panel with a collapsed validation strip.
- Move “Refresh customer defaults” near the Customer field or into a compact toolbar.
- Remove generic “Quote header” card if it only repeats explanatory text.

---

## 3. Quote Header Fields Consume Full Rows
Route: `/sales/quotes`

### Current Issue
Fields such as Quote Number, Customer, Sales Owner, Quote Date, Expiry Date, Priority, Status, Price List are rendered one per row.

### Why It Is a Problem
Only long lookup fields like Customer may need large width. Short fields should not consume the entire row on desktop.

### Required Direction
Use a responsive 12-column form grid:

- Customer: wide field
- Quote Number: medium field
- Sales Owner: medium field
- Quote Date: compact field
- Expiry Date: compact field
- Priority/Status: compact fields
- Price List/Discount/Payment Terms: medium fields

---

## 4. Quote Line Grid Repeats Headings in Every Row
Route: `/sales/quotes`

### Current Issue
The grid already has column headers: Line, Item, UOM, Qty, Price, etc. But each editable row repeats labels again: Line No, Item, Order UOM, Quantity, Unit Price, Price Source.

### Why It Is a Problem
The line section becomes vertically huge. Two lines consume the space that should fit many lines. It does not behave like an ERP transaction grid.

### Required Direction
Desktop mode:

- Show column headers once.
- Row cells contain inputs only.
- Required indicator belongs in header only.
- Row-level errors should be compact icon/border/tooltip, not full text expanding each row.

Mobile/narrow mode:

- It is acceptable to stack line fields with labels.

---

## 5. Missing Transaction Quick Actions
### Current Issue
Transaction screens do not visibly expose common actions:

- Email
- WhatsApp
- Attachments
- Notes
- Audit Trail
- Print/Preview
- Export PDF

### Required Direction
Add a compact transaction action toolbar for applicable transaction screens. If backend is not available, show disabled placeholders with clear tooltips. Do not invent APIs unnecessarily.

