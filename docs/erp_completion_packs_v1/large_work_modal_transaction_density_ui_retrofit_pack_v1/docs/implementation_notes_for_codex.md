# Implementation Notes for Codex

## Recommended Strategy

### Step 1 — Locate Shared Modal and Form Infrastructure
Search for modal/dialog components and CSS classes. Common patterns to search:

```text
Dialog
Modal
Drawer
Sheet
popup
overlay
fixed inset
role="dialog"
Validation summary
Quote draft checks
Item detail editor
Quote line grid
```

### Step 2 — Fix Shared Work Modal Sizing
If a shared modal already supports sizes, add a `work` or `largeWork` size. If not, create a narrow wrapper/class around existing modal to avoid breaking all dialogs.

Do not apply work-modal sizing globally to all modals.

### Step 3 — Compact Validation Summary
Find existing validation rendering logic. Preserve issue generation. Only change rendering.

If issue objects are just strings, support strings first and avoid forcing a large data-model refactor.

### Step 4 — Quote Header Grid
Refactor field layout only. Avoid changing field names, state keys, API payloads, validation keys.

### Step 5 — Line Grid
This is the highest-risk visual refactor. Preserve all line state update handlers. The grid can be changed from label-per-row form layout to CSS grid/table layout without changing data model.

### Step 6 — Quick Actions
Start safe:

- Add visible toolbar.
- Wire only existing functionality.
- Use disabled placeholders for missing integrations.

## Anti-Patterns To Avoid

- Do not hide validation completely.
- Do not put status badges in a giant card.
- Do not convert every modal in the app to full screen.
- Do not make transaction header a single-column mobile form on desktop.
- Do not repeat line labels inside desktop rows.
- Do not create fake backend calls.
- Do not change DB schema.

## Suggested Search Commands

```bash
rg "Quote draft checks|New quote draft|Quote lines|Quote line grid|Draft Item|Item detail editor" src/web/src
rg "role=\"dialog\"|Modal|Dialog|popup|overlay" src/web/src
rg "Save & Continue|Save quote draft|Release quote|Convert to order|Reopen quote" src/web/src
rg "Line No|Order UOM|Unit Price|Price Source" src/web/src
```

## Suggested Refactor Boundary

Prefer small, reviewable diffs:

1. Shared CSS/classes for work modal and form grid.
2. Item modal top-area compaction.
3. Quote modal top-area compaction.
4. Quote header field grid.
5. Quote line grid desktop rendering.
6. Transaction quick action toolbar placeholders.

