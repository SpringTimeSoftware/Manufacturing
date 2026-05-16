# Target UI Specification

## A. Large Work Modal Standard

### Intended For
Use this pattern only for heavy work screens:

- Master create/edit screens with many fields
- Transaction drafts
- Sales/Purchase/Production/Inventory/Quality/Dispatch entry screens
- Screens with header + lines + totals + approvals + attachments

Do not apply this pattern to small confirmation dialogs.

### Desktop Modal Dimensions
Recommended:

```css
width: min(96vw, 1720px);
height: min(94vh, 980px);
```

Acceptable range:

- Width: 92vw to 96vw
- Max width: 1500px to 1800px
- Height: 88vh to 94vh

### Structure

```text
LargeWorkModal
 ├─ Sticky compact header
 │   ├─ Title + one-line subtitle
 │   ├─ Compact status badges
 │   ├─ Quick actions toolbar
 │   └─ Help / Close
 ├─ Scrollable body
 │   ├─ Compact validation strip
 │   ├─ Optional section tabs/side navigation
 │   ├─ Main form grid
 │   ├─ Line grid, totals, attachments, audit sections
 └─ Sticky compact footer
     ├─ Secondary actions
     └─ Primary save/submit/release actions
```

### Header Rules
- Header must not exceed approximately 72px to 96px unless title wraps.
- Subtitle should be one line with ellipsis if needed.
- Status badges must not create a separate full-width card.
- Help and Close remain visible.
- Quick actions can be icon + label on desktop and overflow menu on smaller screens.

### Body Rules
- Body scrolls internally.
- Avoid large cards before actual fields.
- Validation details are collapsed by default.
- Actual form fields must start within the first visible screen.

### Footer Rules
- Sticky at bottom of modal.
- Compact height.
- Primary action group should remain visible.
- Footer must not cover content; body needs bottom padding equal to footer height.

---

## B. Compact Validation Strip

### Collapsed State
Show:

```text
[Warning icon] 3 issues: Customer, Line 1 Item, Line 1 Order UOM required   [View details]
```

### Expanded State
Show full issue list.

### Behavior
- Default collapsed when opening a draft.
- Expand automatically only after a failed save/release attempt if that matches existing UX.
- Maintain existing validation logic; only change presentation.

---

## C. Transaction Header Form Grid

Use a 12-column grid on desktop.

### Suggested Field Spans

| Field Type | Desktop Span | Notes |
|---|---:|---|
| Customer / Supplier lookup | 5 or 6 | Wider because names may be long |
| Item lookup in header | 5 or 6 | Wider if long names |
| Quote / Order number | 3 | Read-only or generated number |
| Sales owner / buyer / planner | 3 or 4 | Medium lookup |
| Date fields | 3 | Compact |
| Status / priority | 3 | Compact |
| Price list / discount scheme | 4 | Medium |
| Payment / delivery terms | 4 | Medium |
| Address / remarks / long terms | 12 | Full width only when needed |
| Numeric totals / percentages | 2 or 3 | Compact |

### Responsive Rules

```text
>= 1200px: 12-column desktop grid
768px–1199px: 2-column / 6+6 grid
< 768px: 1-column stacked grid
```

---

## D. Transaction Line Grid

### Desktop Mode
A line grid must look and behave like a grid:

```text
| Line | Item * | UOM * | Qty * | Unit Price | Price Source | Discount | Tax | Amount | Actions |
| 10   | [select] | [select] | [1] | [0.00] | [Manual] | [0] | ... | ... | ⋮ |
| 20   | [select] | [select] | [1] | [0.00] | [Manual] | [0] | ... | ... | ⋮ |
```

Rules:

- Do not repeat labels inside each row.
- Required marker belongs in column header.
- Keep rows compact.
- Use horizontal scroll for too many columns.
- Keep first key columns visible if feasible.
- Row errors should use compact icon/tooltip/border.
- Add row action area for delete/duplicate/notes/attachments where applicable.

### Mobile Mode
Stacked cards with labels are acceptable below tablet breakpoint.

---

## E. Transaction Quick Actions

Recommended actions:

- Email
- WhatsApp
- Attachments
- Notes
- Audit Trail
- Print / Preview
- Export PDF

Implementation rule:

- If backend/API exists: wire safely.
- If backend/API does not exist: add disabled button with tooltip and no runtime error.
- Do not create new backend endpoints in this pack unless already approved.

Placement:

- Modal header right side, after status badges; or
- Compact toolbar just below header; or
- Footer secondary action group if header becomes too crowded.

