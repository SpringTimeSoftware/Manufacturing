using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Integration;

namespace STS.Mfg.Application.Abstractions.Integration;

public interface IIntegrationService
{
    Task<PagedResult<IntegrationProviderDto>> ListProvidersAsync(IntegrationFilter filter, CancellationToken cancellationToken = default);
    Task<IntegrationProviderDto> GetProviderAsync(long id, CancellationToken cancellationToken = default);
    Task<IntegrationProviderDto> CreateProviderAsync(IntegrationProviderUpsertRequest request, CancellationToken cancellationToken = default);
    Task<IntegrationProviderDto> UpdateProviderAsync(long id, IntegrationProviderUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<IntegrationConnectionDto>> ListConnectionsAsync(IntegrationFilter filter, CancellationToken cancellationToken = default);
    Task<IntegrationConnectionDto> GetConnectionAsync(long id, CancellationToken cancellationToken = default);
    Task<IntegrationConnectionDto> CreateConnectionAsync(IntegrationConnectionUpsertRequest request, CancellationToken cancellationToken = default);
    Task<IntegrationConnectionDto> UpdateConnectionAsync(long id, IntegrationConnectionUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<WebhookSubscriptionDto>> ListWebhooksAsync(IntegrationFilter filter, CancellationToken cancellationToken = default);
    Task<WebhookSubscriptionDto> GetWebhookAsync(long id, CancellationToken cancellationToken = default);
    Task<WebhookSubscriptionDto> CreateWebhookAsync(WebhookSubscriptionUpsertRequest request, CancellationToken cancellationToken = default);
    Task<WebhookSubscriptionDto> UpdateWebhookAsync(long id, WebhookSubscriptionUpsertRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<ImportJobDto>> ListImportJobsAsync(IntegrationFilter filter, CancellationToken cancellationToken = default);
    Task<ImportJobDto> GetImportJobAsync(long id, CancellationToken cancellationToken = default);
    Task<ImportJobDto> CreateImportJobAsync(ImportJobCreateRequest request, CancellationToken cancellationToken = default);

    Task<PagedResult<ExportJobDto>> ListExportJobsAsync(IntegrationFilter filter, CancellationToken cancellationToken = default);
    Task<ExportJobDto> GetExportJobAsync(long id, CancellationToken cancellationToken = default);
    Task<ExportJobDto> CreateExportJobAsync(ExportJobCreateRequest request, CancellationToken cancellationToken = default);
    Task<WebhookDispatchResultDto> DispatchWebhookAsync(WebhookDispatchRequest request, CancellationToken cancellationToken = default);
    Task<ImportJobDto> UpdateImportJobStatusAsync(long id, IntegrationJobStatusUpdateRequest request, CancellationToken cancellationToken = default);
    Task<ExportJobDto> UpdateExportJobStatusAsync(long id, IntegrationJobStatusUpdateRequest request, CancellationToken cancellationToken = default);
}

public interface IOutboundMessageService
{
    Task<OutboundDeliveryStatusDto> QueueMessageAsync(OutboundMessageRequest request, CancellationToken cancellationToken = default);
    Task<OutboundMessagePreviewDto> PreviewMessageAsync(OutboundMessagePreviewRequest request, CancellationToken cancellationToken = default);
    Task<PagedResult<OutboundDeliveryStatusDto>> ListDeliveryStatusesAsync(IntegrationFilter filter, CancellationToken cancellationToken = default);
    Task<IReadOnlyCollection<OutboundProviderHealthDto>> GetProviderHealthAsync(CancellationToken cancellationToken = default);
}

public interface IOutboundMessageProvider
{
    string ChannelType { get; }

    Task<OutboundProviderHealthDto> CheckHealthAsync(CancellationToken cancellationToken = default);

    Task<OutboundDeliveryStatusDto> SendAsync(OutboundMessageRequest request, CancellationToken cancellationToken = default);
}

public interface IEmailMessageProvider : IOutboundMessageProvider
{
}

public interface ISmsMessageProvider : IOutboundMessageProvider
{
}

public interface IWhatsAppMessageProvider : IOutboundMessageProvider
{
}
