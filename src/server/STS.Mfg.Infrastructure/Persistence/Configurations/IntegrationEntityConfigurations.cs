using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STS.Mfg.Domain.Integration;

namespace STS.Mfg.Infrastructure.Persistence.Configurations;

public sealed class IntegrationProviderConfiguration : IEntityTypeConfiguration<IntegrationProvider>
{
    public void Configure(EntityTypeBuilder<IntegrationProvider> builder)
    {
        builder.ToTable("IntegrationProviders", "integration");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ProviderCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.ProviderName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.ProviderType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.Channel).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.VendorType).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.EnvironmentName).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.BaseUrl).HasMaxLength(256);
        builder.Property(entity => entity.CredentialReference).HasMaxLength(128);
        builder.Property(entity => entity.SenderIdentity).HasMaxLength(128);
        builder.Property(entity => entity.WhatsAppBusinessNumber).HasMaxLength(64);
        builder.Property(entity => entity.TemplateNamespace).HasMaxLength(128);
        builder.Property(entity => entity.CrmTenantReference).HasMaxLength(128);
        builder.Property(entity => entity.CallbackUrl).HasMaxLength(256);
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.HealthStatus).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.FailureReason).HasMaxLength(512);
        builder.HasIndex(entity => entity.ProviderCode).IsUnique();
    }
}

public sealed class IntegrationMessageTemplateConfiguration : IEntityTypeConfiguration<IntegrationMessageTemplate>
{
    public void Configure(EntityTypeBuilder<IntegrationMessageTemplate> builder)
    {
        builder.ToTable("MessageTemplates", "integration");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ChannelType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.TemplateCode).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.TemplateName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.TemplateVersion).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.ApprovalStatus).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.BodyTemplate).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.ChannelType, entity.TemplateCode, entity.TemplateVersion }).IsUnique();
    }
}

public sealed class IntegrationOutboundMessageConfiguration : IEntityTypeConfiguration<IntegrationOutboundMessage>
{
    public void Configure(EntityTypeBuilder<IntegrationOutboundMessage> builder)
    {
        builder.ToTable("OutboundMessages", "integration");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ChannelType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.SourceModule).HasMaxLength(64);
        builder.Property(entity => entity.SourceDocumentType).HasMaxLength(64);
        builder.Property(entity => entity.SourceDocumentNo).HasMaxLength(64);
        builder.Property(entity => entity.Recipient).HasMaxLength(256).IsRequired();
        builder.Property(entity => entity.RecipientType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.TemplateCode).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.Subject).HasMaxLength(256);
        builder.Property(entity => entity.PayloadSnapshotJson).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(entity => entity.BodySnapshot).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.ProviderMessageId).HasMaxLength(128);
        builder.Property(entity => entity.FailureReason).HasMaxLength(512);
        builder.Property(entity => entity.DeliveryReceiptStatus).HasMaxLength(32);
        builder.HasIndex(entity => new { entity.CompanyId, entity.Status, entity.CreatedOn });
        builder.HasIndex(entity => new { entity.SourceDocumentType, entity.SourceDocumentId });
    }
}

public sealed class IntegrationDeliveryEventConfiguration : IEntityTypeConfiguration<IntegrationDeliveryEvent>
{
    public void Configure(EntityTypeBuilder<IntegrationDeliveryEvent> builder)
    {
        builder.ToTable("DeliveryEvents", "integration");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.EventType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.ProviderMessageId).HasMaxLength(128);
        builder.Property(entity => entity.ResponseSummary).HasMaxLength(512);
        builder.Property(entity => entity.FailureReason).HasMaxLength(512);
        builder.HasIndex(entity => new { entity.IntegrationOutboundMessageId, entity.EventOn });
    }
}

public sealed class IntegrationConnectionConfiguration : IEntityTypeConfiguration<IntegrationConnection>
{
    public void Configure(EntityTypeBuilder<IntegrationConnection> builder)
    {
        builder.ToTable("IntegrationConnections", "integration");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ConnectionCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.ConnectionName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.EndpointUrl).HasMaxLength(256);
        builder.Property(entity => entity.CredentialReference).HasMaxLength(128);
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.LastHealthStatus).HasMaxLength(64);
        builder.HasIndex(entity => new { entity.CompanyId, entity.ConnectionCode }).IsUnique();
    }
}

