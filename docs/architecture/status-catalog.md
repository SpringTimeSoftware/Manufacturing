# Status Catalog

## Objective

This catalog defines standard document, execution, machine, and reason states so all layers use the same lifecycle language.

## Commercial Documents

### Quote

`Draft`, `PendingApproval`, `Sent`, `Accepted`, `Rejected`, `Expired`, `Cancelled`

### Sales Order

`Draft`, `PendingApproval`, `Confirmed`, `PartiallyPlanned`, `Planned`, `InProduction`, `PartiallyDispatched`, `Dispatched`, `Closed`, `Cancelled`

### Blanket Order

`Draft`, `Active`, `PartiallyReleased`, `Completed`, `OnHold`, `Cancelled`

## Engineering Documents

### BOM

`Draft`, `PendingApproval`, `Approved`, `Released`, `Superseded`, `Obsolete`, `Cancelled`

### ECO

`Draft`, `PendingApproval`, `Approved`, `Implemented`, `Rejected`, `Cancelled`

### Routing

`Draft`, `PendingApproval`, `Approved`, `Released`, `Obsolete`

## Planning Documents

### MPS

`Draft`, `Reviewed`, `Approved`, `Frozen`, `Superseded`

### MRP Run

`Queued`, `Running`, `Completed`, `CompletedWithWarnings`, `Failed`, `Superseded`

### BOQ Requirement

`New`, `Reviewed`, `Approved`, `Converted`, `PartiallyConverted`, `Closed`, `Cancelled`

### Capacity Plan

`Draft`, `Reviewed`, `Published`, `Superseded`

## Procurement Documents

### Purchase Requisition

`Draft`, `PendingApproval`, `Approved`, `PartiallyConverted`, `Converted`, `Rejected`, `Cancelled`, `Closed`

### Purchase Order

`Draft`, `PendingApproval`, `Released`, `PartiallyReceived`, `Received`, `Closed`, `Cancelled`

### Subcontract Order

`Draft`, `Released`, `MaterialIssued`, `InProcessAtVendor`, `PartiallyReceived`, `Received`, `Closed`, `Cancelled`

## Inventory and Traceability States

### Stock Availability State

`Available`, `Reserved`, `Issued`, `InTransit`, `Quarantined`, `Blocked`, `Consumed`

### Lot / Serial State

`Available`, `Reserved`, `Issued`, `QC_Hold`, `Released`, `Blocked`, `Consumed`, `Shipped`

## Production Documents

### Work Order

`Draft`, `PendingRelease`, `Released`, `InProgress`, `PartiallyCompleted`, `Completed`, `Closed`, `OnHold`, `Cancelled`

### Job Card

`Created`, `Assigned`, `Started`, `Paused`, `QC_Hold`, `Completed`, `Closed`, `Cancelled`

### Production Receipt

`Draft`, `Posted`, `QC_Hold`, `Released`, `Cancelled`

### Rework Order

`Draft`, `Released`, `InProgress`, `Completed`, `Closed`, `Cancelled`

## Quality Documents

### Inspection

`Pending`, `InProgress`, `Passed`, `PassedWithDeviation`, `Failed`, `Hold`, `Released`, `Cancelled`

### NCR

`Open`, `UnderReview`, `DispositionApproved`, `ReworkAssigned`, `Closed`, `Cancelled`

## Dispatch Documents

### Pack List

`Draft`, `PackingInProgress`, `Packed`, `ReadyForDispatch`, `Cancelled`, `Closed`

### Shipment

`Draft`, `Planned`, `Loaded`, `Dispatched`, `Delivered`, `Closed`, `Cancelled`

## Machine States

- `Idle`
- `Setup`
- `Running`
- `Paused`
- `Down`
- `Maintenance`
- `Changeover`
- `BlockedByMaterial`
- `BlockedByQuality`
- `Offline`

## Delay, Pause, and Exception Reasons

### Supplier / Material

- `SupplierLate`
- `MaterialShortage`
- `WrongMaterial`
- `MissingLotOrSerial`
- `InspectionPending`

### Machine / Production

- `MachineBreakdown`
- `ToolUnavailable`
- `SetupPending`
- `PowerFailure`
- `OperatorUnavailable`
- `CapacityOverload`
- `ChangeoverDelay`

### Quality

- `QC_Hold`
- `InspectionFailed`
- `ReworkRequired`
- `SpecificationClarificationPending`

### Dispatch / Planning

- `CustomerChangeRequest`
- `RoutingRevisionPending`
- `EngineeringApprovalPending`
- `DispatchVehiclePending`

## Status Usage Rules

- Status names are PascalCase tokens in server and SQL-facing definitions.
- UI labels may render user-friendly text such as `QC Hold` while retaining canonical codes underneath.
- Only workflow-defined transitions are allowed; direct state jumps must be treated as override actions and audited.
- Dashboard colors must follow the design-language status semantics rather than inventing per-screen variants.
