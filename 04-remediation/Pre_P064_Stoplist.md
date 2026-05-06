# Pre-P064 Stoplist

## Stop Condition

- `P064` cannot be executed before `R001-R013` are completed.
- No new production receipt, scrap, rework, landed cost, or return logic may be finalized on V1 master-data assumptions.
- This stoplist remains active until `R013` completes and the repo explicitly resumes at `/02-prompts/P064_production-receipt-scrap-and-rework-apis.md`.

## Blocked Domains and File Scopes

### Item, catalog, packaging, barcode, alias, and partner-reference foundations

- Do not finalize new V1-shaped item or item-adjacent runtime logic in `/src/server/STS.Mfg.Api/Controllers/MeasurementItemControllers.cs`.
- Do not finalize new V1-shaped master or measurement contracts in `/src/server/STS.Mfg.Application/Contracts/Masters/MasterContracts.cs` or `/src/server/STS.Mfg.Application/Contracts/Measurements/MeasurementContracts.cs`.
- Do not finalize new V1-shaped item, variant, barcode, customer-reference, or supplier-reference entities in `/src/server/STS.Mfg.Domain/Masters/MasterEntities.cs` or `/src/server/STS.Mfg.Domain/Measurements/MeasurementEntities.cs`.
- Do not deepen the current V1 item model through `/src/server/STS.Mfg.Infrastructure/Measurements/MeasurementService.cs`, `/src/server/STS.Mfg.Infrastructure/Persistence/MfgDbContext.cs`, or `/src/server/STS.Mfg.Infrastructure/Persistence/Configurations/DomainEntityConfigurations.cs`.

### Customer, customer-site, contact, consent, credit, terms, and dispatch preferences

- Do not finalize new customer-account or customer-address assumptions in `/src/server/STS.Mfg.Api/Controllers/PartnerResourceControllers.cs`.
- Do not finalize new shallow customer contracts or entities in `/src/server/STS.Mfg.Application/Contracts/Masters/MasterContracts.cs` or `/src/server/STS.Mfg.Domain/Masters/MasterEntities.cs`.
- Do not finalize new quote or sales-order customer dependencies on the shallow V1 customer model in `/src/server/STS.Mfg.Api/Controllers/SalesPlanningControllers.cs`, `/src/server/STS.Mfg.Application/Contracts/SalesPlanning/SalesPlanningContracts.cs`, `/src/server/STS.Mfg.Domain/SalesPlanning/SalesPlanningEntities.cs`, or `/src/server/STS.Mfg.Infrastructure/SalesPlanning/SalesPlanningService.cs`.

### Supplier, supplier compliance, vendor references, and deeper terms

- Do not finalize new supplier-depth assumptions in `/src/server/STS.Mfg.Api/Controllers/PartnerResourceControllers.cs` or `/src/server/STS.Mfg.Api/Controllers/ProcurementControllers.cs`.
- Do not finalize new shallow supplier contracts or entities in `/src/server/STS.Mfg.Application/Contracts/Masters/MasterContracts.cs`, `/src/server/STS.Mfg.Application/Contracts/Procurement/ProcurementContracts.cs`, `/src/server/STS.Mfg.Domain/Masters/MasterEntities.cs`, or `/src/server/STS.Mfg.Domain/Procurement/ProcurementEntities.cs`.
- Do not finalize procurement behavior that assumes the V1 supplier model is complete in `/src/server/STS.Mfg.Infrastructure/Procurement/ProcurementService.cs`, `/src/server/STS.Mfg.Infrastructure/Persistence/MfgDbContext.cs`, or `/src/server/STS.Mfg.Infrastructure/Persistence/Configurations/ProcurementEntityConfigurations.cs`.

### Pricing, discount, tax, currency, and commercial contract expansion

- Do not finalize new pricing, discount, tax, currency, or trade-term logic in `/src/server/STS.Mfg.Api/Controllers/SalesPlanningControllers.cs`.
- Do not finalize new commercial contracts on the current shallow shell in `/src/server/STS.Mfg.Application/Contracts/SalesPlanning/SalesPlanningContracts.cs`.
- Do not finalize new commercial entities or status logic on the current shallow shell in `/src/server/STS.Mfg.Domain/SalesPlanning/SalesPlanningEntities.cs`.
- Do not finalize new pricing or credit behavior in `/src/server/STS.Mfg.Infrastructure/SalesPlanning/SalesPlanningService.cs`.

### Replenishment policy and planning-input expansion

