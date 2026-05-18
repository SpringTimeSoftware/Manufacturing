using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STS.Mfg.Application.Abstractions.Integration;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Integration;

namespace STS.Mfg.Api.Controllers;

[ApiController]
[Authorize(Policy = AppPolicies.PlatformAdministration)]
[Route("api/integrations")]
public sealed class IntegrationsController(IIntegrationService integrationService) : ApiControllerBase
{
    [HttpGet("providers")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<IntegrationProviderDto>>>> ListProviders([FromQuery] IntegrationFilter filter, CancellationToken cancellationToken)
    {
        var response = await integrationService.ListProvidersAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("providers/{id:long}")]
    public async Task<ActionResult<ApiEnvelope<IntegrationProviderDto>>> GetProvider(long id, CancellationToken cancellationToken)
    {
        var response = await integrationService.GetProviderAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("providers")]
    public async Task<ActionResult<ApiEnvelope<IntegrationProviderDto>>> CreateProvider([FromBody] IntegrationProviderUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await integrationService.CreateProviderAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(GetProvider), new { id = response.Id }, response, "Integration provider created.");
    }

    [HttpPut("providers/{id:long}")]
    public async Task<ActionResult<ApiEnvelope<IntegrationProviderDto>>> UpdateProvider(long id, [FromBody] IntegrationProviderUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await integrationService.UpdateProviderAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Integration provider updated.");
    }

    [HttpGet("connections")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<IntegrationConnectionDto>>>> ListConnections([FromQuery] IntegrationFilter filter, CancellationToken cancellationToken)
    {
        var response = await integrationService.ListConnectionsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("connections/{id:long}")]
    public async Task<ActionResult<ApiEnvelope<IntegrationConnectionDto>>> GetConnection(long id, CancellationToken cancellationToken)
    {
        var response = await integrationService.GetConnectionAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("connections")]
    public async Task<ActionResult<ApiEnvelope<IntegrationConnectionDto>>> CreateConnection([FromBody] IntegrationConnectionUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await integrationService.CreateConnectionAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(GetConnection), new { id = response.Id }, response, "Integration connection created.");
    }

