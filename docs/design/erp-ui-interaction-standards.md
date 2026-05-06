# ERP UI Interaction Standards

These standards apply to every STS Manufacturing ERP web screen and mobile execution screen. They are governance rules for future implementation waves, not optional visual guidance.

## 1. Action Button Grouping
- Use `ErpActionBar` for page and editor actions.
- Group actions as primary, secondary, utility, and danger.
- Primary actions belong at the far end of the row and must represent a real supported operation.
- Disabled actions must include a short business-safe reason.
- Do not show active buttons for unavailable upload, save, launch, import, export, conversion, or approval operations.

## 2. Filter Bar Layout
- Use `ErpFilterBar` for list filters.
- Search is first, followed by compact select filters ordered by operational importance.
- Controls must use consistent 36px minimum height, compact padding, and wrapping behavior.
- Filters must include a clear/reset affordance when more than two filters are present.

## 3. Grid And Status Alignment
- Use `ErpGrid` for dense list tables and workbenches.
- Status, QC, catalog, media, approval, and exception cells must use `ErpStatusChip`.
- Chip cells must be vertically centered and must not change row height unpredictably.
- Row actions must align at the row end and must be disabled with reason when unavailable.

## 4. Modal And Editor Sizing
- Use `ErpModalWorkspace` for large create/edit/review experiences.
- Recommended size is `min(1280px, calc(100vw - 64px))` with max height `calc(100vh - 64px)`.
- Header and footer stay sticky; body scrolls internally.
- Right drawers are allowed for brief previews only, not deep ERP editors.

## 5. Validation Summary
- Use `ErpValidationSummary`.
- Show the first 3-5 issues by default and allow expand/collapse.
- Do not push all fields below the fold for routine validation.
- Keep inline field errors close to the affected control.

## 6. Lookup, Combo, And Select Controls
- Use `ErpLookupField` for master-linked values.
- Free text is forbidden by default for controlled master values.
- Quick create is allowed only when explicitly permission-gated and backed by a real workflow.
- If a master source is missing, disable the lookup and document the dependency.

## 7. Free Text Allowed Vs Forbidden
- Allowed: names, descriptions, instructions, notes, comments, external references, revision remarks, and long-form customer-facing copy.
- Forbidden: UOM, item group, warehouse, bin, customer, supplier, currency, tax category, payment terms, BOM, routing, work center, machine, operator, QC plan, inspection template, reason code, and other controlled master values.

## 8. Master-Linked Fields
- Master-linked fields must show a selected master value and preserve the related ID when available.
- A selected value from existing data may be displayed even when it is not present in the current option list, but the field should still be a controlled select.
- Missing master dependencies must be captured in the UX violation matrix.

## 9. Empty States
- Use compact business-facing empty states.
- Empty states must explain the business condition and the next valid action.
- Do not use large blank panels or technical data-source wording.

## 10. Disabled And Deferred Actions
- Disabled actions must use production-safe wording.
- Do not mention internal implementation terms.
- If a deferred action is necessary for navigation context, disable it and explain the business dependency.

## 11. Typography And Control Height
- Body text uses the app sans token.
- Standard list/edit controls use 36-40px compact height.
- Badges and status chips use fixed height.
- Avoid viewport-scaled fonts and negative letter spacing.

## 12. Responsive Behavior
- Page headers, action bars, filters, and grids must wrap without clipping.
- Modal workspaces stack section navigation above content on smaller screens.
- Tables may scroll horizontally, but labels and primary actions must remain accessible.

## 13. Future Screen Acceptance Checklist
- Action bar uses grouped actions and no fake active buttons.
- Filter bar uses compact governed controls.
- Grid rows and chips align consistently.
- Deep editors use modal workspace sizing.
- Validation summary is compact and collapsible.
- Master-linked values use lookup/select controls.
- Free text is used only for allowed narrative fields.
- Empty states are compact and business-facing.
- No internal implementation copy is visible.
- Mobile screens keep execution-first controls with clear disabled states.
