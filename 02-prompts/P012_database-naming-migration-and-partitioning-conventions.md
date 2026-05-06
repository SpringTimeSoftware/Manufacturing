# P012 — Database naming, migration, and partitioning conventions

## Phase
Phase 1 - Database

## Objective
Create the SQL Server baseline: schemas, migration rules, seed strategy, soft-delete/audit columns, and partitioning expectations for ledgers/logs.

## Read first
- `/00-blueprint/STS_Manufacturing_ERP_Blueprint.md`
- `/00-blueprint/screen_inventory.csv`
- `/00-blueprint/api_inventory.csv`
- `/00-blueprint/db_entities.csv`
- `/00-blueprint/stored_procedure_inventory.csv`
- `/reference-ui/README.md`
- `/docs/architecture/architecture-baseline.md`

## Work to do
- Define database schemas by domain or naming prefix.
- Define common columns (Id, CompanyId, BranchId, CreatedOn, ModifiedOn, RowVersion, IsDeleted if used).
- Define migration strategy and deployment order for tables, views, functions, and stored procedures.
- Define where to use temporal tables or immutable ledgers.
## Deliverables for this prompt
- `/database/README.md`
- `/docs/database/conventions.md`

## Definition of done
- Keys, constraints, and relationships are documented.
- The design supports multi-company, branch, warehouse, bin, and role scoping.

## Handoff notes
- Update the running progress notes in `/docs/codex-progress/`.
- Record open issues, shortcuts taken, and unresolved dependencies explicitly.
- Next prompt: `/02-prompts/P013_company-branch-department-and-shift-schema.md`
