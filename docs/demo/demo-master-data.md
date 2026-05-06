# Demo Master Data

## Customers

| Code | Name | Scenario |
| --- | --- | --- |
| `CUST-APEX` | Apex Process Systems | fabricated assembly order |
| `CUST-BLUESTAR` | BlueStar Packaging Lines | mixed-UOM enclosure and repeat parts |
| `CUST-HYDRO` | HydroPure Utilities | delayed order dashboard proof |

## Suppliers

| Code | Name | Type |
| --- | --- | --- |
| `SUP-STEEL` | Prime Steel Service Center | raw sheet and plate |
| `SUP-ELEC` | Control Grid Components | electrical bought-out parts |
| `SUP-COAT` | Spectrum Powder Coaters | outside processing vendor |
| `SUP-HARD` | FastenRight Industrial | fasteners and fittings |

## Warehouses and Bins

| Warehouse | Purpose | Example bins |
| --- | --- | --- |
| `RM-MAIN` | raw material store | `RM-A01`, `RM-A02`, `RM-SHEET-01` |
| `WIP-FAB` | fabrication staging and WIP | `WIP-CUT`, `WIP-WELD`, `WIP-ASSY` |
| `FG-MAIN` | finished goods and dispatch staging | `FG-PACK`, `FG-HOLD`, `FG-DISPATCH` |
| `SUBCON` | subcontract send/receive control | `SC-OUT`, `SC-IN` |
| `QC-HOLD` | quarantined stock | `QC-HOLD-01` |

## Work Centers and Machines

| Work center | Machines |
| --- | --- |
| Laser Cutting | `LASER-01` |
| Bending | `BEND-01` |
| Welding | `WELD-01`, `WELD-02` |
| Assembly | `ASSY-01` |
| Inspection | `QC-01` |
| Packing | `PACK-01` |

## Key Items

| Code | Name | Measurement profile | Notes |
| --- | --- | --- | --- |
| `FG-OZONE-SKID-1000` | Ozone skid assembly | count only | scenario 1 finished good |
| `FG-ENCLOSURE-500` | control enclosure | dimensional / mixed UOM | scenario 2 finished good |
| `RM-SS-SHEET-304-2MM` | stainless sheet 304 2mm | dimensional formula | stocked by sheet, analyzed by theoretical weight |
| `RM-MS-TUBE-40NB` | mild steel tube 40NB | length | fabrication input |
| `RM-FASTENER-M8` | hex bolt M8 | count only | standard component |
| `BO-CONTROL-PANEL` | control panel bought-out | count only | delayed supplier item |
| `SFG-FRAME-WELDED` | welded frame | count only | subcontract or internal handoff stage |

## BOM and Routing Seeds

| Parent | Revision | Routing summary |
| --- | --- | --- |
| `FG-OZONE-SKID-1000` | `R1` | cut -> bend -> weld -> assembly -> final QC |
| `FG-ENCLOSURE-500` | `R2` | cut -> bend -> weld -> powder coat subcontract -> assembly |

## Sales Orders

| Order | Customer | Scenario | Outcome |
| --- | --- | --- | --- |
| `SO-1001` | Apex Process Systems | scenario 1 | on-time demo flow |
| `SO-1002` | BlueStar Packaging Lines | scenario 2 | mixed-UOM flow |
| `SO-1003` | HydroPure Utilities | scenario 4 | overdue due to supplier and machine blockage |

## Reason Codes

- `MAT_SHORT`
- `SUP_LATE`
- `MACH_BREAK`
- `QC_HOLD`
- `REWORK_REQ`
- `POWER_FAIL`
- `SETUP_DELAY`

## Dashboard Proof Data Requirements

- `SO-1001` should reach dispatched state.
- `SO-1002` should demonstrate shortage visibility and dual-UOM behavior.
- `SO-1003` should show red risk on order delivery and stage-wise dashboards due to:
  - late `BO-CONTROL-PANEL`
  - downtime on `WELD-01`
