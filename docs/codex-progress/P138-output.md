# P138 - Email SMS And WhatsApp Provider Abstractions

## Scope Completed

- Added outbound message request, preview, delivery-status, and provider-health contracts for Email, Sms, and WhatsApp.
- Added provider abstraction interfaces and an `IOutboundMessageService` implementation backed by the existing notification outbox.
- Added generic Email/Sms/WhatsApp notification channels that avoid vendor-specific logic and keep secrets referenced only by integration connection credential keys.
- Added `/api/integrations/messages/*` endpoints for provider health, delivery status, preview, and queueing.

## Files Changed

- `/src/server/STS.Mfg.Application/Contracts/Integration/IntegrationContracts.cs`
- `/src/server/STS.Mfg.Application/Abstractions/Integration/IIntegrationService.cs`
- `/src/server/STS.Mfg.Infrastructure/Integration/OutboundMessageService.cs`
- `/src/server/STS.Mfg.Infrastructure/Integration/OutboundNotificationChannels.cs`
- `/src/server/STS.Mfg.Infrastructure/DependencyInjection.cs`
- `/src/server/STS.Mfg.Api/Controllers/IntegrationControllers.cs`

## Validation

- `dotnet build C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln`: passed.
- `dotnet test C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.sln --no-build`: passed, 7 tests.
- `dotnet publish C:\StsPackages\Manufacturing_ERP\src\server\STS.Mfg.Host\STS.Mfg.Host.csproj -c Release`: passed.

## Risks And Follow-Ups

- Email/Sms/WhatsApp channels are vendor-neutral runtime abstractions; live provider adapters and secret resolution remain environment-specific follow-up work.
- Provider health reports missing or inactive provider/connection records rather than embedding vendor credentials in code.

## Next Prompt

- `/02-prompts/P139_webhooks-import-and-export-pipelines.md`
