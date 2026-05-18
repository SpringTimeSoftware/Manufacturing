using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STS.Mfg.Domain.ServiceManagement;

namespace STS.Mfg.Infrastructure.Persistence.Configurations;

public sealed class InstalledAssetConfiguration : IEntityTypeConfiguration<InstalledAsset>
{
    public void Configure(EntityTypeBuilder<InstalledAsset> builder)
    {
        builder.ToTable("InstalledAssets", "service");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.AssetNo).HasMaxLength(48).IsRequired();
        builder.Property(entity => entity.SerialNo).HasMaxLength(80);
        builder.Property(entity => entity.SourceDocumentType).HasMaxLength(40);
        builder.Property(entity => entity.SourceDocumentNo).HasMaxLength(80);
        builder.Property(entity => entity.Status).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.LocationSnapshot).HasMaxLength(1000);
        builder.Property(entity => entity.Remarks).HasMaxLength(1000);
        builder.HasIndex(entity => new { entity.CompanyId, entity.AssetNo }).IsUnique();
        builder.HasIndex(entity => new { entity.CustomerId, entity.ItemId, entity.SerialNo });
        builder.HasIndex(entity => entity.SourceDispatchId);
        builder.HasIndex(entity => entity.SourceInvoiceId);
    }
}

public sealed class WarrantyPolicyConfiguration : IEntityTypeConfiguration<WarrantyPolicy>
{
    public void Configure(EntityTypeBuilder<WarrantyPolicy> builder)
    {
        builder.ToTable("WarrantyPolicies", "service");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.PolicyCode).HasMaxLength(48).IsRequired();
        builder.Property(entity => entity.PolicyName).HasMaxLength(160).IsRequired();
        builder.Property(entity => entity.StartTrigger).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.Exclusions).HasMaxLength(2000);
        builder.Property(entity => entity.ClaimLimitAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.Status).HasMaxLength(32).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.PolicyCode }).IsUnique();
        builder.HasIndex(entity => new { entity.ItemId, entity.ItemGroupId, entity.CustomerGroupId, entity.Status });
    }
}

public sealed class ServiceContractConfiguration : IEntityTypeConfiguration<ServiceContract>
{
    public void Configure(EntityTypeBuilder<ServiceContract> builder)
    {
        builder.ToTable("ServiceContracts", "service");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ContractNo).HasMaxLength(48).IsRequired();
        builder.Property(entity => entity.CoverageSummary).HasMaxLength(2000).IsRequired();
        builder.Property(entity => entity.PreventiveScheduleJson).HasMaxLength(4000);
        builder.Property(entity => entity.ContractValueAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.TaxRateSnapshot).HasColumnType("decimal(9,4)");
        builder.Property(entity => entity.Status).HasMaxLength(32).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.ContractNo }).IsUnique();
        builder.HasIndex(entity => new { entity.CustomerId, entity.InstalledAssetId, entity.Status });
    }
}

public sealed class ServiceTicketConfiguration : IEntityTypeConfiguration<ServiceTicket>
{
    public void Configure(EntityTypeBuilder<ServiceTicket> builder)
    {
        builder.ToTable("ServiceTickets", "service");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.TicketNo).HasMaxLength(48).IsRequired();
        builder.Property(entity => entity.SerialNo).HasMaxLength(80);
        builder.Property(entity => entity.IssueCategory).HasMaxLength(80).IsRequired();
        builder.Property(entity => entity.IssueDescription).HasMaxLength(2000).IsRequired();
        builder.Property(entity => entity.Priority).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Severity).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Channel).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.EntitlementType).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.EntitlementSource).HasMaxLength(80);
        builder.Property(entity => entity.EntitlementSnapshotJson).HasMaxLength(4000);
        builder.Property(entity => entity.Status).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.InternalRemarks).HasMaxLength(1000);
        builder.Property(entity => entity.CustomerFacingRemarks).HasMaxLength(1000);
        builder.Property(entity => entity.AssetSnapshotJson).HasMaxLength(4000);
        builder.Property(entity => entity.ReopenReason).HasMaxLength(1000);
        builder.Property(entity => entity.ClosureReason).HasMaxLength(1000);
        builder.HasIndex(entity => new { entity.CompanyId, entity.TicketNo }).IsUnique();
        builder.HasIndex(entity => new { entity.CustomerId, entity.Status });
        builder.HasIndex(entity => entity.InstalledAssetId);
    }
}

