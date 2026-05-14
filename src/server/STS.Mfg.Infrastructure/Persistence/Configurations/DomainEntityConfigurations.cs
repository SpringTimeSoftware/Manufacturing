using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STS.Mfg.Domain.Engineering;
using STS.Mfg.Domain.Masters;
using STS.Mfg.Domain.Measurements;
using STS.Mfg.Domain.Organization;
using STS.Mfg.Domain.Resources;
using STS.Mfg.Domain.SalesPlanning;

namespace STS.Mfg.Infrastructure.Persistence.Configurations;

public sealed class CompanyConfiguration : IEntityTypeConfiguration<Company>
{
    public void Configure(EntityTypeBuilder<Company> builder)
    {
        builder.ToTable("Companies", "org");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.CompanyCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.CompanyName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.LegalName).HasMaxLength(160).IsRequired();
        builder.Property(entity => entity.TaxRegistrationNo).HasMaxLength(64);
        builder.Property(entity => entity.TimeZoneId).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.BaseCurrencyCode).HasMaxLength(16);
        builder.Property(entity => entity.DefaultCalendarCode).HasMaxLength(32);
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => entity.CompanyCode).IsUnique();
    }
}

public sealed class BranchConfiguration : IEntityTypeConfiguration<Branch>
{
    public void Configure(EntityTypeBuilder<Branch> builder)
    {
        builder.ToTable("Branches", "org");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.BranchCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.BranchName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.BranchType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.TimeZoneId).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.DefaultCalendarCode).HasMaxLength(32);
        builder.Property(entity => entity.ContactEmail).HasMaxLength(128);
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.BranchCode }).IsUnique();
    }
}

public sealed class DepartmentConfiguration : IEntityTypeConfiguration<Department>
{
    public void Configure(EntityTypeBuilder<Department> builder)
    {
        builder.ToTable("Departments", "org");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.DepartmentCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.DepartmentName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.DepartmentType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.BranchId, entity.DepartmentCode }).IsUnique();
    }
}

public sealed class ShiftConfiguration : IEntityTypeConfiguration<Shift>
{
    public void Configure(EntityTypeBuilder<Shift> builder)
    {
        builder.ToTable("Shifts", "org");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ShiftCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.ShiftName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.CalendarProfileCode).HasMaxLength(32);
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.BranchId, entity.ShiftCode }).IsUnique();
        builder.HasIndex(entity => new { entity.CompanyId, entity.BranchId, entity.SequenceNo }).IsUnique();
    }
}

public sealed class WarehouseConfiguration : IEntityTypeConfiguration<Warehouse>
{
    public void Configure(EntityTypeBuilder<Warehouse> builder)
    {
        builder.ToTable("Warehouses", "org");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.WarehouseCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.WarehouseName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.WarehouseType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.WarehouseCode }).IsUnique();
    }
}

public sealed class BinConfiguration : IEntityTypeConfiguration<Bin>
{
    public void Configure(EntityTypeBuilder<Bin> builder)
    {
        builder.ToTable("Bins", "org");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.BinCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.BinName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.BinType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.BlockReasonCode).HasMaxLength(64);
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.Property(entity => entity.CapacityValue).HasColumnType("decimal(18,4)");
        builder.HasIndex(entity => new { entity.WarehouseId, entity.BinCode }).IsUnique();
    }
}

public sealed class UomClassConfiguration : IEntityTypeConfiguration<UomClass>
{
    public void Configure(EntityTypeBuilder<UomClass> builder)
    {
        builder.ToTable("UomClasses", "measure");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ClassCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.ClassName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => entity.ClassCode).IsUnique();
    }
}

public sealed class UomConfiguration : IEntityTypeConfiguration<Uom>
{
    public void Configure(EntityTypeBuilder<Uom> builder)
    {
        builder.ToTable("Uoms", "measure");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.UomCode).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.UomName).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.Symbol).HasMaxLength(16);
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => entity.UomCode).IsUnique();
    }
}

public sealed class UomConversionConfiguration : IEntityTypeConfiguration<UomConversion>
{
    public void Configure(EntityTypeBuilder<UomConversion> builder)
    {
        builder.ToTable("UomConversions", "measure");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ConversionMode).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.RoundMode).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.FormulaTokenSet).HasMaxLength(64);
        builder.Property(entity => entity.FactorNumerator).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.FactorDenominator).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.FromUomId, entity.ToUomId }).IsUnique();
    }
}

public sealed class MeasurementProfileConfiguration : IEntityTypeConfiguration<MeasurementProfile>
{
    public void Configure(EntityTypeBuilder<MeasurementProfile> builder)
    {
        builder.ToTable("MeasurementProfiles", "measure");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ProfileCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.ProfileName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.ProfileType).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => entity.ProfileCode).IsUnique();
    }
}

public sealed class MeasurementFormulaConfiguration : IEntityTypeConfiguration<MeasurementFormula>
{
    public void Configure(EntityTypeBuilder<MeasurementFormula> builder)
    {
        builder.ToTable("MeasurementFormulas", "measure");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.FormulaCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.FormulaName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.FormulaPurpose).HasMaxLength(48).IsRequired();
        builder.Property(entity => entity.ExpressionTemplate).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.MeasurementProfileId, entity.FormulaCode }).IsUnique();
    }
}

public sealed class ItemGroupConfiguration : IEntityTypeConfiguration<ItemGroup>
{
    public void Configure(EntityTypeBuilder<ItemGroup> builder)
    {
        builder.ToTable("ItemGroups", "master");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ItemGroupCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.ItemGroupName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.DefaultTraceabilityMode).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.ItemGroupCode }).IsUnique();
    }
}

