# P042 Quality Inspection Save and Hold/Release Logic

## Procedure

`quality.sp_QC_SaveInspection`

## Objective

Persist incoming, in-process, and final inspection results and apply hold/release logic across lots, serials, work orders, and job cards.

## Input Params

- `@CompanyId`
- `@BranchId`
- `@InspectionType`
- `@SourceDocumentType`
- `@SourceDocumentId`
- `@LotId = NULL`
- `@SerialId = NULL`
- `@InspectionPayloadJson`
- `@RequestedByUserId`
- `@CorrelationId = NULL`

## Output

- created or updated `InspectionRecords`
- created or updated `InspectionResults`
- optional `NonConformances`
- return inspection summary and disposition result

## Side Effects

- writes quality transaction records
- may place lot/serial/job card/work-order in `QC_Hold`
- may release held stock or process when passed
- may open NCR

## Idempotency

- idempotent by inspection request token or inspection record identity
- re-save of same inspection revises within allowed draft/in-progress scope only

## Logic Flow

1. validate source context and traceability identity
2. create or load target inspection record
3. persist result rows
4. compute overall result:
   - `Pass`
   - `PassWithDeviation`
   - `Fail`
   - `Hold`
5. if fail or hold:
   - update related lot/serial or process status
   - create NCR if policy requires
6. if pass on in-process inspection:
   - release job card or downstream operation readiness
7. if pass on final inspection:
   - release FG/QC-hold stock to available state

## Hold/Release Rules

- incoming failures hold received stock or lot
- in-process failures hold the job card or operation
- final failures hold finished goods and block shipment
- release actions must be auditable and reason-coded where deviation exists
