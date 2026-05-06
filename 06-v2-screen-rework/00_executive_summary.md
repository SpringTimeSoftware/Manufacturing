# V2 Deep Screen Rework Executive Summary

## Current Product State

The current STS Manufacturing ERP repository has a broad application skeleton across platform admin, organization setup, measurement, master data, sales, planning, engineering, procurement, inventory, production, quality, dispatch, reports, integrations, AI, and mobile execution. The app now has a runnable SQL-backed foundation for many completed backend modules, a localhost publish path, and smoke-tested company, branch, department, notification, approval, admin, planning, and work order surfaces.

That foundation is not yet a serious customer-demo ERP experience. The application is still best classified as **internal-only** for product, engineering, and controlled stakeholder walkthroughs. It is not pilot-ready and should not be positioned as production-grade until the rework waves in this specification are completed.

## What Is Good

- The manufacturing execution backbone is present and must be preserved: BOM, BOQ/MRP, Work Orders, Job Cards, Machine Board, Stage Wise Dashboard, and Order Delivery Dashboard.
- The platform stack is aligned with the target deployment model: ASP.NET Core, SQL Server, React web, React Native mobile, and IIS publish-folder deployment.
- The repository has broad route coverage and a consistent navigation model across web modules.
- The backend exposes many real controllers and contracts for organization, measurements, item compatibility, partners, sales/planning, engineering, procurement, inventory, production output, quality, dispatch, dashboards, integrations, and AI draft flows.
- Recent localhost smoke testing showed the app can open, authenticate, serve health endpoints, load core admin context screens, and navigate to planning/work-order surfaces.
- The reference UI direction for manufacturing dashboards is stronger than the average screen and should remain the visual baseline for density, hierarchy, status, and operational urgency.

## What Is Shallow

- Many pages are list-card or simple drawer experiences rather than full ERP editors with tabs, dense line grids, validation panels, audit history, attachments, media, and status lifecycle controls.
- Several screens still depend on fallback, seeded, or demo-style adapters instead of fully live API-backed behavior.
- Mobile screens are mostly action-shell implementations with seeded role navigation and local queue concepts, not production-ready offline/sync flows.
- Master data remains materially under-modeled at the UI level. Item, customer, supplier, pricing, discount, tax, currency, packaging, catalog, media, contacts, references, compliance, and replenishment depth are not adequate.
- Some required screens are missing as first-class UI routes, including global search, work center, machine, tool/resource setup, AI provider/prompt/ops review screens, and audit trail viewer.
- Attachment and document handling exists as a concept but is not yet a deep cross-module media/document subsystem.
- Several pages expose implementation-state language or source-status concepts that are useful for engineering but inappropriate for production users.
- The current app has too much screen-to-screen variance in density, form depth, copy quality, action bars, and live-data clarity.

## Most Dangerous Domains

1. **Login, auth, and shell copy**: Any internal scaffolding, stale-token friction, or debug language on entry screens damages trust immediately.
2. **Item master**: A shallow item form is the single highest master-data risk because manufacturing, planning, procurement, inventory, quality, labels, catalog, costing, and dispatch all depend on it.
3. **Customer and supplier masters**: Partner records need legal identity, sites, contacts, terms, credit, compliance, references, and history. Current depth is not enough for operational use.
4. **Pricing, discount, tax, and currency**: These remain largely absent or deferred and should not be improvised in order/sales flows.
5. **Production receipt, scrap, rework, and inventory-cost hooks**: These flows must not be finalized on V1 assumptions or shallow master-data references.
6. **Mobile execution**: Current mobile screens need live role/task assignment, offline queue integrity, device binding, scan validation, media proof, and sync conflict handling.
7. **Quality and traceability**: QC, NCR, lot/serial/catch-weight, hold/release, and proof capture need deeper transaction integrity before production pilot use.
8. **Workflow, approvals, and audit**: Approval screens exist, but full status transition governance, audit review, and role-aware restrictions are not consistently visible.
9. **Integrations and AI**: Backend draft-safe concepts exist, but admin/provider screens and production safety boundaries need explicit UI and governance.
10. **Reports and documents**: Travelers, labels, pack lists, and print packs must become parameterized, traceable, and document-controlled.

## Readiness Verdict

The current application is **internal-only**.

It can support engineering demonstrations of navigation, architecture, and selected live API flows. It is not serious customer-demo ready because too many screens are shallow, demo-backed, missing, or lacking ERP-grade field depth and operational controls. It is not pilot-ready because mobile execution, master data depth, commercial foundations, audit, attachments, workflow, and production transaction validation are incomplete.

## Required Before Serious Customer Demo

- Complete Wave 1 critical login/auth/shell/content fixes.
- Remove all scaffold, prompt, technology, debug, source-status, and demo wording from production-facing UI.
- Add a clear all-menu super admin seed/rule for demos without bypassing role-governance design.
- Convert the top navigation/context controls into a compact, non-overlapping enterprise header.
- Ensure each visible screen declares live/fallback status internally for support without exposing implementation copy to users.
- Rework platform/admin and organization screens into dense ERP setup pages with tabbed editors, validation, audit panels, and live persistence.
- Rebuild item, customer, supplier, pricing, and commercial master screens to V2 depth before expanding receipt, scrap, rework, landed cost, returns, or costing flows.
- Harden mobile execution around live assignments, scans, queued actions, proof media, and sync error handling.
- Produce role-wise demo data that covers realistic orders, items, BOMs, routes, WOs, job cards, QC, dispatch, and dashboard risks.
- Pass smoke, role-wise UAT, security hardening checks, and performance checks with no obvious layout defects or fatal API errors.