public sealed class ItemAttributeConfiguration : IEntityTypeConfiguration<ItemAttribute>
{
    public void Configure(EntityTypeBuilder<ItemAttribute> builder)
    {
        builder.ToTable("ItemAttributes", "master");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.AttributeCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.AttributeName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.DataType).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.AttributeCode }).IsUnique();
    }
}

public sealed class ItemAttributeValueConfiguration : IEntityTypeConfiguration<ItemAttributeValue>
{
    public void Configure(EntityTypeBuilder<ItemAttributeValue> builder)
    {
        builder.ToTable("ItemAttributeValues", "master");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.AttributeValueCode).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.AttributeValueName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.ItemAttributeId, entity.AttributeValueCode }).IsUnique();
        builder.HasOne<ItemAttribute>().WithMany().HasForeignKey(entity => entity.ItemAttributeId).OnDelete(DeleteBehavior.Cascade);
    }
}

public sealed class ItemConfiguration : IEntityTypeConfiguration<Item>
{
    public void Configure(EntityTypeBuilder<Item> builder)
    {
        builder.ToTable("Items", "master");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ItemCode).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.ItemName).HasMaxLength(160).IsRequired();
        builder.Property(entity => entity.ShortName).HasMaxLength(80);
        builder.Property(entity => entity.ItemType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.TraceabilityMode).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.DefaultIssueMethod).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.DefaultMakeType).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.ReorderPolicy).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.ItemCode }).IsUnique();
    }
}

public sealed class ItemVariantConfiguration : IEntityTypeConfiguration<ItemVariant>
{
    public void Configure(EntityTypeBuilder<ItemVariant> builder)
    {
        builder.ToTable("ItemVariants", "master");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.VariantCode).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.VariantName).HasMaxLength(160).IsRequired();
        builder.Property(entity => entity.VariantKey).HasMaxLength(256).IsRequired();
        builder.Property(entity => entity.VariantAttributeSummary).HasMaxLength(256);
        builder.Property(entity => entity.VariantAttributeMapJson).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(entity => entity.OverrideWeightPerUnit).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.VariantCode }).IsUnique();
        builder.HasIndex(entity => new { entity.ItemId, entity.VariantKey }).IsUnique();
    }
}

public sealed class ItemUomConfiguration : IEntityTypeConfiguration<ItemUom>
{
    public void Configure(EntityTypeBuilder<ItemUom> builder)
    {
        builder.ToTable("ItemUoms", "master");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.UomRole).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.BaseToThisNumerator).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.BaseToThisDenominator).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.MinOrderQty).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.ItemId, entity.ItemVariantId, entity.UomRole, entity.UomId }).IsUnique();
    }
}

public sealed class ItemBarcodeConfiguration : IEntityTypeConfiguration<ItemBarcode>
{
    public void Configure(EntityTypeBuilder<ItemBarcode> builder)
    {
        builder.ToTable("ItemBarcodes", "master");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.BarcodeValue).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.BarcodeType).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.ScanPurpose).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => entity.BarcodeValue).IsUnique();
    }
}

public sealed class ItemAliasConfiguration : IEntityTypeConfiguration<ItemAlias>
{
    public void Configure(EntityTypeBuilder<ItemAlias> builder)
    {
        builder.ToTable("ItemAliases", "master");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.AliasType).HasMaxLength(50).IsRequired();
        builder.Property(entity => entity.AliasValue).HasMaxLength(160).IsRequired();
        builder.Property(entity => entity.LanguageCode).HasMaxLength(16);
        builder.Property(entity => entity.Status).HasMaxLength(30).IsRequired();
        builder.HasIndex(entity => new { entity.ItemId, entity.AliasType, entity.Status });
    }
}

public sealed class ItemMediaConfiguration : IEntityTypeConfiguration<ItemMedia>
{
    public void Configure(EntityTypeBuilder<ItemMedia> builder)
    {
        builder.ToTable("ItemMedia", "master");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.MediaType).HasMaxLength(40).IsRequired();
        builder.Property(entity => entity.Title).HasMaxLength(160).IsRequired();
        builder.Property(entity => entity.FileName).HasMaxLength(260);
        builder.Property(entity => entity.MimeType).HasMaxLength(120);
        builder.Property(entity => entity.StorageUri).HasMaxLength(600);
        builder.Property(entity => entity.ThumbnailUri).HasMaxLength(600);
        builder.Property(entity => entity.ApprovalStatus).HasMaxLength(40).IsRequired();
        builder.Property(entity => entity.VisibilityScope).HasMaxLength(40).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(30).IsRequired();
        builder.HasIndex(entity => new { entity.ItemId, entity.Status, entity.IsPrimary });
    }
}

public sealed class ItemDocumentConfiguration : IEntityTypeConfiguration<ItemDocument>
{
    public void Configure(EntityTypeBuilder<ItemDocument> builder)
    {
        builder.ToTable("ItemDocuments", "master");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.DocumentType).HasMaxLength(50).IsRequired();
        builder.Property(entity => entity.Title).HasMaxLength(180).IsRequired();
        builder.Property(entity => entity.DocumentNo).HasMaxLength(80);
        builder.Property(entity => entity.RevisionCode).HasMaxLength(40);
        builder.Property(entity => entity.FileName).HasMaxLength(260);
        builder.Property(entity => entity.StorageUri).HasMaxLength(600);
        builder.Property(entity => entity.ApprovalStatus).HasMaxLength(40).IsRequired();
        builder.Property(entity => entity.VisibilityScope).HasMaxLength(40).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(30).IsRequired();
        builder.HasIndex(entity => new { entity.ItemId, entity.DocumentType, entity.Status });
    }
}

