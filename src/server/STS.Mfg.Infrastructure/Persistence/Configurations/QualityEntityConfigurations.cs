using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STS.Mfg.Domain.Quality;

namespace STS.Mfg.Infrastructure.Persistence.Configurations;

public sealed class InspectionPlanConfiguration : IEntityTypeConfiguration<InspectionPlan>
{
    public void Configure(EntityTypeBuilder<InspectionPlan> builder)
    {
        builder.ToTable("InspectionPlans", "quality");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.PlanCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.PlanName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.InspectionType).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.PlanCode }).IsUnique();
    }
}

public sealed class InspectionRecordConfiguration : IEntityTypeConfiguration<InspectionRecord>
{
    public void Configure(EntityTypeBuilder<InspectionRecord> builder)
    {
        builder.ToTable("InspectionRecords", "quality");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.InspectionNo).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.InspectionType).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.SourceDocumentType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.OverallResult).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.RequestToken).HasMaxLength(64);
        builder.Property(entity => entity.Notes).HasMaxLength(512);
        builder.HasIndex(entity => new { entity.CompanyId, entity.InspectionNo }).IsUnique();
        builder.HasIndex(entity => new { entity.CompanyId, entity.RequestToken }).IsUnique().HasFilter("[RequestToken] IS NOT NULL");
    }
}

public sealed class InspectionResultConfiguration : IEntityTypeConfiguration<InspectionResult>
{
    public void Configure(EntityTypeBuilder<InspectionResult> builder)
    {
        builder.ToTable("InspectionResults", "quality");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ParameterCode).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.ExpectedValue).HasMaxLength(128);
        builder.Property(entity => entity.ActualValue).HasMaxLength(128);
        builder.Property(entity => entity.ResultStatus).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Remarks).HasMaxLength(512);
        builder.HasIndex(entity => new { entity.InspectionRecordId, entity.LineNo }).IsUnique();
    }
}

public sealed class NonConformanceConfiguration : IEntityTypeConfiguration<NonConformance>
{
    public void Configure(EntityTypeBuilder<NonConformance> builder)
    {
        builder.ToTable("NonConformances", "quality");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.NcrNo).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.SourceDocumentType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.Disposition).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.RootCause).HasMaxLength(512);
        builder.Property(entity => entity.Remarks).HasMaxLength(512);
        builder.HasIndex(entity => new { entity.CompanyId, entity.NcrNo }).IsUnique();
    }
}
