# Manual Verification Checklist

## Build/Test Gates
Run from `src/web` or the correct frontend root:

- [ ] `npm test`
- [ ] `npm run typecheck` if available
- [ ] `npm run build`

If one command does not exist, record it clearly in the final report and run the nearest available equivalent.

---

## Item Master Verification
Route: `/masters/items`

- [ ] Open New Item Draft / Draft Item popup.
- [ ] Modal is significantly wider than before.
- [ ] Modal height uses most of viewport but still respects browser bounds.
- [ ] Header is compact.
- [ ] Duplicate large “Draft Item / New item code pending” block is removed or compacted.
- [ ] Status badges remain visible in compact header/toolbar.
- [ ] “Item detail editor” remains available.
- [ ] Validation summary is compact/collapsible.
- [ ] Core Info fields are visible much earlier without excessive scroll.
- [ ] Save Draft still works as before.
- [ ] Save & Continue still works as before.
- [ ] Existing validation behavior is preserved.

---

## Quote Draft Verification
Route: `/sales/quotes`

- [ ] Open New Quote Draft popup.
- [ ] Modal is almost full screen width.
- [ ] Top title/status/validation area is compact.
- [ ] Draft badge does not consume a separate large row.
- [ ] Quote draft validation is compact/collapsible.
- [ ] Customer default chips are compact.
- [ ] Refresh customer defaults does not create a large empty block.
- [ ] Header fields begin much higher than before.
- [ ] Quote number does not consume full row on desktop.
- [ ] Quote date and expiry date are compact fields.
- [ ] Priority and status are compact fields.
- [ ] Customer remains wider than short fields.
- [ ] Save quote draft still works.
- [ ] Release quote, convert to order, reopen quote behavior remains unchanged.

---

## Quote Line Grid Verification
Route: `/sales/quotes`

- [ ] Add at least 2 quote lines.
- [ ] Column headers appear once.
- [ ] Row-level labels are not repeated on desktop.
- [ ] Required markers appear in headers, not repeated inside every row.
- [ ] Two rows consume substantially less height than before.
- [ ] Horizontal scrolling works if columns overflow.
- [ ] Line No, Item, UOM, Quantity, Price remain editable.
- [ ] Row validation still identifies missing item/UOM/quantity.
- [ ] Add Line still works.
- [ ] Delete/row action behavior works if implemented/existing.

---

## Responsive Verification

### Desktop
- [ ] Heavy modals use wide/tall work layout.
- [ ] Header form is multi-column.
- [ ] Line grid is grid/table-like.

### Tablet
- [ ] Form safely reduces to 2-column where appropriate.
- [ ] No clipped controls.

### Mobile/Narrow
- [ ] Modal remains usable.
- [ ] Forms stack to one column.
- [ ] Line grid may switch to card mode or horizontal scroll without breaking.

---

## Transaction Quick Actions

- [ ] Quote Draft shows compact transaction actions where applicable.
- [ ] Email action visible or disabled with tooltip.
- [ ] WhatsApp action visible or disabled with tooltip.
- [ ] Attachments action visible or disabled with tooltip.
- [ ] Notes/Audit/Print visible if applicable.
- [ ] Disabled placeholder actions do not trigger runtime errors.

