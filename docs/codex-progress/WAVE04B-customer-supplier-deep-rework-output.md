# Wave 4B Customer And Supplier Deep Business Rework Output

Date: 2026-04-22

## Scope

- Reworked Customer and Supplier master list/detail screens only.
- Applied the existing global ERP UI/UX components and lookup rules.
- Did not change sidebar/menu, Item Master, unrelated modules, database schema, or backend behavior.

## Backend And DB Audit

- Existing backend controllers already expose governed core create/update routes for:
  - customers
  - customer addresses
  - suppliers
  - supplier addresses
  - supplier lead times
- Existing backend contracts cover the core partner fields used by the current database model.
- No additive SQL, EF entity, DbContext, seed, or backend controller change was made in this pass.
- Web API contracts and client methods were added for the existing partner create/update endpoints.

## Customer Master Changes

- Customer list now uses an ERP-grade KPI strip:
  - total customers
  - active customers
  - credit watch
  - sites ready
  - contacts ready
  - catalog enabled
- Customer filters now include:
  - search
  - status
  - customer type
  - city/region
  - credit status
  - payment terms
  - has contacts
  - has ship-to
- Customer grid now includes dense business columns:
  - customer code
  - customer name
  - legal/type
  - terms
  - credit status
  - contacts
  - sites/addresses
  - status
- Row click opens the governed centered modal workspace.
- New customer draft opens the same modal in create mode.
- Customer modal now exposes the required 12 sections:
  - Core Info
  - Legal/Tax
  - Sites / Bill-to / Ship-to
  - Contacts
  - Contact Points
  - Credit Profile
  - Terms & Commercial
  - Dispatch Preferences
  - Catalog / Visibility
  - Customer Item References
  - Documents
  - Audit / History

## Supplier Master Changes

- Supplier list now uses an ERP-grade KPI strip:
  - total suppliers
  - active suppliers
  - approved suppliers
  - compliance pending
  - lead-time coverage
  - contacts ready
- Supplier filters now include:
  - search
  - status
  - supplier type/category
  - compliance status
  - preferred supplier
  - payment terms
  - lead-time ready
- Supplier grid now includes dense business columns:
  - supplier code
  - supplier name
  - supplier type/category
  - terms
  - compliance
  - lead-time signal
  - contacts
  - status
- Row click opens the governed centered modal workspace.
- New supplier draft opens the same modal in create mode.
- Supplier modal now exposes the required 12 sections:
  - Core Info
  - Legal/Tax
  - Sites / Addresses
  - Contacts
  - Contact Points
  - Terms & Commercial
  - Supplier Categories / Capability
  - Lead-Time Rules
  - Approved Items / Vendor References
  - Compliance Documents
  - Documents
  - Audit / History

## Lookup Enforcement

- Controlled lookup/select controls were applied for:
  - payment terms
  - currency
  - tax category
  - customer type
  - supplier type/category
  - lifecycle status
  - contact role
  - communication channel
  - credit status
  - dispatch preference
  - preferred supplier
  - compliance status
  - supplier capability
  - default branch display
- Free-text remains only for fields that are free-form in the current core partner model, such as customer/supplier names and tax registration text.

## Save, Document, And Audit Status

- Core customer and supplier create/update support is wired to the existing backend routes.
- Save actions are active only for live sessions with partner master write access.
- Demo/test sessions show disabled save with a business-safe reason.
- Deep profile sections beyond the existing core partner model remain view/edit-readiness surfaces until partner profile persistence is added.
- Document upload actions are disabled with the business-safe reason: document control is not enabled for partner masters yet.
- Audit/history panels are present and use a clear business-facing pending state until recorded partner change history is available.

## Tests

- Added `Wave04BCustomerSupplierDeepRework.test.tsx`.
- Updated `MasterDataUxGlobal02.test.tsx` to assert the deeper customer/supplier modal sections.
- Coverage added for:
  - customer KPI strip and dense grid columns
  - customer create modal and 12 required sections
  - supplier KPI strip and dense grid columns
  - supplier create modal and 12 required sections
  - payment/contact lookup controls
  - disabled document upload reasons
  - absence of internal/scaffold copy in partner pages

## Validation

- `npm run typecheck`: passed.
- `npm test -- src/pages/Wave04BCustomerSupplierDeepRework.test.tsx`: passed.
- `npm test -- src/pages/MasterDataUxGlobal02.test.tsx`: passed.
- `npm test`: passed, 24 test files and 98 tests.
- `npm run build`: passed; Vite reported the existing large chunk warning.
- `npm run build:host`: passed and refreshed the IIS host web assets; Vite reported the existing large chunk warning.
- Backend, web dev server, and mobile Metro were already running and responding after validation:
  - backend health: `https://localhost:7042/health` returned 200
  - web dev server: `http://127.0.0.1:5173` returned 200
  - mobile Metro: `http://127.0.0.1:8081/status` returned `packager-status:running`

## Remaining Customer/Supplier Gaps

- Additive partner profile persistence is still needed for deep sections beyond existing core customer/supplier records.
- Dedicated partner document storage and approval workflow is still needed.
- Recorded partner audit/history feed is still needed.
- Customer/supplier site/contact create/edit inside the modal remains a future follow-up; existing address/contact data is displayed and core partner save is wired.
- Credit profile, catalog visibility, dispatch preferences, supplier capabilities, and compliance document metadata are governed UI surfaces but not yet backed by dedicated V2 partner profile tables.

## Exact Next Recommended Wave

Wave 4B.1: Partner Profile Persistence, Site/Contact Editing, Documents, And Audit Foundation.
