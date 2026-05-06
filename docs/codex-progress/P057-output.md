# P057 Output

## Objective Status

- Implemented routing, BOM, alternate-item, and engineering-change APIs with nested child payload support and revision/status actions.

## Deliverables Completed

- Added routing CRUD/list/get plus BOM CRUD/list/get and revision clone/approve/obsolete endpoints
- Added alternate-item and engineering-change APIs including submit/approve/implement actions
- Added nested service mapping for routing operations, BOM revisions/lines/operations, and ECO lines with audit writes

## Assumptions Captured

- BOM revisions omitted from an update payload are retained so historical engineering records are not implicitly deleted
- Alternate-item and engineering-change approval flows are status transitions in the API layer; deeper release orchestration remains in later prompt work

## Open Issues / Blockers

- Routing operations and document child rows are rebuilt on update for this pass, so child row IDs are not stable across updates
- Several parent-link fields remain immutable after create because the current domain model does not support re-parenting in-place

## Build / Test / Lint

- Verified in the combined `P054`-`P059` backend pass with `dotnet build src/server/STS.Mfg.sln`
- Verified in the combined `P054`-`P059` backend pass with `dotnet test src/server/STS.Mfg.sln --no-build`

## Next Prompt

- `/02-prompts/P058_quote-sales-order-and-forecast-apis.md`