- Do not finalize new replenishment policy logic in `/src/server/STS.Mfg.Api/Controllers/SalesPlanningControllers.cs`, `/src/server/STS.Mfg.Api/Controllers/InventoryControllers.cs`, or `/src/server/STS.Mfg.Api/Controllers/ProcurementControllers.cs`.
- Do not finalize new replenishment contracts or planning-input assumptions in `/src/server/STS.Mfg.Application/Contracts/SalesPlanning/SalesPlanningContracts.cs`, `/src/server/STS.Mfg.Application/Contracts/Inventory/InventoryContracts.cs`, or `/src/server/STS.Mfg.Application/Contracts/Procurement/ProcurementContracts.cs`.
- Do not finalize new replenishment or planning entities in `/src/server/STS.Mfg.Domain/SalesPlanning/SalesPlanningEntities.cs`, `/src/server/STS.Mfg.Domain/Inventory/InventoryEntities.cs`, or `/src/server/STS.Mfg.Domain/Procurement/ProcurementEntities.cs`.
- Do not finalize replenishment-driven behavior in `/src/server/STS.Mfg.Infrastructure/SalesPlanning/SalesPlanningService.cs`, `/src/server/STS.Mfg.Infrastructure/Inventory/InventoryService.cs`, `/src/server/STS.Mfg.Infrastructure/Procurement/ProcurementService.cs`, `/src/server/STS.Mfg.Infrastructure/Persistence/Configurations/InventoryEntityConfigurations.cs`, or `/src/server/STS.Mfg.Infrastructure/Persistence/Configurations/ProcurementEntityConfigurations.cs`.

### Template, localization, document-link, and controlled-document expansion

- Do not finalize new template or controlled-document runtime behavior in `/src/server/STS.Mfg.Api/Controllers/LocalizationController.cs`, `/src/server/STS.Mfg.Application/Contracts/Localization/TranslationContracts.cs`, `/src/server/STS.Mfg.Domain/Platform/Localization/TranslationEntry.cs`, or `/src/server/STS.Mfg.Domain/Platform/Documents/DocumentLink.cs`.
- Do not finalize new attachment-driven document semantics in `/src/server/STS.Mfg.Application/Contracts/Attachments/AttachmentSaveRequest.cs`, `/src/server/STS.Mfg.Infrastructure/Platform/Attachments/AttachmentService.cs`, or `/src/server/STS.Mfg.Infrastructure/Platform/Attachments/LocalAttachmentStorage.cs`.
- Do not finalize template-aware notification or rendering behavior in `/src/server/STS.Mfg.Infrastructure/Platform/Localization/TranslationService.cs` or `/src/server/STS.Mfg.Infrastructure/Platform/Notifications/NotificationTemplateLookup.cs`.

### UDF and metadata extensibility

- Do not add or finalize runtime files for metadata or custom-field extensibility under `/src/server/STS.Mfg.Api/Controllers/MetadataController.cs`, `/src/server/STS.Mfg.Application/Contracts/Metadata/`, `/src/server/STS.Mfg.Domain/Platform/Metadata/`, or `/src/server/STS.Mfg.Infrastructure/Platform/Metadata/` before the remediation sequence reaches `R009-R013`.
- Do not add metadata SQL objects, seed data, or migration artifacts under `/database/` before the remediation sequence reaches the SQL and backend remediation prompts.

### Costing hooks, landed cost, returns, and production receipt or rework logic

- Do not finalize new production receipt, scrap, rework, or costing-hook runtime behavior in `/src/server/STS.Mfg.Api/Controllers/InventoryControllers.cs`, `/src/server/STS.Mfg.Api/Controllers/WorkOrderControllers.cs`, or `/src/server/STS.Mfg.Api/Controllers/JobCardControllers.cs`.
- Do not finalize new production receipt, scrap, rework, return, or costing contracts in `/src/server/STS.Mfg.Application/Contracts/Inventory/InventoryContracts.cs` or `/src/server/STS.Mfg.Application/Contracts/Production/`.
- Do not finalize new production receipt, rework, return, or costing entities in `/src/server/STS.Mfg.Domain/Inventory/InventoryEntities.cs`, `/src/server/STS.Mfg.Domain/Production/WorkOrderEntities.cs`, or `/src/server/STS.Mfg.Domain/Production/JobCardEntities.cs`.
- Do not finalize new production receipt, scrap, rework, return, landed-cost, or costing orchestration in `/src/server/STS.Mfg.Infrastructure/Inventory/InventoryService.cs`, `/src/server/STS.Mfg.Infrastructure/Production/WorkOrderService.cs`, `/src/server/STS.Mfg.Infrastructure/Production/JobCardService.cs`, `/src/server/STS.Mfg.Infrastructure/Persistence/Configurations/InventoryEntityConfigurations.cs`, `/src/server/STS.Mfg.Infrastructure/Persistence/Configurations/ProductionEntityConfigurations.cs`, or `/src/server/STS.Mfg.Infrastructure/Persistence/Procedures/Production/`.

### Global SQL and migration stoplist

- Do not add or finalize blocked-domain SQL objects, stored procedures, migration packs, or seed scripts under `/database/` before `R011-R013`.
- Do not treat any blocked runtime surface as stable until the V2 canonical master-data, partner, commercial, replenishment, platform, and SQL remediation prompts are complete.