public sealed class ItemCatalogConfiguration : IEntityTypeConfiguration<ItemCatalog>
{
    public void Configure(EntityTypeBuilder<ItemCatalog> builder)
    {
        builder.ToTable("ItemCatalog", "master");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.CatalogTitle).HasMaxLength(180).IsRequired();
        builder.Property(entity => entity.CatalogSection).HasMaxLength(120);
        builder.Property(entity => entity.MarketingDescription).HasMaxLength(1000);
        builder.Property(entity => entity.CustomerVisibleSpecsJson).HasColumnType("nvarchar(max)");
        builder.Property(entity => entity.PublishStatus).HasMaxLength(40).IsRequired();
        builder.Property(entity => entity.PreviewSlug).HasMaxLength(180);
        builder.Property(entity => entity.Status).HasMaxLength(30).IsRequired();
        builder.HasIndex(entity => entity.ItemId).IsUnique();
    }
}

public sealed class ItemPackagingConfiguration : IEntityTypeConfiguration<ItemPackaging>
{
    public void Configure(EntityTypeBuilder<ItemPackaging> builder)
    {
        builder.ToTable("ItemPackaging", "master");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.InnerPackQty).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.CartonQty).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.PalletQty).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.NetWeight).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.GrossWeight).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.LengthValue).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.WidthValue).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.HeightValue).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.PackingInstructions).HasMaxLength(1000);
        builder.Property(entity => entity.Status).HasMaxLength(30).IsRequired();
        builder.HasIndex(entity => entity.ItemId).IsUnique();
    }
}

public sealed class ItemPhysicalSpecsConfiguration : IEntityTypeConfiguration<ItemPhysicalSpecs>
{
    public void Configure(EntityTypeBuilder<ItemPhysicalSpecs> builder)
    {
        builder.ToTable("ItemPhysicalSpecs", "master");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.LengthValue).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.WidthValue).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.HeightValue).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.ThicknessValue).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.Grade).HasMaxLength(80);
        builder.Property(entity => entity.Material).HasMaxLength(120);
        builder.Property(entity => entity.ColorFinish).HasMaxLength(120);
        builder.Property(entity => entity.StorageCondition).HasMaxLength(240);
        builder.Property(entity => entity.ToleranceNote).HasMaxLength(500);
        builder.Property(entity => entity.Status).HasMaxLength(30).IsRequired();
        builder.HasIndex(entity => entity.ItemId).IsUnique();
    }
}

public sealed class ItemCustomerReferenceConfiguration : IEntityTypeConfiguration<ItemCustomerReference>
{
    public void Configure(EntityTypeBuilder<ItemCustomerReference> builder)
    {
        builder.ToTable("ItemCustomerReferences", "master");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.CustomerItemCode).HasMaxLength(80).IsRequired();
        builder.Property(entity => entity.DrawingNo).HasMaxLength(100);
        builder.Property(entity => entity.RevisionCode).HasMaxLength(40);
        builder.Property(entity => entity.PackagingOverride).HasMaxLength(500);
        builder.Property(entity => entity.SpecificationOverride).HasMaxLength(500);
        builder.Property(entity => entity.ApprovalStatus).HasMaxLength(40).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(30).IsRequired();
        builder.HasIndex(entity => new { entity.ItemId, entity.CustomerId, entity.Status });
    }
}

public sealed class ItemVendorReferenceConfiguration : IEntityTypeConfiguration<ItemVendorReference>
{
    public void Configure(EntityTypeBuilder<ItemVendorReference> builder)
    {
        builder.ToTable("ItemVendorReferences", "master");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.VendorItemCode).HasMaxLength(80).IsRequired();
        builder.Property(entity => entity.MinimumOrderQty).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.ComplianceStatus).HasMaxLength(80);
        builder.Property(entity => entity.DocumentStatus).HasMaxLength(80);
        builder.Property(entity => entity.Status).HasMaxLength(30).IsRequired();
        builder.HasIndex(entity => new { entity.ItemId, entity.SupplierId, entity.Status });
    }
}

public sealed class ItemManufacturingPolicyConfiguration : IEntityTypeConfiguration<ItemManufacturingPolicy>
{
    public void Configure(EntityTypeBuilder<ItemManufacturingPolicy> builder)
    {
        builder.ToTable("ItemManufacturingPolicies", "master");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.BomPolicy).HasMaxLength(80).IsRequired();
        builder.Property(entity => entity.RoutingPolicy).HasMaxLength(80).IsRequired();
        builder.Property(entity => entity.IssueMethod).HasMaxLength(40).IsRequired();
        builder.Property(entity => entity.ScrapAllowancePercent).HasColumnType("decimal(9,4)");
        builder.Property(entity => entity.OperationLinkage).HasMaxLength(240);
        builder.Property(entity => entity.Status).HasMaxLength(30).IsRequired();
        builder.HasIndex(entity => entity.ItemId).IsUnique();
    }
}

