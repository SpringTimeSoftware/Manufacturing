# R012 EF, Domain, and Contract Refactor Plan

## Objective

Define the exact runtime surfaces, salvage boundaries, adapter rules, and staged cutover sequence that a future `R013` implementation wave must follow.

## Runtime Surface Plan

| Surface group | Current files | Class | R013 rule |
| --- | --- | --- | --- |
| Organization and scope | `OrganizationEntities.cs`, `OrganizationContracts.cs`, `OrganizationControllers.cs`, `OrganizationService.cs` | `KEEP` plus `PATCH` | Touch only for setup verification, currency/tax references, or localization integrity checks. |
| Master and measurement domain | `MasterEntities.cs`, `MeasurementEntities.cs`, `MasterContracts.cs`, `MeasurementContracts.cs`, `MeasurementItemControllers.cs`, `MeasurementService.cs` | `REPLACE` plus `PATCH` | Allowed for canonical item, packaging, barcode, partner-reference, and bridge DTO work. |
| Partner and procurement shell | `PartnerResourceControllers.cs`, `ProcurementControllers.cs`, `ProcurementEntities.cs`, `ProcurementContracts.cs`, `ProcurementService.cs` | `REPLACE` plus `PATCH` | Allowed for customer and supplier bridge cutover and procurement reference alignment. |
| Sales and planning shell | `SalesPlanningEntities.cs`, `SalesPlanningContracts.cs`, `SalesPlanningControllers.cs`, `SalesPlanningService.cs` | `REPLACE` plus `PATCH` | Allowed for commercial bridge contracts, pricing adapters, and replenishment input alignment. |
| Inventory shell | `InventoryEntities.cs`, `InventoryContracts.cs`, `InventoryControllers.cs`, `InventoryService.cs` | `PATCH` | Allowed for packaging, barcode, valuation hook, and replenishment input alignment only. |
| Platform shell | Attachment, localization, notification, auth, and system surfaces | `PATCH` | Allowed for metadata, templates, consent, setup verification, and bridge semantics. |
| Engineering shell | `EngineeringEntities.cs`, `EngineeringContracts.cs`, `EngineeringControllers.cs`, `EngineeringService.cs` | `KEEP` plus `PATCH` | Touch only if a canonical item adapter is required; preserve API and lifecycle behavior. |
| Production execution shell | `WorkOrder*`, `JobCard*`, machine-board read and procedure surfaces | `KEEP` plus `PATCH` | Touch only for compatibility adapters required by master-data cutover; do not change lifecycle intent. |
| Persistence shell | `MfgDbContext.cs`, EF configuration files, persistence abstractions, procedure executor | `PATCH` | Allowed for canonical mapping, additive tables, bridge views, and ordered SQL pack alignment. |

## Compatibility Adapter Rules

- Preserve the shared API envelope, scope enforcement, audit writes, and existing route names unless a versioned bridge contract is explicitly required.
- Prefer additive canonical entities plus legacy bridge projections instead of in-place destructive rewrites.
- Preserve `P057`, `P062`, and `P063` behavior by adapting upstream item, partner, and commercial reads rather than rewriting execution services.
- Use dual-read, staged-write, bridge DTO, and mapper patterns before removing shallow V1 assumptions.

## Exact R013 Touch Allowlist

