using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STS.Mfg.Domain.Production;

namespace STS.Mfg.Infrastructure.Persistence.Configurations;

public sealed class ProductionReceiptConfiguration : IEntityTypeConfiguration<ProductionReceipt>
{
    public void Configure(EntityTypeBuilder<ProductionReceipt> builder)
    {
        builder.ToTable("ProductionReceipts", "production");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ReceiptNo).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.CorrelationId).HasMaxLength(64);
        builder.Property(entity => entity.Remarks).HasMaxLength(512);
        builder.HasIndex(entity => new { entity.CompanyId, entity.ReceiptNo }).IsUnique();
    }
}

public sealed class ProductionReceiptLineConfiguration : IEntityTypeConfiguration<ProductionReceiptLine>
{
    public void Configure(EntityTypeBuilder<ProductionReceiptLine> builder)
    {
        builder.ToTable("ProductionReceiptLines", "production");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.LineType).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Quantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.CatchWeightQty).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.InventoryState).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Remarks).HasMaxLength(512);
        builder.HasIndex(entity => new { entity.ProductionReceiptId, entity.LineNo }).IsUnique();
    }
}

public sealed class ScrapEntryConfiguration : IEntityTypeConfiguration<ScrapEntry>
{
    public void Configure(EntityTypeBuilder<ScrapEntry> builder)
    {
        builder.ToTable("ScrapEntries", "production");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ScrapNo).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.Quantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.CatchWeightQty).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.ReasonCode).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.InventoryState).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Remarks).HasMaxLength(512);
        builder.HasIndex(entity => new { entity.CompanyId, entity.ScrapNo }).IsUnique();
    }
}

public sealed class ReworkOrderConfiguration : IEntityTypeConfiguration<ReworkOrder>
{
    public void Configure(EntityTypeBuilder<ReworkOrder> builder)
    {
        builder.ToTable("ReworkOrders", "production");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ReworkNo).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.SourceDocumentType).HasMaxLength(32);
        builder.Property(entity => entity.Quantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.CatchWeightQty).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.ReasonCode).HasMaxLength(64);
        builder.Property(entity => entity.Instructions).HasMaxLength(512);
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.ReworkNo }).IsUnique();
    }
}
