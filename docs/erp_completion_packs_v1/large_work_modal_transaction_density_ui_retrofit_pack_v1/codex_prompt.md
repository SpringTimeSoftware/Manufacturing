# Codex Prompt — Large Work Modal + Transaction Density UI Retrofit

You are working on the STS Manufacturing ERP React frontend.

## Task Name
`large_work_modal_transaction_density_ui_retrofit_pack_v1`

## Critical Context
Large create/edit popups such as Item Master and Quote Draft currently waste too much screen space in headers, status bands, validation panels, and one-field-per-row layouts. On normal desktop screens, users cannot see enough actual working fields without scrolling. Transaction line grids also repeat column captions inside every row, making line entry bulky and inefficient.

This is a UX architecture correction, not just cosmetic CSS.

## First Screens Observed

- `/masters/items` — Item Master / Draft Item popup
- `/sales/quotes` — New Quote Draft popup
- Quote line grid in `/sales/quotes`

## Main Goal
Create a consistent large-work-modal and enterprise-density transaction layout standard so that:

1. Heavy modals use almost full available screen width and height.
2. Top header/status/validation areas are compact.
3. Duplicate summary/status blocks are removed or collapsed.
4. Main fields are visible quickly.
5. Header fields use intelligent multi-column layout instead of one full row per field.
6. Transaction line grids behave like real grids, not repeated form blocks.
7. Common quick actions such as Email, WhatsApp, Attachments, Notes, Audit, Print/Preview are visible where applicable.
8. Existing functionality does not break.

## Files / Areas To Inspect First

Inspect and identify actual shared component structure before editing:

- `src/web/src/pages/PartnerPages.tsx`
- `src/web/src/pages/CommercialPlanningPages.tsx`
- `src/web/src/components/*`
- `src/web/src/pages/*`
- Shared modal/dialog components
- Shared form section/components
- Shared validation summary components
- Shared transaction line grid components
- Shared CSS/global styles/modules

Do not blindly patch only one page if a shared component exists. Fix shared patterns where safe.

---

# Part 1 — Large Work Modal Pattern

Implement or refactor a reusable heavy modal pattern. Use existing naming conventions if already present. Acceptable names include:

- `WorkModal`
- `LargeWorkModal`
- `TransactionModal`
- `MasterDataModal`

## Required Behavior

### Size
Desktop:

- Width: approximately `92vw` to `96vw`
- Max width: preferably `1500px` to `1800px`
- Height: approximately `88vh` to `94vh`

Small dialogs must remain small. Only heavy working modals should use this.

### Layout

```text
Work modal shell
 ├─ compact sticky header
 ├─ scrollable body
 └─ compact sticky footer/action bar
```

### Header
Header should include:

- Title
- One-line subtitle
- Compact status badges
- Optional transaction quick actions
- Help / Close buttons

Header must not contain large card-like blocks for draft status.

### Body
Body should:

- Scroll internally.
- Start quickly with validation strip and actual fields.
- Avoid large blank/intro cards before form fields.

### Footer
Footer should:

- Stay sticky at bottom.
- Keep existing action buttons available.
- Not cover form fields.

---

# Part 2 — Item Master Popup Redesign

Route: `/masters/items`

## Current Problem
The popup currently has:

- A large “Draft Item / New item code pending” block.
- A large “Item detail editor” panel.
- A large always-visible validation summary.

Together they push Core Info fields too far down.

## Required Change

### Remove/Compact Duplicate Draft Block
Remove the large full-width “Draft Item / New item code pending” card.

Do not lose its information. Move it to compact areas:

- Title row / subtitle
- Status badge group
- Compact metadata line

For example:

```text
Draft Item    [Draft] [Make/buy pending] [QC optional]
New item code pending
```

This must not be a large card.

### Compact Item Detail Editor
Keep the concept of “Item detail editor”, but do not let it dominate the screen.

Preferred:

- Header title remains compact.
- Subtitle shortened.
- Validation summary becomes collapsible.

### Validation Summary
Replace permanent large validation block with compact strip:

```text
8 issues: Item code, Item name, Short name, Item type required +4 more   [View details]
```

Expanded state shows full details.

Default should be collapsed unless existing UX requires expanded after a failed save.

## Acceptance

- Core Info fields are visible much earlier.
- Duplicate full-width draft status card is gone.
- Status badges remain visible.
- Save Draft and Save & Continue still work.
- Existing validation rules still work.

---

# Part 3 — Quote Draft Top Area Redesign

Route: `/sales/quotes`

## Current Problem
The popup loses too much height to:

- Large title/subtitle area
- Full-row Draft badge
- Large Quote Draft Checks validation box
- Large Quote Header explanatory area
- Oversized customer default section

## Required Change

Create compact top area:

1. Modal title row:
   - Left: `New quote draft`
   - One-line subtitle
   - Right: Help / Close

2. Compact status/validation strip:
   - Draft badge
   - `3 issues` summary
   - First few messages inline
   - Expand/collapse details

3. Compact default chips:
   - `Sales owner not defaulted`
   - `Price list not defaulted`
   - `Discount scheme not defaulted`

4. `Refresh customer defaults`:
   - Move near Customer field or into compact toolbar.
   - If disabled, use tooltip or single muted hint.
   - Do not consume a large right-side block.

5. Remove generic Quote Header card if it only repeats explanatory information.

## Acceptance

- Actual Header fields begin much higher.
- Empty whitespace in top section is removed.
- Draft/validation/default status remains visible but compact.
- Existing customer defaulting behavior remains unchanged.

---

# Part 4 — Transaction Header Form Density

## Current Problem
Quote header fields are full width one per row, including short fields.

