# R002 Master Data V2 Canonical Domain Map

## Objective

Define the V2 bounded contexts, aggregate ownership, shared identities, and salvage rules that every later remediation step must honor before `P064`.

## Canonical Bounded Contexts

| Context | Owns | Current repo surface | Disposition |
| --- | --- | --- | --- |
| Organization and scope | Company, Branch, Department, Warehouse, Bin, Shift | `OrganizationEntities`, `OrganizationControllers`, scope policies | `KEEP` |
| Measurement foundation | UOM classes, units, conversions, profiles, formulas | `MeasurementEntities`, `MeasurementService`, `MeasurementContracts` | `PATCH` |
| Product master | Operational item, texts, media links, documents, physical specs | `MasterEntities`, `MeasurementItemControllers`, attachments | `REPLACE` |
| Catalog and references | Catalogs, catalog items, catalog visibility, catalog texts, partner item references | No dedicated catalog surface; sales and procurement embed shallow references | `REPLACE` |
| Partner master | Customer and supplier accounts, sites, contacts, contact points, consent, commercial defaults | `MasterEntities`, `PartnerResourceControllers`, procurement and sales shells | `REPLACE` |
| Commercial foundation | Pricing, discount, tax, currency, dispatch preference, credit control | `SalesPlanningEntities`, `SalesPlanningService` | `REPLACE` |
| Procurement foundation | PR, PO, subcontract, supplier compliance, preferred sourcing | `ProcurementEntities`, `ProcurementControllers`, `ProcurementService` | `PATCH` |
| Inventory and planning input | Ledger, reservations, replenishment policies, packaging-aware planning inputs | `InventoryEntities`, `InventoryService`, `SalesPlanningEntities` | `PATCH` |
| Engineering and execution | Routing, BOM, ECO, alternate item, WO, JC, downtime, machine board | `EngineeringEntities`, `WorkOrderEntities`, `JobCardEntities` | `KEEP` |
| Platform services | Attachments, localization, notifications, metadata, templates, setup verification | Platform domain and infrastructure services | `PATCH` |
| SQL and cost foundation | Ordered migration packs, DDL packs, procedure packs, costing hooks | `database/README.md`, `MfgDbContext`, one machine-board wrapper | `REPLACE` |

## Canonical Aggregate Ownership

| Aggregate | Canonical key | Owning context | Notes |
| --- | --- | --- | --- |
| Company / Branch / Warehouse / Bin | Surrogate numeric ids preserved | Organization and scope | Existing multi-company backbone remains the scoping anchor. |
| Item | `ItemId` preserved as the operational identity bridge | Product master | V1 item id remains the bridge key during staged cutover. |
| Catalog | `CatalogId` | Catalog and references | Catalog is separate from operational item ownership. |
| CustomerAccount / CustomerSite | `CustomerAccountId`, `CustomerSiteId` | Partner master | Replaces the shallow customer plus address split. |
| SupplierAccount / SupplierSite | `SupplierAccountId`, `SupplierSiteId` | Partner master / Procurement foundation | Preserves procurement continuity through a default-site bridge. |
| PriceList / DiscountScheme | `PriceListId`, `DiscountSchemeId` | Commercial foundation | Commercial behavior becomes a separate engine, not embedded on documents. |
| ReplenishmentPolicy | `ReplenishmentPolicyId` | Inventory and planning input | Planning consumes policy inputs instead of shallow item flags. |
| DocumentTemplate / MetadataDefinition | `DocumentTemplateId`, `MetadataDefinitionId` | Platform services | Shared platform services remain additive and tenant-aware. |
| WorkOrder / JobCard | Existing ids preserved | Engineering and execution | Preserved execution backbone consumes canonical master projections later. |
| CostSet / LandedCostHeader | `CostSetId`, `LandedCostHeaderId` | SQL and cost foundation | Foundation only before post-`R013` execution waves. |

## Existing Repo Surface Classification

| Surface group | Current files | Class | Guardrail |
| --- | --- | --- | --- |
| Organization and scope | `OrganizationEntities.cs`, `OrganizationContracts.cs`, `OrganizationControllers.cs`, `OrganizationService.cs` | `KEEP` | Preserve as the scoping backbone and verify setup completeness later. |
| Measurements and basic item shell | `MeasurementEntities.cs`, `MasterEntities.cs`, `MeasurementContracts.cs`, `MasterContracts.cs`, `MeasurementItemControllers.cs`, `MeasurementService.cs` | `PATCH` plus `REPLACE` | Keep UOM foundations, replace the shallow item and partner business shape. |
| Sales and procurement master references | `SalesPlanningEntities.cs`, `ProcurementEntities.cs`, `SalesPlanningContracts.cs`, `ProcurementContracts.cs`, related controllers and services | `REPLACE` plus `PATCH` | Preserve document skeletons while replacing their shallow upstream assumptions. |
| Inventory and planning | `InventoryEntities.cs`, `InventoryContracts.cs`, `InventoryControllers.cs`, `InventoryService.cs`, `SalesPlanningService.cs` | `PATCH` | Keep ledger and planning logic, change their upstream master-data inputs. |
| Engineering and manufacturing execution | `EngineeringEntities.cs`, `EngineeringControllers.cs`, `WorkOrder*`, `JobCard*`, machine-board procedure wrapper | `KEEP` | Preserve route, BOM, WO, JC, and dashboard behavior. |
| Platform scaffolding | Attachment, localization, notification, audit, auth, data-scope surfaces | `PATCH` | Reuse the scaffolding behind richer metadata, template, and consent models. |
| SQL delivery posture | `database/README.md`, `MfgDbContext.cs`, EF configurations, procedure executor | `REPLACE` | Introduce an ordered migration and procedure pack discipline before further runtime expansion. |

## Compatibility Strategy

- Preserve existing numeric ids, numbering conventions, audit flows, and branch/company scoping as the bridge between V1 and V2.
- Use additive canonical aggregates, bridge mappings, compatibility DTOs, and staged read adapters before deprecating shallow V1 shapes.
- Keep engineering, work-order, job-card, machine-board, stage dashboard, and order-delivery dashboard flows intact while upstream master data is rebuilt.
- Keep attachment storage, translation fallback, and notification outbox scaffolding, but move business semantics into new V2 ownership models.

## Cutover Approach

1. Define the canonical V2 model in `R003-R009`.
2. Define cross-cutting cost, SQL, and runtime refactor plans in `R010-R012`.
3. Limit `R013` to the repo surfaces explicitly permitted by the refactor plan.
4. Re-verify preserved manufacturing execution behavior before reopening `P064`.

## Next Prompt

- `/04-remediation/prompts/R003_item-and-catalog-v2-schema.md`
