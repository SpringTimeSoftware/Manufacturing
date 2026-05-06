# Role-Wise UAT And Acceptance Matrix

## Scope

This UAT matrix covers the completed V1 manufacturing scope through P149 and aligns with the demo scenarios in `/docs/demo/demo-scenarios.md`.

## Role-Wise Flows

| Role | Flow | Acceptance Criteria |
| --- | --- | --- |
| SalesCoordinator | Create or review sales order demand and delivery risk. | Sales order is visible, promised date is clear, and order delivery dashboard shows deterministic blocker state. |
| PlanningManager | Review BOM, run MRP/BOQ, and convert recommendations. | BOM revision is approved, shortages are visible, and BOQ action lines show BUY/MAKE/TRANSFER decisions. |
| PurchaseManager | Review PR/PO and outside-processing handoff. | Subcontract/outside-processing due dates and supplier follow-up status are visible. |
| StoreKeeper | Issue material, return unused material, transfer bins, and perform cycle count. | Stock movement preserves warehouse/bin/lot context and queue-compatible mobile actions are available. |
| ProductionSupervisor | Release work order, monitor job cards, machine board, downtime, and shift handover. | WO, JC, machine board, downtime, and handover surfaces use consistent status vocabulary and audit-friendly actions. |
| MachineOperator | Start/pause/resume job card and capture quantities. | Mobile flow captures good/reject/scrap with offline queue state. |
| QCInspector | Record checkpoints, holds, releases, and NCR. | QC hold/release states are visible and NCR links to source document/rework context. |
| DispatchManager | Build pack list, plan shipment, and capture loading proof. | Shipment proof includes package scan, vehicle/seal notes, and queued media evidence. |
| PlantHead | Review stage-wise blockers and AI daily summary draft. | Dashboard blockers are deterministic; AI output is draft-only and review-gated. |
| PlatformAdmin | Review integrations, AI providers, health, and audit. | Provider config uses credential references; health endpoints and audit review are available. |

## Demo Scenario Coverage

| Scenario | Required Proof |
| --- | --- |
| Make-to-order fabricated assembly | Sales order -> BOM -> BOQ/MRP -> WO -> JC -> QC -> dispatch. |
| Mixed UOM sheet/weight item | Measurement profile, dimensional formula, stock issue, production receipt, traceability. |
| Outside processing | Subcontract plan, supplier due date, return/quality checkpoint, final assembly resume. |
| Overdue order from supplier and machine blockage | Stage-wise dashboard, order delivery dashboard, downtime, supplier delay, AI risk explanation. |

## Pilot Exit Criteria

- IIS publish folder can be produced without raw web source.
- SQL seed path can create minimum runnable platform/admin data.
- Backend build, tests, and publish pass.
- Web typecheck, tests, build, and host build pass.
- Mobile coverage baseline validates required action flows without pretending unsupported component tests exist.
- Open production gaps are listed in `/docs/release/production-readiness-review.md`.
