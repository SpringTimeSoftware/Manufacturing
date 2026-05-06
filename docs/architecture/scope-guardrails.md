# Scope Guardrails

## Product Position

STS Manufacturing ERP is a manufacturing operating system for discrete and mixed-unit manufacturers. It is not a generic ERP, generic admin portal, or accounting-first suite.

The product is centered on this operating chain:

Sales demand -> engineering definition -> planning and shortage control -> work order execution -> quality closure -> dispatch readiness -> management risk visibility

## V1 Scope Statement

Version 1 focuses on the workflows required to plan, execute, track, inspect, and dispatch manufactured work in small and mid-sized factories with mixed make-to-order and make-to-stock demand.

V1 includes:

- Platform and security foundations: users, roles, approvals, numbering, workflow, audit, attachments, notifications
- Organization and operational masters: company, branch, warehouse, bin, shifts, work centers, machines, reason codes
- Measurement and item masters: UOM classes, conversions, measurement profiles, item master, variants, barcodes, supplier lead times
- Sales demand inputs: quotes, sales orders, blanket orders, demand forecast, order promise inputs
- Engineering controls: BOMs, revisions, routings, alternate items, engineering changes
- Planning: MPS, MRP, BOQ requirements, shortage visibility, capacity planning, recommendation conversion
- Procurement support tied to planning: purchase requisitions, purchase orders, subcontract planning
- Inventory and stores execution: stock balances, issue, return, transfer, cycle count, lot and serial traceability
- Production execution: work orders, job cards, machine schedule board, occupancy calendar, downtime, shift handover, production receipts, scrap, rework
- Quality: inspection plans, incoming, in-process, final inspection, hold and release, NCR
- Dispatch: pack lists, dispatch planning, shipments, loading proof
- Dashboards and operational visibility: order delivery risk, stage-wise dashboard, executive cockpit, print pack, traceability views
- Controlled integrations and AI: provider setup, imports and exports, safe AI summaries, translation, message drafting, approved operational assistant flows

## Explicit V1 Exclusions

The following areas are out of scope for V1 and must not be introduced indirectly through side modules or screen creep:

- HR, payroll, attendance payroll integration, recruitment, or general HRM
- Full accounting, general ledger, AP, AR, taxation, bank reconciliation, or financial close
- Broad CRM beyond manufacturing demand capture
- Retail POS, e-commerce storefronts, or consumer order management
- Full PLM or bi-directional CAD integration
- Full CMMS or preventive maintenance suite
- Deep MES or PLC acquisition beyond machine state, downtime, and future-ready inbound event hooks
- Process manufacturing recipe engine with potency, specific gravity, or advanced batch genealogy
- Field service, warranty, or customer support suite

## Supported Manufacturing Modes

V1 must support these operating modes from the same product shape:

- Make to stock: replenishment and service-level driven planning
- Make to order: customer-order-driven production and material planning
- Engineer to order: order-specific BOM or routing revision control with attachment support
- Mixed mode: the same tenant can run stock, order-driven, and engineering-driven demand together

## Target Industries

The first-market-fit industries are:

- Fabricated metal
- Industrial assembly
- Ozone and equipment assembly
- Packaging and printing-like job-work environments
- Small and mid-sized manufacturers with mixed-unit measurement behavior and hybrid MTO/MTS demand

## First Demo Tenant

The default demo tenant for repository decisions is:

- Name: `STS Precision Fabricators`
- Profile: small-to-mid-sized fabricated metal and industrial assembly manufacturer
- Operating model: mixed make-to-order and make-to-stock
- Plant shape: one plant with multiple work centers, bins, shifts, and machine lanes
- Measurement complexity: count, weight, and dimensional formula items in the same tenant
- Core demo storyline: sales order -> BOM revision -> MRP shortage -> work order release -> job card execution -> in-process QC -> dispatch readiness -> order risk dashboard

## Guardrails That Must Not Drift

- Preserve ASP.NET Core backend, SQL Server, React web, React Native mobile, and IIS publish-folder deployment.
- Keep mobile focused on action and execution. Keep web focused on setup, planning, dense operations, reporting, and administration.
- Preserve the reference UI visual language for web screens.
- Prefer manufacturing workflows and visibility over generic ERP breadth.
- Add modules only when they directly strengthen planning, execution, quality, dispatch, or management visibility for the target industries.

## Change Control Rule

Any future prompt output that expands scope beyond these guardrails must explicitly document why the change is required and how it avoids violating the V1 exclusions above.
