# large_work_modal_transaction_density_ui_retrofit_pack_v1

## Purpose
This pack fixes a critical ERP usability problem in STS Manufacturing ERP: large master and transaction modals are wasting too much vertical and horizontal space, making normal data-entry work inefficient. The first affected screens observed are:

- `/masters/items` — Item Master / Draft Item popup
- `/sales/quotes` — New Quote Draft popup
- Quote line grid and likely other transaction line grids

This is not a cosmetic change. It is a shared UI architecture correction for heavy enterprise work modals, transaction header forms, validation summaries, and editable line grids.

## Business Problem
Current large popups behave like small mobile forms stretched into a modal. Important fields are hidden below large title/status/validation blocks. Transaction header fields consume full rows even when they are short fields like quote date, expiry date, status, and priority. Line grids repeat field labels inside every row even though column headers already exist.

The result is poor ERP productivity:

- Users scroll too much.
- Main fields are not visible when the popup opens.
- Quote/item creation looks unfinished despite having many implemented controls.
- Transaction line entry wastes vertical space.
- Communication/document actions such as Email, WhatsApp, Attachments, Notes, Audit, Print are not visible where users expect them.

## Target Outcome
After this pack:

1. Heavy work modals use almost full screen width and height.
2. Header/status/validation areas are compact.
3. Duplicate top cards are removed or merged into compact modal header/toolbars.
4. Transaction header forms use a responsive multi-column grid.
5. Desktop line entry behaves like a real editable grid.
6. Communication/document quick actions are visible without requiring backend invention.
7. Existing save/release/convert/defaulting/validation behavior remains intact.

## Execution Order
Run this pack before adding more transaction modules, because many future screens will inherit the same layout pattern.

Recommended Codex execution:

1. Read this README.
2. Read `docs/observed_ui_issues.md`.
3. Read `docs/target_ui_spec.md`.
4. Read `docs/component_design_contract.md`.
5. Use `codex_prompt.md` as the main implementation prompt.
6. Use `samples/sample_work_modal_layout.tsx` and `samples/sample_work_modal_styles.css` as reference only, not blind copy-paste.
7. Complete verification using `tests/manual_verification_checklist.md`.

## Non-Negotiables

- Do not break existing workflows.
- Do not change backend APIs unless absolutely required.
- Do not make DB changes without explicit approval.
- Fix shared components/patterns where possible instead of patching one screen only.
- Preserve accessibility: labels, keyboard navigation, focus rings, disabled states, and validation messages.