    [HttpPut("connections/{id:long}")]
    public async Task<ActionResult<ApiEnvelope<IntegrationConnectionDto>>> UpdateConnection(long id, [FromBody] IntegrationConnectionUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await integrationService.UpdateConnectionAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Integration connection updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/integrations/messages")]
public sealed class OutboundMessagesController(IOutboundMessageService outboundMessageService) : ApiControllerBase
{
    [HttpGet("provider-health")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<OutboundProviderHealthDto>>>> GetProviderHealth(CancellationToken cancellationToken)
    {
        var response = await outboundMessageService.GetProviderHealthAsync(cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("deliveries")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<OutboundDeliveryStatusDto>>>> ListDeliveries([FromQuery] IntegrationFilter filter, CancellationToken cancellationToken)
    {
        var response = await outboundMessageService.ListDeliveryStatusesAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("preview")]
    public async Task<ActionResult<ApiEnvelope<OutboundMessagePreviewDto>>> Preview([FromBody] OutboundMessagePreviewRequest request, CancellationToken cancellationToken)
    {
        var response = await outboundMessageService.PreviewMessageAsync(request, cancellationToken);
        return OkEnvelope(response, "Message preview rendered.");
    }

    [HttpPost("queue")]
    public async Task<ActionResult<ApiEnvelope<OutboundDeliveryStatusDto>>> Queue([FromBody] OutboundMessageRequest request, CancellationToken cancellationToken)
    {
        var response = await outboundMessageService.QueueMessageAsync(request, cancellationToken);
        return OkEnvelope(response, "Outbound message queued.");
    }

    [HttpPost("{id:long}/retry")]
    public async Task<ActionResult<ApiEnvelope<OutboundDeliveryStatusDto>>> Retry(long id, [FromBody] OutboundRetryRequest request, CancellationToken cancellationToken)
    {
        var response = await outboundMessageService.RetryMessageAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Outbound retry recorded.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.CompanyAdministration)]
[Route("api/webhooks")]
public sealed class WebhooksController(IIntegrationService integrationService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<WebhookSubscriptionDto>>>> List([FromQuery] IntegrationFilter filter, CancellationToken cancellationToken)
    {
        var response = await integrationService.ListWebhooksAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<WebhookSubscriptionDto>>> Get(long id, CancellationToken cancellationToken)
    {
        var response = await integrationService.GetWebhookAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<WebhookSubscriptionDto>>> Create([FromBody] WebhookSubscriptionUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await integrationService.CreateWebhookAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(Get), new { id = response.Id }, response, "Webhook subscription created.");
    }

    [HttpPut("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<WebhookSubscriptionDto>>> Update(long id, [FromBody] WebhookSubscriptionUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await integrationService.UpdateWebhookAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Webhook subscription updated.");
    }

    [HttpPost("dispatch")]
    public async Task<ActionResult<ApiEnvelope<WebhookDispatchResultDto>>> Dispatch([FromBody] WebhookDispatchRequest request, CancellationToken cancellationToken)
    {
        var response = await integrationService.DispatchWebhookAsync(request, cancellationToken);
        return OkEnvelope(response, "Webhook dispatch recorded.");
    }

    [HttpGet("events")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<WebhookEventDto>>>> ListEvents([FromQuery] IntegrationFilter filter, CancellationToken cancellationToken)
    {
        var response = await integrationService.ListWebhookEventsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [AllowAnonymous]
    [HttpPost("inbound/{providerCode}")]
    public async Task<ActionResult<ApiEnvelope<WebhookEventDto>>> Inbound(string providerCode, [FromBody] InboundWebhookRequest request, CancellationToken cancellationToken)
    {
        var response = await integrationService.RecordInboundWebhookAsync(providerCode, request, cancellationToken);
        return OkEnvelope(response, "Inbound webhook event recorded.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.CompanyAdministration)]
[Route("api/integrations/templates")]
public sealed class IntegrationTemplatesController(IIntegrationService integrationService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<IntegrationMessageTemplateDto>>>> List([FromQuery] IntegrationFilter filter, CancellationToken cancellationToken)
    {
        var response = await integrationService.ListMessageTemplatesAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<IntegrationMessageTemplateDto>>> Upsert([FromBody] IntegrationMessageTemplateUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await integrationService.UpsertMessageTemplateAsync(request, cancellationToken);
        return OkEnvelope(response, "Message template saved.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.CompanyAdministration)]
[Route("api/integrations/crm")]
public sealed class CrmIntegrationController(IIntegrationService integrationService) : ApiControllerBase
{
    [HttpGet("mappings")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<CrmObjectMappingDto>>>> ListMappings([FromQuery] IntegrationFilter filter, CancellationToken cancellationToken)
    {
        var response = await integrationService.ListCrmMappingsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("mappings")]
    public async Task<ActionResult<ApiEnvelope<CrmObjectMappingDto>>> UpsertMapping([FromBody] CrmObjectMappingUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await integrationService.UpsertCrmMappingAsync(request, cancellationToken);
        return OkEnvelope(response, "CRM mapping saved.");
    }

    [HttpPost("sync")]
    public async Task<ActionResult<ApiEnvelope<CrmSyncJobDto>>> RunSync([FromBody] CrmSyncRequest request, CancellationToken cancellationToken)
    {
        var response = await integrationService.RunCrmSyncAsync(request, cancellationToken);
        return OkEnvelope(response, "CRM sync recorded.");
    }

    [HttpGet("conflicts")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<CrmSyncConflictDto>>>> ListConflicts([FromQuery] IntegrationFilter filter, CancellationToken cancellationToken)
    {
        var response = await integrationService.ListCrmConflictsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/imports")]
public sealed class ImportsController(IIntegrationService integrationService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<ImportJobDto>>>> List([FromQuery] IntegrationFilter filter, CancellationToken cancellationToken)
    {
        var response = await integrationService.ListImportJobsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<ImportJobDto>>> Get(long id, CancellationToken cancellationToken)
    {
        var response = await integrationService.GetImportJobAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<ImportJobDto>>> Create([FromBody] ImportJobCreateRequest request, CancellationToken cancellationToken)
    {
        var response = await integrationService.CreateImportJobAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(Get), new { id = response.Id }, response, "Import job queued.");
    }

    [HttpPost("{id:long}/status")]
    public async Task<ActionResult<ApiEnvelope<ImportJobDto>>> UpdateStatus(long id, [FromBody] IntegrationJobStatusUpdateRequest request, CancellationToken cancellationToken)
    {
        var response = await integrationService.UpdateImportJobStatusAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Import job status updated.");
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/exports")]
public sealed class ExportsController(IIntegrationService integrationService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<ExportJobDto>>>> List([FromQuery] IntegrationFilter filter, CancellationToken cancellationToken)
    {
        var response = await integrationService.ListExportJobsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("{id:long}")]
    public async Task<ActionResult<ApiEnvelope<ExportJobDto>>> Get(long id, CancellationToken cancellationToken)
    {
        var response = await integrationService.GetExportJobAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<ExportJobDto>>> Create([FromBody] ExportJobCreateRequest request, CancellationToken cancellationToken)
    {
        var response = await integrationService.CreateExportJobAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(Get), new { id = response.Id }, response, "Export job queued.");
    }

    [HttpPost("{id:long}/status")]
    public async Task<ActionResult<ApiEnvelope<ExportJobDto>>> UpdateStatus(long id, [FromBody] IntegrationJobStatusUpdateRequest request, CancellationToken cancellationToken)
    {
        var response = await integrationService.UpdateExportJobStatusAsync(id, request, cancellationToken);
        return OkEnvelope(response, "Export job status updated.");
    }
}
