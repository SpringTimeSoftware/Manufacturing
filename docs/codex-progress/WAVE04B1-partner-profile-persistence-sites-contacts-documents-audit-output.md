# Wave 4B.1 Partner Profile Persistence, Sites, Contacts, Documents, And Audit Output

Date: 2026-04-23

## Scope Completed

Wave 4B.1 added a compatibility-safe persistence foundation behind the Customer and Supplier modal workspaces from Wave 4B. The work stayed inside partner master data and did not start pricing, tax, sidebar, engineering, planning, or unrelated module work.

## Backend / DB Changes

- Added additive partner extension entities for customer and supplier profile data, contact points, item/vendor references, and document metadata.
- Added EF DbSets and entity configurations for the new partner profile tables.
- Added customer and supplier partner workspace contracts and upsert request models.
- Added resource service methods for reading and saving customer and supplier partner workspaces.
- Added API endpoints:
  - `GET /api/customers/{id}/profile`
  - `PUT /api/customers/{id}/profile`
  - `GET /api/suppliers/{id}/profile`
  - `PUT /api/suppliers/{id}/profile`
- Restored the host project file so the solution, local backend run, and IIS publish-folder deployment remain buildable.
- Added idempotent SQL pack:
  - `database/ddl/10-master-data/030_partner_master_v2_extension_tables.sql`
- Applied the SQL pack to local development database:
  - Server: `(localdb)\MSSQLLocalDB`
  - Database: `STS_Mfg_Dev`
- Updated `database/README.md` execution order so `030_partner_master_v2_extension_tables.sql` runs after `020_item_master_v2_extension_tables.sql` and before commercial packs.

## Customer Persistence Completed

- Customer legal/tax profile fields persist through the partner workspace API.
- Customer terms/commercial fields persist through the partner workspace API.
- Customer dispatch preference fields persist through the partner workspace API.
- Customer catalog visibility flags persist through the partner workspace API.
- Customer item reference profile rows persist as additive profile metadata.
- Customer document metadata rows persist without implying binary upload support.
- Existing customer core save still uses the existing core customer API before saving partner profile data.

## Supplier Persistence Completed

- Supplier legal/tax profile fields persist through the partner workspace API.
- Supplier terms/commercial fields persist through the partner workspace API.
- Supplier capability/compliance metadata persists through the partner workspace API.
- Supplier lead-time profile fields persist through the partner workspace API.
- Supplier approved item/vendor reference rows persist as additive profile metadata.
- Supplier document metadata rows persist without implying binary upload support.
- Existing supplier core save still uses the existing core supplier API before saving partner profile data.

## Site / Contact Editing Completed

- Customer bill-to, ship-to, and operational site edits are staged in the governed modal and saved through existing address APIs.
- Supplier order, remittance, subcontract, and operating site edits are staged in the governed modal and saved through existing address APIs.
- Customer and supplier contact points can be added and edited with controlled role/channel fields.
- Contact-point metadata persists through the partner workspace API.
- The modal keeps the governed centered editor pattern and does not reintroduce right-side drawers for deep partner editing.

## Document Support Status

- Customer and supplier document metadata lists are persisted.
- Document row add/edit support is available for metadata such as document type, reference, status, owner, and review/expiry dates.
- Binary file upload/storage is not implemented in this wave.
- Upload actions remain disabled with a business-safe reason: binary upload storage is not enabled, but document metadata can be saved.

## Audit / History Support Status

- Partner profile APIs return audit events from the shared audit log where matching customer or supplier changes are recorded.
- Customer and supplier modal audit sections render persisted events when available.
- When no audit events exist, the modal shows a compact business-facing empty state instead of a fake history feed.
- Remaining audit depth depends on complete write-path audit coverage for every profile sub-section.

## Tests Added / Updated

- Added partner profile adapter tests for customer/supplier workspace save mapping and audit event readback.
- Added UI tests for customer site, contact point, and document metadata editing in the governed modal.
- Added UI tests for supplier site, contact point, and compliance/document metadata editing in the governed modal.
- Updated Wave 4B customer/supplier tests for the new metadata-save document state.

## Validation Results

- SQL DDL apply: PASS
  - `sqlcmd -S "(localdb)\MSSQLLocalDB" -d "STS_Mfg_Dev" -E -b -i "database\ddl\10-master-data\030_partner_master_v2_extension_tables.sql"`
- Web typecheck: PASS
  - `npm run typecheck`
- Web tests: PASS
  - `npm test`
  - 26 files, 102 tests passed.
- Web production build: PASS
  - `npm run build`
- IIS host web build/copy: PASS
  - `npm run build:host`
- Backend build: PASS
  - `dotnet build C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln`
- Backend tests: PASS
  - `dotnet test C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln --no-build`
  - 12 tests passed.
- Backend publish: PASS
  - `dotnet publish C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.Host\STS.Mfg.Host.csproj -c Release`
- Mobile typecheck: PASS
  - `npm run typecheck`
- Mobile coverage-plan validation: PASS
  - `npm run test:coverage-plan`
  - 7 action-flow coverage entries validated.

## Local Project Run Status

- Backend: RUNNING
  - `https://localhost:7042`
  - `http://localhost:5102`
  - `https://localhost:7042/api/health/ready` returned 200.
- Web: RUNNING
  - `http://127.0.0.1:5173`
  - `http://127.0.0.1:5173/` returned 200.
  - `http://127.0.0.1:5173/api/health/ready` returned 200 through the Vite proxy.
- Mobile Metro: RUNNING
  - `http://127.0.0.1:8081`
  - `http://127.0.0.1:8081/status` returned 200.

## Remaining Partner Gaps

- Binary document upload and preview storage remain future work.
- Partner document remove is metadata-state based; hard delete was not introduced.
- Credit and compliance workflows remain operational profile fields, not full accounting/AP/AR ledgers.
- Pricing, discount, tax, and currency depth was intentionally not started.
- More granular partner audit coverage may be needed if every sub-section must show field-level diffs.
- Address save uses existing address APIs; richer address validation and jurisdiction lookup should be handled in a later partner/address hardening pass.

## Exact Next Recommended Wave

Wave 4C: Pricing, Discount, Tax, Currency, And Commercial Master Data Deep Rework.