public sealed class ItemPlanningPolicyConfiguration : IEntityTypeConfiguration<ItemPlanningPolicy>
{
    public void Configure(EntityTypeBuilder<ItemPlanningPolicy> builder)
    {
        builder.ToTable("ItemPlanningPolicies", "master");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.SafetyStockQty).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.ReorderPointQty).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.MinimumQty).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.MaximumQty).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.LotSizeQty).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.AbcClass).HasMaxLength(12);
        builder.Property(entity => entity.Status).HasMaxLength(30).IsRequired();
        builder.HasIndex(entity => entity.ItemId).IsUnique();
    }
}

public sealed class ItemInventoryPolicyConfiguration : IEntityTypeConfiguration<ItemInventoryPolicy>
{
    public void Configure(EntityTypeBuilder<ItemInventoryPolicy> builder)
    {
        builder.ToTable("ItemInventoryPolicies", "master");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.SerialTrackingMode).HasMaxLength(40).IsRequired();
        builder.Property(entity => entity.LotTrackingMode).HasMaxLength(40).IsRequired();
        builder.Property(entity => entity.NegativeStockPolicy).HasMaxLength(40).IsRequired();
        builder.Property(entity => entity.ExpiryPolicy).HasMaxLength(80);
        builder.Property(entity => entity.Status).HasMaxLength(30).IsRequired();
        builder.HasIndex(entity => entity.ItemId).IsUnique();
    }
}

public sealed class ItemQualityPolicyConfiguration : IEntityTypeConfiguration<ItemQualityPolicy>
{
    public void Configure(EntityTypeBuilder<ItemQualityPolicy> builder)
    {
        builder.ToTable("ItemQualityPolicies", "master");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.InspectionPlanCode).HasMaxLength(80);
        builder.Property(entity => entity.CertificateRequirement).HasMaxLength(160);
        builder.Property(entity => entity.HoldRule).HasMaxLength(160);
        builder.Property(entity => entity.TraceabilityDepth).HasMaxLength(80);
        builder.Property(entity => entity.Status).HasMaxLength(30).IsRequired();
        builder.HasIndex(entity => entity.ItemId).IsUnique();
    }
}

public sealed class CustomerConfiguration : IEntityTypeConfiguration<Customer>
{
    public void Configure(EntityTypeBuilder<Customer> builder)
    {
        builder.ToTable("Customers", "master");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.CustomerCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.CustomerName).HasMaxLength(160).IsRequired();
        builder.Property(entity => entity.ShortName).HasMaxLength(80);
        builder.Property(entity => entity.CustomerType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.TaxRegistrationNo).HasMaxLength(64);
        builder.Property(entity => entity.PaymentTermsCode).HasMaxLength(32);
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.CustomerCode }).IsUnique();
    }
}

public sealed class CustomerAddressConfiguration : IEntityTypeConfiguration<CustomerAddress>
{
    public void Configure(EntityTypeBuilder<CustomerAddress> builder)
    {
        builder.ToTable("CustomerAddresses", "master");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.AddressCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.AddressType).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.AddressLine1).HasMaxLength(160).IsRequired();
        builder.Property(entity => entity.AddressLine2).HasMaxLength(160);
        builder.Property(entity => entity.City).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.StateOrProvince).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.PostalCode).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.CountryCode).HasMaxLength(8).IsRequired();
        builder.Property(entity => entity.ContactName).HasMaxLength(128);
        builder.Property(entity => entity.ContactEmail).HasMaxLength(128);
        builder.Property(entity => entity.ContactPhone).HasMaxLength(32);
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.CustomerId, entity.AddressCode }).IsUnique();
    }
}

public sealed class SupplierConfiguration : IEntityTypeConfiguration<Supplier>
{
    public void Configure(EntityTypeBuilder<Supplier> builder)
    {
        builder.ToTable("Suppliers", "master");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.SupplierCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.SupplierName).HasMaxLength(160).IsRequired();
        builder.Property(entity => entity.SupplierType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.TaxRegistrationNo).HasMaxLength(64);
        builder.Property(entity => entity.PaymentTermsCode).HasMaxLength(32);
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.SupplierCode }).IsUnique();
    }
}

public sealed class SupplierAddressConfiguration : IEntityTypeConfiguration<SupplierAddress>
{
    public void Configure(EntityTypeBuilder<SupplierAddress> builder)
    {
        builder.ToTable("SupplierAddresses", "master");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.AddressCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.AddressType).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.AddressLine1).HasMaxLength(160).IsRequired();
        builder.Property(entity => entity.City).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.StateOrProvince).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.PostalCode).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.CountryCode).HasMaxLength(8).IsRequired();
        builder.Property(entity => entity.ContactName).HasMaxLength(128);
        builder.Property(entity => entity.ContactEmail).HasMaxLength(128);
        builder.Property(entity => entity.ContactPhone).HasMaxLength(32);
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.SupplierId, entity.AddressCode }).IsUnique();
    }
}

public sealed class SupplierLeadTimeConfiguration : IEntityTypeConfiguration<SupplierLeadTime>
{
    public void Configure(EntityTypeBuilder<SupplierLeadTime> builder)
    {
        builder.ToTable("SupplierLeadTimes", "master");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.MinOrderQty).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.OrderMultipleQty).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.SupplierId, entity.BranchId, entity.ItemId, entity.ItemGroupId }).IsUnique();
    }
}

