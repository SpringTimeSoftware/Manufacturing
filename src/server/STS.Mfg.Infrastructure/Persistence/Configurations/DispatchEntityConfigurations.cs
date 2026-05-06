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
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.ShipmentId, entity.LineNo }).IsUnique();
    }
}
