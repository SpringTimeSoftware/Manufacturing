# WS07 Mobile / Integrations / AI / Reporting Output

Date: 2026-05-13

## Status

COMPLETE for the WS07 touched and revalidated scope. Critical touched-scope blockers are 0. New integration, AI, import/export, delivery-log, report, and saved-view web routes are discoverable, use governed controls, open centered workspaces where deep editing is needed, and have truthful actions: working in live authenticated sessions where APIs exist, or disabled with clear business-safe reasons where external workflow depth remains future work.

## Files Changed

- Web contracts/API client: added integration provider, connection, webhook, import/export, outbound delivery, AI, assistant, and translation contracts plus client methods.
- Web pages/routes/navigation: added WS07 integration, AI, reporting, and saved-view pages; wired routes and role-aware navigation metadata.
- Shared shell: added an Integrations & AI navigation group and differentiated icons for integration, import, export, delivery log, and provider-health entries.
- Tests: added WS07 coverage for navigation discovery, review-mode disabled reasons, live provider/webhook/import/export/AI/report actions, and governed controls; updated protected-route navigation completeness.
- Governance/docs: added WS07 workstream matrices and updated action, field, entity, and issue registries.
- Evidence/build output: captured WS07 screenshots and refreshed IIS host web assets through `npm run build:host` and `dotnet publish`.

## Screens Completed

- Integration Provider Admin
- Provider Health
- Webhook Subscriptions
- Import Jobs
- Export Jobs
- Delivery Logs
- AI Assistant
- Translation Assistant
- Report Catalog
- Report Parameters
- Saved Views
- Print Pack / Traveler / Labels reverified
- Mobile execution shell revalidated through typecheck and action-flow coverage plan

## Actions Wired / Disabled / Hidden

- Wired: `New provider`, `Save provider`, `New webhook`, `Save webhook`, `Dispatch test event`, `New import`, `Queue import`, `Save import status`, `Queue export`, `Save export status`, `Preview message`, `Queue message`, `Prepare governed plan`, `Generate draft`, `Generate translation draft`, `Queue report export`, and `Refresh health`.
- Disabled with reason: `Rotate credentials`, `Run external probe`, `Rotate webhook secret`, `Upload source file`, `Attach import file`, `Download file`, `Open storage file`, `Apply recommendation`, `Publish translation`, `Edit report layout`, `Save current view`, and `Share view`.
- Hidden: no WS07 touched visible action needed to be hidden.

## Field / Governance Results

- Lookup violations fixed: provider type/status, webhook event/status, import/export module/format/status, delivery channel/template, AI provider/model/intent/language, and report domain controls use governed selectors.
- Numeric/date violations fixed: provider health counts, AI model counts, import failed rows, delivery attempts, report date range, report minimum risk %, and saved-view refresh minutes use numeric/date controls.
- Upload truth fixed: import file staging is disabled with a visible scanner/staging reason; export download/open storage is disabled until signed storage URL support exists.
- Live/demo data truth fixed for touched WS07 pages: live sessions call live endpoints; review mode is explicitly labeled and does not pretend seeded review rows are live operational data.

## Backend / DB Changes

- No backend schema change was required.
- Existing additive integration/AI SQL foundation remains `database/ddl/00-foundation/020_integration_ai_tables.sql` and is included in the review pack.
- Existing integration, webhook, import/export, outbound messaging, AI, and translation endpoints were reused through new web contracts and client methods.
- No destructive database operation was performed.

## Validation Results

- `npm run typecheck`: PASS
- `npm test`: PASS, 45 files / 180 tests
- `npm run build`: PASS with Vite chunk-size warning only
- `npm run build:host`: PASS
- `npm --prefix src/mobile run typecheck`: PASS
- `npm --prefix src/mobile run test:coverage-plan`: PASS, 7 mobile action-flow coverage entries
- `dotnet build src/server/STS.Mfg.sln`: PASS
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 37 tests
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: PASS with Vite chunk-size warning only

## Screenshot Evidence

Folder: `docs/codex-review-screens/WS07/`

Captured 16 entries: integration provider admin, provider health, webhook subscriptions, import jobs, export jobs, delivery logs, AI assistant, translation assistant, report catalog, report parameters, saved views, print pack, and centered modal workspaces for provider, webhook, import, and export.

## Remaining Blockers

- None for WS07 touched critical gates.
- Non-blocking future depth: native camera/barcode/voice capture, production CRM synchronization, import row-repair editing, signed export download URLs, external credential/secret rotation, report layout authoring, dashboard builder persistence, saved-view publishing, and operational AI write-back remain future extensions with visible disabled reasons where surfaced.

## Review Pack

`artifacts/review-packs/WS07-review-pack.zip`