public sealed class CustomerPartnerProfileConfiguration : IEntityTypeConfiguration<CustomerPartnerProfile>
{
    public void Configure(EntityTypeBuilder<CustomerPartnerProfile> builder)
    {
        builder.ToTable("CustomerPartnerProfiles", "master");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.LegalName).HasMaxLength(180);
        builder.Property(entity => entity.TaxCategory).HasMaxLength(60);
        builder.Property(entity => entity.CurrencyCode).HasMaxLength(8);
        builder.Property(entity => entity.CreditStatus).HasMaxLength(40);
        builder.Property(entity => entity.CreditLimitAmount).HasColumnType("decimal(18,2)");
        builder.Property(entity => entity.CreditHoldRule).HasMaxLength(80);
        builder.Property(entity => entity.PaymentTermsCode).HasMaxLength(32);
        builder.Property(entity => entity.CommercialSegment).HasMaxLength(80);
        builder.Property(entity => entity.OrderReleaseControl).HasMaxLength(80);
        builder.Property(entity => entity.DispatchPreference).HasMaxLength(80);
        builder.Property(entity => entity.DispatchInstruction).HasMaxLength(500);
        builder.Property(entity => entity.CatalogSegment).HasMaxLength(80);
        builder.Property(entity => entity.Status).HasMaxLength(30).IsRequired();
        builder.HasIndex(entity => entity.CustomerId).IsUnique();
        builder.HasIndex(entity => new { entity.CompanyId, entity.Status });
    }
}

public sealed class CustomerContactPointConfiguration : IEntityTypeConfiguration<CustomerContactPoint>
{
    public void Configure(EntityTypeBuilder<CustomerContactPoint> builder)
    {
        builder.ToTable("CustomerContactPoints", "master");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ContactName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.ContactRole).HasMaxLength(60).IsRequired();
        builder.Property(entity => entity.Channel).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.ContactValue).HasMaxLength(160).IsRequired();
        builder.Property(entity => entity.ConsentStatus).HasMaxLength(40);
        builder.Property(entity => entity.EscalationLevel).HasMaxLength(40);
        builder.Property(entity => entity.Status).HasMaxLength(30).IsRequired();
        builder.HasIndex(entity => new { entity.CustomerId, entity.ContactRole, entity.Channel, entity.ContactValue });
    }
}

public sealed class CustomerItemReferenceProfileConfiguration : IEntityTypeConfiguration<CustomerItemReferenceProfile>
{
    public void Configure(EntityTypeBuilder<CustomerItemReferenceProfile> builder)
    {
        builder.ToTable("CustomerItemReferenceProfiles", "master");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.CustomerItemCode).HasMaxLength(80).IsRequired();
        builder.Property(entity => entity.DrawingNo).HasMaxLength(100);
        builder.Property(entity => entity.RevisionCode).HasMaxLength(40);
        builder.Property(entity => entity.PackagingOverride).HasMaxLength(500);
        builder.Property(entity => entity.SpecificationOverride).HasMaxLength(500);
        builder.Property(entity => entity.ApprovalStatus).HasMaxLength(40).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(30).IsRequired();
        builder.HasIndex(entity => new { entity.CustomerId, entity.ItemId, entity.CustomerItemCode });
    }
}

public sealed class CustomerDocumentConfiguration : IEntityTypeConfiguration<CustomerDocument>
{
    public void Configure(EntityTypeBuilder<CustomerDocument> builder)
    {
        builder.ToTable("CustomerDocuments", "master");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.DocumentType).HasMaxLength(60).IsRequired();
        builder.Property(entity => entity.Title).HasMaxLength(180).IsRequired();
        builder.Property(entity => entity.DocumentNo).HasMaxLength(80);
        builder.Property(entity => entity.RevisionCode).HasMaxLength(40);
        builder.Property(entity => entity.FileName).HasMaxLength(260);
        builder.Property(entity => entity.StorageUri).HasMaxLength(500);
        builder.Property(entity => entity.ApprovalStatus).HasMaxLength(40).IsRequired();
        builder.Property(entity => entity.VisibilityScope).HasMaxLength(40).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(30).IsRequired();
        builder.HasIndex(entity => new { entity.CustomerId, entity.DocumentType, entity.Status });
    }
}

public sealed class SupplierPartnerProfileConfiguration : IEntityTypeConfiguration<SupplierPartnerProfile>
{
    public void Configure(EntityTypeBuilder<SupplierPartnerProfile> builder)
    {
        builder.ToTable("SupplierPartnerProfiles", "master");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.LegalName).HasMaxLength(180);
        builder.Property(entity => entity.TaxCategory).HasMaxLength(60);
        builder.Property(entity => entity.CurrencyCode).HasMaxLength(8);
        builder.Property(entity => entity.PaymentTermsCode).HasMaxLength(32);
        builder.Property(entity => entity.PreferredStatus).HasMaxLength(40);
        builder.Property(entity => entity.ComplianceStatus).HasMaxLength(40);
        builder.Property(entity => entity.CapabilitySummary).HasMaxLength(500);
        builder.Property(entity => entity.QualityRating).HasColumnType("decimal(5,2)");
        builder.Property(entity => entity.ProcurementReleaseControl).HasMaxLength(80);
        builder.Property(entity => entity.Status).HasMaxLength(30).IsRequired();
        builder.HasIndex(entity => entity.SupplierId).IsUnique();
        builder.HasIndex(entity => new { entity.CompanyId, entity.Status });
    }
}