## Required Change
Use responsive 12-column grid for transaction headers.

Suggested desktop spans:

- Quote Number: 3 columns
- Customer: 5 or 6 columns
- Sales Owner: 3 or 4 columns
- Quote Date: 3 columns
- Expiry Date: 3 columns
- Priority: 3 columns
- Status: 3 columns
- Price List: 4 columns
- Discount Scheme: 4 columns
- Payment Terms: 4 columns
- Remarks / address / long terms: 12 columns only when genuinely needed

Responsive behavior:

- Desktop: 12-column grid
- Tablet: 2-column layout
- Mobile: 1-column layout

## Rules

- Do not make every field full width by default.
- Date/status/priority/numeric fields should be compact.
- Customer/vendor/item lookup may be wider.
- Preserve existing labels, help text, validation messages, and accessibility.

## Acceptance

- Quote header displays multiple fields per row on desktop.
- Quote number/date/status/priority do not consume full row.
- Customer remains wider than compact fields.

---

# Part 5 — Transaction Line Grid Standardization

## Current Problem
Quote line grid shows column headers and then repeats labels inside each line row.

## Required Change
Desktop line grid must show column headers once only.

Desktop layout example:

```text
| Line | Item * | Order UOM * | Qty * | Unit Price | Price Source | Discount | Actions |
| 10   | Select | Select      | 1     | 0          | Manual       | 0        | ⋮       |
| 20   | Select | Select      | 1     | 0          | Manual       | 0        | ⋮       |
```

## Rules

- Do not repeat `Line No`, `Item`, `Order UOM`, `Quantity`, etc. labels inside every row on desktop.
- Required marker appears in column header.
- Row controls should align under headers.
- Keep row height compact.
- Horizontal scrolling is acceptable.
- Keep first important columns visible if feasible.
- Row errors should be compact icon/border/tooltip.
- Mobile may switch to stacked card layout with labels.

## Acceptance

- Two quote lines consume much less vertical space.
- Grid remains editable.
- Existing line validation still works.
- Add Line behavior still works.

---

# Part 6 — Transaction Quick Actions

## Current Problem
Transaction screens do not visibly show Email / WhatsApp / Attachments / Notes / Audit / Print actions.

## Required Change
Add compact action toolbar for applicable transaction modals, starting with Quote Draft.

Actions:

- Email
- WhatsApp
- Attachments
- Notes
- Audit Trail
- Print / Preview
- Export PDF if already supported

## Important Backend Rule
Do not invent backend APIs.

If an API exists, wire safely.

If no API exists, show disabled/placeholder action with tooltip:

- `Email action pending communication API`
- `WhatsApp action pending integration`
- `Attachments pending document API`
- `Print template pending`

Disabled placeholders must not throw runtime errors.

## Placement
Preferred:

- Header right toolbar; or
- Compact toolbar below header; or
- Footer secondary action group if header gets crowded.

Do not consume large vertical space.

---

# Part 7 — Apply Safely Across Heavy Modals

Find other heavy large modal patterns if practical:

- Item Master
- Quote Draft
- Sales Order
- Purchase Order
- GRN
- Production Order
- Job Card
- Dispatch
- Quality/NCR
- Customer/Supplier master if they use similar heavy popups

Apply shared classes/components where safe.

Do not force small confirmation dialogs to full width.

---

# Part 8 — Design Rules

Preserve existing STS Manufacturing ERP visual language:

- Soft cards
- Rounded corners
- Light blue/neutral palette
- Current typography
- Current buttons and focus rings

But reduce wasted space:

- Reduce excessive padding.
- Avoid large blank rows.
- Use compact section headers.
- Use chip rows instead of full cards.
- Use collapsible validation details.
- Use enterprise density, not tiny cramped controls.

---

# Part 9 — Regression Safety

Must preserve:

- Existing save behavior
- Existing validation behavior
- Existing customer defaulting behavior
- Existing release/convert/reopen behavior
- Existing item draft save/continue behavior
- Existing route behavior
- Existing API contracts
- Existing permissions/security behavior

Do not change backend unless absolutely required.

If backend or DB changes appear necessary:

1. Stop.
2. Document proposed change.
3. Do not implement DB changes without explicit approval.

---

# Part 10 — Required Tests

Run:

1. `npm test`
2. `npm run typecheck` if available
3. `npm run build`

Manual verification:

- `/masters/items`
  - Open New Item Draft.
  - Confirm modal is wider/taller.
  - Confirm duplicate top draft card is gone/compacted.
  - Confirm validation is compact/collapsible.
  - Confirm Core Info fields visible earlier.
  - Confirm Save Draft and Save & Continue still work.

- `/sales/quotes`
  - Open New Quote Draft.
  - Confirm top section is compact.
  - Confirm Header fields start much higher.
  - Confirm Quote Number, dates, status, priority, price list use multi-column layout.
  - Confirm Customer remains wider.
  - Confirm quote line grid does not repeat labels inside each row on desktop.
  - Confirm Add Line, Save, Release, Convert, Reopen remain safe.
  - Confirm transaction quick actions visible or safely disabled.

Responsive:

- Desktop: dense multi-column layout.
- Tablet: safe two-column layout.
- Mobile: one-column/stacked layout.

---

# Part 11 — Required Final Report

After completion, report exactly:

1. Files changed.
2. Shared components created/updated.
3. Screens verified.
4. Exact UI behavior changed.
5. Any disabled placeholder actions added for Email/WhatsApp/Attachments/etc.
6. Tests run and results.
7. Any known limitations.
8. Any places where similar modal pattern exists but was not changed and why.

Do not give vague output. Include exact files and line ranges wherever possible.