public sealed class ServiceVisitConfiguration : IEntityTypeConfiguration<ServiceVisit>
{
    public void Configure(EntityTypeBuilder<ServiceVisit> builder)
    {
        builder.ToTable("ServiceVisits", "service");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.VisitAddressSnapshot).HasMaxLength(1000);
        builder.Property(entity => entity.WorkPerformed).HasMaxLength(2000);
        builder.Property(entity => entity.Diagnosis).HasMaxLength(2000);
        builder.Property(entity => entity.Resolution).HasMaxLength(2000);
        builder.Property(entity => entity.CustomerSignoffName).HasMaxLength(160);
        builder.Property(entity => entity.Status).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.Remarks).HasMaxLength(1000);
        builder.HasIndex(entity => new { entity.CompanyId, entity.ServiceTicketId, entity.Status });
    }
}

public sealed class ServiceSpareMovementConfiguration : IEntityTypeConfiguration<ServiceSpareMovement>
{
    public void Configure(EntityTypeBuilder<ServiceSpareMovement> builder)
    {
        builder.ToTable("ServiceSpareMovements", "service");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.MovementNo).HasMaxLength(48).IsRequired();
        builder.Property(entity => entity.MovementType).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Quantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.InventoryState).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.SerialNo).HasMaxLength(80);
        builder.Property(entity => entity.Status).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.ReasonCode).HasMaxLength(64);
        builder.Property(entity => entity.Remarks).HasMaxLength(1000);
        builder.HasIndex(entity => new { entity.CompanyId, entity.MovementNo }).IsUnique();
        builder.HasIndex(entity => new { entity.ServiceTicketId, entity.MovementType });
        builder.HasIndex(entity => entity.StockTransactionId);
    }
}

public sealed class WarrantyClaimConfiguration : IEntityTypeConfiguration<WarrantyClaim>
{
    public void Configure(EntityTypeBuilder<WarrantyClaim> builder)
    {
        builder.ToTable("WarrantyClaims", "service");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ClaimNo).HasMaxLength(48).IsRequired();
        builder.Property(entity => entity.SerialNo).HasMaxLength(80);
        builder.Property(entity => entity.ClaimType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.EntitlementType).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.EntitlementSnapshotJson).HasMaxLength(4000);
        builder.Property(entity => entity.ApprovalStatus).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.Disposition).HasMaxLength(1000);
        builder.Property(entity => entity.CostDecision).HasMaxLength(128);
        builder.Property(entity => entity.RejectionReason).HasMaxLength(1000);
        builder.Property(entity => entity.OverrideReason).HasMaxLength(1000);
        builder.Property(entity => entity.Status).HasMaxLength(32).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.ClaimNo }).IsUnique();
        builder.HasIndex(entity => new { entity.ServiceTicketId, entity.ApprovalStatus });
    }
}

public sealed class ServiceChargeConfiguration : IEntityTypeConfiguration<ServiceCharge>
{
    public void Configure(EntityTypeBuilder<ServiceCharge> builder)
    {
        builder.ToTable("ServiceCharges", "service");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ChargeNo).HasMaxLength(48).IsRequired();
        builder.Property(entity => entity.LaborAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.PartsAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.TravelAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.OtherAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.DiscountAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.TaxRateSnapshot).HasColumnType("decimal(9,4)");
        builder.Property(entity => entity.TaxAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.TotalAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.BillableStatus).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.NonBillableReason).HasMaxLength(1000);
        builder.Property(entity => entity.Status).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.SnapshotJson).HasMaxLength(4000);
        builder.HasIndex(entity => new { entity.CompanyId, entity.ChargeNo }).IsUnique();
        builder.HasIndex(entity => new { entity.ServiceTicketId, entity.Status });
    }
}