public sealed class SupplierContactPointConfiguration : IEntityTypeConfiguration<SupplierContactPoint>
{
    public void Configure(EntityTypeBuilder<SupplierContactPoint> builder)
    {
        builder.ToTable("SupplierContactPoints", "master");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ContactName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.ContactRole).HasMaxLength(60).IsRequired();
        builder.Property(entity => entity.Channel).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.ContactValue).HasMaxLength(160).IsRequired();
        builder.Property(entity => entity.ConsentStatus).HasMaxLength(40);
        builder.Property(entity => entity.EscalationLevel).HasMaxLength(40);
        builder.Property(entity => entity.Status).HasMaxLength(30).IsRequired();
        builder.HasIndex(entity => new { entity.SupplierId, entity.ContactRole, entity.Channel, entity.ContactValue });
    }
}

public sealed class SupplierVendorReferenceProfileConfiguration : IEntityTypeConfiguration<SupplierVendorReferenceProfile>
{
    public void Configure(EntityTypeBuilder<SupplierVendorReferenceProfile> builder)
    {
        builder.ToTable("SupplierVendorReferenceProfiles", "master");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.VendorItemCode).HasMaxLength(80).IsRequired();
        builder.Property(entity => entity.MinimumOrderQty).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.ComplianceStatus).HasMaxLength(40);
        builder.Property(entity => entity.DocumentStatus).HasMaxLength(40);
        builder.Property(entity => entity.ApprovalStatus).HasMaxLength(40).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(30).IsRequired();
        builder.HasIndex(entity => new { entity.SupplierId, entity.ItemId, entity.VendorItemCode });
    }
}

public sealed class SupplierDocumentConfiguration : IEntityTypeConfiguration<SupplierDocument>
{
    public void Configure(EntityTypeBuilder<SupplierDocument> builder)
    {
        builder.ToTable("SupplierDocuments", "master");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.DocumentType).HasMaxLength(60).IsRequired();
        builder.Property(entity => entity.Title).HasMaxLength(180).IsRequired();
        builder.Property(entity => entity.DocumentNo).HasMaxLength(80);
        builder.Property(entity => entity.RevisionCode).HasMaxLength(40);
        builder.Property(entity => entity.FileName).HasMaxLength(260);
        builder.Property(entity => entity.StorageUri).HasMaxLength(500);
        builder.Property(entity => entity.ApprovalStatus).HasMaxLength(40).IsRequired();
        builder.Property(entity => entity.VisibilityScope).HasMaxLength(40).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(30).IsRequired();
        builder.HasIndex(entity => new { entity.SupplierId, entity.DocumentType, entity.Status });
    }
}

public sealed class OperationConfiguration : IEntityTypeConfiguration<Operation>
{
    public void Configure(EntityTypeBuilder<Operation> builder)
    {
        builder.ToTable("Operations", "resource");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.OperationCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.OperationName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.OperationType).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.DefaultSetupMinutes).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.DefaultRunMinutesPerUnit).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.DefaultTeardownMinutes).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.OperationCode }).IsUnique();
    }
}

public sealed class WorkCenterConfiguration : IEntityTypeConfiguration<WorkCenter>
{
    public void Configure(EntityTypeBuilder<WorkCenter> builder)
    {
        builder.ToTable("WorkCenters", "resource");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.WorkCenterCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.WorkCenterName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.DefaultShiftPatternCode).HasMaxLength(32);
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.WorkCenterCode }).IsUnique();
    }
}

public sealed class MachineConfiguration : IEntityTypeConfiguration<Machine>
{
    public void Configure(EntityTypeBuilder<Machine> builder)
    {
        builder.ToTable("Machines", "resource");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.MachineCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.MachineName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.CapacityPerHour).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.CurrentStatus).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.MachineCode }).IsUnique();
    }
}

public sealed class ToolConfiguration : IEntityTypeConfiguration<Tool>
{
    public void Configure(EntityTypeBuilder<Tool> builder)
    {
        builder.ToTable("Tools", "resource");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ToolCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.ToolName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.ToolType).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.CompatibleMachineGroup).HasMaxLength(64);
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.ToolCode }).IsUnique();
    }
}

public sealed class RoutingConfiguration : IEntityTypeConfiguration<Routing>
{
    public void Configure(EntityTypeBuilder<Routing> builder)
    {
        builder.ToTable("Routings", "resource");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.RoutingCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.RoutingName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.RevisionCode).HasMaxLength(24);
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.RoutingCode }).IsUnique();
    }
}

public sealed class RoutingOperationConfiguration : IEntityTypeConfiguration<RoutingOperation>
{
    public void Configure(EntityTypeBuilder<RoutingOperation> builder)
    {
        builder.ToTable("RoutingOperations", "resource");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.SetupMinutes).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.RunMinutesPerUnit).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.TeardownMinutes).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.OverlapPercent).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.RoutingId, entity.SequenceNo }).IsUnique();
    }
}

public sealed class BomConfiguration : IEntityTypeConfiguration<Bom>
{
    public void Configure(EntityTypeBuilder<Bom> builder)
    {
        builder.ToTable("Boms", "engineering");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.BomCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.BomName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.BomCode }).IsUnique();
        builder.HasIndex(entity => new { entity.CompanyId, entity.ItemId }).IsUnique();
    }
}

public sealed class BomRevisionConfiguration : IEntityTypeConfiguration<BomRevision>
{
    public void Configure(EntityTypeBuilder<BomRevision> builder)
    {
        builder.ToTable("BomRevisions", "engineering");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.RevisionCode).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.ApprovalStatus).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.ChangeSummary).HasMaxLength(256);
        builder.HasIndex(entity => new { entity.BomId, entity.RevisionCode }).IsUnique();
    }
}

