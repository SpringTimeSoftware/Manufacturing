# P061 Output

## Objective Status

- Implemented inventory balance, stock movement, cycle count, and lot/serial traceability APIs in the backend bootstrap.

## Deliverables Completed

- Added an `Inventory` module with stock balances, stock transactions, reservations, lots, serials, and cycle-count entities plus EF mappings
- Added `api/inventory`, `api/inventory/transactions`, `api/stock-issues`, `api/stock-returns`, `api/stock-transfers`, `api/cycle-counts`, and `api/traceability` controller surfaces
- Implemented balance mutation, immutable ledger writes, cycle-count posting, warehouse/bin usability checks, and audit logging inside a dedicated inventory service
- Preserved branch-scoped authorization, shared envelopes, paging, and traceability reads aligned to the active data scope

## Assumptions Captured

- Issue, return, and transfer endpoints currently support `Available` inventory-state movements only; reservation, QC-hold, blocked, and in-transit state transitions remain for later prompts
- Cycle-count lines operate on exact stock-balance dimensions (`item + variant + warehouse + bin + lot + serial`) rather than aggregating across lower-level locations
- Lot genealogy reads use direct ledger history for this pass; the dedicated `sp_Traceability_LotGenealogy` implementation remains deferred
- When a lot number is not unique within a company, traceability lookup requires `itemId` to disambiguate the lot

## Open Issues / Blockers

- No blocker for `P061`
- Stock movement idempotency tokens, reservation recalculation, and stored-procedure-grade validation from `/docs/database/P039-stock-movements.md` are not implemented yet
- Live SQL object creation is still deferred because the repository does not yet contain an ordered migration/procedure pack to apply safely to `Manufacturing_ERP`

## Build / Test / Lint

- Ran `dotnet build src/server/STS.Mfg.sln`
- Ran `dotnet test src/server/STS.Mfg.sln --no-build`
- No lint target is configured in the repository yet

## Next Prompt

- `/02-prompts/P062_work-order-apis.md`
