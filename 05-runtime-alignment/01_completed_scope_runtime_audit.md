# Completed Scope Runtime Audit

## Cutline

This audit covers backend/runtime scope completed through `P067` and web scope completed through `P083`. It does not resume `P084` or any later prompt-chain feature work.

## Runtime Status By Area

| Area | Backend reality | SQL reality after this wave | Web reality | Status |
| --- | --- | --- | --- | --- |
| Auth/session/context | `api/auth` is bootstrap identity backed, JWT-backed, audit-writing, and now captures forgot-password requests in SQL; users/roles have a SQL visibility mirror but auth validation still uses bootstrap identity. | Platform audit/notification/translation tables plus app-user/role/permission/password-recovery tables are present. | Login, restore, switch context, demo fallback, recovery, and warehouse preference surfaces exist. | `PARTIAL` |
| Organization company/branch/department/warehouse/bin/shift | `OrganizationControllers` and `OrganizationService` use EF `org` DbSets. | `org.Companies`, `Branches`, `Departments`, `Warehouses`, `Bins`, `Shifts` added with indexes and minimum ACME seed. | P082 and P083 screens are live-first with seeded fallback. | `RUNNABLE` |
| Measurement/UOM | `MeasurementItemControllers` and `MeasurementService` use EF `measure` DbSets. | `measure.UomClasses`, `Uoms`, `UomConversions`, `MeasurementProfiles`, `MeasurementFormulas` added with minimum seed. | P084/P085 screens are not executed in this run. | `RUNNABLE` backend, `BLOCKED` web |
| Item/customer/supplier compatibility layer | Master read/write services exist through `MeasurementService` and partner/resource services; R013 added compatibility request fields. | `master` item, barcode, customer, supplier, address, and lead-time tables added with minimum masters seed. | Item/customer/supplier pages beyond placeholder framework are later prompts. | `PARTIAL` |
| BOM/routing/ECO | `EngineeringControllers` and `EngineeringService` use EF resource/engineering tables. | `resource` operation/routing tables and `engineering` BOM/ECO tables added with minimum routing/BOM seed. | Existing placeholder/reference screens remain; deeper engineering screens are later prompts. | `RUNNABLE` backend, `PARTIAL` web |
| MPS/MRP/BOQ/work order/job card | Sales/planning/procurement/inventory/production services exist and preserve the manufacturing backbone. | `sales`, `planning`, `procurement`, `inventory`, and base `production` execution tables added; P064 output tables preserved. | Planning/execution web screens are later prompts; dashboards consume selected APIs. | `RUNNABLE` backend, `PARTIAL` web |
| Production receipt/scrap/rework | `P064` EF-backed APIs exist and post inventory through compatibility helpers. | P064 `production.ProductionReceipts`, lines, scrap, and rework DDL already existed and remains ordered after base production tables. | Web/mobile receipt screens are later prompts. | `RUNNABLE` backend, `BLOCKED` web |
| Quality | `P065` EF-backed quality APIs exist. | P064/P065 quality DDL already existed and remains in the ordered foundation pack. | Quality screens are later prompts. | `RUNNABLE` backend, `BLOCKED` web |
| Dispatch/dashboard/report | `P066` dispatch APIs and dashboard/report reads exist. | Dispatch DDL already existed; supporting sales/planning/production/inventory tables now exist. | P079 dashboard screens use live dashboard APIs with fallback. | `PARTIAL` |
| Integration/AI draft registry | `P067` integration, import/export, webhook, AI provider/model/template/run APIs exist. | `integration` and `ai` DDL already existed; platform seed adds draft-safe reference rows. | AI setup screens are later prompts. | `RUNNABLE` backend, `BLOCKED` web |
| Localization/settings/admin | Localization resources, user/role reads, workflow/numbering reads, tenant-setting reads, notification inbox reads, and approval decisions now have SQL-backed runtime endpoints. Auth-user mutation and full settings mutation remain future prompt-chain work. | Platform translations plus admin/runtime tables for users, roles, permissions, workflows, document series, tenant settings, notification inbox metadata, approvals, and password recovery are present. | P078-P081 screens are live-first with seeded fallback where backend is unavailable. | `PARTIAL` |

## Preserved Assets

- Manufacturing execution backbone remains preserved: BOM, BOQ/MRP, Work Orders, Job Cards, Machine Board, Stage Wise Dashboard, and Order Delivery Dashboard.
- IIS publish-folder deployment remains preserved through `npm run build:host` and ASP.NET Host `wwwroot`.
- Demo/mock paths remain present for unavailable or intentionally deferred backend contracts.
- R013 compatibility adapters remain the path for item/customer/supplier references across preserved runtime flows.

## Not Advanced

- No normal prompt-chain feature beyond the completed P083 point was executed.
- No HR, payroll, full accounting, landed-cost finalization, destructive master-data reset, or speculative future module was introduced.