public sealed class BomLineConfiguration : IEntityTypeConfiguration<BomLine>
{
    public void Configure(EntityTypeBuilder<BomLine> builder)
    {
        builder.ToTable("BomLines", "engineering");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.QuantityPer).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.ScrapPercent).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.IssueMethod).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.BomRevisionId, entity.SequenceNo }).IsUnique();
    }
}

public sealed class BomOperationConfiguration : IEntityTypeConfiguration<BomOperation>
{
    public void Configure(EntityTypeBuilder<BomOperation> builder)
    {
        builder.ToTable("BomOperations", "engineering");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.SetupMinutes).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.RunMinutesPerUnit).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.TeardownMinutes).HasColumnType("decimal(18,4)");
        builder.HasIndex(entity => new { entity.BomRevisionId, entity.SequenceNo }).IsUnique();
    }
}

public sealed class AlternateItemConfiguration : IEntityTypeConfiguration<AlternateItem>
{
    public void Configure(EntityTypeBuilder<AlternateItem> builder)
    {
        builder.ToTable("AlternateItems", "engineering");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ContextType).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.ApprovalStatus).HasMaxLength(16).IsRequired();
        builder.Property(entity => entity.ReasonCode).HasMaxLength(64);
        builder.HasIndex(entity => new { entity.PrimaryItemId, entity.AlternateItemValueId, entity.ContextType, entity.BomId }).IsUnique();
    }
}

public sealed class EngineeringChangeConfiguration : IEntityTypeConfiguration<EngineeringChange>
{
    public void Configure(EntityTypeBuilder<EngineeringChange> builder)
    {
        builder.ToTable("EngineeringChanges", "engineering");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.EcoCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.EcoTitle).HasMaxLength(160).IsRequired();
        builder.Property(entity => entity.ChangeType).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.ApprovalStatus).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.ReasonCode).HasMaxLength(64);
        builder.HasIndex(entity => new { entity.CompanyId, entity.EcoCode }).IsUnique();
    }
}

public sealed class EngineeringChangeLineConfiguration : IEntityTypeConfiguration<EngineeringChangeLine>
{
    public void Configure(EntityTypeBuilder<EngineeringChangeLine> builder)
    {
        builder.ToTable("EngineeringChangeLines", "engineering");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ImpactType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.ActionType).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.FromValueSummary).HasMaxLength(256);
        builder.Property(entity => entity.ToValueSummary).HasMaxLength(256);
        builder.HasIndex(entity => new { entity.EngineeringChangeId, entity.LineNo }).IsUnique();
    }
}

public sealed class QuoteConfiguration : IEntityTypeConfiguration<Quote>
{
    public void Configure(EntityTypeBuilder<Quote> builder)
    {
        builder.ToTable("Quotes", "sales");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.QuoteNo).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.PriorityCode).HasMaxLength(16).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.CustomerSpecRef).HasMaxLength(128);
        builder.HasIndex(entity => new { entity.CompanyId, entity.QuoteNo }).IsUnique();
    }
}

public sealed class QuoteLineConfiguration : IEntityTypeConfiguration<QuoteLine>
{
    public void Configure(EntityTypeBuilder<QuoteLine> builder)
    {
        builder.ToTable("QuoteLines", "sales");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.Quantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.UnitPrice).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.DiscountPercent).HasColumnType("decimal(9,4)");
        builder.Property(entity => entity.DiscountAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.TaxPercent).HasColumnType("decimal(9,4)");
        builder.Property(entity => entity.TaxAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.LineAmount).HasColumnType("decimal(18,4)");
        builder.Property(entity => entity.MakeType).HasMaxLength(16).IsRequired();
        builder.Property(entity => entity.PriorityCode).HasMaxLength(16).IsRequired();
        builder.Property(entity => entity.CustomerSpecRef).HasMaxLength(128);
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.QuoteId, entity.LineNo }).IsUnique();
    }
}

public sealed class SalesOrderConfiguration : IEntityTypeConfiguration<SalesOrder>
{
    public void Configure(EntityTypeBuilder<SalesOrder> builder)
    {
        builder.ToTable("SalesOrders", "sales");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.SalesOrderNo).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.PriorityCode).HasMaxLength(16).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(32).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.SalesOrderNo }).IsUnique();
    }
}

public sealed class SalesOrderLineConfiguration : IEntityTypeConfiguration<SalesOrderLine>
{
    public void Configure(EntityTypeBuilder<SalesOrderLine> builder)
    {
        builder.ToTable("SalesOrderLines", "sales");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.Quantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.MakeType).HasMaxLength(16).IsRequired();
        builder.Property(entity => entity.PriorityCode).HasMaxLength(16).IsRequired();
        builder.Property(entity => entity.CustomerSpecRef).HasMaxLength(128);
        builder.Property(entity => entity.Status).HasMaxLength(32).IsRequired();
        builder.HasIndex(entity => new { entity.SalesOrderId, entity.LineNo }).IsUnique();
    }
}

public sealed class BlanketOrderConfiguration : IEntityTypeConfiguration<BlanketOrder>
{
    public void Configure(EntityTypeBuilder<BlanketOrder> builder)
    {
        builder.ToTable("BlanketOrders", "sales");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.BlanketOrderNo).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.BlanketOrderNo }).IsUnique();
    }
}

public sealed class BlanketOrderScheduleConfiguration : IEntityTypeConfiguration<BlanketOrderSchedule>
{
    public void Configure(EntityTypeBuilder<BlanketOrderSchedule> builder)
    {
        builder.ToTable("BlanketOrderSchedules", "sales");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.Quantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.BlanketOrderId, entity.LineNo }).IsUnique();
    }
}

