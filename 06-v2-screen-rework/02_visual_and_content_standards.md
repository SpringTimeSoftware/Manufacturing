# V2 Visual And Content Standards

## Non-Negotiable Content Rules

- Do not show scaffold, prompt, implementation, or technology copy in production-facing UI.
- Do not show prompt numbers, wave names, "React + TypeScript", "IIS-ready web console", "reference UI preserved", "guarded demo shell", "demo seeds active", "mock adapters preserved", "backend reachability", "live call used", or route/API implementation notes to business users.
- Do not expose fallback/source labels to end users. Keep live/fallback diagnostics in developer tooling, admin health, or support-only telemetry.
- Production login, context switching, and home screens must read like real ERP screens, not landing pages or engineering dashboards.
- Empty states must explain the business condition and the next action, not mention missing adapters or incomplete prompts.

## Layout Standards

- Use full-height application layouts with dense, balanced content. Avoid centered landing-page whitespace except for constrained authentication forms.
- Favor two-column enterprise pages where appropriate: left list/search/result rail, right detail drawer or editor.
- Use sticky filter bars on list and planning screens.
- Use sticky action bars on editor screens for Save, Submit, Approve, Reject, Release, Hold, Cancel, and More actions.
- Use sectioned or tabbed editors for ERP objects. Long single-column forms are not acceptable for master data or transactions.
- Keep list pages high-density: compact filters, KPI strip, table/grid, status chips, saved views, and quick actions.
- Use drawers for quick inspection and route-backed detail pages for deep editing.
- Avoid massive blank regions. If a module has little data, use guided empty states, next actions, and sample-safe onboarding panels.

## ERP Form Density

- Group fields into business sections with clear labels.
- Use compact labels, aligned controls, and consistent field widths.
- Put required identifiers, status, branch, owner, and lifecycle fields in a persistent header summary.
- Put validation errors near fields and summarize blockers in a right-side validation panel.
- Use read-only derived fields for calculated quantities, lead times, conversion outputs, shortages, delays, and risk scores.
- Use inline line grids for BOM components, routing operations, order lines, PR/PO lines, QC parameters, dispatch packs, and inventory movements.

## Standard Page Components

- KPI strip: show status counts, exceptions, overdue items, readiness, blocked items, or risk score.
- Filter rail: saved view, search, status, branch, warehouse, date, customer, supplier, item, work center, machine, and owner filters.
- Status chips: Released, Draft, Approved, Blocked, Hold, Rework, QC Pending, Shortage, Overdue, Running, Down, Closed.
- Action bar: primary action, secondary actions, bulk actions, export/print, and audit/history.
- Audit panel: created by, updated by, approval history, status timeline, source document, and linked transaction chain.
- Attachment/media panel: drawings, photos, certificates, manuals, labels, customer specs, supplier docs, proof images, and voice/text notes.
- Related records panel: linked item, BOM, route, WO, job card, lot, customer, supplier, PO, SO, shipment, NCR, and approval.

## Data Clarity Rules

- Distinguish business status from technical health. Users should see "No approved BOM found", not "fallback adapter used".
- If data is not live, the screen must either be hidden from production roles or clearly treated as a training/demo-only screen outside production mode.
- Live API failures must show actionable business-safe errors: "Company list could not be loaded. Retry or contact admin." Do not show stack traces or EF terms.
- Required backend gaps must be tracked in implementation plans, not explained inside production pages.

## Typography And Spacing

- Use the established reference UI type scale for screen titles, section labels, dense tables, and status chips.
- Header controls must match the rest of the page scale and must never overlap.
- Sidebar groups should be collapsed by default for large menus and expand one domain at a time.
- Use consistent vertical rhythm across platform, setup, planning, and execution screens.
- Avoid oversized controls in dense enterprise headers. Company, branch, notifications, profile, and sign-out controls must fit a single compact header row on desktop.

## Responsive Behavior

- Desktop: prioritize dense grids, pinned filters, split editors, and right-side panels.
- Tablet: collapse secondary panels into drawers, keep primary action bars sticky.
- Mobile web: only support review and light admin actions unless the role is explicitly execution-oriented.
- Native mobile: action-first, scan-first, offline-aware. Do not force desktop setup concepts into mobile.

## Mobile Action-First Standard

- Every mobile screen must answer: "What should this operator do now?"
- Primary action must be thumb-reachable and visible without scrolling.
- Scanner, camera, and offline queue states must be explicit.
- Queued actions must show pending, synced, failed, and retry states.
- Mobile must not become a small version of web master data setup.

## What "Wow" Means For This ERP

"Wow" is operational clarity, not decorative animation. A strong screen lets a plant head, planner, storekeeper, QC inspector, or operator immediately see what is blocked, what must be done next, what risk exists, and what action is allowed. The design should feel like a serious manufacturing cockpit: dense, fast, trustworthy, status-rich, role-aware, and visually calm under pressure.
