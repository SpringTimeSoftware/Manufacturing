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

public sealed class InspectionPlanCharacteristicConfiguration : IEntityTypeConfiguration<InspectionPlanCharacteristic>
{
    public void Configure(EntityTypeBuilder<InspectionPlanCharacteristic> builder)
    {
        builder.ToTable("InspectionPlanCharacteristics", "quality");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ParameterCode).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.ParameterName).HasMaxLength(160).IsRequired();
        builder.Property(entity => entity.CharacteristicType).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.ExpectedValue).HasMaxLength(256);
        builder.Property(entity => entity.LowerLimit).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.UpperLimit).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Remarks).HasMaxLength(512);
        builder.HasIndex(entity => new { entity.InspectionPlanId, entity.LineNo }).IsUnique();
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
        builder.Property(entity => entity.DefectCategory).HasMaxLength(80);
        builder.Property(entity => entity.ContainmentAction).HasMaxLength(512);
        builder.Property(entity => entity.RootCause).HasMaxLength(512);
        builder.Property(entity => entity.CorrectiveAction).HasMaxLength(512);
        builder.Property(entity => entity.PreventiveAction).HasMaxLength(512);
        builder.Property(entity => entity.Remarks).HasMaxLength(512);
        builder.HasIndex(entity => new { entity.CompanyId, entity.NcrNo }).IsUnique();
    }
}

public sealed class NonConformanceLineConfiguration : IEntityTypeConfiguration<NonConformanceLine>
{
    public void Configure(EntityTypeBuilder<NonConformanceLine> builder)
    {
        builder.ToTable("NonConformanceLines", "quality");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.AffectedQuantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.DefectCode).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.DefectDescription).HasMaxLength(256).IsRequired();
        builder.Property(entity => entity.Disposition).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.Remarks).HasMaxLength(512);
        builder.HasIndex(entity => new { entity.NonConformanceId, entity.LineNo }).IsUnique();
    }
}

public sealed class CoaCertificateConfiguration : IEntityTypeConfiguration<CoaCertificate>
{
    public void Configure(EntityTypeBuilder<CoaCertificate> builder)
    {
        builder.ToTable("CoaCertificates", "quality");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.CoaNo).HasMaxLength(40).IsRequired();
        builder.Property(entity => entity.SourceDocumentType).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.TemplateCode).HasMaxLength(80).IsRequired();
        builder.Property(entity => entity.StoragePath).HasMaxLength(512).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.ReissueReason).HasMaxLength(512);
        builder.HasIndex(entity => new { entity.CompanyId, entity.CoaNo, entity.VersionNo }).IsUnique();
        builder.HasIndex(entity => entity.InspectionRecordId);
    }
}

public sealed class CoaCertificateLineConfiguration : IEntityTypeConfiguration<CoaCertificateLine>
{
    public void Configure(EntityTypeBuilder<CoaCertificateLine> builder)
    {
        builder.ToTable("CoaCertificateLines", "quality");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ParameterCode).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.ExpectedValue).HasMaxLength(256);
        builder.Property(entity => entity.ActualValue).HasMaxLength(256);
        builder.Property(entity => entity.ResultStatus).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Remarks).HasMaxLength(512);
        builder.HasIndex(entity => new { entity.CoaCertificateId, entity.LineNo }).IsUnique();
    }
}