- `src/server/STS.Mfg.Api/Controllers/MeasurementItemControllers.cs`
- `src/server/STS.Mfg.Api/Controllers/PartnerResourceControllers.cs`
- `src/server/STS.Mfg.Api/Controllers/ProcurementControllers.cs`
- `src/server/STS.Mfg.Api/Controllers/SalesPlanningControllers.cs`
- `src/server/STS.Mfg.Api/Controllers/InventoryControllers.cs`
- `src/server/STS.Mfg.Api/Controllers/OrganizationControllers.cs`
- `src/server/STS.Mfg.Api/Controllers/LocalizationController.cs`
- `src/server/STS.Mfg.Api/Controllers/SystemController.cs`
- `src/server/STS.Mfg.Application/Contracts/Masters/MasterContracts.cs`
- `src/server/STS.Mfg.Application/Contracts/Measurements/MeasurementContracts.cs`
- `src/server/STS.Mfg.Application/Contracts/Procurement/ProcurementContracts.cs`
- `src/server/STS.Mfg.Application/Contracts/SalesPlanning/SalesPlanningContracts.cs`
- `src/server/STS.Mfg.Application/Contracts/Inventory/InventoryContracts.cs`
- `src/server/STS.Mfg.Application/Contracts/Localization/TranslationContracts.cs`
- `src/server/STS.Mfg.Application/Contracts/Attachments/AttachmentSaveRequest.cs`
- `src/server/STS.Mfg.Application/Abstractions/Measurements/IMeasurementService.cs`
- `src/server/STS.Mfg.Application/Abstractions/Procurement/IProcurementService.cs`
- `src/server/STS.Mfg.Application/Abstractions/SalesPlanning/ISalesPlanningService.cs`
- `src/server/STS.Mfg.Application/Abstractions/Inventory/IInventoryService.cs`
- `src/server/STS.Mfg.Domain/Masters/MasterEntities.cs`
- `src/server/STS.Mfg.Domain/Measurements/MeasurementEntities.cs`
- `src/server/STS.Mfg.Domain/Procurement/ProcurementEntities.cs`
- `src/server/STS.Mfg.Domain/SalesPlanning/SalesPlanningEntities.cs`
- `src/server/STS.Mfg.Domain/Inventory/InventoryEntities.cs`
- `src/server/STS.Mfg.Domain/Platform/Documents/DocumentLink.cs`
- `src/server/STS.Mfg.Domain/Platform/Localization/TranslationEntry.cs`
- `src/server/STS.Mfg.Domain/Platform/Notifications/NotificationTemplate.cs`
- `src/server/STS.Mfg.Domain/Platform/Notifications/NotificationOutboxMessage.cs`
- `src/server/STS.Mfg.Infrastructure/Measurements/MeasurementService.cs`
- `src/server/STS.Mfg.Infrastructure/Procurement/ProcurementService.cs`
- `src/server/STS.Mfg.Infrastructure/SalesPlanning/SalesPlanningService.cs`
- `src/server/STS.Mfg.Infrastructure/Inventory/InventoryService.cs`
- `src/server/STS.Mfg.Infrastructure/Organization/OrganizationService.cs`
- `src/server/STS.Mfg.Infrastructure/Platform/Attachments/AttachmentService.cs`
- `src/server/STS.Mfg.Infrastructure/Platform/Localization/TranslationService.cs`
- `src/server/STS.Mfg.Infrastructure/Platform/Notifications/NotificationOutboxService.cs`
- `src/server/STS.Mfg.Infrastructure/Platform/Notifications/NotificationTemplateLookup.cs`
- `src/server/STS.Mfg.Infrastructure/Persistence/MfgDbContext.cs`
- `src/server/STS.Mfg.Infrastructure/Persistence/Configurations/DomainEntityConfigurations.cs`
- `src/server/STS.Mfg.Infrastructure/Persistence/Configurations/InventoryEntityConfigurations.cs`
- `src/server/STS.Mfg.Infrastructure/Persistence/Configurations/PlatformEntityConfigurations.cs`
- `src/server/STS.Mfg.Infrastructure/Persistence/Configurations/ProcurementEntityConfigurations.cs`
- `src/server/STS.Mfg.Infrastructure/Persistence/Configurations/ProductionEntityConfigurations.cs`

## Protected Surfaces

- `EngineeringControllers.cs`, `EngineeringService.cs`, and `EngineeringContracts.cs` stay preserved unless an item-identity adapter is strictly required.
- `WorkOrderControllers.cs`, `JobCardControllers.cs`, `WorkOrderService.cs`, `JobCardService.cs`, `MachineBoardReadService.cs`, and `MachineBoardStoredProcedure.cs` stay behaviorally preserved and may only receive compatibility-led master-reference updates.
- Host configuration, tests, and non-remediation runtime surfaces stay out of scope.

## Cutover Sequence for R013

1. Add canonical entities, bridge tables, EF mappings, and compatibility DTOs.
2. Patch services and mappers before patching controllers.
3. Patch preserved engineering and production flows only where canonical adapters are unavoidable.
4. Re-verify preserved execution behavior before any later prompt reopens the `P064` path.

## Next Prompt

- `/04-remediation/prompts/R013_backend-master-and-commercial-remediation-wave.md`
