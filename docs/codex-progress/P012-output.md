# P012 Output

## Objective Status

- Defined the SQL Server baseline for schemas, keys, common columns, soft delete, temporal history, append-only ledgers, partitioning, migrations, and seeds.
- Added the database folder readme and formal conventions doc.

## Deliverables Completed

- Created `/database/README.md`
- Created `/docs/database/conventions.md`
- Created `/docs/codex-progress/P012-output.md`

## Assumptions Captured

- Core table primary keys use `BIGINT IDENTITY` with separate business codes or document numbers.
- Domain-based SQL schemas are preferred over a single `dbo` schema.

## Open Issues / Blockers

- None for `P012`.

## Build / Test / Lint

- Not run. Documentation-only prompt.

## Next Prompt

- `/02-prompts/P013_company-branch-department-and-shift-schema.md`
