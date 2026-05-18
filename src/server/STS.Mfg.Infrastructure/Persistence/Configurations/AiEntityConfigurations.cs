using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STS.Mfg.Domain.AI;

namespace STS.Mfg.Infrastructure.Persistence.Configurations;

public sealed class AiProviderConfiguration : IEntityTypeConfiguration<AiProvider>
{
    public void Configure(EntityTypeBuilder<AiProvider> builder)
    {
        builder.ToTable("AiProviders", "ai");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ProviderCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.ProviderName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.ProviderType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => entity.ProviderCode).IsUnique();
    }
}

public sealed class AiModelConfiguration : IEntityTypeConfiguration<AiModel>
{
    public void Configure(EntityTypeBuilder<AiModel> builder)
    {
        builder.ToTable("AiModels", "ai");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ModelCode).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.ModelName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.CapabilityFlagsJson).HasMaxLength(4000);
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.AiProviderId, entity.ModelCode }).IsUnique();
    }
}

public sealed class AiPromptTemplateConfiguration : IEntityTypeConfiguration<AiPromptTemplate>
{
    public void Configure(EntityTypeBuilder<AiPromptTemplate> builder)
    {
        builder.ToTable("AiPromptTemplates", "ai");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.TemplateCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.TemplateName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.PromptPurpose).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.TemplateBody).HasMaxLength(8000).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.TemplateCode }).IsUnique();
    }
}

public sealed class AiRunConfiguration : IEntityTypeConfiguration<AiRun>
{
    public void Configure(EntityTypeBuilder<AiRun> builder)
    {
        builder.ToTable("AiRuns", "ai");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.DraftPurpose).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.RelatedDocumentType).HasMaxLength(64);
        builder.Property(entity => entity.InputText).HasMaxLength(8000).IsRequired();
        builder.Property(entity => entity.OutputText).HasMaxLength(8000);
        builder.Property(entity => entity.RunStatus).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.ReviewStatus).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.ReviewNote).HasMaxLength(512);
        builder.Property(entity => entity.AppliedTargetType).HasMaxLength(64);
        builder.Property(entity => entity.TokenUsageJson).HasMaxLength(512);
        builder.HasIndex(entity => new { entity.CompanyId, entity.RequestedOn });
    }
}
