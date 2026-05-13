# WS05 Production / Shop Floor Execution Output

Date: 2026-05-13

## Status

COMPLETE for the WS05 touched scope. Critical touched-scope blockers are 0. The job-card execution gap was closed by wiring the visible execution actions to live job-card APIs, adding governed execution controls, and keeping demo/no-live or invalid states disabled with clear business-safe reasons.

## Files Changed

- Web contracts/client: job-card start, pause, resume, quantity, and complete request/result types plus API client methods.
- Web operations adapter: job-card machine, operator, and shift assignment mapping for governed execution context.
- Web operations UI: job-card route deep-link opening, centered execution workspace controls, live Start/Resume/Pause/Log quantity/Complete actions, and hidden dead Add reject action.
- Tests: WS05 job-card deep-link and live complete-action coverage.
- Governance/docs: WS05 workstream matrices plus action, field, and issue registry updates.
- Host publish assets: refreshed IIS publish-folder web assets through `npm run build:host` and `dotnet publish`.

## Screens Completed

- Work Orders
- Job Cards
- Machine Board
- Occupancy Calendar
- Shift Production
- Downtime Register
- Production Receipts
- Scrap / By-products
- Rework Orders
- Machine Status
- Material Issue
- Material Return
- Traceability
- IIS Host Publish Output

## Actions Wired / Disabled / Hidden

- Wired: `Start` posts to live `/api/job-cards/{id}/start`.
- Wired: `Resume` posts to live `/api/job-cards/{id}/resume`.
- Wired: `Pause` posts to live `/api/job-cards/{id}/pause` and requires a governed pause reason.
- Wired: `Log quantity` posts good/reject/scrap quantities to live `/api/job-cards/{id}/quantities`.
- Wired: `Complete` posts to live `/api/job-cards/{id}/complete`.
- Wired: `/production/job-cards?jobCard=...` opens the specific job-card workspace.
- Wired: `Record downtime` and `Open QC` preserve selected job-card context.
- Hidden: `Add reject` was removed as a dead standalone action and replaced by governed reject/scrap quantity posting.
- Disabled with reason: live execution actions are disabled in demo/no-live sessions and invalid lifecycle states.
- Disabled with reason: work-order release/generation, production posting, scrap/by-product posting, rework lifecycle writes, and material issue/return posting remain guarded where full downstream posting is outside the WS05 closure slice.

## Field / Governance Results

- Lookup violations fixed: job-card assigned machine, assigned operator, execution reason, and pause reason use governed selectors.
- Numeric violations fixed: good, reject, and scrap quantities use `ErpDecimalField`.
- Date truth preserved: occupancy/date filters remain date controls.
- No touched governed production or inventory field remains unrestricted free text.

## Backend / DB Changes

- No backend schema change was required.
- Existing live job-card API endpoints were reused through new web contracts and client methods.
- No destructive database operation was performed.

## Validation Results

- `npm run typecheck`: PASS
- `npm test`: PASS, 43 files / 172 tests
- `npm run build`: PASS with Vite chunk-size warning only
- `npm run build:host`: PASS
- `dotnet build src/server/STS.Mfg.sln`: PASS
- `dotnet test src/server/STS.Mfg.sln --no-build`: PASS, 37 tests
- `dotnet publish src/server/STS.Mfg.Host/STS.Mfg.Host.csproj -c Release`: PASS
- Note: the first publish attempt raced a concurrent host asset build and failed on an old hashed JS file; rerunning publish after the host build completed passed.

## Screenshot Evidence

Folder: `docs/codex-review-screens/WS05/`

Captured work orders, job cards, job-card execution modal, machine board, occupancy calendar, shift production, downtime register, production receipts, scrap/by-products, rework orders, machine status, material issue, material return, and traceability.

## Remaining Blockers

- None for WS05 touched critical gates.
- Non-blocking future depth: manual job-card creation, work-order release/job-card generation UI, production receipt posting, scrap/rework posting, material issue/return posting, shift summary submission, downtime RCA queue, and print/export workflows remain future enhancements outside this WS05 closure slice.

## Review Pack

`artifacts/review-packs/WS05-review-pack.zip`
