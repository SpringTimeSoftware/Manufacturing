# Reference UI Notes

These HTML files are the visual anchor for the web product.

## Files
- `W057_Order_Delivery_Dashboard.html`
- `W060_BOM_Management.html`
- `W066_BOQ_Requirements.html`
- `W080_Work_Orders.html`
- `W082_Job_Cards.html`
- `W084_Machine_Schedule_Board.html`
- `W085_PPS_Machine_Occupancy_Calendar.html`
- `W108_Stage_Wise_Dashboard.html`

## Design rules extracted from the reference screens
1. Use a light, modern manufacturing UI, not a dark industrial console and not a default admin template.
2. Keep a sky-blue / white palette with soft gradients, rounded cards, subtle borders, and clean shadows.
3. Prefer dense but breathable screens: KPI strips, filter bars, compact badges, and clean grids.
4. Use right-side drawers or detail panels for row details instead of always navigating away.
5. Use lane boards, kanban columns, and calendar occupancy surfaces where they improve operations visibility.
6. Use status badges and pill chips consistently for state, risk, action recommendation, and machine status.
7. Keep top actions obvious and limited: primary action, export/print, and a few contextual actions.
8. Use activity timelines for execution logs such as job cards and shift handovers.
9. Keep filter bars simple: search, status, date range, and one or two domain-specific filters.
10. Preserve the overall look-and-feel across all manufacturing modules, including screens not present in the reference set.

## Important behavior cues
- `W080_Work_Orders.html` implies a planner-first work order view with release and job-card creation actions.
- `W082_Job_Cards.html` implies a supervisor/operator view with timeline history and direct action buttons.
- `W084_Machine_Schedule_Board.html` implies a lane view by machine with queued cards and risk chips.
- `W085_PPS_Machine_Occupancy_Calendar.html` implies a date-bucket occupancy calendar for planning.
- `W108_Stage_Wise_Dashboard.html` implies a cross-functional board from confirmed order through dispatch.
- `W057_Order_Delivery_Dashboard.html` implies customer-order centric risk visibility and progress calculation.
