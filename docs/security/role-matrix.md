# Role Matrix

## Objective

This matrix aligns web screens, mobile actions, API surfaces, approval powers, and override rights by role.

## Role Matrix

| Role | Primary web surfaces | Primary mobile actions | Primary API groups | Approval / override rights | Default scope |
| --- | --- | --- | --- | --- | --- |
| `PlatformAdmin` | tenant settings, integrations, AI provider setup, health, audit, feature flags | notification review, urgent approval only | `Users`, `Roles`, `Settings`, `Integrations`, `Webhooks`, `AI`, `Health` | can configure deployment-wide settings; no transactional override by default | deployment |
| `CompanyAdmin` | company, branch, workflow, numbering, language, masters, audit | approvals, attachments, notifications | `Companies`, `Branches`, `Departments`, `Settings`, `Languages`, `Users`, `Roles`, selected master APIs | approves configuration and master-data workflows; can override configuration locks | company |
| `SalesCoordinator` | quotes, sales orders, blanket orders, forecasts, ATP, order dashboard | order snapshot, approvals, notifications | `Quotes`, `SalesOrders`, `BlanketOrders`, `Forecasts`, `Dashboards`, `Attachments` | can submit commercial documents; cannot release WO or post stock | company or assigned branches |
| `PlanningManager` | MPS, MRP, BOQ, capacity, BOM library, routing, work orders | compact dashboards, approvals | `BOMs`, `BOMRevisions`, `ECOs`, `Routings`, `MPS`, `MRP`, `BOQ`, `Capacity`, `WorkOrders` | can approve planning outputs and release/re-release work orders | company and planning branches |
| `PurchaseManager` | supplier master, lead times, PR, PO, subcontract planning | approvals, supplier follow-up alerts | `Suppliers`, `SupplierLeadTimes`, `PurchaseRequisitions`, `PurchaseOrders`, `Subcontracting` | can approve PR/PO, vendor commitments, subcontract release | company and assigned branches |
| `StoreKeeper` | warehouses, bins, stock balance, issue, return, transfer, cycle count, traceability | issue scan, return scan, transfer, count, receipt assist | `Warehouses`, `Bins`, `Inventory`, `StockIssues`, `StockReturns`, `StockTransfers`, `CycleCounts`, `LotsSerials` | can post warehouse transactions within scope; cannot change planning or engineering masters | branch and warehouse |
| `ProductionSupervisor` | work orders, job cards, machine board, occupancy, downtime, shift entry, production receipt | job card actions, downtime log, machine status, receipt, shift handover | `WorkOrders`, `JobCards`, `MachineBoard`, `Downtime`, `ProductionReceipts`, `ScrapRework` | can assign and manage job cards; can hold operations; limited override for execution blockers | branch, department, machines |
| `MachineOperator` | job card queue, limited job card detail | start, pause, resume, quantity entry, downtime, photo upload | `JobCards`, `Downtime`, limited `Attachments` | no approval rights; cannot override locked or completed states | own-record and assigned machines |
| `QCInspector` | QC plan, incoming inspection, in-process, final inspection, NCR, traceability | QC checkpoint entry, NCR capture, photo upload | `Quality`, `LotsSerials`, `Attachments` | can place or release QC hold within workflow authority; cannot close commercial docs | branch, department, inspection workload |
| `DispatchManager` | pack list, dispatch planning, shipment, loading proof, order readiness | loading proof, shipment confirmation, approvals | `Dispatch`, `Dashboards`, `Attachments` | can confirm dispatch release and shipment steps | branch and dispatch warehouses |
| `PlantHead` | stage-wise dashboard, machine board, executive views, work order oversight | stage-wise board, approvals, escalation response | `Dashboards`, `WorkOrders`, `JobCards`, `Downtime`, `Quality` | can approve operational overrides and escalation actions | company or assigned plants |
| `ManagementViewer` | order delivery dashboard, stage-wise dashboard, executive cockpit, reports | mobile order snapshot, stage-wise mobile board | `Dashboards`, `Reports` | read-only; no transactional override | company or enterprise read scope |

## Approval Rights

| Workflow area | Primary approver roles |
| --- | --- |
| Master-data and configuration changes | `CompanyAdmin`, `PlatformAdmin` |
| BOM and ECO approval | `PlanningManager`, `Engineering`, `CompanyAdmin` when required |
| Work order release and re-release | `PlanningManager`, `ProductionSupervisor` within allowed workflow |
| Purchase requisition / purchase order | `PurchaseManager`, optional `PlantHead` escalation |
| QC hold and release | `QCInspector`, `ProductionSupervisor`, `PlantHead` escalation |
| Dispatch release | `DispatchManager`, `SalesCoordinator` for commercial confirmation where required |
| AI draft send/release | document owner plus designated manager approver |

## Override Rights

- Override rights are narrower than approval rights.
- Any override must be explicit, reason-coded, and audited.
- Typical override holders:
  - `PlantHead` for urgent operational state exceptions
  - `CompanyAdmin` for workflow or master-data unlocks
  - `PlanningManager` for planning conversion overrides
  - `PurchaseManager` for supplier and PO exception overrides

## Access Rules

- Users inherit no cross-company access by default.
- Mobile actions are a subset of role permissions, not a separate permission universe.
- API authorization must enforce the same role and scope rules as the UI.
- Read access to dashboards does not imply write access to underlying transactions.