public sealed class DemandForecastConfiguration : IEntityTypeConfiguration<DemandForecast>
{
    public void Configure(EntityTypeBuilder<DemandForecast> builder)
    {
        builder.ToTable("DemandForecasts", "sales");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ForecastCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.ForecastName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.PeriodType).HasMaxLength(16).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.ForecastCode }).IsUnique();
    }
}

public sealed class DemandForecastLineConfiguration : IEntityTypeConfiguration<DemandForecastLine>
{
    public void Configure(EntityTypeBuilder<DemandForecastLine> builder)
    {
        builder.ToTable("DemandForecastLines", "sales");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.Quantity).HasColumnType("decimal(18,6)");
        builder.HasIndex(entity => new { entity.DemandForecastId, entity.LineNo }).IsUnique();
    }
}

public sealed class MasterProductionScheduleConfiguration : IEntityTypeConfiguration<MasterProductionSchedule>
{
    public void Configure(EntityTypeBuilder<MasterProductionSchedule> builder)
    {
        builder.ToTable("MasterProductionSchedules", "planning");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.MpsCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.MpsCode }).IsUnique();
    }
}

public sealed class MpsLineConfiguration : IEntityTypeConfiguration<MpsLine>
{
    public void Configure(EntityTypeBuilder<MpsLine> builder)
    {
        builder.ToTable("MpsLines", "planning");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.PlannedQuantity).HasColumnType("decimal(18,6)");
        builder.HasIndex(entity => new { entity.MasterProductionScheduleId, entity.LineNo }).IsUnique();
    }
}

public sealed class MrpRunConfiguration : IEntityTypeConfiguration<MrpRun>
{
    public void Configure(EntityTypeBuilder<MrpRun> builder)
    {
        builder.ToTable("MrpRuns", "planning");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.RunCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.RunType).HasMaxLength(16).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.RunCode }).IsUnique();
    }
}

public sealed class MrpRunItemConfiguration : IEntityTypeConfiguration<MrpRunItem>
{
    public void Configure(EntityTypeBuilder<MrpRunItem> builder)
    {
        builder.ToTable("MrpRunItems", "planning");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.DemandSourceType).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.GrossRequirementQty).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.NetRequirementQty).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.AvailableQtyAtRun).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.RecommendedAction).HasMaxLength(16).IsRequired();
        builder.Property(entity => entity.ExceptionCode).HasMaxLength(64);
        builder.HasIndex(entity => new { entity.MrpRunId, entity.ItemId, entity.DemandSourceType }).IsUnique();
    }
}

public sealed class BoqRequirementConfiguration : IEntityTypeConfiguration<BoqRequirement>
{
    public void Configure(EntityTypeBuilder<BoqRequirement> builder)
    {
        builder.ToTable("BoqRequirements", "planning");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.SourceDocumentType).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
    }
}

public sealed class BoqRequirementLineConfiguration : IEntityTypeConfiguration<BoqRequirementLine>
{
    public void Configure(EntityTypeBuilder<BoqRequirementLine> builder)
    {
        builder.ToTable("BoqRequirementLines", "planning");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.RequiredQuantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.RecommendedAction).HasMaxLength(16).IsRequired();
        builder.Property(entity => entity.ApprovedAction).HasMaxLength(16);
        builder.Property(entity => entity.OverrideReasonCode).HasMaxLength(64);
        builder.Property(entity => entity.Status).HasMaxLength(16).IsRequired();
        builder.HasIndex(entity => new { entity.BoqRequirementId, entity.LineNo }).IsUnique();
    }
}

public sealed class PlanningPlanConfiguration : IEntityTypeConfiguration<PlanningPlan>
{
    public void Configure(EntityTypeBuilder<PlanningPlan> builder)
    {
        builder.ToTable("PlanningPlans", "planning");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.PlanCode).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.PlanName).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.PlanType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.PlanCode }).IsUnique();
    }
}

public sealed class PlanningSnapshotConfiguration : IEntityTypeConfiguration<PlanningSnapshot>
{
    public void Configure(EntityTypeBuilder<PlanningSnapshot> builder)
    {
        builder.ToTable("PlanningSnapshots", "planning");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.SnapshotCode).HasMaxLength(40).IsRequired();
        builder.Property(entity => entity.SnapshotType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.InputHash).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.OutputHash).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.PlannedQuantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.SnapshotCode }).IsUnique();
    }
}

public sealed class PlannedOrderConfiguration : IEntityTypeConfiguration<PlannedOrder>
{
    public void Configure(EntityTypeBuilder<PlannedOrder> builder)
    {
        builder.ToTable("PlannedOrders", "planning");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.PlannedOrderNo).HasMaxLength(40).IsRequired();
        builder.Property(entity => entity.OrderType).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.Quantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.PeggingSourceType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.TargetDocumentType).HasMaxLength(32);
        builder.HasIndex(entity => new { entity.CompanyId, entity.PlannedOrderNo }).IsUnique();
    }
}

public sealed class ShortageActionConfiguration : IEntityTypeConfiguration<ShortageAction>
{
    public void Configure(EntityTypeBuilder<ShortageAction> builder)
    {
        builder.ToTable("ShortageActions", "planning");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ShortageQuantity).HasColumnType("decimal(18,6)");
        builder.Property(entity => entity.ActionType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.ReasonCode).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(24).IsRequired();
        builder.Property(entity => entity.ResolutionNote).HasMaxLength(512);
    }
}
