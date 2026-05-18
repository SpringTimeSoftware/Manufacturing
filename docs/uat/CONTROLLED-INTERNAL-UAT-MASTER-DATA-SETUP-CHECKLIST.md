# Controlled Internal UAT Master Data Setup Checklist

Purpose: configure governed business master data before controlled internal UAT. Do not use production credentials or unlabelled production data for UAT. Every row should be signed off by the owner role before the dependent UAT script starts.

Severity of missing setup:
- P0: blocks UAT continuation.
- P1: blocks workflow acceptance.
- P2: workaround acceptable with written business approval.
- P3: cosmetic or later enhancement.

| Area | Setup item | Required | Owner role | Setup screen/API | Sample value needed | Blocking impact if missing | Validation method |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Company / legal entity / plant / branch | Company/legal entity | Required | Admin | Organization > Companies | STS Precision Fabricators, GST/legal registration | P0: users and documents lack company scope | Open company list and verify active legal entity |
| Company / legal entity / plant / branch | Fiscal year | Required | Finance | Finance > Fiscal Periods | FY 2026-27 | P0: GL/AP/AR posting blocked | Verify fiscal year appears with open periods |
| Company / legal entity / plant / branch | Fiscal periods | Required | Finance | Finance > Fiscal Periods | Apr 2026 through Mar 2027, Open | P0: posting date validation fails | Post test journal in open period; closed period must block |
| Company / legal entity / plant / branch | Branch/site/plant | Required | Admin | Organization > Branches | PLANT-1 Main Fabrication Plant | P0: operational documents lack plant context | Confirm branch selectable in user context |
| Company / legal entity / plant / branch | Warehouse | Required | Store/warehouse | Organization > Warehouses | MAIN, QC-HOLD, DISPATCH-STAGE | P0: stock movements and dispatch cannot post | Verify warehouse appears in inventory selectors |
| Company / legal entity / plant / branch | Bin/location | Required if bin-managed | Store/warehouse | Organization > Bins | MAIN-A01, QC-HOLD-01, STAGE-01 | P0 for bin-managed items/warehouses | Post validation preview requires valid bin |
| Company / legal entity / plant / branch | Tax region/place of supply | Required where tax policy uses it | Finance | Commercial > Tax/Currency/Terms | Maharashtra / intra-state | P1: tax treatment cannot be verified | Quote/SO tax category resolves from setup |
| Company / legal entity / plant / branch | Base currency/exchange rate | Required | Finance | Commercial > Tax/Currency/Terms | INR, rate 1.0000 | P0 for commercial/finance snapshots | Quote and AR invoice display currency/rate snapshot |
| Users / roles / permissions | Admin user | Required | Admin | Platform > Users/Roles | UAT Admin | P0: setup cannot continue | Sign in and access setup screens |
| Users / roles / permissions | Sales user | Required | Admin/Sales lead | Platform > Users/Roles | UAT Sales Owner | P0 for quote/SO defaulting tests | Sales owner selector lists governed user |
| Users / roles / permissions | Procurement user | Required | Admin/Procurement | Platform > Users/Roles | UAT Buyer | P0 for P2P UAT | User can create RFQ/PO |
| Users / roles / permissions | Store/warehouse user | Required | Admin/Warehouse | Platform > Users/Roles | UAT Store Keeper | P0 for inventory/dispatch/service spares | User can post stock movement where authorized |
| Users / roles / permissions | Production user | Required | Admin/Production | Platform > Users/Roles | UAT Production Supervisor | P1 for work order UAT | User can open work order/job card screens |
| Users / roles / permissions | Quality user | Required | Admin/Quality | Platform > Users/Roles | UAT QC Inspector | P0 for quality gate UAT | User can record inspection/NCR/COA |
| Users / roles / permissions | Dispatch/logistics user | Required | Admin/Dispatch | Platform > Users/Roles | UAT Dispatcher | P0 for pick/pack/ship/POD | User can open shipment/POD actions |
| Users / roles / permissions | Finance user | Required | Admin/Finance | Platform > Users/Roles | UAT Accountant | P0 for posting/invoice tests | User can post journal/AP/AR where authorized |
| Users / roles / permissions | Service user | Required | Admin/Service | Platform > Users/Roles | UAT Service Coordinator | P1 for service UAT | User can create ticket/visit/claim |
| Users / roles / permissions | Mobile technician/operator | Required for mobile UAT | Admin/Mobile lead | Platform > Users + mobile device registration | UAT Technician Device 01 | P0 for mobile/offline UAT | Device trust status visible and scoped |
| Users / roles / permissions | Integration admin | Required for provider tests | Admin/IT | Integrations > Providers | UAT Integration Admin | P1 for send/sync UAT | Provider registry actions available |
| Users / roles / permissions | Report viewer | Required | Admin/Reporting | Platform > Roles + Reports | UAT Report Viewer | P1 for report UAT | User can run registered reports |
| Users / roles / permissions | UDF admin | Required if UDF UAT runs | Admin/UDF owner | Platform > Extensibility | UAT UDF Admin | P1 for customization UAT | User can create active UDF definition |
| Users / roles / permissions | Approval/override roles | Required where overrides tested | Admin/Process owner | Platform > Roles/Approvals | Warranty override approver, commercial override approver | P1: override tests blocked | Override without permission must fail |
| Commercial setup | Price lists | Required | Sales/Finance | Commercial > Price Lists | STD-INR-2026 | P0: quote/SO pricing defaulting blocked | Quote line resolves effective-date price |
| Commercial setup | Discount schemes | Required | Sales/Finance | Commercial > Discount Schemes | STD-DISC-2026 | P1: discount tests blocked | Quote line resolves discount by document date |
| Commercial setup | Tax categories/codes/rates | Required | Finance | Commercial > Tax/Currency/Terms | GST18 output/input | P0: tax snapshot tests blocked | Quote, AP, AR tax uses snapshot |
| Commercial setup | Payment terms | Required | Sales/Finance | Commercial > Tax/Currency/Terms | NET30 | P1: customer defaulting incomplete | Customer profile and quote/SO show term |
| Commercial setup | Trade terms | Required where used | Sales/Finance | Commercial > Tax/Currency/Terms | FOR dispatch / Ex works | P2 if not used in pilot | Quote/SO shows governed trade term |
| Commercial setup | Freight/packing/insurance/other charge policies | Required | Sales/Finance | Commercial service/calculation setup | Freight taxable, packing taxable | P1: totals cannot be accepted | Quote/SO totals include charges |
| Commercial setup | Round-off policy | Required | Finance | Commercial/Finance policy | Nearest 1 INR | P1: invoice totals differ | AR invoice uses persisted round-off |
| Commercial setup | Customer commercial defaults | Required | Sales | Customer master commercial profile | Sales owner, price list, discount, terms, tax, currency | P0 for sales-to-cash UAT | New quote defaults from customer |
| Commercial setup | Sales owner/team/territory assignment | Required | Sales lead | Customer profile / sales assignment | Territory WEST, Sales Team A | P1 for ownership reporting | Quote/SO owner defaults and reports show owner |
| Item / inventory setup | Item groups | Required | Master data owner | Master Data > Item Groups | FG, RM, SPARE | P1 for posting profiles/valuation | Item selector shows group |
| Item / inventory setup | UOM | Required | Master data owner | Measurements > UOM | EA, KG, MTR | P0: lines cannot save | Transaction grids require governed UOM |
| Item / inventory setup | Item revision policy | Required for engineered items | Engineering | Item Master / Engineering | REV-A released | P1: revision snapshot tests blocked | Quote/SO/stock movement stores revision |
| Item / inventory setup | Stock-controlled flag | Required | Warehouse/Master data | Item Master inventory policy | Stock controlled = true | P0: inventory validation unreliable | Movement validation reports stock policy |
| Item / inventory setup | Bin/lot/serial/PCID tracking policy | Required per pilot item | Warehouse/Master data | Item Master inventory policy | Requires bin, lot, serial or PCID as applicable | P0: traceability UAT invalid | Missing required dimension fails server-side |
| Item / inventory setup | Quality inspection required flag | Required for quality flows | Quality/Master data | Item quality policy | Incoming/final inspection required | P1: quality gate cannot be verified | GRN/final QC route shows inspection requirement |
| Item / inventory setup | COA required flag | Required where COA tested | Quality/Sales | Quality policy / item policy | COA required for customer A/item X | P1: COA dispatch gate not meaningful | COA required blocks/warns per policy |
| Item / inventory setup | Default warehouse/bin policies | Required where defaults are allowed | Warehouse | Item/Warehouse policy | MAIN-A01 receive, STAGE-01 dispatch | P1: selectors require manual choice | Selector filters valid active bins |
| Item / inventory setup | Stock status policy | Required | Warehouse/Quality | Inventory policy | Available, QualityHold, Blocked, InTransit | P0: blocked stock tests invalid | Quality-held stock cannot issue/dispatch |
| Item / inventory setup | Valuation/cost policy | Required | Finance/Warehouse | Finance > Posting Profiles / Inventory valuation | Weighted average, valuation pending rule | P0 for finance/inventory UAT | GRN/dispatch creates valuation entry or clear pending status |
| Customer / supplier setup | Customer profiles | Required | Sales | Partners > Customers | Customer with tax, currency, terms, owner | P0 for sales-to-cash | Customer detail saves and defaults quote |
| Customer / supplier setup | Customer contacts/sites | Required | Sales/Dispatch | Partners > Customers | Bill-to, ship-to, buyer contact | P1 for dispatch/POD/send tests | Dispatch snapshot uses customer/site/contact |
| Customer / supplier setup | Supplier profiles | Required | Procurement | Partners > Suppliers | Approved material supplier | P0 for P2P | Supplier selectable in RFQ/PO |
| Customer / supplier setup | Supplier contacts/sites | Required | Procurement | Partners > Suppliers | RFQ email/contact/site | P1 for RFQ/PO send tests | Supplier contact visible and persisted |
| Customer / supplier setup | Tax/GST registration | Required where tax uses it | Finance | Partner profile / tax setup | GSTIN / tax registration | P1 for tax reports | AP/AR tax snapshots include configured treatment |
| Customer / supplier setup | Payment/commercial terms | Required | Sales/Procurement/Finance | Partner commercial profile | NET30, currency INR | P1 for invoice due dates | AP/AR invoice due dates resolve |
| Customer / supplier setup | Credit/limit policy | Optional unless pilot uses it | Finance/Sales | Customer profile / finance policy | Credit limit 500000 | P2 if not piloted | Document approval/credit warning behaves per policy |
| Procurement setup | RFQ templates | Optional | Procurement | RFQ workspace/report templates | Standard RFQ output | P2: can run manual RFQ without template | RFQ document output disabled or generated truthfully |
| Procurement setup | Supplier quotation comparison setup | Required | Procurement | Procurement > Quote Comparison | Comparison factors price/tax/lead time | P1 for supplier award | Comparison shows persisted quote lines |
| Procurement setup | PO terms | Required | Procurement/Finance | PO workspace / commercial terms | Delivery, freight, tax terms | P1 for PO acceptance | PO shows governed terms |
| Procurement setup | GRN/QC route rules | Required if inspection piloted | Procurement/Quality | GRN/QC policy | Incoming QC required for RM | P1 for quality-to-P2P UAT | GRN links inspection route |
| Procurement setup | Supplier invoice/AP matching rules | Required | Finance/Procurement | Supplier invoice/AP matching | 2-way/3-way tolerance | P0 for AP posting UAT | Supplier invoice blocks or posts per match |
| Procurement setup | Vendor return / landed cost boundaries | Optional/later unless piloted | Procurement/Finance | Procurement boundaries | Disabled with reason if not enabled | P2/P1 depending pilot scope | Buttons remain disabled with reason where incomplete |
| Production setup | BOM | Required | Engineering/Production | Engineering > BOM | Released FG BOM REV-A | P0 for production UAT | Work order references released BOM |
| Production setup | Routing | Required | Engineering/Production | Engineering > Routing | Released routing REV-A | P0 for job card UAT | Work order/job card references routing |
| Production setup | Work centers/resources | Required | Production | Resources > Work Centers/Machines | WC-FAB, CNC-01 | P1 for capacity/job card | Routing operation resolves governed work center |
| Production setup | Job card/operation setup | Required | Production | Production > Job Cards | Operation 10/20 | P1 for operation execution | Job card generated from work order |
| Production setup | Production issue/receipt policy | Required | Production/Warehouse | Production/inventory policy | Issue to WIP, receipt FG | P0 for production inventory/valuation | Material issue/receipt post through inventory |
| Production setup | Scrap/rework policy | Required if piloted | Production/Quality/Finance | Production output policy | Scrap reason codes, rework route | P1 for scrap/rework UAT | Scrap/rework actions persist or disable with reason |
| Quality setup | QC plan | Required | Quality | Quality > Plans | RM incoming plan, FG final plan | P0 for quality UAT | Inspection can select plan |
| Quality setup | Inspection characteristics | Required | Quality | Quality > Plans | Dimension, visual, certificate check | P0 for result capture | Result grid has characteristics |
| Quality setup | NCR categories | Required | Quality | Quality > NCR | Dimensional, material, packaging | P1 for NCR reporting | NCR category selector governed |
| Quality setup | CAPA categories | Required | Quality | Quality > NCR/CAPA | Corrective, preventive | P1 for CAPA workflow | CAPA persists with category |
| Quality setup | Disposition rules | Required | Quality/Warehouse | Quality > NCR | Use as is, rework, reject, release | P0 for stock status/dispatch gate | Disposition updates/blocks stock as expected |
| Quality setup | Final QC/dispatch gate policy | Required where dispatch gate piloted | Quality/Dispatch | Quality policy / dispatch gate | Final QC passed required | P1 for dispatch acceptance | Shipment blocks if final QC not passed |
| Quality setup | COA policy | Required where COA piloted | Quality/Sales | Quality > COA | COA required for customer/item | P1 for COA UAT | COA issue/reissue persists |
| Dispatch/logistics setup | Transporter/carrier master | Optional unless logistics piloted | Dispatch | Dispatch/logistics master | Local Carrier A | P2 if not piloted | Carrier selector or disabled reason visible |
| Dispatch/logistics setup | Dispatch staging/bin policy | Required | Warehouse/Dispatch | Warehouse/Bin policy | STAGE-01 active | P0 for dispatch pick/ship | Dispatch pick requires valid bin |
| Dispatch/logistics setup | POD policy | Required | Dispatch/Sales | Dispatch workspace | POD required before invoice | P1/P0 depending AR policy | AR invoice blocks until POD if configured |
| Dispatch/logistics setup | Package/weight/logistics fields | Required if logistics UAT | Dispatch | Dispatch shipment | Cartons, gross/net weight, vehicle | P1 for logistics acceptance | Shipment persists logistics values |
| Dispatch/logistics setup | E-way/carrier provider boundary | Optional/later | Dispatch/IT | Integrations/provider setup | Disabled reason if no provider | P2 unless mandated | External provider actions block clearly |
| Finance setup | Chart of Accounts | Required | Finance | Finance > Chart of Accounts | AR, AP, Revenue, Inventory, Tax, WIP, COGS | P0: posting blocked | Posting account rules validated |
| Finance setup | Posting profiles | Required | Finance | Finance > Posting Profiles | AP, AR, inventory, tax, COGS mappings | P0: no accounting bridge | Missing mapping fails with clear reason |
| Finance setup | AP/AR accounts | Required | Finance | Posting profiles / COA | 2100-AP, 1200-AR | P0 for AP/AR | AP/AR subledger creates GL |
| Finance setup | Inventory/GRIR/COGS/WIP/tax/round-off accounts | Required | Finance | Posting Profiles | Inventory, GRIR, COGS, WIP, output/input tax | P0/P1 for valuation and tax | Stock/AR/AP postings use mapped IDs |
| Finance setup | Fiscal period open status | Required | Finance | Fiscal Periods | Current UAT period Open | P0: posting blocked | Closed period rejects posting |
| Finance setup | Tax ledger setup | Required | Finance | Tax setup / finance | Input/output tax codes | P1 for tax reports | Tax ledger generated from snapshots |
| Finance setup | Valuation policy | Required | Finance/Warehouse | Inventory valuation | Weighted average, valuation pending decision | P1 for COGS/valuation | Valuation entries reconcile with stock movement |
| Finance setup | AR invoice from dispatch policy | Required | Finance/Sales/Dispatch | Finance/Dispatch policy | Invoice after POD | P1 for sales-to-cash | AR invoice created from eligible dispatch |
| Finance setup | Bank/payment execution boundary | Optional/later | Finance | Finance boundary screen | Disabled until bank provider enabled | P2 unless pilot includes payments | Pay/receive actions disabled with reason |
| Reports/dashboard setup | Report permissions | Required | Reporting/Admin | Reports / Roles | Sales, finance, inventory report roles | P1 for report UAT | Unauthorized user cannot run/download |
| Reports/dashboard setup | Dashboard roles | Required | Reporting/Admin | Reports > Saved Views | Executive, sales, finance dashboards | P2 if not pilot-critical | Dashboard visible by role |
| Reports/dashboard setup | Generated output permissions | Required | Reporting/Admin | Reports catalog/output | Download permission | P1 for document output | Download audited and permission checked |
| Reports/dashboard setup | Finance report permissions | Required | Finance/Admin | Roles / Reports | Finance report viewer | P1 for finance UAT | Non-finance user blocked |
| Reports/dashboard setup | Report templates/scheduled report boundary | Optional/later | Reporting/IT | Reports/Integrations | Disabled or configured scheduler | P2 | Schedule actions disabled or queued truthfully |
| Integrations setup | Provider registry | Required for send UAT | IT/Integration admin | Integrations > Providers | Email sandbox provider | P1 for send tests | Provider active/inactive status visible |
| Integrations setup | Credential references | Required for live provider tests | IT/Security | Provider detail / secret store | `secret://uat/email/smtp` | P1/P0 depending send scope | Raw secrets not exposed; missing reference blocks |
| Integrations setup | Email SMTP/API | Required if email UAT | IT | Provider registry | SMTP sandbox endpoint | P1 | Send creates outbound ledger/provider result |
| Integrations setup | WhatsApp BSP | Required if WhatsApp UAT | IT/Marketing | Provider registry/template setup | BSP sandbox + approved template | P1 | Missing template blocks clearly |
| Integrations setup | SMS gateway | Required if SMS UAT | IT | Provider registry/template setup | Sender ID STSUAT | P1 | Invalid sender/recipient blocks |
| Integrations setup | CRM tenant/object mappings | Required if CRM UAT | Sales/IT | Integrations > CRM Mapping | Customer/account external ID | P1 | Sync persists external ID mapping |
| Integrations setup | Webhook callback URLs | Required if webhook UAT | IT | Integrations > Webhooks | Public callback URL + secret ref | P1 | Signature/callback verification recorded |
| Integrations setup | AI provider/model credentials | Optional unless AI UAT | IT/Process owner | AI provider setup | Sandbox model credential ref | P2 | AI draft requires review; no auto-post |
| Integrations setup | Sandbox/live mode choice | Required | IT/Business owner | Provider registry | Sandbox for UAT | P1 | Dry-run labelled; live sends explicit |
| Integrations setup | Dry-run vs live-send policy | Required | Business owner | UAT runbook | Dry-run allowed for first cycle | P1 | Outbound ledger status distinguishes dry-run/live |
| Mobile setup | Device registration | Required | Mobile/Admin | Mobile/device trust API/admin | Device UAT-01 | P0 for mobile UAT | Device appears trusted/untrusted |
| Mobile setup | Trusted/revoked device policy | Required | Security/Mobile lead | Device trust setup | Trust required for stock posting | P0 | Revoked device cannot sync/post |
| Mobile setup | Warehouse/user scope | Required | Mobile/Warehouse | User/device assignment | PLANT-1 MAIN | P0 | Mobile task feed scoped to warehouse |
| Mobile setup | Scanner devices | Required for scanner UAT | Mobile/Warehouse | Runtime/device inventory | Keyboard-wedge scanner | P1 | Scan source recorded as hardware/manual/camera |
| Mobile setup | Camera devices | Required for photo UAT | Mobile/Quality/Dispatch | Runtime/device inventory | Android/iOS camera browser/native | P1 | Evidence metadata persists or action disabled |
| Mobile setup | Offline queue policy | Required | Mobile/IT | Mobile setup | Queue allowed for POD/service evidence | P1 | Offline operation idempotency verified |
| Mobile setup | Network-loss test plan | Required | Mobile/IT | Runtime test plan | Airplane-mode/blocked network scenario | P1 | Conflict/sync status visible |
| Mobile setup | Mobile operator roles | Required | Admin/Mobile lead | Roles/users | Store operator, technician | P0 | Unauthorized mobile post rejected |
| UDF/customization setup | UDF definitions | Required if UDF UAT | UDF admin | Platform > Extensibility | Customer priority code | P1 | Definition active and typed |
| UDF/customization setup | UDF placements | Required if UDF UAT | UDF admin | Platform > Extensibility | Customer header, quote header, service ticket | P1 | Field appears in actual workspace |
| UDF/customization setup | Mandatory UDFs | Optional unless lifecycle UAT | UDF admin/process owner | UDF validation | Required on quote release | P1 | Missing required UDF blocks configured transition |
| UDF/customization setup | Sensitive UDF rules | Required if sensitive data used | Security/UDF admin | UDF permissions | Hidden margin note | P1 | Restricted UDF not exported/sent to unauthorized users |
| UDF/customization setup | UDF report/export inclusion | Optional unless report UAT | Reporting/UDF admin | Reports/UDF setup | Include customer priority in report | P2 | Report output includes configured UDF |
| UDF/customization setup | Custom objects/screens | Optional/foundation | UDF admin | Platform > Extensibility | Service checklist object | P2 | Custom record persists and route/action truthful |
| UDF/customization setup | Service/Warranty/AMC UDF placements | Required for service UDF UAT | Service/UDF admin | Platform > Extensibility | Service ticket symptom code | P1 | UDF visible on service ticket and reportable |
| Service/Warranty/AMC setup | Installed asset source rules | Required | Service/Sales/Dispatch | Service > Installed Assets | Create asset from invoice/dispatch or explicit source | P1 | Asset stores customer/item/serial/source snapshot |
| Service/Warranty/AMC setup | Warranty policies | Required | Service/Quality/Sales | Service > Warranty Policies | 12 months from invoice date | P1 | Entitlement resolves by policy/date/source |
| Service/Warranty/AMC setup | Warranty entitlement triggers | Required | Service | Warranty policy | Invoice date, dispatch date, installation date | P1 | Expired warranty blocks claim without override |
| Service/Warranty/AMC setup | AMC contracts | Required if AMC UAT | Service/Finance | Service > Contracts | AMC-2026 customer asset coverage | P1 | Active/expired status respected |
| Service/Warranty/AMC setup | SLA/response targets | Optional/foundation | Service | Service ticket setup | 4-hour response, 48-hour resolution | P2 | SLA report shows target where configured |
| Service/Warranty/AMC setup | Technician/team assignment | Required | Service/Admin | Users/Roles/Service visits | Technician Team A | P1 | Ticket/visit assignment governed |
| Service/Warranty/AMC setup | Spare issue/return warehouses | Required | Service/Warehouse | Warehouse/item policy | SERVICE-SPARES bin tracked | P0 for spare posting | Service spare issue requires bin/lot/serial/PCID |
| Service/Warranty/AMC setup | Service charge/tax policies | Required for paid service | Service/Finance | Service charges / finance setup | Labor, parts, travel GST | P1 | Invoice-ready charge has persisted tax snapshot |
| Service/Warranty/AMC setup | Service reports | Required | Service/Reporting | Service > Reports / Reports catalog | Ticket register, asset history | P2/P1 based on pilot | Report run reads persisted service data |

## Setup Completion Signoff

| Domain owner | Name | Date | Status | Notes |
| --- | --- | --- | --- | --- |
| Admin |  |  | Pending |  |
| Sales |  |  | Pending |  |
| Procurement |  |  | Pending |  |
| Warehouse |  |  | Pending |  |
| Production |  |  | Pending |  |
| Quality |  |  | Pending |  |
| Dispatch |  |  | Pending |  |
| Finance |  |  | Pending |  |
| Service |  |  | Pending |  |
| IT / Integrations / Mobile |  |  | Pending |  |
