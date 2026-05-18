using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STS.Mfg.Domain.Mobile;

namespace STS.Mfg.Infrastructure.Persistence.Configurations;

public sealed class MobileDeviceRegistrationConfiguration : IEntityTypeConfiguration<MobileDeviceRegistration>
{
    public void Configure(EntityTypeBuilder<MobileDeviceRegistration> builder)
    {
        builder.ToTable("DeviceRegistrations", "mobile");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.DeviceCode).HasMaxLength(80).IsRequired();
        builder.Property(entity => entity.DeviceName).HasMaxLength(160).IsRequired();
        builder.Property(entity => entity.AssignedUserName).HasMaxLength(160);
        builder.Property(entity => entity.Platform).HasMaxLength(40).IsRequired();
        builder.Property(entity => entity.RuntimeName).HasMaxLength(80).IsRequired();
        builder.Property(entity => entity.AppVersion).HasMaxLength(40);
        builder.Property(entity => entity.OperatingSystem).HasMaxLength(120);
        builder.Property(entity => entity.BrowserInfo).HasMaxLength(240);
        builder.Property(entity => entity.ScannerCapability).HasMaxLength(40).IsRequired();
        builder.Property(entity => entity.CameraCapability).HasMaxLength(40).IsRequired();
        builder.Property(entity => entity.TrustStatus).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.CredentialReference).HasMaxLength(200);
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.DeviceCode }).IsUnique();
        builder.HasIndex(entity => new { entity.CompanyId, entity.BranchId, entity.WarehouseId, entity.TrustStatus });
    }
}

public sealed class MobileOfflineOperationConfiguration : IEntityTypeConfiguration<MobileOfflineOperation>
{
    public void Configure(EntityTypeBuilder<MobileOfflineOperation> builder)
    {
        builder.ToTable("OfflineOperations", "mobile");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.OperationType).HasMaxLength(80).IsRequired();
        builder.Property(entity => entity.SourceModule).HasMaxLength(80).IsRequired();
        builder.Property(entity => entity.PayloadSnapshotJson).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(entity => entity.IdempotencyKey).HasMaxLength(120).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.FailureReason).HasMaxLength(1000);
        builder.Property(entity => entity.ConflictReason).HasMaxLength(1000);
        builder.Property(entity => entity.ServerReferenceType).HasMaxLength(80);
        builder.Property(entity => entity.ServerReferenceNo).HasMaxLength(120);
        builder.HasIndex(entity => new { entity.CompanyId, entity.IdempotencyKey }).IsUnique();
        builder.HasIndex(entity => new { entity.DeviceRegistrationId, entity.Status, entity.QueuedOn });
    }
}

public sealed class MobileSyncConflictConfiguration : IEntityTypeConfiguration<MobileSyncConflict>
{
    public void Configure(EntityTypeBuilder<MobileSyncConflict> builder)
    {
        builder.ToTable("SyncConflicts", "mobile");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ConflictType).HasMaxLength(80).IsRequired();
        builder.Property(entity => entity.ConflictReason).HasMaxLength(1000).IsRequired();
        builder.Property(entity => entity.LocalPayloadJson).HasColumnType("nvarchar(max)");
        builder.Property(entity => entity.ServerPayloadJson).HasColumnType("nvarchar(max)");
        builder.Property(entity => entity.ResolutionStatus).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.MobileOfflineOperationId, entity.ResolutionStatus });
    }
}

public sealed class MobileScanEventConfiguration : IEntityTypeConfiguration<MobileScanEvent>
{
    public void Configure(EntityTypeBuilder<MobileScanEvent> builder)
    {
        builder.ToTable("ScanEvents", "mobile");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ScanValue).HasMaxLength(240).IsRequired();
        builder.Property(entity => entity.ScanSource).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.ScanContext).HasMaxLength(80).IsRequired();
        builder.Property(entity => entity.ResolvedEntityType).HasMaxLength(80);
        builder.Property(entity => entity.ResolvedEntityCode).HasMaxLength(160);
        builder.Property(entity => entity.ResolutionStatus).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.ValidationMessage).HasMaxLength(1000);
        builder.Property(entity => entity.PayloadSnapshotJson).HasColumnType("nvarchar(max)");
        builder.HasIndex(entity => new { entity.CompanyId, entity.ScanValue, entity.ScanTimestamp });
        builder.HasIndex(entity => new { entity.DeviceRegistrationId, entity.ScanTimestamp });
    }
}

public sealed class MobilePhotoEvidenceConfiguration : IEntityTypeConfiguration<MobilePhotoEvidence>
{
    public void Configure(EntityTypeBuilder<MobilePhotoEvidence> builder)
    {
        builder.ToTable("PhotoEvidence", "mobile");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.SourceModule).HasMaxLength(80).IsRequired();
        builder.Property(entity => entity.SourceDocumentType).HasMaxLength(80).IsRequired();
        builder.Property(entity => entity.SourceDocumentNo).HasMaxLength(120);
        builder.Property(entity => entity.EvidenceType).HasMaxLength(80).IsRequired();
        builder.Property(entity => entity.FileName).HasMaxLength(260);
        builder.Property(entity => entity.ContentType).HasMaxLength(120);
        builder.Property(entity => entity.UploadStatus).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.FailureReason).HasMaxLength(1000);
        builder.Property(entity => entity.MetadataJson).HasColumnType("nvarchar(max)");
        builder.HasIndex(entity => new { entity.SourceModule, entity.SourceDocumentType, entity.SourceDocumentId });
        builder.HasIndex(entity => new { entity.DeviceRegistrationId, entity.CapturedOn });
    }
}
