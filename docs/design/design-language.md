# Design Language

## Objective

This design language converts the reference HTML screens into a stable visual system for all web modules. The visual direction must stay light, modern, data-dense, and manufacturing-specific.

## Reference Anchors

The following reference screens define the visual baseline:

- `W057_Order_Delivery_Dashboard.html`
- `W060_BOM_Management.html`
- `W066_BOQ_Requirements.html`
- `W080_Work_Orders.html`
- `W082_Job_Cards.html`
- `W084_Machine_Schedule_Board.html`
- `W085_PPS_Machine_Occupancy_Calendar.html`
- `W108_Stage_Wise_Dashboard.html`

## Core Visual Direction

- Use a sky-blue and white manufacturing UI, not a dark operations console.
- Use soft gradients and clear white cards instead of flat gray admin-template surfaces.
- Keep information dense but breathable with spacing, strong grouping, and restrained accents.
- Prefer visual hierarchy through scale, contrast, and surface layering rather than loud saturation.

## Color Tokens

The reference HTML consistently uses this palette family:

| Token | Value | Use |
| --- | --- | --- |
| `--color-bg-page` | `#f6fbff` | page background |
| `--color-bg-soft` | `#f8fbff` | secondary section wash |
| `--color-bg-accent` | `#eaf6ff` | highlighted panels and selected states |
| `--color-surface` | `#ffffff` | main cards, tables, drawers |
| `--color-surface-tint` | `#ffffffcc` | glass-like overlays where needed |
| `--color-text-strong` | `#0f172a` | titles and primary labels |
| `--color-text-muted` | `#475569` | secondary labels and helper text |
| `--color-primary` | `#0ea5e9` | primary action, links, active pills |
| `--color-primary-deep` | `#0369a1` | emphasis, charts, important accents |
| `--color-primary-dark` | `#075985` | hover or selected emphasis |
| `--color-primary-soft` | `#38bdf8` | chart fill, soft badge accent |
| `--color-border` | `#e2e8f0` | borders and separators |
| `--color-success` | `#16a34a` | success and completed states |
| `--color-success-deep` | `#166534` | strong positive emphasis |
| `--color-warning` | `#f59e0b` | warnings and at-risk states |
| `--color-warning-deep` | `#92400e` | warning text on light pills |
| `--color-danger` | `#ef4444` | hard blockers and failed states |
| `--color-danger-deep` | `#b91c1c` | critical text emphasis |
| `--color-neutral-border-2` | `#e5e7eb` | calendar or dense grid separators |

## Surface Rules

- Primary content sits on white cards over a very light blue or white-blue gradient background.
- Cards use subtle elevation and crisp borders, not heavy drop shadows.
- Surfaces should feel layered, but the page should still read as one calm operational workspace.
- Drawers use the same white surface language as cards so detail views feel connected rather than modal-heavy.

## Shape Tokens

- Card radius: 18px to 24px for major surfaces.
- Input and badge radius: 10px to 14px.
- Pill radius: full or high-radius treatment for statuses and risk chips.
- Tables and drawers should avoid sharp corners; the references favor softly rounded containers.

## Shadow Style

- Use soft, low-contrast shadows with blue-gray tint rather than dark generic shadows.
- Keep shadows more visible on hero cards and drawers, lighter on dense tables and KPI strips.
- Avoid stacking multiple heavy shadows on one page.

## Spacing Rhythm

- Page gutters should feel generous enough for dashboards and filters.
- Use tight internal spacing for data clusters, with larger gaps between cards and sections.
- KPI strips use compact padding; drawers and editors use slightly roomier internal spacing.
- Dense tables should use compact row heights, but never collapse so tightly that badges and state labels feel cramped.

## Typography

- Titles should be sharp and high-contrast, using weight to guide hierarchy.
- Secondary text should remain readable, slightly cool-toned, and consistent.
- KPI numbers can be larger and bolder than table-heavy screens, but not cartoonishly oversized.
- Small labels should stay crisp and purposeful; avoid washed-out gray text that reduces scanability.

