using STS.Mfg.Domain.Abstractions;

namespace STS.Mfg.Domain.Masters;

public sealed class ItemGroup : AuditableEntity, ICompanyScoped
{
    private ItemGroup()
    {
    }

    public long? CompanyId { get; private set; }
    public string ItemGroupCode { get; private set; } = string.Empty;
    public string ItemGroupName { get; private set; } = string.Empty;
    public long? ParentItemGroupId { get; private set; }
    public long? DefaultMeasurementProfileId { get; private set; }
    public bool DefaultQcRequired { get; private set; }
    public string DefaultTraceabilityMode { get; private set; } = string.Empty;
    public string Status { get; private set; } = string.Empty;

    public static ItemGroup Create(
        long? companyId,
        string itemGroupCode,
        string itemGroupName,
        long? parentItemGroupId,
        long? defaultMeasurementProfileId,
        bool defaultQcRequired,
        string defaultTraceabilityMode,
        string status,
        long? userId)
    {
        var entity = new ItemGroup { CompanyId = companyId };
        entity.Update(itemGroupCode, itemGroupName, parentItemGroupId, defaultMeasurementProfileId, defaultQcRequired, defaultTraceabilityMode, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string itemGroupCode, string itemGroupName, long? parentItemGroupId, long? defaultMeasurementProfileId, bool defaultQcRequired, string defaultTraceabilityMode, string status, long? userId)
    {
        ItemGroupCode = itemGroupCode.Trim();
        ItemGroupName = itemGroupName.Trim();
        ParentItemGroupId = parentItemGroupId;
        DefaultMeasurementProfileId = defaultMeasurementProfileId;
        DefaultQcRequired = defaultQcRequired;
        DefaultTraceabilityMode = defaultTraceabilityMode.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class Item : AuditableEntity, ICompanyScoped, IBranchScoped, IWarehouseScoped
{
    private Item()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId => null;
    public long? WarehouseId => DefaultWarehouseId;
    public string ItemCode { get; private set; } = string.Empty;
    public string ItemName { get; private set; } = string.Empty;
    public string? ShortName { get; private set; }
    public string ItemType { get; private set; } = string.Empty;
    public long ItemGroupId { get; private set; }
    public long MeasurementProfileId { get; private set; }
    public long StockUomId { get; private set; }
    public long? PurchaseUomId { get; private set; }
    public long? SalesUomId { get; private set; }
    public long? ProductionUomId { get; private set; }
    public long? QcUomId { get; private set; }
    public string TraceabilityMode { get; private set; } = string.Empty;
    public bool IsCatchWeightItem { get; private set; }
    public bool IsQcRequired { get; private set; }
    public bool IsBatchExpiryTracked { get; private set; }
    public string DefaultIssueMethod { get; private set; } = string.Empty;
    public string DefaultMakeType { get; private set; } = string.Empty;
    public long? DefaultWarehouseId { get; private set; }
    public long? DefaultBinId { get; private set; }
    public int LeadTimeDays { get; private set; }
    public string ReorderPolicy { get; private set; } = string.Empty;
    public string Status { get; private set; } = string.Empty;

    public static Item Create(
        long companyId,
        string itemCode,
        string itemName,
        string? shortName,
        string itemType,
        long itemGroupId,
        long measurementProfileId,
        long stockUomId,
        long? purchaseUomId,
        long? salesUomId,
        long? productionUomId,
        long? qcUomId,
        string traceabilityMode,
        bool isCatchWeightItem,
        bool isQcRequired,
        bool isBatchExpiryTracked,
        string defaultIssueMethod,
        string defaultMakeType,
        long? defaultWarehouseId,
        long? defaultBinId,
        int leadTimeDays,
        string reorderPolicy,
        string status,
        long? userId)
    {
        var entity = new Item
        {
            CompanyId = companyId,
            ItemGroupId = itemGroupId,
            MeasurementProfileId = measurementProfileId,
            StockUomId = stockUomId
        };
        entity.Update(itemCode, itemName, shortName, itemType, purchaseUomId, salesUomId, productionUomId, qcUomId, traceabilityMode, isCatchWeightItem, isQcRequired, isBatchExpiryTracked, defaultIssueMethod, defaultMakeType, defaultWarehouseId, defaultBinId, leadTimeDays, reorderPolicy, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string itemCode,
        string itemName,
        string? shortName,
        string itemType,
        long? purchaseUomId,
        long? salesUomId,
        long? productionUomId,
        long? qcUomId,
        string traceabilityMode,
        bool isCatchWeightItem,
        bool isQcRequired,
        bool isBatchExpiryTracked,
        string defaultIssueMethod,
        string defaultMakeType,
        long? defaultWarehouseId,
        long? defaultBinId,
        int leadTimeDays,
        string reorderPolicy,
        string status,
        long? userId)
    {
        ItemCode = itemCode.Trim();
        ItemName = itemName.Trim();
        ShortName = string.IsNullOrWhiteSpace(shortName) ? null : shortName.Trim();
        ItemType = itemType.Trim();
        PurchaseUomId = purchaseUomId;
        SalesUomId = salesUomId;
        ProductionUomId = productionUomId;
        QcUomId = qcUomId;
        TraceabilityMode = traceabilityMode.Trim();
        IsCatchWeightItem = isCatchWeightItem;
        IsQcRequired = isQcRequired;
        IsBatchExpiryTracked = isBatchExpiryTracked;
        DefaultIssueMethod = defaultIssueMethod.Trim();
        DefaultMakeType = defaultMakeType.Trim();
        DefaultWarehouseId = defaultWarehouseId;
        DefaultBinId = defaultBinId;
        LeadTimeDays = leadTimeDays;
        ReorderPolicy = reorderPolicy.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class ItemVariant : AuditableEntity, ICompanyScoped
{
    private ItemVariant()
    {
    }

    public long? CompanyId { get; private set; }
    public long ItemId { get; private set; }
    public string VariantCode { get; private set; } = string.Empty;
    public string VariantName { get; private set; } = string.Empty;
    public string VariantKey { get; private set; } = string.Empty;
    public string? VariantAttributeSummary { get; private set; }
    public string VariantAttributeMapJson { get; private set; } = string.Empty;
    public long? OverrideMeasurementProfileId { get; private set; }
    public long? OverrideStockUomId { get; private set; }
    public decimal? OverrideWeightPerUnit { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static ItemVariant Create(
        long companyId,
        long itemId,
        string variantCode,
        string variantName,
        string variantKey,
        string? variantAttributeSummary,
        string variantAttributeMapJson,
        long? overrideMeasurementProfileId,
        long? overrideStockUomId,
        decimal? overrideWeightPerUnit,
        string status,
        long? userId)
    {
        var entity = new ItemVariant { CompanyId = companyId, ItemId = itemId };
        entity.Update(variantCode, variantName, variantKey, variantAttributeSummary, variantAttributeMapJson, overrideMeasurementProfileId, overrideStockUomId, overrideWeightPerUnit, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string variantCode, string variantName, string variantKey, string? variantAttributeSummary, string variantAttributeMapJson, long? overrideMeasurementProfileId, long? overrideStockUomId, decimal? overrideWeightPerUnit, string status, long? userId)
    {
        VariantCode = variantCode.Trim();
        VariantName = variantName.Trim();
        VariantKey = variantKey.Trim();
        VariantAttributeSummary = string.IsNullOrWhiteSpace(variantAttributeSummary) ? null : variantAttributeSummary.Trim();
        VariantAttributeMapJson = variantAttributeMapJson.Trim();
        OverrideMeasurementProfileId = overrideMeasurementProfileId;
        OverrideStockUomId = overrideStockUomId;
        OverrideWeightPerUnit = overrideWeightPerUnit;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class ItemUom : AuditableEntity, ICompanyScoped
{
    private ItemUom()
    {
    }

    public long? CompanyId { get; private set; }
    public long ItemId { get; private set; }
    public long? ItemVariantId { get; private set; }
    public string UomRole { get; private set; } = string.Empty;
    public long UomId { get; private set; }
    public decimal BaseToThisNumerator { get; private set; }
    public decimal BaseToThisDenominator { get; private set; }
    public long? MeasurementFormulaId { get; private set; }
    public bool IsDefault { get; private set; }
    public bool IsCatchWeightActualUom { get; private set; }
    public decimal? MinOrderQty { get; private set; }
    public int RoundingScale { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static ItemUom Create(
        long companyId,
        long itemId,
        long? itemVariantId,
        string uomRole,
        long uomId,
        decimal baseToThisNumerator,
        decimal baseToThisDenominator,
        long? measurementFormulaId,
        bool isDefault,
        bool isCatchWeightActualUom,
        decimal? minOrderQty,
        int roundingScale,
        string status,
        long? userId)
    {
        var entity = new ItemUom { CompanyId = companyId, ItemId = itemId, ItemVariantId = itemVariantId, UomId = uomId };
        entity.Update(uomRole, baseToThisNumerator, baseToThisDenominator, measurementFormulaId, isDefault, isCatchWeightActualUom, minOrderQty, roundingScale, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string uomRole, decimal baseToThisNumerator, decimal baseToThisDenominator, long? measurementFormulaId, bool isDefault, bool isCatchWeightActualUom, decimal? minOrderQty, int roundingScale, string status, long? userId)
    {
        UomRole = uomRole.Trim();
        BaseToThisNumerator = baseToThisNumerator;
        BaseToThisDenominator = baseToThisDenominator;
        MeasurementFormulaId = measurementFormulaId;
        IsDefault = isDefault;
        IsCatchWeightActualUom = isCatchWeightActualUom;
        MinOrderQty = minOrderQty;
        RoundingScale = roundingScale;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class ItemBarcode : AuditableEntity, ICompanyScoped
{
    private ItemBarcode()
    {
    }

    public long? CompanyId { get; private set; }
    public long ItemId { get; private set; }
    public long? ItemVariantId { get; private set; }
    public long? UomId { get; private set; }
    public string BarcodeValue { get; private set; } = string.Empty;
    public string BarcodeType { get; private set; } = string.Empty;
    public string ScanPurpose { get; private set; } = string.Empty;
    public int PreferenceRank { get; private set; }
    public bool IsPrimary { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static ItemBarcode Create(
        long companyId,
        long itemId,
        long? itemVariantId,
        long? uomId,
        string barcodeValue,
        string barcodeType,
        string scanPurpose,
        int preferenceRank,
        bool isPrimary,
        string status,
        long? userId)
    {
        var entity = new ItemBarcode { CompanyId = companyId, ItemId = itemId, ItemVariantId = itemVariantId, UomId = uomId };
        entity.Update(barcodeValue, barcodeType, scanPurpose, preferenceRank, isPrimary, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string barcodeValue, string barcodeType, string scanPurpose, int preferenceRank, bool isPrimary, string status, long? userId)
    {
        BarcodeValue = barcodeValue.Trim();
        BarcodeType = barcodeType.Trim();
        ScanPurpose = scanPurpose.Trim();
        PreferenceRank = preferenceRank;
        IsPrimary = isPrimary;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class ItemAlias : AuditableEntity, ICompanyScoped
{
    private ItemAlias()
    {
    }

    public long? CompanyId { get; private set; }
    public long ItemId { get; private set; }
    public string AliasType { get; private set; } = string.Empty;
    public string AliasValue { get; private set; } = string.Empty;
    public string? LanguageCode { get; private set; }
    public bool IsPrimary { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static ItemAlias Create(long companyId, long itemId, string aliasType, string aliasValue, string? languageCode, bool isPrimary, string status, long? userId)
    {
        var entity = new ItemAlias { CompanyId = companyId, ItemId = itemId };
        entity.Update(aliasType, aliasValue, languageCode, isPrimary, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string aliasType, string aliasValue, string? languageCode, bool isPrimary, string status, long? userId)
    {
        AliasType = aliasType.Trim();
        AliasValue = aliasValue.Trim();
        LanguageCode = string.IsNullOrWhiteSpace(languageCode) ? null : languageCode.Trim();
        IsPrimary = isPrimary;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class ItemMedia : AuditableEntity, ICompanyScoped
{
    private ItemMedia()
    {
    }

    public long? CompanyId { get; private set; }
    public long ItemId { get; private set; }
    public long? ItemVariantId { get; private set; }
    public string MediaType { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string? FileName { get; private set; }
    public string? MimeType { get; private set; }
    public string? StorageUri { get; private set; }
    public string? ThumbnailUri { get; private set; }
    public bool IsPrimary { get; private set; }
    public int SortOrder { get; private set; }
    public string ApprovalStatus { get; private set; } = string.Empty;
    public string VisibilityScope { get; private set; } = string.Empty;
    public DateTimeOffset? RetiredOnUtc { get; private set; }
    public string Status { get; private set; } = string.Empty;
}

public sealed class ItemDocument : AuditableEntity, ICompanyScoped
{
    private ItemDocument()
    {
    }

    public long? CompanyId { get; private set; }
    public long ItemId { get; private set; }
    public long? ItemVariantId { get; private set; }
    public string DocumentType { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string? DocumentNo { get; private set; }
    public string? RevisionCode { get; private set; }
    public string? FileName { get; private set; }
    public string? StorageUri { get; private set; }
    public string ApprovalStatus { get; private set; } = string.Empty;
    public string VisibilityScope { get; private set; } = string.Empty;
    public DateOnly? EffectiveFrom { get; private set; }
    public DateOnly? EffectiveTo { get; private set; }
    public DateOnly? ExpiresOn { get; private set; }
    public string Status { get; private set; } = string.Empty;
}

public sealed class ItemCatalog : AuditableEntity, ICompanyScoped
{
    private ItemCatalog()
    {
    }

    public long? CompanyId { get; private set; }
    public long ItemId { get; private set; }
    public string CatalogTitle { get; private set; } = string.Empty;
    public string? CatalogSection { get; private set; }
    public string? MarketingDescription { get; private set; }
    public string? CustomerVisibleSpecsJson { get; private set; }
    public string PublishStatus { get; private set; } = string.Empty;
    public bool IsCatalogVisible { get; private set; }
    public DateOnly? EffectiveFrom { get; private set; }
    public DateOnly? EffectiveTo { get; private set; }
    public string? PreviewSlug { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static ItemCatalog Create(long companyId, long itemId, string catalogTitle, string? catalogSection, string? marketingDescription, string? customerVisibleSpecsJson, string publishStatus, bool isCatalogVisible, DateOnly? effectiveFrom, DateOnly? effectiveTo, string? previewSlug, string status, long? userId)
    {
        var entity = new ItemCatalog { CompanyId = companyId, ItemId = itemId };
        entity.Update(catalogTitle, catalogSection, marketingDescription, customerVisibleSpecsJson, publishStatus, isCatalogVisible, effectiveFrom, effectiveTo, previewSlug, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string catalogTitle, string? catalogSection, string? marketingDescription, string? customerVisibleSpecsJson, string publishStatus, bool isCatalogVisible, DateOnly? effectiveFrom, DateOnly? effectiveTo, string? previewSlug, string status, long? userId)
    {
        CatalogTitle = catalogTitle.Trim();
        CatalogSection = string.IsNullOrWhiteSpace(catalogSection) ? null : catalogSection.Trim();
        MarketingDescription = string.IsNullOrWhiteSpace(marketingDescription) ? null : marketingDescription.Trim();
        CustomerVisibleSpecsJson = string.IsNullOrWhiteSpace(customerVisibleSpecsJson) ? null : customerVisibleSpecsJson.Trim();
        PublishStatus = publishStatus.Trim();
        IsCatalogVisible = isCatalogVisible;
        EffectiveFrom = effectiveFrom;
        EffectiveTo = effectiveTo;
        PreviewSlug = string.IsNullOrWhiteSpace(previewSlug) ? null : previewSlug.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class ItemPackaging : AuditableEntity, ICompanyScoped
{
    private ItemPackaging()
    {
    }

    public long? CompanyId { get; private set; }
    public long ItemId { get; private set; }
    public long? PackagingUomId { get; private set; }
    public decimal? InnerPackQty { get; private set; }
    public decimal? CartonQty { get; private set; }
    public decimal? PalletQty { get; private set; }
    public decimal? NetWeight { get; private set; }
    public decimal? GrossWeight { get; private set; }
    public long? WeightUomId { get; private set; }
    public decimal? LengthValue { get; private set; }
    public decimal? WidthValue { get; private set; }
    public decimal? HeightValue { get; private set; }
    public long? DimensionUomId { get; private set; }
    public int? LabelCount { get; private set; }
    public string? PackingInstructions { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static ItemPackaging Create(long companyId, long itemId, long? packagingUomId, decimal? innerPackQty, decimal? cartonQty, decimal? palletQty, decimal? netWeight, decimal? grossWeight, long? weightUomId, decimal? lengthValue, decimal? widthValue, decimal? heightValue, long? dimensionUomId, int? labelCount, string? packingInstructions, string status, long? userId)
    {
        var entity = new ItemPackaging { CompanyId = companyId, ItemId = itemId };
        entity.Update(packagingUomId, innerPackQty, cartonQty, palletQty, netWeight, grossWeight, weightUomId, lengthValue, widthValue, heightValue, dimensionUomId, labelCount, packingInstructions, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(long? packagingUomId, decimal? innerPackQty, decimal? cartonQty, decimal? palletQty, decimal? netWeight, decimal? grossWeight, long? weightUomId, decimal? lengthValue, decimal? widthValue, decimal? heightValue, long? dimensionUomId, int? labelCount, string? packingInstructions, string status, long? userId)
    {
        PackagingUomId = packagingUomId;
        InnerPackQty = innerPackQty;
        CartonQty = cartonQty;
        PalletQty = palletQty;
        NetWeight = netWeight;
        GrossWeight = grossWeight;
        WeightUomId = weightUomId;
        LengthValue = lengthValue;
        WidthValue = widthValue;
        HeightValue = heightValue;
        DimensionUomId = dimensionUomId;
        LabelCount = labelCount;
        PackingInstructions = string.IsNullOrWhiteSpace(packingInstructions) ? null : packingInstructions.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class ItemPhysicalSpecs : AuditableEntity, ICompanyScoped
{
    private ItemPhysicalSpecs()
    {
    }

    public long? CompanyId { get; private set; }
    public long ItemId { get; private set; }
    public decimal? LengthValue { get; private set; }
    public decimal? WidthValue { get; private set; }
    public decimal? HeightValue { get; private set; }
    public decimal? ThicknessValue { get; private set; }
    public long? DimensionUomId { get; private set; }
    public string? Grade { get; private set; }
    public string? Material { get; private set; }
    public string? ColorFinish { get; private set; }
    public int? ShelfLifeDays { get; private set; }
    public string? StorageCondition { get; private set; }
    public string? ToleranceNote { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static ItemPhysicalSpecs Create(long companyId, long itemId, decimal? lengthValue, decimal? widthValue, decimal? heightValue, decimal? thicknessValue, long? dimensionUomId, string? grade, string? material, string? colorFinish, int? shelfLifeDays, string? storageCondition, string? toleranceNote, string status, long? userId)
    {
        var entity = new ItemPhysicalSpecs { CompanyId = companyId, ItemId = itemId };
        entity.Update(lengthValue, widthValue, heightValue, thicknessValue, dimensionUomId, grade, material, colorFinish, shelfLifeDays, storageCondition, toleranceNote, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(decimal? lengthValue, decimal? widthValue, decimal? heightValue, decimal? thicknessValue, long? dimensionUomId, string? grade, string? material, string? colorFinish, int? shelfLifeDays, string? storageCondition, string? toleranceNote, string status, long? userId)
    {
        LengthValue = lengthValue;
        WidthValue = widthValue;
        HeightValue = heightValue;
        ThicknessValue = thicknessValue;
        DimensionUomId = dimensionUomId;
        Grade = string.IsNullOrWhiteSpace(grade) ? null : grade.Trim();
        Material = string.IsNullOrWhiteSpace(material) ? null : material.Trim();
        ColorFinish = string.IsNullOrWhiteSpace(colorFinish) ? null : colorFinish.Trim();
        ShelfLifeDays = shelfLifeDays;
        StorageCondition = string.IsNullOrWhiteSpace(storageCondition) ? null : storageCondition.Trim();
        ToleranceNote = string.IsNullOrWhiteSpace(toleranceNote) ? null : toleranceNote.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class ItemCustomerReference : AuditableEntity, ICompanyScoped
{
    private ItemCustomerReference()
    {
    }

    public long? CompanyId { get; private set; }
    public long ItemId { get; private set; }
    public long CustomerId { get; private set; }
    public string CustomerItemCode { get; private set; } = string.Empty;
    public string? DrawingNo { get; private set; }
    public string? RevisionCode { get; private set; }
    public string? PackagingOverride { get; private set; }
    public string? SpecificationOverride { get; private set; }
    public string ApprovalStatus { get; private set; } = string.Empty;
    public DateOnly? EffectiveFrom { get; private set; }
    public DateOnly? EffectiveTo { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static ItemCustomerReference Create(long companyId, long itemId, long customerId, string customerItemCode, string? drawingNo, string? revisionCode, string? packagingOverride, string? specificationOverride, string approvalStatus, DateOnly? effectiveFrom, DateOnly? effectiveTo, string status, long? userId)
    {
        var entity = new ItemCustomerReference { CompanyId = companyId, ItemId = itemId, CustomerId = customerId };
        entity.Update(customerItemCode, drawingNo, revisionCode, packagingOverride, specificationOverride, approvalStatus, effectiveFrom, effectiveTo, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string customerItemCode, string? drawingNo, string? revisionCode, string? packagingOverride, string? specificationOverride, string approvalStatus, DateOnly? effectiveFrom, DateOnly? effectiveTo, string status, long? userId)
    {
        CustomerItemCode = customerItemCode.Trim();
        DrawingNo = string.IsNullOrWhiteSpace(drawingNo) ? null : drawingNo.Trim();
        RevisionCode = string.IsNullOrWhiteSpace(revisionCode) ? null : revisionCode.Trim();
        PackagingOverride = string.IsNullOrWhiteSpace(packagingOverride) ? null : packagingOverride.Trim();
        SpecificationOverride = string.IsNullOrWhiteSpace(specificationOverride) ? null : specificationOverride.Trim();
        ApprovalStatus = approvalStatus.Trim();
        EffectiveFrom = effectiveFrom;
        EffectiveTo = effectiveTo;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class ItemVendorReference : AuditableEntity, ICompanyScoped
{
    private ItemVendorReference()
    {
    }

    public long? CompanyId { get; private set; }
    public long ItemId { get; private set; }
    public long SupplierId { get; private set; }
    public string VendorItemCode { get; private set; } = string.Empty;
    public decimal? MinimumOrderQty { get; private set; }
    public int? LeadTimeDays { get; private set; }
    public long? PurchaseUomId { get; private set; }
    public string? ComplianceStatus { get; private set; }
    public string? DocumentStatus { get; private set; }
    public DateOnly? EffectiveFrom { get; private set; }
    public DateOnly? EffectiveTo { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static ItemVendorReference Create(long companyId, long itemId, long supplierId, string vendorItemCode, decimal? minimumOrderQty, int? leadTimeDays, long? purchaseUomId, string? complianceStatus, string? documentStatus, DateOnly? effectiveFrom, DateOnly? effectiveTo, string status, long? userId)
    {
        var entity = new ItemVendorReference { CompanyId = companyId, ItemId = itemId, SupplierId = supplierId };
        entity.Update(vendorItemCode, minimumOrderQty, leadTimeDays, purchaseUomId, complianceStatus, documentStatus, effectiveFrom, effectiveTo, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string vendorItemCode, decimal? minimumOrderQty, int? leadTimeDays, long? purchaseUomId, string? complianceStatus, string? documentStatus, DateOnly? effectiveFrom, DateOnly? effectiveTo, string status, long? userId)
    {
        VendorItemCode = vendorItemCode.Trim();
        MinimumOrderQty = minimumOrderQty;
        LeadTimeDays = leadTimeDays;
        PurchaseUomId = purchaseUomId;
        ComplianceStatus = string.IsNullOrWhiteSpace(complianceStatus) ? null : complianceStatus.Trim();
        DocumentStatus = string.IsNullOrWhiteSpace(documentStatus) ? null : documentStatus.Trim();
        EffectiveFrom = effectiveFrom;
        EffectiveTo = effectiveTo;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class ItemManufacturingPolicy : AuditableEntity, ICompanyScoped
{
    private ItemManufacturingPolicy()
    {
    }

    public long? CompanyId { get; private set; }
    public long ItemId { get; private set; }
    public string BomPolicy { get; private set; } = string.Empty;
    public string RoutingPolicy { get; private set; } = string.Empty;
    public string IssueMethod { get; private set; } = string.Empty;
    public decimal? ScrapAllowancePercent { get; private set; }
    public string? OperationLinkage { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static ItemManufacturingPolicy Create(long companyId, long itemId, string bomPolicy, string routingPolicy, string issueMethod, decimal? scrapAllowancePercent, string? operationLinkage, string status, long? userId)
    {
        var entity = new ItemManufacturingPolicy { CompanyId = companyId, ItemId = itemId };
        entity.Update(bomPolicy, routingPolicy, issueMethod, scrapAllowancePercent, operationLinkage, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string bomPolicy, string routingPolicy, string issueMethod, decimal? scrapAllowancePercent, string? operationLinkage, string status, long? userId)
    {
        BomPolicy = bomPolicy.Trim();
        RoutingPolicy = routingPolicy.Trim();
        IssueMethod = issueMethod.Trim();
        ScrapAllowancePercent = scrapAllowancePercent;
        OperationLinkage = string.IsNullOrWhiteSpace(operationLinkage) ? null : operationLinkage.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class ItemPlanningPolicy : AuditableEntity, ICompanyScoped
{
    private ItemPlanningPolicy()
    {
    }

    public long? CompanyId { get; private set; }
    public long ItemId { get; private set; }
    public bool MrpEnabled { get; private set; }
    public decimal? SafetyStockQty { get; private set; }
    public decimal? ReorderPointQty { get; private set; }
    public decimal? MinimumQty { get; private set; }
    public decimal? MaximumQty { get; private set; }
    public int? LeadTimeDays { get; private set; }
    public decimal? LotSizeQty { get; private set; }
    public string? AbcClass { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static ItemPlanningPolicy Create(long companyId, long itemId, bool mrpEnabled, decimal? safetyStockQty, decimal? reorderPointQty, decimal? minimumQty, decimal? maximumQty, int? leadTimeDays, decimal? lotSizeQty, string? abcClass, string status, long? userId)
    {
        var entity = new ItemPlanningPolicy { CompanyId = companyId, ItemId = itemId };
        entity.Update(mrpEnabled, safetyStockQty, reorderPointQty, minimumQty, maximumQty, leadTimeDays, lotSizeQty, abcClass, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(bool mrpEnabled, decimal? safetyStockQty, decimal? reorderPointQty, decimal? minimumQty, decimal? maximumQty, int? leadTimeDays, decimal? lotSizeQty, string? abcClass, string status, long? userId)
    {
        MrpEnabled = mrpEnabled;
        SafetyStockQty = safetyStockQty;
        ReorderPointQty = reorderPointQty;
        MinimumQty = minimumQty;
        MaximumQty = maximumQty;
        LeadTimeDays = leadTimeDays;
        LotSizeQty = lotSizeQty;
        AbcClass = string.IsNullOrWhiteSpace(abcClass) ? null : abcClass.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class ItemInventoryPolicy : AuditableEntity, ICompanyScoped, IWarehouseScoped
{
    private ItemInventoryPolicy()
    {
    }

    public long? CompanyId { get; private set; }
    public long? WarehouseId => DefaultWarehouseId;
    public long ItemId { get; private set; }
    public long? DefaultWarehouseId { get; private set; }
    public long? DefaultBinId { get; private set; }
    public string SerialTrackingMode { get; private set; } = string.Empty;
    public string LotTrackingMode { get; private set; } = string.Empty;
    public bool IsCatchWeightItem { get; private set; }
    public string NegativeStockPolicy { get; private set; } = string.Empty;
    public string? ExpiryPolicy { get; private set; }
    public int? ShelfLifeDays { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static ItemInventoryPolicy Create(long companyId, long itemId, long? defaultWarehouseId, long? defaultBinId, string serialTrackingMode, string lotTrackingMode, bool isCatchWeightItem, string negativeStockPolicy, string? expiryPolicy, int? shelfLifeDays, string status, long? userId)
    {
        var entity = new ItemInventoryPolicy { CompanyId = companyId, ItemId = itemId };
        entity.Update(defaultWarehouseId, defaultBinId, serialTrackingMode, lotTrackingMode, isCatchWeightItem, negativeStockPolicy, expiryPolicy, shelfLifeDays, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(long? defaultWarehouseId, long? defaultBinId, string serialTrackingMode, string lotTrackingMode, bool isCatchWeightItem, string negativeStockPolicy, string? expiryPolicy, int? shelfLifeDays, string status, long? userId)
    {
        DefaultWarehouseId = defaultWarehouseId;
        DefaultBinId = defaultBinId;
        SerialTrackingMode = serialTrackingMode.Trim();
        LotTrackingMode = lotTrackingMode.Trim();
        IsCatchWeightItem = isCatchWeightItem;
        NegativeStockPolicy = negativeStockPolicy.Trim();
        ExpiryPolicy = string.IsNullOrWhiteSpace(expiryPolicy) ? null : expiryPolicy.Trim();
        ShelfLifeDays = shelfLifeDays;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class ItemQualityPolicy : AuditableEntity, ICompanyScoped
{
    private ItemQualityPolicy()
    {
    }

    public long? CompanyId { get; private set; }
    public long ItemId { get; private set; }
    public bool QcRequired { get; private set; }
    public long? InspectionPlanId { get; private set; }
    public string? InspectionPlanCode { get; private set; }
    public string? CertificateRequirement { get; private set; }
    public string? HoldRule { get; private set; }
    public string? TraceabilityDepth { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static ItemQualityPolicy Create(long companyId, long itemId, bool qcRequired, long? inspectionPlanId, string? inspectionPlanCode, string? certificateRequirement, string? holdRule, string? traceabilityDepth, string status, long? userId)
    {
        var entity = new ItemQualityPolicy { CompanyId = companyId, ItemId = itemId };
        entity.Update(qcRequired, inspectionPlanId, inspectionPlanCode, certificateRequirement, holdRule, traceabilityDepth, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(bool qcRequired, long? inspectionPlanId, string? inspectionPlanCode, string? certificateRequirement, string? holdRule, string? traceabilityDepth, string status, long? userId)
    {
        QcRequired = qcRequired;
        InspectionPlanId = inspectionPlanId;
        InspectionPlanCode = string.IsNullOrWhiteSpace(inspectionPlanCode) ? null : inspectionPlanCode.Trim();
        CertificateRequirement = string.IsNullOrWhiteSpace(certificateRequirement) ? null : certificateRequirement.Trim();
        HoldRule = string.IsNullOrWhiteSpace(holdRule) ? null : holdRule.Trim();
        TraceabilityDepth = string.IsNullOrWhiteSpace(traceabilityDepth) ? null : traceabilityDepth.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class Customer : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private Customer()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId => DefaultBranchId;
    public string CustomerCode { get; private set; } = string.Empty;
    public string CustomerName { get; private set; } = string.Empty;
    public string? ShortName { get; private set; }
    public string CustomerType { get; private set; } = string.Empty;
    public long? DefaultBranchId { get; private set; }
    public long? DefaultLanguageId { get; private set; }
    public string? TaxRegistrationNo { get; private set; }
    public string? PaymentTermsCode { get; private set; }
    public int? CreditDays { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static Customer Create(long companyId, string customerCode, string customerName, string? shortName, string customerType, long? defaultBranchId, long? defaultLanguageId, string? taxRegistrationNo, string? paymentTermsCode, int? creditDays, string status, long? userId)
    {
        var entity = new Customer { CompanyId = companyId };
        entity.Update(customerCode, customerName, shortName, customerType, defaultBranchId, defaultLanguageId, taxRegistrationNo, paymentTermsCode, creditDays, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string customerCode, string customerName, string? shortName, string customerType, long? defaultBranchId, long? defaultLanguageId, string? taxRegistrationNo, string? paymentTermsCode, int? creditDays, string status, long? userId)
    {
        CustomerCode = customerCode.Trim();
        CustomerName = customerName.Trim();
        ShortName = string.IsNullOrWhiteSpace(shortName) ? null : shortName.Trim();
        CustomerType = customerType.Trim();
        DefaultBranchId = defaultBranchId;
        DefaultLanguageId = defaultLanguageId;
        TaxRegistrationNo = string.IsNullOrWhiteSpace(taxRegistrationNo) ? null : taxRegistrationNo.Trim();
        PaymentTermsCode = string.IsNullOrWhiteSpace(paymentTermsCode) ? null : paymentTermsCode.Trim();
        CreditDays = creditDays;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class CustomerAddress : AuditableEntity, ICompanyScoped
{
    private CustomerAddress()
    {
    }

    public long? CompanyId { get; private set; }
    public long CustomerId { get; private set; }
    public string AddressCode { get; private set; } = string.Empty;
    public string AddressType { get; private set; } = string.Empty;
    public string AddressLine1 { get; private set; } = string.Empty;
    public string? AddressLine2 { get; private set; }
    public string City { get; private set; } = string.Empty;
    public string StateOrProvince { get; private set; } = string.Empty;
    public string PostalCode { get; private set; } = string.Empty;
    public string CountryCode { get; private set; } = string.Empty;
    public string? ContactName { get; private set; }
    public string? ContactEmail { get; private set; }
    public string? ContactPhone { get; private set; }
    public bool IsDefaultBilling { get; private set; }
    public bool IsDefaultShipping { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static CustomerAddress Create(long companyId, long customerId, string addressCode, string addressType, string addressLine1, string? addressLine2, string city, string stateOrProvince, string postalCode, string countryCode, string? contactName, string? contactEmail, string? contactPhone, bool isDefaultBilling, bool isDefaultShipping, string status, long? userId)
    {
        var entity = new CustomerAddress { CompanyId = companyId, CustomerId = customerId };
        entity.Update(addressCode, addressType, addressLine1, addressLine2, city, stateOrProvince, postalCode, countryCode, contactName, contactEmail, contactPhone, isDefaultBilling, isDefaultShipping, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string addressCode, string addressType, string addressLine1, string? addressLine2, string city, string stateOrProvince, string postalCode, string countryCode, string? contactName, string? contactEmail, string? contactPhone, bool isDefaultBilling, bool isDefaultShipping, string status, long? userId)
    {
        AddressCode = addressCode.Trim();
        AddressType = addressType.Trim();
        AddressLine1 = addressLine1.Trim();
        AddressLine2 = string.IsNullOrWhiteSpace(addressLine2) ? null : addressLine2.Trim();
        City = city.Trim();
        StateOrProvince = stateOrProvince.Trim();
        PostalCode = postalCode.Trim();
        CountryCode = countryCode.Trim();
        ContactName = string.IsNullOrWhiteSpace(contactName) ? null : contactName.Trim();
        ContactEmail = string.IsNullOrWhiteSpace(contactEmail) ? null : contactEmail.Trim();
        ContactPhone = string.IsNullOrWhiteSpace(contactPhone) ? null : contactPhone.Trim();
        IsDefaultBilling = isDefaultBilling;
        IsDefaultShipping = isDefaultShipping;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class Supplier : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private Supplier()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId => DefaultBranchId;
    public string SupplierCode { get; private set; } = string.Empty;
    public string SupplierName { get; private set; } = string.Empty;
    public string SupplierType { get; private set; } = string.Empty;
    public bool SupportsSubcontracting { get; private set; }
    public long? DefaultBranchId { get; private set; }
    public long? DefaultLanguageId { get; private set; }
    public string? TaxRegistrationNo { get; private set; }
    public string? PaymentTermsCode { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static Supplier Create(long companyId, string supplierCode, string supplierName, string supplierType, bool supportsSubcontracting, long? defaultBranchId, long? defaultLanguageId, string? taxRegistrationNo, string? paymentTermsCode, string status, long? userId)
    {
        var entity = new Supplier { CompanyId = companyId };
        entity.Update(supplierCode, supplierName, supplierType, supportsSubcontracting, defaultBranchId, defaultLanguageId, taxRegistrationNo, paymentTermsCode, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string supplierCode, string supplierName, string supplierType, bool supportsSubcontracting, long? defaultBranchId, long? defaultLanguageId, string? taxRegistrationNo, string? paymentTermsCode, string status, long? userId)
    {
        SupplierCode = supplierCode.Trim();
        SupplierName = supplierName.Trim();
        SupplierType = supplierType.Trim();
        SupportsSubcontracting = supportsSubcontracting;
        DefaultBranchId = defaultBranchId;
        DefaultLanguageId = defaultLanguageId;
        TaxRegistrationNo = string.IsNullOrWhiteSpace(taxRegistrationNo) ? null : taxRegistrationNo.Trim();
        PaymentTermsCode = string.IsNullOrWhiteSpace(paymentTermsCode) ? null : paymentTermsCode.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class SupplierAddress : AuditableEntity, ICompanyScoped
{
    private SupplierAddress()
    {
    }

    public long? CompanyId { get; private set; }
    public long SupplierId { get; private set; }
    public string AddressCode { get; private set; } = string.Empty;
    public string AddressType { get; private set; } = string.Empty;
    public string AddressLine1 { get; private set; } = string.Empty;
    public string City { get; private set; } = string.Empty;
    public string StateOrProvince { get; private set; } = string.Empty;
    public string PostalCode { get; private set; } = string.Empty;
    public string CountryCode { get; private set; } = string.Empty;
    public string? ContactName { get; private set; }
    public string? ContactEmail { get; private set; }
    public string? ContactPhone { get; private set; }
    public bool IsDefaultOrderAddress { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static SupplierAddress Create(long companyId, long supplierId, string addressCode, string addressType, string addressLine1, string city, string stateOrProvince, string postalCode, string countryCode, string? contactName, string? contactEmail, string? contactPhone, bool isDefaultOrderAddress, string status, long? userId)
    {
        var entity = new SupplierAddress { CompanyId = companyId, SupplierId = supplierId };
        entity.Update(addressCode, addressType, addressLine1, city, stateOrProvince, postalCode, countryCode, contactName, contactEmail, contactPhone, isDefaultOrderAddress, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string addressCode, string addressType, string addressLine1, string city, string stateOrProvince, string postalCode, string countryCode, string? contactName, string? contactEmail, string? contactPhone, bool isDefaultOrderAddress, string status, long? userId)
    {
        AddressCode = addressCode.Trim();
        AddressType = addressType.Trim();
        AddressLine1 = addressLine1.Trim();
        City = city.Trim();
        StateOrProvince = stateOrProvince.Trim();
        PostalCode = postalCode.Trim();
        CountryCode = countryCode.Trim();
        ContactName = string.IsNullOrWhiteSpace(contactName) ? null : contactName.Trim();
        ContactEmail = string.IsNullOrWhiteSpace(contactEmail) ? null : contactEmail.Trim();
        ContactPhone = string.IsNullOrWhiteSpace(contactPhone) ? null : contactPhone.Trim();
        IsDefaultOrderAddress = isDefaultOrderAddress;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class SupplierLeadTime : AuditableEntity, ICompanyScoped, IBranchScoped
{
    private SupplierLeadTime()
    {
    }

    public long? CompanyId { get; private set; }
    public long? BranchId { get; private set; }
    public long SupplierId { get; private set; }
    public long? ItemId { get; private set; }
    public long? ItemGroupId { get; private set; }
    public int LeadTimeDays { get; private set; }
    public decimal? MinOrderQty { get; private set; }
    public decimal? OrderMultipleQty { get; private set; }
    public bool IsSubcontractLeadTime { get; private set; }
    public int PriorityRank { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static SupplierLeadTime Create(long companyId, long supplierId, long? branchId, long? itemId, long? itemGroupId, int leadTimeDays, decimal? minOrderQty, decimal? orderMultipleQty, bool isSubcontractLeadTime, int priorityRank, string status, long? userId)
    {
        var entity = new SupplierLeadTime { CompanyId = companyId, SupplierId = supplierId, BranchId = branchId, ItemId = itemId, ItemGroupId = itemGroupId };
        entity.Update(leadTimeDays, minOrderQty, orderMultipleQty, isSubcontractLeadTime, priorityRank, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(int leadTimeDays, decimal? minOrderQty, decimal? orderMultipleQty, bool isSubcontractLeadTime, int priorityRank, string status, long? userId)
    {
        LeadTimeDays = leadTimeDays;
        MinOrderQty = minOrderQty;
        OrderMultipleQty = orderMultipleQty;
        IsSubcontractLeadTime = isSubcontractLeadTime;
        PriorityRank = priorityRank;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class CustomerPartnerProfile : AuditableEntity, ICompanyScoped
{
    private CustomerPartnerProfile()
    {
    }

    public long? CompanyId { get; private set; }
    public long CustomerId { get; private set; }
    public string? LegalName { get; private set; }
    public string? TaxCategory { get; private set; }
    public string? CurrencyCode { get; private set; }
    public string? CreditStatus { get; private set; }
    public decimal? CreditLimitAmount { get; private set; }
    public string? CreditHoldRule { get; private set; }
    public string? PaymentTermsCode { get; private set; }
    public string? CommercialSegment { get; private set; }
    public string? OrderReleaseControl { get; private set; }
    public string? DispatchPreference { get; private set; }
    public string? DispatchInstruction { get; private set; }
    public bool CatalogVisible { get; private set; }
    public string? CatalogSegment { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static CustomerPartnerProfile Create(long companyId, long customerId, string? legalName, string? taxCategory, string? currencyCode, string? creditStatus, decimal? creditLimitAmount, string? creditHoldRule, string? paymentTermsCode, string? commercialSegment, string? orderReleaseControl, string? dispatchPreference, string? dispatchInstruction, bool catalogVisible, string? catalogSegment, string status, long? userId)
    {
        var entity = new CustomerPartnerProfile { CompanyId = companyId, CustomerId = customerId };
        entity.Update(legalName, taxCategory, currencyCode, creditStatus, creditLimitAmount, creditHoldRule, paymentTermsCode, commercialSegment, orderReleaseControl, dispatchPreference, dispatchInstruction, catalogVisible, catalogSegment, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string? legalName, string? taxCategory, string? currencyCode, string? creditStatus, decimal? creditLimitAmount, string? creditHoldRule, string? paymentTermsCode, string? commercialSegment, string? orderReleaseControl, string? dispatchPreference, string? dispatchInstruction, bool catalogVisible, string? catalogSegment, string status, long? userId)
    {
        LegalName = Clean(legalName);
        TaxCategory = Clean(taxCategory);
        CurrencyCode = Clean(currencyCode);
        CreditStatus = Clean(creditStatus);
        CreditLimitAmount = creditLimitAmount;
        CreditHoldRule = Clean(creditHoldRule);
        PaymentTermsCode = Clean(paymentTermsCode);
        CommercialSegment = Clean(commercialSegment);
        OrderReleaseControl = Clean(orderReleaseControl);
        DispatchPreference = Clean(dispatchPreference);
        DispatchInstruction = Clean(dispatchInstruction);
        CatalogVisible = catalogVisible;
        CatalogSegment = Clean(catalogSegment);
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}

public sealed class CustomerContactPoint : AuditableEntity, ICompanyScoped
{
    private CustomerContactPoint()
    {
    }

    public long? CompanyId { get; private set; }
    public long CustomerId { get; private set; }
    public long? CustomerAddressId { get; private set; }
    public string ContactName { get; private set; } = string.Empty;
    public string ContactRole { get; private set; } = string.Empty;
    public string Channel { get; private set; } = string.Empty;
    public string ContactValue { get; private set; } = string.Empty;
    public bool IsPrimary { get; private set; }
    public string? ConsentStatus { get; private set; }
    public string? EscalationLevel { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static CustomerContactPoint Create(long companyId, long customerId, long? customerAddressId, string contactName, string contactRole, string channel, string contactValue, bool isPrimary, string? consentStatus, string? escalationLevel, string status, long? userId)
    {
        var entity = new CustomerContactPoint { CompanyId = companyId, CustomerId = customerId };
        entity.Update(customerAddressId, contactName, contactRole, channel, contactValue, isPrimary, consentStatus, escalationLevel, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(long? customerAddressId, string contactName, string contactRole, string channel, string contactValue, bool isPrimary, string? consentStatus, string? escalationLevel, string status, long? userId)
    {
        CustomerAddressId = customerAddressId;
        ContactName = contactName.Trim();
        ContactRole = contactRole.Trim();
        Channel = channel.Trim();
        ContactValue = contactValue.Trim();
        IsPrimary = isPrimary;
        ConsentStatus = Clean(consentStatus);
        EscalationLevel = Clean(escalationLevel);
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}

public sealed class CustomerItemReferenceProfile : AuditableEntity, ICompanyScoped
{
    private CustomerItemReferenceProfile()
    {
    }

    public long? CompanyId { get; private set; }
    public long CustomerId { get; private set; }
    public long? ItemId { get; private set; }
    public string CustomerItemCode { get; private set; } = string.Empty;
    public string? DrawingNo { get; private set; }
    public string? RevisionCode { get; private set; }
    public string? PackagingOverride { get; private set; }
    public string? SpecificationOverride { get; private set; }
    public string ApprovalStatus { get; private set; } = string.Empty;
    public string Status { get; private set; } = string.Empty;

    public static CustomerItemReferenceProfile Create(long companyId, long customerId, long? itemId, string customerItemCode, string? drawingNo, string? revisionCode, string? packagingOverride, string? specificationOverride, string approvalStatus, string status, long? userId)
    {
        var entity = new CustomerItemReferenceProfile { CompanyId = companyId, CustomerId = customerId, ItemId = itemId };
        entity.Update(customerItemCode, drawingNo, revisionCode, packagingOverride, specificationOverride, approvalStatus, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string customerItemCode, string? drawingNo, string? revisionCode, string? packagingOverride, string? specificationOverride, string approvalStatus, string status, long? userId)
    {
        CustomerItemCode = customerItemCode.Trim();
        DrawingNo = Clean(drawingNo);
        RevisionCode = Clean(revisionCode);
        PackagingOverride = Clean(packagingOverride);
        SpecificationOverride = Clean(specificationOverride);
        ApprovalStatus = approvalStatus.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}

public sealed class CustomerDocument : AuditableEntity, ICompanyScoped
{
    private CustomerDocument()
    {
    }

    public long? CompanyId { get; private set; }
    public long CustomerId { get; private set; }
    public string DocumentType { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string? DocumentNo { get; private set; }
    public string? RevisionCode { get; private set; }
    public string? FileName { get; private set; }
    public string? StorageUri { get; private set; }
    public string ApprovalStatus { get; private set; } = string.Empty;
    public string VisibilityScope { get; private set; } = string.Empty;
    public DateOnly? EffectiveFrom { get; private set; }
    public DateOnly? EffectiveTo { get; private set; }
    public DateOnly? ExpiresOn { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static CustomerDocument Create(long companyId, long customerId, string documentType, string title, string? documentNo, string? revisionCode, string? fileName, string? storageUri, string approvalStatus, string visibilityScope, DateOnly? effectiveFrom, DateOnly? effectiveTo, DateOnly? expiresOn, string status, long? userId)
    {
        var entity = new CustomerDocument { CompanyId = companyId, CustomerId = customerId };
        entity.Update(documentType, title, documentNo, revisionCode, fileName, storageUri, approvalStatus, visibilityScope, effectiveFrom, effectiveTo, expiresOn, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string documentType, string title, string? documentNo, string? revisionCode, string? fileName, string? storageUri, string approvalStatus, string visibilityScope, DateOnly? effectiveFrom, DateOnly? effectiveTo, DateOnly? expiresOn, string status, long? userId)
    {
        DocumentType = documentType.Trim();
        Title = title.Trim();
        DocumentNo = Clean(documentNo);
        RevisionCode = Clean(revisionCode);
        FileName = Clean(fileName);
        StorageUri = Clean(storageUri);
        ApprovalStatus = approvalStatus.Trim();
        VisibilityScope = visibilityScope.Trim();
        EffectiveFrom = effectiveFrom;
        EffectiveTo = effectiveTo;
        ExpiresOn = expiresOn;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}

public sealed class SupplierPartnerProfile : AuditableEntity, ICompanyScoped
{
    private SupplierPartnerProfile()
    {
    }

    public long? CompanyId { get; private set; }
    public long SupplierId { get; private set; }
    public string? LegalName { get; private set; }
    public string? TaxCategory { get; private set; }
    public string? CurrencyCode { get; private set; }
    public string? PaymentTermsCode { get; private set; }
    public string? PreferredStatus { get; private set; }
    public string? ComplianceStatus { get; private set; }
    public string? CapabilitySummary { get; private set; }
    public decimal? QualityRating { get; private set; }
    public string? ProcurementReleaseControl { get; private set; }
    public int? LeadTimeReviewDays { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static SupplierPartnerProfile Create(long companyId, long supplierId, string? legalName, string? taxCategory, string? currencyCode, string? paymentTermsCode, string? preferredStatus, string? complianceStatus, string? capabilitySummary, decimal? qualityRating, string? procurementReleaseControl, int? leadTimeReviewDays, string status, long? userId)
    {
        var entity = new SupplierPartnerProfile { CompanyId = companyId, SupplierId = supplierId };
        entity.Update(legalName, taxCategory, currencyCode, paymentTermsCode, preferredStatus, complianceStatus, capabilitySummary, qualityRating, procurementReleaseControl, leadTimeReviewDays, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string? legalName, string? taxCategory, string? currencyCode, string? paymentTermsCode, string? preferredStatus, string? complianceStatus, string? capabilitySummary, decimal? qualityRating, string? procurementReleaseControl, int? leadTimeReviewDays, string status, long? userId)
    {
        LegalName = Clean(legalName);
        TaxCategory = Clean(taxCategory);
        CurrencyCode = Clean(currencyCode);
        PaymentTermsCode = Clean(paymentTermsCode);
        PreferredStatus = Clean(preferredStatus);
        ComplianceStatus = Clean(complianceStatus);
        CapabilitySummary = Clean(capabilitySummary);
        QualityRating = qualityRating;
        ProcurementReleaseControl = Clean(procurementReleaseControl);
        LeadTimeReviewDays = leadTimeReviewDays;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}

public sealed class SupplierContactPoint : AuditableEntity, ICompanyScoped
{
    private SupplierContactPoint()
    {
    }

    public long? CompanyId { get; private set; }
    public long SupplierId { get; private set; }
    public long? SupplierAddressId { get; private set; }
    public string ContactName { get; private set; } = string.Empty;
    public string ContactRole { get; private set; } = string.Empty;
    public string Channel { get; private set; } = string.Empty;
    public string ContactValue { get; private set; } = string.Empty;
    public bool IsPrimary { get; private set; }
    public string? ConsentStatus { get; private set; }
    public string? EscalationLevel { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static SupplierContactPoint Create(long companyId, long supplierId, long? supplierAddressId, string contactName, string contactRole, string channel, string contactValue, bool isPrimary, string? consentStatus, string? escalationLevel, string status, long? userId)
    {
        var entity = new SupplierContactPoint { CompanyId = companyId, SupplierId = supplierId };
        entity.Update(supplierAddressId, contactName, contactRole, channel, contactValue, isPrimary, consentStatus, escalationLevel, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(long? supplierAddressId, string contactName, string contactRole, string channel, string contactValue, bool isPrimary, string? consentStatus, string? escalationLevel, string status, long? userId)
    {
        SupplierAddressId = supplierAddressId;
        ContactName = contactName.Trim();
        ContactRole = contactRole.Trim();
        Channel = channel.Trim();
        ContactValue = contactValue.Trim();
        IsPrimary = isPrimary;
        ConsentStatus = Clean(consentStatus);
        EscalationLevel = Clean(escalationLevel);
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}

public sealed class SupplierVendorReferenceProfile : AuditableEntity, ICompanyScoped
{
    private SupplierVendorReferenceProfile()
    {
    }

    public long? CompanyId { get; private set; }
    public long SupplierId { get; private set; }
    public long? ItemId { get; private set; }
    public string VendorItemCode { get; private set; } = string.Empty;
    public decimal? MinimumOrderQty { get; private set; }
    public int? LeadTimeDays { get; private set; }
    public long? PurchaseUomId { get; private set; }
    public string? ComplianceStatus { get; private set; }
    public string? DocumentStatus { get; private set; }
    public string ApprovalStatus { get; private set; } = string.Empty;
    public string Status { get; private set; } = string.Empty;

    public static SupplierVendorReferenceProfile Create(long companyId, long supplierId, long? itemId, string vendorItemCode, decimal? minimumOrderQty, int? leadTimeDays, long? purchaseUomId, string? complianceStatus, string? documentStatus, string approvalStatus, string status, long? userId)
    {
        var entity = new SupplierVendorReferenceProfile { CompanyId = companyId, SupplierId = supplierId, ItemId = itemId };
        entity.Update(vendorItemCode, minimumOrderQty, leadTimeDays, purchaseUomId, complianceStatus, documentStatus, approvalStatus, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string vendorItemCode, decimal? minimumOrderQty, int? leadTimeDays, long? purchaseUomId, string? complianceStatus, string? documentStatus, string approvalStatus, string status, long? userId)
    {
        VendorItemCode = vendorItemCode.Trim();
        MinimumOrderQty = minimumOrderQty;
        LeadTimeDays = leadTimeDays;
        PurchaseUomId = purchaseUomId;
        ComplianceStatus = Clean(complianceStatus);
        DocumentStatus = Clean(documentStatus);
        ApprovalStatus = approvalStatus.Trim();
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}

public sealed class SupplierDocument : AuditableEntity, ICompanyScoped
{
    private SupplierDocument()
    {
    }

    public long? CompanyId { get; private set; }
    public long SupplierId { get; private set; }
    public string DocumentType { get; private set; } = string.Empty;
    public string Title { get; private set; } = string.Empty;
    public string? DocumentNo { get; private set; }
    public string? RevisionCode { get; private set; }
    public string? FileName { get; private set; }
    public string? StorageUri { get; private set; }
    public string ApprovalStatus { get; private set; } = string.Empty;
    public string VisibilityScope { get; private set; } = string.Empty;
    public DateOnly? EffectiveFrom { get; private set; }
    public DateOnly? EffectiveTo { get; private set; }
    public DateOnly? ExpiresOn { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static SupplierDocument Create(long companyId, long supplierId, string documentType, string title, string? documentNo, string? revisionCode, string? fileName, string? storageUri, string approvalStatus, string visibilityScope, DateOnly? effectiveFrom, DateOnly? effectiveTo, DateOnly? expiresOn, string status, long? userId)
    {
        var entity = new SupplierDocument { CompanyId = companyId, SupplierId = supplierId };
        entity.Update(documentType, title, documentNo, revisionCode, fileName, storageUri, approvalStatus, visibilityScope, effectiveFrom, effectiveTo, expiresOn, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string documentType, string title, string? documentNo, string? revisionCode, string? fileName, string? storageUri, string approvalStatus, string visibilityScope, DateOnly? effectiveFrom, DateOnly? effectiveTo, DateOnly? expiresOn, string status, long? userId)
    {
        DocumentType = documentType.Trim();
        Title = title.Trim();
        DocumentNo = Clean(documentNo);
        RevisionCode = Clean(revisionCode);
        FileName = Clean(fileName);
        StorageUri = Clean(storageUri);
        ApprovalStatus = approvalStatus.Trim();
        VisibilityScope = visibilityScope.Trim();
        EffectiveFrom = effectiveFrom;
        EffectiveTo = effectiveTo;
        ExpiresOn = expiresOn;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }

    private static string? Clean(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
