using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STS.Mfg.Domain.Inventory;

namespace STS.Mfg.Infrastructure.Persistence.Configurations;

public sealed class StockBalanceConfiguration : IEntityTypeConfiguration<StockBalance>
{
    public void Configure(EntityTypeBuilder<StockBalance> builder)
    {
        builder.ToTable("StockBalances", "inventory");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.OnHandQty).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.ReservedQty).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.QcHoldQty).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.BlockedQty).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.InTransitQty).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.CatchWeightQty).HasColumnType("decimal(18,6)");
        builder.HasIndex(entity => new
        {
            entity.CompanyId,
            entity.BranchId,
            entity.ItemId,
            entity.ItemVariantId,
            entity.WarehouseId,
            entity.BinId,
            entity.LotId,
            entity.SerialId,
            entity.PcidId
        }).IsUnique();
    }
}

public sealed class StockTransactionConfiguration : IEntityTypeConfiguration<StockTransaction>
{
    public void Configure(EntityTypeBuilder<StockTransaction> builder)
    {
        builder.ToTable("StockTransactions", "inventory");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.TransactionNo).HasMaxLength(48).IsRequired();
        builder.Property(entity => entity.TransactionType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.Quantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.CatchWeightQty).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.InventoryState).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.SourceDocumentType).HasMaxLength(32);
        builder.Property(entity => entity.SourceDocumentNo).HasMaxLength(80);
        builder.Property(entity => entity.Remarks).HasMaxLength(512);
        builder.HasIndex(entity => new { entity.CompanyId, entity.TransactionNo }).IsUnique();
        builder.HasIndex(entity => new { entity.SourceDocumentType, entity.SourceDocumentId, entity.SourceDocumentLineId });
    }
}

public sealed class StockReservationConfiguration : IEntityTypeConfiguration<StockReservation>
{
    public void Configure(EntityTypeBuilder<StockReservation> builder)
    {
        builder.ToTable("StockReservations", "inventory");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ReservedQuantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.SourceDocumentType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.ItemId, entity.SourceDocumentType, entity.SourceDocumentId });
    }
}

public sealed class LotConfiguration : IEntityTypeConfiguration<Lot>
{
    public void Configure(EntityTypeBuilder<Lot> builder)
    {
        builder.ToTable("Lots", "inventory");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.LotNo).HasMaxLength(48).IsRequired();
        builder.Property(entity => entity.LotStatus).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.CatchWeightQty).HasColumnType("decimal(18,6)");
        builder.HasIndex(entity => new { entity.CompanyId, entity.ItemId, entity.LotNo }).IsUnique();
    }
}

public sealed class SerialConfiguration : IEntityTypeConfiguration<Serial>
{
    public void Configure(EntityTypeBuilder<Serial> builder)
    {
        builder.ToTable("Serials", "inventory");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.SerialNo).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.SerialStatus).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.SerialNo }).IsUnique();
    }
}

public sealed class InventoryLicensePlateConfiguration : IEntityTypeConfiguration<InventoryLicensePlate>
{
    public void Configure(EntityTypeBuilder<InventoryLicensePlate> builder)
    {
        builder.ToTable("LicensePlates", "inventory");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.PcidNo).HasMaxLength(80).IsRequired();
        builder.Property(entity => entity.LicensePlateType).HasMaxLength(40).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.PcidNo }).IsUnique();
    }
}

public sealed class InventoryLicensePlateContentConfiguration : IEntityTypeConfiguration<InventoryLicensePlateContent>
{
    public void Configure(EntityTypeBuilder<InventoryLicensePlateContent> builder)
    {
        builder.ToTable("LicensePlateContents", "inventory");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.Quantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.InventoryState).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.LicensePlateId, entity.ItemId, entity.LotId, entity.SerialId });
    }
}

public sealed class CycleCountConfiguration : IEntityTypeConfiguration<CycleCount>
{
    public void Configure(EntityTypeBuilder<CycleCount> builder)
    {
        builder.ToTable("CycleCounts", "inventory");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.CountNo).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.CountType).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Remarks).HasMaxLength(512);
        builder.HasIndex(entity => new { entity.CompanyId, entity.CountNo }).IsUnique();
    }
}

public sealed class CycleCountLineConfiguration : IEntityTypeConfiguration<CycleCountLine>
{
    public void Configure(EntityTypeBuilder<CycleCountLine> builder)
    {
        builder.ToTable("CycleCountLines", "inventory");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.SystemQuantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.CountedQuantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.VarianceQuantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Remarks).HasMaxLength(512);
        builder.HasIndex(entity => new { entity.CycleCountId, entity.LineNo }).IsUnique();
    }
}
