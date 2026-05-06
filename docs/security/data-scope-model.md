# Data Scope Model

## Objective

This model defines how access is constrained by organization, plant, warehouse, department, and ownership in both API and SQL layers.

## Scope Hierarchy

1. `Deployment`
2. `Company`
3. `Branch`
4. `Warehouse`
5. `Department`
6. `TeamRecord`
7. `OwnRecord`

Higher scopes may include lower scopes when explicitly granted.

## Scope Definitions

| Scope | Meaning |
| --- | --- |
| `Deployment` | Cross-company administration for platform-level settings and provider registry. |
| `Company` | All records within one legal entity or tenant company. |
| `Branch` | One plant/site/branch inside a company. |
| `Warehouse` | One or more allowed warehouses or store locations. |
| `Department` | Functional scope such as planning, stores, production, quality, or dispatch. |
| `TeamRecord` | Records assigned to a supervisor's team, machine group, or inspection queue. |
| `OwnRecord` | Records directly assigned to the logged-in user. |

## Enforcement Model

### API layer

- Every request resolves:
  - user identity
  - active company and branch context
  - role grants
  - allowed data scopes
- Query handlers apply mandatory filters before business logic returns data.
- Action handlers validate both role permission and record scope before any transition or write.

### SQL layer

- Stored procedures must accept scope inputs such as `@CompanyId`, `@BranchId`, `@WarehouseId`, `@DepartmentId`, or `@UserId` where relevant.
- Read-model procedures for dashboards must already be filtered by the caller's resolved scope.
- SQL must not trust arbitrary front-end filters for access control.

## Row-Level Access Strategy

- Row-level access is enforced in the application service layer first and reinforced in procedure/query design.
- Sensitive read models must use parameterized filters based on resolved scope context.
- For large dashboard queries, create scope-aware views or stored procedures instead of exposing unrestricted base tables.
- Never rely on UI hiding alone for access control.

## Scope by Functional Area

| Area | Typical scope |
| --- | --- |
| Platform settings | deployment |
| Company masters | company |
| Branch, warehouse, bin operations | branch or warehouse |
| Sales and planning | company and branch |
| Stores transactions | warehouse and branch |
| Production execution | branch, department, machine team |
| Quality | branch, department, inspection queue |
| Dispatch | branch and dispatch warehouse |
| Executive dashboards | company or enterprise read scope |

## Approval and Override Model

- Approval rights do not bypass scope checks; approvers must still have access to the affected company and branch.
- Override actions require:
  - explicit permission
  - reason code
  - comment or note where required
  - audit log record
- A user may read a document but still be blocked from approving or overriding it due to narrower action rights.

## Context Switching Rules

- Users can switch company or branch only if mapped to that scope.
- Mobile apps must respect the same active operating context as the server-issued token or profile.
- Offline mobile queues are stamped with the company and branch context active at capture time.

## Sensitive Data Rules

- AI provider secrets, integration credentials, and system diagnostics stay restricted to `PlatformAdmin` and approved `CompanyAdmin` users.
- Audit logs are readable only by designated admin roles and support roles with explicit permission.
- Attachment visibility follows the parent document scope unless a stricter rule is defined.
