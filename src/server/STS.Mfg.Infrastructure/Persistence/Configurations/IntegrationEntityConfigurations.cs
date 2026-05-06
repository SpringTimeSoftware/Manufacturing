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
        builder.Property(entity => entity.BaseUrl).HasMaxLength(256);
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => entity.ProviderCode).IsUnique();
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
