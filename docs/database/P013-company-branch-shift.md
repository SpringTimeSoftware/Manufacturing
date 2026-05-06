# P013 Company, Branch, Department, and Shift Schema

All tables inherit common columns from `/docs/database/conventions.md` unless noted otherwise.

## Tables

### `org.Companies`

Purpose: legal entity and top-level operating scope.

| Column | Notes |
| --- | --- |
| `CompanyCode` | unique business code |
| `CompanyName` | display name |
| `LegalName` | statutory name |
| `TaxRegistrationNo` | optional statutory identifier |
| `TimeZoneId` | default timezone |
| `DefaultLanguageId` | FK to `platform.Languages` |
| `BaseCurrencyCode` | reserved for future financial integration without enabling full accounting |
| `DefaultCalendarCode` | default work calendar/profile reference |
| `Status` | `Active`, `Inactive` |

Unique constraints:

- `UX_Companies_CompanyCode`

### `org.Branches`

Purpose: plant/site/branch operating unit under a company.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `BranchCode` | unique within company |
| `BranchName` | display name |
| `BranchType` | `Plant`, `WarehouseHub`, `Office`, `DispatchHub` |
| `TimeZoneId` | branch override |
| `DefaultLanguageId` | branch override language |
| `DefaultCalendarCode` | branch work calendar/profile |
| `DefaultShiftId` | optional FK to `org.Shifts` |
| `DefaultWarehouseId` | optional FK to `org.Warehouses` added after P014 |
| `ContactEmail` | operational contact |
| `Status` | `Active`, `Inactive` |

Unique constraints:

- `UX_Branches_CompanyId_BranchCode`

Relationships:

- one `Company` to many `Branches`

### `org.Departments`

Purpose: functional departments used for access control, routing, approvals, and reporting.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `BranchId` | nullable; null means company-wide department |
| `DepartmentCode` | unique within company/branch scope |
| `DepartmentName` | display name |
| `ParentDepartmentId` | optional self-reference |
| `ManagerUserId` | optional owner |
| `DepartmentType` | `Sales`, `Planning`, `Stores`, `Production`, `Quality`, `Dispatch`, `Admin` |
| `Status` | `Active`, `Inactive` |

Unique constraints:

- `UX_Departments_CompanyId_BranchId_DepartmentCode`

### `org.Shifts`

Purpose: named operating shift patterns for planning, execution, and handover.

| Column | Notes |
| --- | --- |
| `CompanyId` | FK to `org.Companies` |
| `BranchId` | nullable for company-wide shift |
| `ShiftCode` | unique within company/branch scope |
| `ShiftName` | display name |
| `StartTime` | `TIME(0)` |
| `EndTime` | `TIME(0)` |
| `CrossesMidnight` | bit |
| `BreakMinutes` | total default break duration |
| `SequenceNo` | display and planning order |
| `CalendarProfileCode` | links to workday pattern |
| `Status` | `Active`, `Inactive` |

Unique constraints:

- `UX_Shifts_CompanyId_BranchId_ShiftCode`
- `UX_Shifts_CompanyId_BranchId_SequenceNo`

## Relationship Summary

- `Companies` 1:n `Branches`
- `Companies` 1:n `Departments`
- `Branches` 1:n `Departments`
- `Companies` 1:n `Shifts`
- `Branches` 1:n `Shifts`

## Scope Notes

- Most transactional tables will require `CompanyId` and `BranchId`.
- Departments and shifts allow branch-specific overrides while retaining company-wide templates.

## Open Design Notes

- Holiday exceptions and detailed shift calendars may require additional supporting tables later if daily variance becomes necessary.