## Core Patterns

### KPI Strips

- Used in `W057_Order_Delivery_Dashboard.html`, `W066_BOQ_Requirements.html`, and `W108_Stage_Wise_Dashboard.html`.
- A KPI strip is the first scan surface on dashboards and planning screens.
- Use 3 to 6 compact cards per row, each with one key number, one short label, and optional trend or status hint.

### Filter Bars

- Filters stay compact and horizontal.
- Preferred filters: search, status, date range, plant/warehouse, and one domain-specific filter.
- Avoid giant advanced-filter walls as the default state.

### Status Badges and Pills

- Status is communicated through soft background pills with strong text color.
- Use a consistent color family by meaning:
  - blue for active or informational states
  - green for ready/completed states
  - amber for warning, pending, or constrained states
  - red for blocked, overdue, rejected, or critical states

### Right Drawers

- `W060_BOM_Management.html`, `W080_Work_Orders.html`, and `W082_Job_Cards.html` imply right-side detail drawers.
- Use drawers for row details, quick actions, timelines, and contextual editing when the user should preserve list context.
- Use full-page navigation only when the user is entering a deep edit or multi-step workflow.

### Dense Tables

- Use tables for lists with many records, sortable columns, or operational review.
- Best suited for BOM libraries, work orders, purchase lists, stock balances, and job card queues.
- Pair tables with sticky filters, badges, and limited inline actions.

### Cards

- Use cards for dashboards, summary clusters, compact analytics, and screen sections where comparison matters more than raw record count.
- Cards should support quick scanning, not become decorative wrappers for every single field.

### Lane Boards

- `W084_Machine_Schedule_Board.html` defines the lane-board pattern.
- Use horizontal or vertical machine lanes with compact queued work items, risk pills, and current/next emphasis.
- Lane boards should prioritize operational readability over ornamental drag-and-drop visuals.

### Calendar Occupancy

- `W085_PPS_Machine_Occupancy_Calendar.html` defines the occupancy calendar pattern.
- Calendar cells should communicate load, booking, and overload clearly through color fill, labels, and density.
- Keep borders light and the occupancy blocks easy to compare across days and machines.

### Timelines

- `W082_Job_Cards.html` implies event timelines for execution history.
- Use timelines for job card events, downtime, QC holds, approvals, and shift handovers.
- Timeline entries should emphasize action, actor, timestamp, and note without visual clutter.

## Tables vs Cards vs Drawers

| Pattern | Use when | Avoid when |
| --- | --- | --- |
| Table | many records, comparison by columns, operational scanning | the task is mostly narrative or one-record summary |
| Card grid | KPI summary, dashboard overview, short action clusters | the user needs heavy sorting or long lists |
| Right drawer | inspect or act on a selected record while staying in context | the workflow requires long-form editing or printing |

## Screen-Specific Guidance

- `W057_Order_Delivery_Dashboard.html`: customer-order centric dashboard with risk chips, completion progress, and next-action clarity.
- `W060_BOM_Management.html`: planner-friendly list plus detail drawer with revision awareness.
- `W066_BOQ_Requirements.html`: shortage-first planning screen with action badges like BUY, MAKE, or TRANSFER.
- `W080_Work_Orders.html`: dense planner/supervisor list with release actions and readiness states.
- `W082_Job_Cards.html`: action-heavy supervisor/operator view with timeline context.
- `W084_Machine_Schedule_Board.html`: lane-based machine visibility with queued work and constraint markers.
- `W085_PPS_Machine_Occupancy_Calendar.html`: date-bucket planning surface with occupancy density.
- `W108_Stage_Wise_Dashboard.html`: cross-functional board from order confirmation to dispatch.

## Visual Guardrails

- Do not default to generic enterprise gray UI.
- Do not introduce dark-mode-first styling for the web product baseline.
- Do not overuse bright accent colors outside meaningful status semantics.
- Do not replace contextual drawers and boards with generic modal workflows.
- Preserve the same visual grammar across screens that do not exist in the original reference set.
