# Manual QA Checklist

- Open `/planning/workspace`.
- Confirm the planning dashboard shows snapshot, planned-order, pegging, shortage, capacity, and document sections.
- Click `Create Plan`; confirm centered workspace opens with plan type/status lookups, date fields, and numeric fence fields.
- In live mode, save a plan and reopen the workspace list after refresh.
- Click `Add planned order`; confirm item and UOM are governed selectors and quantity is a decimal control.
- Save a purchase planned order in live mode.
- Open `Preview conversion` and convert the purchase planned order to a purchase requisition.
- Save a work planned order without BOM revision and confirm work order conversion is disabled or blocked with released-BOM reason.
- Open `Review shortage` and save the shortage action in live mode.
- Open `/planning/mps`; confirm multiline MPS grid supports add/remove/save.
- Open `/sales/forecasts`; confirm forecast line entry is compact grid and import is disabled with reason.
- Open `/planning/mrp`; confirm MRP run draft opens in centered modal and run status/result grid is visible.
- Open `/planning/boq-requirements`; confirm BOQ line approval/conversion actions are working or disabled with reasons.
- Open `/planning/capacity`; confirm capacity buckets show available, required, overload/slack and source operation references.
- Confirm no live authenticated failure silently shows seeded planning rows.
