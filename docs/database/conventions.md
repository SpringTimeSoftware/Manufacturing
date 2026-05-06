# Database Conventions

## Objective

These conventions define the SQL Server baseline for schemas, table naming, common columns, migrations, and long-running data structures.

## Schema Strategy

Use SQL schemas by domain rather than a single `dbo` dump.

| Schema | Purpose |
| --- | --- |
| `platform` | users, roles, translations, numbering, workflow, audit, notifications |
| `org` | companies, branches, departments, warehouses, bins, shifts |
| `measure` | UOM, measurement profiles, formulas |
| `master` | items, item groups, attributes, partners |
| `resource` | work centers, machines, tools, routings, operations |
| `engineering` | BOM, revisions, engineering changes |
| `sales` | quotes, sales orders, forecasts, blanket orders |
| `planning` | MPS, MRP runs, BOQ, capacity |
| `procurement` | PR, PO, subcontract |
| `inventory` | balances, reservations, transactions, lots, serials |
| `production` | work orders, job cards, issues, receipts, scrap, rework, downtime, handovers |
| `quality` | inspection plans, inspections, NCR |
| `dispatch` | pack lists, shipments |
| `integration` | providers, connections, webhooks, import/export jobs |
| `ai` | providers, models, prompt templates, runs |
| `reporting` | read-optimized helper tables or materialized snapshots when needed |

## Naming Rules

- Tables: plural PascalCase, for example `org.Companies`
- Primary key column: `Id`
- Foreign keys: `<ParentName>Id`, for example `CompanyId`, `WarehouseId`
- Unique public/business keys: `<Entity>Code` or `<Entity>No`
- Views: `vw_<Area>_<Purpose>`
- Stored procedures: `sp_<Area>_<Action>`
- Functions: `fn_<Area>_<Purpose>`
- Nonclustered indexes: `IX_<Table>_<ColumnList>`
- Unique constraints: `UX_<Table>_<ColumnList>`
- Foreign keys: `FK_<Child>_<Parent>_<Column>`

## Key Strategy

- Use `BIGINT IDENTITY(1,1)` for primary keys on standard master and transactional tables.
- Use business codes and document numbers as separate unique columns; do not overload primary keys as human-facing identifiers.
- Use `ROWVERSION` for optimistic concurrency on mutable tables.
- Use surrogate keys plus business uniqueness constraints rather than composite primary keys for core tables.

## Common Columns

### Mutable master/configuration tables

- `Id BIGINT IDENTITY`
- `CompanyId BIGINT NULL` when data can be tenant-specific; `NULL` means deployment/global where allowed
- `BranchId BIGINT NULL` only where branch-specific configuration is valid
- `CreatedOn DATETIME2(3) NOT NULL`
- `CreatedByUserId BIGINT NULL`
- `ModifiedOn DATETIME2(3) NOT NULL`
- `ModifiedByUserId BIGINT NULL`
- `RowVersion ROWVERSION`
- `IsDeleted BIT NOT NULL DEFAULT 0` only where soft delete is permitted
- `DeletedOn DATETIME2(3) NULL`
- `DeletedByUserId BIGINT NULL`

### Transactional ledger/event tables

- `Id BIGINT IDENTITY`
- `CompanyId BIGINT NOT NULL`
- `BranchId BIGINT NOT NULL`
- `CreatedOn DATETIME2(3) NOT NULL`
- `CreatedByUserId BIGINT NULL`
- `CorrelationId NVARCHAR(64) NULL`
- no soft delete
- no update-in-place for critical value columns after posting except controlled correction mechanisms

## Multi-Scope Rules

- `CompanyId` is mandatory for almost all transactional tables.
- `BranchId` is mandatory for plant-level and warehouse-level operational tables.
- `WarehouseId` and `BinId` appear only where physical stock ownership matters.
- Platform-wide reference tables may omit `CompanyId`.

## Relationship Rules

- Every foreign key must be explicit.
- Cascading delete is disabled for transactional tables.
- Soft-deleted masters must remain reference-safe until no active transactions depend on them.
- Child detail tables should cascade only through application logic or controlled cleanup scripts, not blind database cascade, for sensitive business data.

## Soft Delete Rules

Use soft delete for:

- configuration tables
- item and partner masters
- workflow and prompt/config metadata

Do not use soft delete for:

- stock ledger
- job card events
- audit logs
- production receipts
- shipments
- inspections

These use immutable or correction-based patterns instead.

## Temporal Tables and Immutable Ledgers

### Recommended temporal tables

- `platform.DocumentSeries`
- `platform.WorkflowDefinitions`
- `master.Items`
- `master.Customers`
- `master.Suppliers`
- `resource.Machines`

Use temporal history where operational review of changed reference/configuration data is valuable.

### Recommended immutable / append-only ledgers

- `inventory.StockTransactions`
- `production.JobCardEvents`
- `production.DowntimeEvents`
- `platform.AuditLogs`
- `platform.Notifications`
- `ai.AiRuns`

These tables should prefer append-only behavior and correction records over in-place mutation.

## Partitioning Expectations

Partition by date only for large, append-heavy tables once volume justifies it. Candidate tables:

- `inventory.StockTransactions`
- `production.JobCardEvents`
- `production.DowntimeEvents`
- `platform.AuditLogs`
- `platform.Notifications`
- `ai.AiRuns`

Preferred partition key:

- monthly or quarterly boundary on `CreatedOn` or posting date columns

Do not partition small configuration or master tables.

## Migration Strategy

- Migrations are forward-only and idempotent.
- Apply in this order:
  1. schemas
  2. shared helper functions/types
  3. base master tables
  4. reference and transactional tables
  5. indexes and constraints not required for initial creation
  6. views
  7. seed/reference data
  8. stored procedures
- Each migration should have a clear rollback or correction note even if full down-scripts are not used in production.
- Procedure and view changes should be shipped after dependent tables and columns exist.

## Seed Strategy

- Separate immutable reference seed data from demo seed data.
- Keep demo tenant seeds under `database/seeds`.
- Seed scripts must be rerunnable for empty or reset demo environments.

## Security and Audit Expectations

- Sensitive procedures must accept scoped context parameters such as `@CompanyId` and `@BranchId`.
- Audit-critical writes must stamp `CreatedByUserId` and `CorrelationId` where available.
- AI or integration tables must never store secrets in plain text if avoidable.
