# V2 Screen Acceptance Checklist

## Global Gate

- No scaffold, dev, prompt, technology, adapter, fallback, or implementation copy is visible to business users.
- No route exposes a fatal API/runtime error during smoke testing.
- No fallback remains where a live API and table already exist.
- No screen has massive unexplained blank space.
- Header, sidebar, action bars, and page content do not overlap at common desktop widths.
- Role restrictions are visible through enabled/disabled actions, permission messaging, and route guards.
- All visible dates, statuses, quantities, branches, warehouses, users, and documents use consistent formats.

## Data And API Gate

- Screen reads from approved live API contracts unless explicitly marked training-only.
- Create/update/delete actions call approved APIs and return business-safe errors.
- Required SQL tables, keys, indexes, constraints, and seed data exist.
- Reference data selectors are live, filtered by tenant/company/branch where required.
- API errors are handled without exposing stack traces, EF terms, or implementation details.
- Audit events are written for master-data changes, status transitions, approvals, and production/inventory/quality transactions.

## Form Depth Gate

- Required fields, optional fields, derived fields, and read-only fields are clearly separated.
- Validation runs client-side for immediacy and server-side for authority.
- Editors use tabs or sections for dense ERP records.
- Line grids support add, edit, delete, copy, reorder, bulk update, import, and validation where relevant.
- Attachments/media are available where drawings, photos, certificates, manuals, proofs, labels, or customer specs are part of the process.
- Audit/history is visible for records with compliance, approval, or transaction impact.

## Master Data Gate

- Item master includes Core Info, Classification, Images & Media, Catalog, UOM & Conversions, Packaging, Physical Specs, Barcode & Labels, Variants/Templates, Manufacturing, Planning/Replenishment, Inventory/Warehouse Policy, Quality/Traceability, Sales/Commercial, Purchase/Vendor, Customer References, Attachments/Documents, and Audit/History.
- Customer and supplier screens include legal identity, sites, contacts, communication preferences, terms, compliance documents, commercial profiles, and history.
- Pricing, discount, tax, currency, and trade terms are not bypassed by shallow order fields.
- Master records cannot be activated until required dependencies are valid.

## Manufacturing And Execution Gate

- BOM, routing, work order, job card, machine board, stage dashboard, and delivery dashboard behavior remains preserved.
- Production receipt, scrap, rework, issue, return, QC, dispatch, and traceability flows enforce status, quantity, lot/serial, warehouse/bin, and role validations.
- Status transitions are explicit and auditable.
- Mobile execution supports scan, photo/media proof, offline queue, retry, conflict handling, and sync status before pilot use.

## UX Gate

- Screen title, purpose, status, and primary action are visible above the fold.
- Filters are sticky or quickly recoverable.
- Tables have useful columns, sort, saved views, empty states, and row actions.
- Drawers and detail pages have consistent headers, status chips, tabs, and audit panels.
- High-risk actions require confirmation and show business impact.
- Dashboards have real KPIs, drilldowns, and exception lists; they are not static cards.

## Validation Gate

- `npm run typecheck` passes for web changes.
- `npm test` passes for changed web behavior.
- `npm run build` passes.
- `npm run build:host` passes.
- Backend build/test/publish pass when backend contracts, schema, or host behavior is touched.
- Localhost smoke passes.
- Role-wise UAT passes for the completed scope or records exact, accepted exceptions.
- Security hardening review has no open critical blockers for the changed scope.
