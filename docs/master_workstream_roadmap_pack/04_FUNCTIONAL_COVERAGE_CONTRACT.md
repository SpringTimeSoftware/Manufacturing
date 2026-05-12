# Functional Coverage Contract

This document defines the functional depth expected from a commercially credible manufacturing ERP.

## Commercial Transactions

Required capabilities:
- quote header and multiline quote lines
- sales order header and multiline order lines
- line item lookup, UOM, quantity, unit price, discount, tax, delivery date
- header add/less charges
- freight terms
- payment terms
- price list application
- discount scheme application
- tax calculation
- round-off policy: none, nearest, floor, ceiling where configured
- save draft, edit, clone, cancel/inactivate, release/approval where applicable
- print/export where applicable
- credit checks before release/order acceptance
- salesperson assignment and commission foundation if exposed

## Procure-to-Pay

Required capabilities:
- purchase requisition / material request where applicable
- RFQ
- supplier quotation
- quotation comparison
- PO header and multiline lines
- PO approval
- GRN against PO
- incoming QC where applicable
- purchase invoice 3-way match (PO -> GRN -> Invoice)
- vendor payment scheduling
- landed cost/additional charges
- vendor return / claim

## Manufacturing Planning

Required capabilities:
- MPS
- demand forecast
- MRP run parameters
- planned order generation
- exception ownership
- conversion to PR/PO/WO
- BOQ/material requirements
- capacity planning
- ATP/order promise
- production forecasting
- sales forecasting

## Engineering

Required capabilities:
- BOM authoring with multiline components
- BOM revisions and effectivity
- routing authoring with operation sequence
- ECO create/approve/impact analysis
- alternates/substitutes
- engineering documents
- release/freeze rules

## Production Execution

Required capabilities:
- work order lifecycle
- material issue to production
- job cards
- labor/machine booking
- downtime
- subcontracting order flow
- production receipt / FG receipt
- scrap/rework
- WIP valuation truth
- timeline/audit

## Inventory

Required capabilities:
- stock ledger
- warehouse/bin balances
- inter-warehouse transfer
- inter-bin transfer
- reservations/allocation per job/order
- lot/serial/catch-weight traceability
- blocked/hold/quarantine stock
- cycle count

## Quality

Required capabilities:
- inspection plans
- incoming/in-process/outgoing inspection
- inspection lot creation
- parameter results
- rejection/non-conformance
- hold/release quarantine
- NCR lifecycle
- root cause/disposition
- CoA where applicable

## Dispatch / Logistics

Required capabilities:
- packing list
- delivery challan
- gate pass
- vehicle/transporter assignment
- LR/courier reference
- e-way bill fields for India-context dispatch where applicable
- proof of delivery
- return/rejection inward
- labels and print templates

## Finance

Required capabilities:
- chart of accounts
- journal entry
- accounting period open/close
- AR/AP subledger basics
- trial balance
- P&L
- balance sheet
- aging
- bank reconciliation
- cost center/profit center
- COGS / cost posting linkage

## Service / Warranty / AMC

Required capabilities:
- complaint/service ticket
- warranty by serial number
- AMC contract
- service visit/task
- spare consumption
- RMA/repair/return
- service dashboard

## Platform / Extensibility

Required capabilities:
- UDF fields
- UDF validation
- UDF storage/audit
- screen extension placeholders
- report builder
- dashboard builder
- role/permission governance
- workflow builder or configured workflow setup