public sealed class WebhookSubscriptionConfiguration : IEntityTypeConfiguration<WebhookSubscription>
{
    public void Configure(EntityTypeBuilder<WebhookSubscription> builder)
    {
        builder.ToTable("WebhookSubscriptions", "integration");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.SubscriptionCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.EventType).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.TargetUrl).HasMaxLength(256).IsRequired();
        builder.Property(entity => entity.SecretReference).HasMaxLength(128);
        builder.Property(entity => entity.HeadersJson).HasMaxLength(4000);
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.SubscriptionCode }).IsUnique();
    }
}

public sealed class ImportJobConfiguration : IEntityTypeConfiguration<ImportJob>
{
    public void Configure(EntityTypeBuilder<ImportJob> builder)
    {
        builder.ToTable("ImportJobs", "integration");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.JobNo).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.Module).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.SourceFormat).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.StoragePath).HasMaxLength(256).IsRequired();
        builder.Property(entity => entity.RequestToken).HasMaxLength(64);
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.LastError).HasMaxLength(512);
        builder.HasIndex(entity => new { entity.CompanyId, entity.JobNo }).IsUnique();
        builder.HasIndex(entity => entity.RequestToken).IsUnique().HasFilter("[RequestToken] IS NOT NULL");
    }
}

public sealed class ExportJobConfiguration : IEntityTypeConfiguration<ExportJob>
{
    public void Configure(EntityTypeBuilder<ExportJob> builder)
    {
        builder.ToTable("ExportJobs", "integration");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.JobNo).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.Module).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.OutputFormat).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.FilterJson).HasMaxLength(4000);
        builder.Property(entity => entity.StoragePath).HasMaxLength(256).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.LastError).HasMaxLength(512);
        builder.HasIndex(entity => new { entity.CompanyId, entity.JobNo }).IsUnique();
    }
}

public sealed class WebhookEventConfiguration : IEntityTypeConfiguration<WebhookEvent>
{
    public void Configure(EntityTypeBuilder<WebhookEvent> builder)
    {
        builder.ToTable("WebhookEvents", "integration");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.Direction).HasMaxLength(16).IsRequired();
        builder.Property(entity => entity.EventType).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.SourceDocumentType).HasMaxLength(64);
        builder.Property(entity => entity.PayloadReference).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.PayloadHash).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.ResponseSummary).HasMaxLength(512);
        builder.Property(entity => entity.Status).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.FailureReason).HasMaxLength(512);
        builder.HasIndex(entity => new { entity.CompanyId, entity.EventType, entity.EventOn });
        builder.HasIndex(entity => new { entity.Direction, entity.Status });
    }
}

public sealed class CrmObjectMappingConfiguration : IEntityTypeConfiguration<CrmObjectMapping>
{
    public void Configure(EntityTypeBuilder<CrmObjectMapping> builder)
    {
        builder.ToTable("CrmObjectMappings", "integration");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ErpObjectType).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.ExternalObjectType).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.ExternalId).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.SyncDirection).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.ConflictStatus).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.IntegrationProviderId, entity.ErpObjectType, entity.ErpObjectId }).IsUnique().HasFilter("[ErpObjectId] IS NOT NULL");
        builder.HasIndex(entity => new { entity.CompanyId, entity.IntegrationProviderId, entity.ExternalObjectType, entity.ExternalId }).IsUnique();
    }
}

public sealed class CrmSyncJobConfiguration : IEntityTypeConfiguration<CrmSyncJob>
{
    public void Configure(EntityTypeBuilder<CrmSyncJob> builder)
    {
        builder.ToTable("CrmSyncJobs", "integration");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ObjectType).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.SyncDirection).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.PayloadSnapshotJson).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.FailureReason).HasMaxLength(512);
        builder.HasIndex(entity => new { entity.CompanyId, entity.ObjectType, entity.RequestedOn });
    }
}

public sealed class CrmSyncConflictConfiguration : IEntityTypeConfiguration<CrmSyncConflict>
{
    public void Configure(EntityTypeBuilder<CrmSyncConflict> builder)
    {
        builder.ToTable("CrmSyncConflicts", "integration");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ObjectType).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.ExternalId).HasMaxLength(128);
        builder.Property(entity => entity.ConflictType).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.ResolutionStatus).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.DetailsJson).HasColumnType("nvarchar(max)").IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.ResolutionStatus });
    }
}
