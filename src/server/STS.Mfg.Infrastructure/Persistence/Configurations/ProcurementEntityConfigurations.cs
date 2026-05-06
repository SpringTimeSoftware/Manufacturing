using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STS.Mfg.Domain.Procurement;

namespace STS.Mfg.Infrastructure.Persistence.Configurations;

public sealed class PurchaseRequisitionConfiguration : IEntityTypeConfiguration<PurchaseRequisition>
{
    public void Configure(EntityTypeBuilder<PurchaseRequisition> builder)
    {
        builder.ToTable("PurchaseRequisitions", "procurement");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.PurchaseRequisitionNo).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.SourceDocumentType).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.PurchaseRequisitionNo }).IsUnique();
    }
}

public sealed class PurchaseRequisitionLineConfiguration : IEntityTypeConfiguration<PurchaseRequisitionLine>
{
    public void Configure(EntityTypeBuilder<PurchaseRequisitionLine> builder)
    {
        builder.ToTable("PurchaseRequisitionLines", "procurement");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.RequiredQuantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.PurchaseRequisitionId, entity.LineNo }).IsUnique();
    }
}

public sealed class PurchaseOrderConfiguration : IEntityTypeConfiguration<PurchaseOrder>
{
    public void Configure(EntityTypeBuilder<PurchaseOrder> builder)
    {
        builder.ToTable("PurchaseOrders", "procurement");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.PurchaseOrderNo).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.PurchaseOrderNo }).IsUnique();
    }
}

public sealed class PurchaseOrderLineConfiguration : IEntityTypeConfiguration<PurchaseOrderLine>
{
    public void Configure(EntityTypeBuilder<PurchaseOrderLine> builder)
    {
        builder.ToTable("PurchaseOrderLines", "procurement");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.OrderedQuantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.PurchaseOrderId, entity.LineNo }).IsUnique();
    }
}

public sealed class SubcontractOrderConfiguration : IEntityTypeConfiguration<SubcontractOrder>
{
    public void Configure(EntityTypeBuilder<SubcontractOrder> builder)
    {
        builder.ToTable("SubcontractOrders", "procurement");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.SubcontractOrderNo).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.SubcontractOrderNo }).IsUnique();
    }
}
