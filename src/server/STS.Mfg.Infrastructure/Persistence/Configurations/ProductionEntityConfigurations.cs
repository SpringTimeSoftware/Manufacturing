using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STS.Mfg.Domain.Production;

namespace STS.Mfg.Infrastructure.Persistence.Configurations;

public sealed class WorkOrderConfiguration : IEntityTypeConfiguration<WorkOrder>
{
    public void Configure(EntityTypeBuilder<WorkOrder> builder)
    {
        builder.ToTable("WorkOrders", "production");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.WorkOrderNo).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.PlannedQuantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Remarks).HasMaxLength(512);
        builder.HasIndex(entity => new { entity.CompanyId, entity.WorkOrderNo }).IsUnique();
    }
}

public sealed class WorkOrderOperationConfiguration : IEntityTypeConfiguration<WorkOrderOperation>
{
    public void Configure(EntityTypeBuilder<WorkOrderOperation> builder)
    {
        builder.ToTable("WorkOrderOperations", "production");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.PlannedQuantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.CompletedQuantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.WorkOrderId, entity.SequenceNo }).IsUnique();
    }
}

public sealed class JobCardConfiguration : IEntityTypeConfiguration<JobCard>
{
    public void Configure(EntityTypeBuilder<JobCard> builder)
    {
        builder.ToTable("JobCards", "production");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.JobCardNo).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.PlannedQuantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.CompletedGoodQty).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.CompletedRejectQty).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.CompletedScrapQty).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.JobCardNo }).IsUnique();
        builder.HasIndex(entity => new { entity.WorkOrderOperationId, entity.SplitSequenceNo }).IsUnique();
    }
}

public sealed class JobCardEventConfiguration : IEntityTypeConfiguration<JobCardEvent>
{
    public void Configure(EntityTypeBuilder<JobCardEvent> builder)
    {
        builder.ToTable("JobCardEvents", "production");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.EventType).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Quantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.ReasonCode).HasMaxLength(64);
        builder.Property(entity => entity.Remarks).HasMaxLength(512);
        builder.HasIndex(entity => new { entity.JobCardId, entity.EventOn });
    }
}

public sealed class DowntimeEventConfiguration : IEntityTypeConfiguration<DowntimeEvent>
{
    public void Configure(EntityTypeBuilder<DowntimeEvent> builder)
    {
        builder.ToTable("DowntimeEvents", "production");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ReasonCode).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.DurationMinutes).HasColumnType("decimal(18,2)");
        builder.Property(entity => entity.Remarks).HasMaxLength(512);
        builder.HasIndex(entity => new { entity.JobCardId, entity.StartOn, entity.EndOn });
    }
}
