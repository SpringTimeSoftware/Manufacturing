using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STS.Mfg.Domain.Platform.Attachments;
using STS.Mfg.Domain.Platform.Audit;
using STS.Mfg.Domain.Platform.Localization;
using STS.Mfg.Domain.Platform.Notifications;

namespace STS.Mfg.Infrastructure.Persistence.Configurations;

public sealed class AuditLogEntryConfiguration : IEntityTypeConfiguration<AuditLogEntry>
{
    public void Configure(EntityTypeBuilder<AuditLogEntry> builder)
    {
        builder.ToTable("AuditLogs", "platform");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.Module).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.EntityType).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.ActionCode).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.EntityId).HasMaxLength(64);
        builder.Property(entity => entity.ReasonCode).HasMaxLength(64);
        builder.Property(entity => entity.CorrelationId).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.ClientType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.BeforeSnapshot).HasColumnType("nvarchar(max)");
        builder.Property(entity => entity.AfterSnapshot).HasColumnType("nvarchar(max)");
        builder.HasIndex(entity => new { entity.CompanyId, entity.BranchId, entity.CreatedOn });
    }
}

public sealed class AttachmentRecordConfiguration : IEntityTypeConfiguration<AttachmentRecord>
{
    public void Configure(EntityTypeBuilder<AttachmentRecord> builder)
    {
        builder.ToTable("Attachments", "platform");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.RelatedDocumentType).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.FileName).HasMaxLength(256).IsRequired();
        builder.Property(entity => entity.ContentType).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.StoragePath).HasMaxLength(512).IsRequired();
        builder.HasIndex(entity => new { entity.RelatedDocumentType, entity.RelatedDocumentId });
    }
}

public sealed class NotificationTemplateConfiguration : IEntityTypeConfiguration<NotificationTemplate>
{
    public void Configure(EntityTypeBuilder<NotificationTemplate> builder)
    {
        builder.ToTable("NotificationTemplates", "platform");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.TemplateCode).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.ChannelType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.TemplateBody).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.TemplateCode, entity.ChannelType, entity.CompanyId, entity.BranchId }).IsUnique();
    }
}

public sealed class NotificationOutboxMessageConfiguration : IEntityTypeConfiguration<NotificationOutboxMessage>
{
    public void Configure(EntityTypeBuilder<NotificationOutboxMessage> builder)
    {
        builder.ToTable("Notifications", "platform");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ChannelType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.RecipientRef).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.TemplateCode).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.PayloadJson).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(entity => entity.RelatedDocumentType).HasMaxLength(64);
        builder.Property(entity => entity.DeliveryStatus).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.LastError).HasMaxLength(512);
        builder.HasIndex(entity => new { entity.DeliveryStatus, entity.CreatedOn });
    }
}

public sealed class TranslationEntryConfiguration : IEntityTypeConfiguration<TranslationEntry>
{
    public void Configure(EntityTypeBuilder<TranslationEntry> builder)
    {
        builder.ToTable("Translations", "platform");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.LanguageCode).HasMaxLength(16).IsRequired();
        builder.Property(entity => entity.TranslationKey).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.TranslationValue).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(entity => entity.Module).HasMaxLength(64);
        builder.HasIndex(entity => new { entity.LanguageCode, entity.CompanyId, entity.BranchId, entity.TranslationKey }).IsUnique();
    }
}
