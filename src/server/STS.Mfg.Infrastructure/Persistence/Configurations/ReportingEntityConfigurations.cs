using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STS.Mfg.Domain.Reporting;

namespace STS.Mfg.Infrastructure.Persistence.Configurations;

public sealed class ReportDefinitionConfiguration : IEntityTypeConfiguration<ReportDefinition>
{
    public void Configure(EntityTypeBuilder<ReportDefinition> builder)
    {
        builder.ToTable("ReportDefinitions", "reporting");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ReportCode).HasMaxLength(96).IsRequired();
        builder.Property(entity => entity.ReportName).HasMaxLength(160).IsRequired();
        builder.Property(entity => entity.Module).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.Category).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.Description).HasMaxLength(512);
        builder.Property(entity => entity.DatasetSource).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.ReportType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.OutputFormatsJson).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(entity => entity.PermissionKey).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.ParameterSchemaJson).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(entity => entity.DefaultFiltersJson).HasColumnType("nvarchar(max)");
        builder.Property(entity => entity.OwnerUserName).HasMaxLength(160);
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.ReportCode }).IsUnique();
    }
}

public sealed class ReportRunConfiguration : IEntityTypeConfiguration<ReportRun>
{
    public void Configure(EntityTypeBuilder<ReportRun> builder)
    {
        builder.ToTable("ReportRuns", "reporting");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.RunNo).HasMaxLength(96).IsRequired();
        builder.Property(entity => entity.ParametersJson).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(entity => entity.OutputFormat).HasMaxLength(16).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.FailureReason).HasMaxLength(1024);
        builder.Property(entity => entity.SourceEntityType).HasMaxLength(96);
        builder.HasIndex(entity => new { entity.CompanyId, entity.BranchId, entity.RunNo }).IsUnique();
        builder.HasIndex(entity => entity.ReportDefinitionId);
    }
}

public sealed class ReportOutputConfiguration : IEntityTypeConfiguration<ReportOutput>
{
    public void Configure(EntityTypeBuilder<ReportOutput> builder)
    {
        builder.ToTable("ReportOutputs", "reporting");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.FileName).HasMaxLength(180).IsRequired();
        builder.Property(entity => entity.OutputFormat).HasMaxLength(16).IsRequired();
        builder.Property(entity => entity.ContentType).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.StoragePath).HasMaxLength(512).IsRequired();
        builder.Property(entity => entity.Checksum).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.ContentText).HasColumnType("nvarchar(max)");
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => entity.ReportRunId);
    }
}

public sealed class DashboardDefinitionConfiguration : IEntityTypeConfiguration<DashboardDefinition>
{
    public void Configure(EntityTypeBuilder<DashboardDefinition> builder)
    {
        builder.ToTable("DashboardDefinitions", "reporting");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.DashboardCode).HasMaxLength(96).IsRequired();
        builder.Property(entity => entity.DashboardName).HasMaxLength(160).IsRequired();
        builder.Property(entity => entity.Module).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.Description).HasMaxLength(512);
        builder.Property(entity => entity.VisibilityRole).HasMaxLength(64);
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.BranchId, entity.DashboardCode }).IsUnique();
    }
}

public sealed class DashboardWidgetConfiguration : IEntityTypeConfiguration<DashboardWidget>
{
    public void Configure(EntityTypeBuilder<DashboardWidget> builder)
    {
        builder.ToTable("DashboardWidgets", "reporting");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.WidgetCode).HasMaxLength(96).IsRequired();
        builder.Property(entity => entity.Title).HasMaxLength(160).IsRequired();
        builder.Property(entity => entity.WidgetType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.DatasetSource).HasMaxLength(128);
        builder.Property(entity => entity.FiltersJson).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(entity => entity.DrilldownRoute).HasMaxLength(256);
        builder.Property(entity => entity.DrilldownFilterJson).HasColumnType("nvarchar(max)");
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.DashboardDefinitionId, entity.WidgetCode }).IsUnique();
        builder.HasIndex(entity => entity.ReportDefinitionId);
    }
}
