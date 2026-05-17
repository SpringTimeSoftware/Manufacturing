using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STS.Mfg.Domain.Dispatch;

namespace STS.Mfg.Infrastructure.Persistence.Configurations;

public sealed class PackListConfiguration : IEntityTypeConfiguration<PackList>
{
    public void Configure(EntityTypeBuilder<PackList> builder)
    {
        builder.ToTable("PackLists", "dispatch");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.PackListNo).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Remarks).HasMaxLength(512);
        builder.HasIndex(entity => new { entity.CompanyId, entity.PackListNo }).IsUnique();
    }
}

public sealed class PackListLineConfiguration : IEntityTypeConfiguration<PackListLine>
{
    public void Configure(EntityTypeBuilder<PackListLine> builder)
    {
        builder.ToTable("PackListLines", "dispatch");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.PackedQuantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.PackageRef).HasMaxLength(64);
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.PackListId, entity.LineNo }).IsUnique();
        builder.HasIndex(entity => entity.PcidId);
    }
}

public sealed class ShipmentConfiguration : IEntityTypeConfiguration<Shipment>
{
    public void Configure(EntityTypeBuilder<Shipment> builder)
    {
        builder.ToTable("Shipments", "dispatch");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ShipmentNo).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.VehicleRef).HasMaxLength(64);
        builder.Property(entity => entity.TrackingRef).HasMaxLength(64);
        builder.Property(entity => entity.SealNo).HasMaxLength(64);
        builder.Property(entity => entity.ProofNotes).HasMaxLength(512);
        builder.Property(entity => entity.TransporterName).HasMaxLength(128);
        builder.Property(entity => entity.DriverName).HasMaxLength(128);
        builder.Property(entity => entity.DriverContact).HasMaxLength(64);
        builder.Property(entity => entity.DeliveryAddressSnapshot).HasMaxLength(1000);
        builder.Property(entity => entity.PodReceivedBy).HasMaxLength(128);
        builder.Property(entity => entity.PodReceiverContact).HasMaxLength(64);
        builder.Property(entity => entity.PodRemarks).HasMaxLength(512);
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.ShipmentNo }).IsUnique();
    }
}

public sealed class ShipmentLineConfiguration : IEntityTypeConfiguration<ShipmentLine>
{
    public void Configure(EntityTypeBuilder<ShipmentLine> builder)
    {
        builder.ToTable("ShipmentLines", "dispatch");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ShippedQuantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.DeliveredQuantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.ShortQuantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.DamagedQuantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.UnitPrice).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.DiscountPercent).HasColumnType("decimal(9,4)");
        builder.Property(entity => entity.DiscountAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.TaxRateSnapshot).HasColumnType("decimal(9,4)");
        builder.Property(entity => entity.TaxAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.LineSubtotal).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.LineTaxableAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.LineTotalAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.SourceDocumentNo).HasMaxLength(64);
        builder.Property(entity => entity.PriceSourceType).HasMaxLength(32);
        builder.Property(entity => entity.LineInternalRemarks).HasMaxLength(512);
        builder.Property(entity => entity.LineCustomerFacingRemarks).HasMaxLength(512);
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.ShipmentId, entity.LineNo }).IsUnique();
        builder.HasIndex(entity => entity.SalesOrderLineId);
        builder.HasIndex(entity => entity.PcidId);
    }
}
