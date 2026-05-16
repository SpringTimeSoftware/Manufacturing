using STS.Mfg.Application.Contracts;

namespace STS.Mfg.Application.Contracts.Masters;

public sealed record CompanyScopedFilter(
    int Page = 1,
    int PageSize = 25,
    string? Search = null,
    string? Status = null,
    long? CompanyId = null,
    long? BranchId = null) : QueryFilter(Page, PageSize, Search, Status);

public sealed record ItemDto(
    long Id,
    long CompanyId,
    string ItemCode,
    string ItemName,
    string? ShortName,
    string ItemType,
    long ItemGroupId,
    long MeasurementProfileId,
    long StockUomId,
    long? PurchaseUomId,
    long? SalesUomId,
    long? ProductionUomId,
    long? QcUomId,
    string TraceabilityMode,
    bool IsCatchWeightItem,
    bool IsQcRequired,
    bool IsBatchExpiryTracked,
    string DefaultIssueMethod,
    string DefaultMakeType,
    long? DefaultWarehouseId,
    long? DefaultBinId,
    int LeadTimeDays,
    string ReorderPolicy,
    string Status);

public sealed record ItemUpsertRequest(
    long CompanyId,
    string ItemCode,
    string ItemName,
    string? ShortName,
    string ItemType,
    long ItemGroupId,
    long MeasurementProfileId,
    long StockUomId,
    long? PurchaseUomId,
    long? SalesUomId,
    long? ProductionUomId,
    long? QcUomId,
    string TraceabilityMode,
    bool IsCatchWeightItem,
    bool IsQcRequired,
    bool IsBatchExpiryTracked,
    string DefaultIssueMethod,
    string DefaultMakeType,
    long? DefaultWarehouseId,
    long? DefaultBinId,
    int LeadTimeDays,
    string ReorderPolicy,
    string Status);

public sealed record ItemLookupDto(long Id, string ItemCode, string ItemName, string ItemType, string Status);

public sealed record ItemAttributeDto(
    long Id,
    long? CompanyId,
    string AttributeCode,
    string AttributeName,
    string DataType,
    bool IsVariantAxis,
    long? UnitUomId,
    string Status,
    IReadOnlyCollection<ItemAttributeValueDto> Values);

public sealed record ItemAttributeUpsertRequest(
    long? CompanyId,
    string AttributeCode,
    string AttributeName,
    string DataType,
    bool IsVariantAxis,
    long? UnitUomId,
    string Status,
    IReadOnlyCollection<ItemAttributeValueUpsertRequest> Values);

public sealed record ItemAttributeValueDto(
    long Id,
    long ItemAttributeId,
    string AttributeValueCode,
    string AttributeValueName,
    int SortOrder,
    string Status);

public sealed record ItemAttributeValueUpsertRequest(
    long? Id,
    string AttributeValueCode,
    string AttributeValueName,
    int SortOrder,
    string Status);

public sealed record ItemVariantDto(
    long Id,
    long CompanyId,
    long ItemId,
    string VariantCode,
    string VariantName,
    string VariantKey,
    string? VariantAttributeSummary,
    string VariantAttributeMapJson,
    long? OverrideMeasurementProfileId,
    long? OverrideStockUomId,
    decimal? OverrideWeightPerUnit,
    string Status);

public sealed record ItemVariantUpsertRequest(
    long CompanyId,
    long ItemId,
    string VariantCode,
    string VariantName,
    string VariantKey,
    string? VariantAttributeSummary,
    string VariantAttributeMapJson,
    long? OverrideMeasurementProfileId,
    long? OverrideStockUomId,
    decimal? OverrideWeightPerUnit,
    string Status);

public sealed record ItemUomDto(
    long Id,
    long CompanyId,
    long ItemId,
    long? ItemVariantId,
    string UomRole,
    long UomId,
    decimal BaseToThisNumerator,
    decimal BaseToThisDenominator,
    long? MeasurementFormulaId,
    bool IsDefault,
    bool IsCatchWeightActualUom,
    decimal? MinOrderQty,
    int RoundingScale,
    string Status);

public sealed record ItemUomUpsertRequest(
    long CompanyId,
    long ItemId,
    long? ItemVariantId,
    string UomRole,
    long UomId,
    decimal BaseToThisNumerator,
    decimal BaseToThisDenominator,
    long? MeasurementFormulaId,
    bool IsDefault,
    bool IsCatchWeightActualUom,
    decimal? MinOrderQty,
    int RoundingScale,
    string Status);

public sealed record ItemBarcodeDto(
    long Id,
    long CompanyId,
    long ItemId,
    long? ItemVariantId,
    long? UomId,
    string BarcodeValue,
    string BarcodeType,
    string ScanPurpose,
    int PreferenceRank,
    bool IsPrimary,
    string Status);

public sealed record ItemBarcodeUpsertRequest(
    long CompanyId,
    long ItemId,
    long? ItemVariantId,
    long? UomId,
    string BarcodeValue,
    string BarcodeType,
    string ScanPurpose,
    int PreferenceRank,
    bool IsPrimary,
    string Status);

public sealed record BarcodeResolutionDto(
    long Id,
    long ItemId,
    long? ItemVariantId,
    long? UomId,
    string BarcodeValue,
    string ScanPurpose,
    string Status,
    string? ItemCode = null,
    string? ItemName = null,
    string? ItemVariantCode = null,
    string? ItemVariantName = null);

public sealed record ItemAliasDto(
    long Id,
    long CompanyId,
    long ItemId,
    string AliasType,
    string AliasValue,
    string? LanguageCode,
    bool IsPrimary,
    string Status);

public sealed record ItemMediaDto(
    long Id,
    long CompanyId,
    long ItemId,
    long? ItemVariantId,
    string MediaType,
    string Title,
    string? FileName,
    string? MimeType,
    string? StorageUri,
    string? ThumbnailUri,
    bool IsPrimary,
    int SortOrder,
    string ApprovalStatus,
    string VisibilityScope,
    DateTimeOffset? RetiredOnUtc,
    string Status);

public sealed record ItemDocumentDto(
    long Id,
    long CompanyId,
    long ItemId,
    long? ItemVariantId,
    string DocumentType,
    string Title,
    string? DocumentNo,
    string? RevisionCode,
    string? FileName,
    string? StorageUri,
    string ApprovalStatus,
    string VisibilityScope,
    DateOnly? EffectiveFrom,
    DateOnly? EffectiveTo,
    DateOnly? ExpiresOn,
    string Status);

public sealed record ItemCatalogDto(
    long Id,
    long CompanyId,
    long ItemId,
    string CatalogTitle,
    string? CatalogSection,
    string? MarketingDescription,
    string? CustomerVisibleSpecsJson,
    string PublishStatus,
    bool IsCatalogVisible,
    DateOnly? EffectiveFrom,
    DateOnly? EffectiveTo,
    string? PreviewSlug,
    string Status);

public sealed record ItemPackagingDto(
    long Id,
    long CompanyId,
    long ItemId,
    long? PackagingUomId,
    decimal? InnerPackQty,
    decimal? CartonQty,
    decimal? PalletQty,
    decimal? NetWeight,
    decimal? GrossWeight,
    long? WeightUomId,
    decimal? LengthValue,
    decimal? WidthValue,
    decimal? HeightValue,
    long? DimensionUomId,
    int? LabelCount,
    string? PackingInstructions,
    string Status);

public sealed record ItemPhysicalSpecsDto(
    long Id,
    long CompanyId,
    long ItemId,
    decimal? LengthValue,
    decimal? WidthValue,
    decimal? HeightValue,
    decimal? ThicknessValue,
    long? DimensionUomId,
    string? Grade,
    string? Material,
    string? ColorFinish,
    int? ShelfLifeDays,
    string? StorageCondition,
    string? ToleranceNote,
    string Status);

public sealed record ItemCustomerReferenceDto(
    long Id,
    long CompanyId,
    long ItemId,
    long CustomerId,
    string? CustomerCode,
    string? CustomerName,
    string CustomerItemCode,
    string? DrawingNo,
    string? RevisionCode,
    string? PackagingOverride,
    string? SpecificationOverride,
    string ApprovalStatus,
    DateOnly? EffectiveFrom,
    DateOnly? EffectiveTo,
    string Status);

public sealed record ItemVendorReferenceDto(
    long Id,
    long CompanyId,
    long ItemId,
    long SupplierId,
    string? SupplierCode,
    string? SupplierName,
    string VendorItemCode,
    decimal? MinimumOrderQty,
    int? LeadTimeDays,
    long? PurchaseUomId,
    string? ComplianceStatus,
    string? DocumentStatus,
    DateOnly? EffectiveFrom,
    DateOnly? EffectiveTo,
    string Status);

public sealed record ItemManufacturingPolicyDto(
    long Id,
    long CompanyId,
    long ItemId,
    string BomPolicy,
    string RoutingPolicy,
    string IssueMethod,
    decimal? ScrapAllowancePercent,
    string? OperationLinkage,
    string Status);

public sealed record ItemPlanningPolicyDto(
    long Id,
    long CompanyId,
    long ItemId,
    bool MrpEnabled,
    decimal? SafetyStockQty,
    decimal? ReorderPointQty,
    decimal? MinimumQty,
    decimal? MaximumQty,
    int? LeadTimeDays,
    decimal? LotSizeQty,
    string? AbcClass,
    string Status);

public sealed record ItemInventoryPolicyDto(
    long Id,
    long CompanyId,
    long ItemId,
    long? DefaultWarehouseId,
    long? DefaultBinId,
    string SerialTrackingMode,
    string LotTrackingMode,
    bool IsCatchWeightItem,
    string NegativeStockPolicy,
    string? ExpiryPolicy,
    int? ShelfLifeDays,
    string Status);

public sealed record ItemQualityPolicyDto(
    long Id,
    long CompanyId,
    long ItemId,
    bool QcRequired,
    long? InspectionPlanId,
    string? InspectionPlanCode,
    string? CertificateRequirement,
    string? HoldRule,
    string? TraceabilityDepth,
    string Status);

public sealed record ItemMasterProfileDto(
    long ItemId,
    IReadOnlyCollection<ItemAliasDto> Aliases,
    IReadOnlyCollection<ItemMediaDto> Media,
    IReadOnlyCollection<ItemDocumentDto> Documents,
    ItemCatalogDto? Catalog,
    ItemPackagingDto? Packaging,
    ItemPhysicalSpecsDto? PhysicalSpecs,
    IReadOnlyCollection<ItemCustomerReferenceDto> CustomerReferences,
    IReadOnlyCollection<ItemVendorReferenceDto> VendorReferences,
    ItemManufacturingPolicyDto? ManufacturingPolicy,
    ItemPlanningPolicyDto? PlanningPolicy,
    ItemInventoryPolicyDto? InventoryPolicy,
    ItemQualityPolicyDto? QualityPolicy);

public sealed record ItemAliasUpsertRequest(
    string AliasType,
    string AliasValue,
    string? LanguageCode,
    bool IsPrimary,
    string Status);

public sealed record ItemCatalogUpsertRequest(
    string CatalogTitle,
    string? CatalogSection,
    string? MarketingDescription,
    string? CustomerVisibleSpecsJson,
    string PublishStatus,
    bool IsCatalogVisible,
    DateOnly? EffectiveFrom,
    DateOnly? EffectiveTo,
    string? PreviewSlug,
    string Status);

public sealed record ItemPackagingUpsertRequest(
    long? PackagingUomId,
    decimal? InnerPackQty,
    decimal? CartonQty,
    decimal? PalletQty,
    decimal? NetWeight,
    decimal? GrossWeight,
    long? WeightUomId,
    decimal? LengthValue,
    decimal? WidthValue,
    decimal? HeightValue,
    long? DimensionUomId,
    int? LabelCount,
    string? PackingInstructions,
    string Status);

public sealed record ItemPhysicalSpecsUpsertRequest(
    decimal? LengthValue,
    decimal? WidthValue,
    decimal? HeightValue,
    decimal? ThicknessValue,
    long? DimensionUomId,
    string? Grade,
    string? Material,
    string? ColorFinish,
    int? ShelfLifeDays,
    string? StorageCondition,
    string? ToleranceNote,
    string Status);

public sealed record ItemCustomerReferenceUpsertRequest(
    long CustomerId,
    string CustomerItemCode,
    string? DrawingNo,
    string? RevisionCode,
    string? PackagingOverride,
    string? SpecificationOverride,
    string ApprovalStatus,
    DateOnly? EffectiveFrom,
    DateOnly? EffectiveTo,
    string Status);

public sealed record ItemVendorReferenceUpsertRequest(
    long SupplierId,
    string VendorItemCode,
    decimal? MinimumOrderQty,
    int? LeadTimeDays,
    long? PurchaseUomId,
    string? ComplianceStatus,
    string? DocumentStatus,
    DateOnly? EffectiveFrom,
    DateOnly? EffectiveTo,
    string Status);

public sealed record ItemManufacturingPolicyUpsertRequest(
    string BomPolicy,
    string RoutingPolicy,
    string IssueMethod,
    decimal? ScrapAllowancePercent,
    string? OperationLinkage,
    string Status);

public sealed record ItemPlanningPolicyUpsertRequest(
    bool MrpEnabled,
    decimal? SafetyStockQty,
    decimal? ReorderPointQty,
    decimal? MinimumQty,
    decimal? MaximumQty,
    int? LeadTimeDays,
    decimal? LotSizeQty,
    string? AbcClass,
    string Status);

public sealed record ItemInventoryPolicyUpsertRequest(
    long? DefaultWarehouseId,
    long? DefaultBinId,
    string SerialTrackingMode,
    string LotTrackingMode,
    bool IsCatchWeightItem,
    string NegativeStockPolicy,
    string? ExpiryPolicy,
    int? ShelfLifeDays,
    string Status);

public sealed record ItemQualityPolicyUpsertRequest(
    bool QcRequired,
    long? InspectionPlanId,
    string? InspectionPlanCode,
    string? CertificateRequirement,
    string? HoldRule,
    string? TraceabilityDepth,
    string Status);

public sealed record ItemMasterProfileUpsertRequest(
    IReadOnlyCollection<ItemAliasUpsertRequest> Aliases,
    ItemCatalogUpsertRequest Catalog,
    ItemPackagingUpsertRequest Packaging,
    ItemPhysicalSpecsUpsertRequest PhysicalSpecs,
    ItemManufacturingPolicyUpsertRequest ManufacturingPolicy,
    ItemPlanningPolicyUpsertRequest PlanningPolicy,
    ItemInventoryPolicyUpsertRequest InventoryPolicy,
    ItemQualityPolicyUpsertRequest QualityPolicy,
    IReadOnlyCollection<ItemCustomerReferenceUpsertRequest> CustomerReferences,
    IReadOnlyCollection<ItemVendorReferenceUpsertRequest> VendorReferences);

public sealed record CustomerDto(
    long Id,
    long CompanyId,
    string CustomerCode,
    string CustomerName,
    string? ShortName,
    string CustomerType,
    long? DefaultBranchId,
    long? DefaultLanguageId,
    string? TaxRegistrationNo,
    string? PaymentTermsCode,
    int? CreditDays,
    string Status);

public sealed record CustomerUpsertRequest(
    long CompanyId,
    string CustomerCode,
    string CustomerName,
    string? ShortName,
    string CustomerType,
    long? DefaultBranchId,
    long? DefaultLanguageId,
    string? TaxRegistrationNo,
    string? PaymentTermsCode,
    int? CreditDays,
    string Status);

public sealed record CustomerAddressDto(
    long Id,
    long CompanyId,
    long CustomerId,
    string AddressCode,
    string AddressType,
    string AddressLine1,
    string? AddressLine2,
    string City,
    string StateOrProvince,
    string PostalCode,
    string CountryCode,
    string? ContactName,
    string? ContactEmail,
    string? ContactPhone,
    bool IsDefaultBilling,
    bool IsDefaultShipping,
    string Status);

public sealed record CustomerAddressUpsertRequest(
    long CompanyId,
    long CustomerId,
    string AddressCode,
    string AddressType,
    string AddressLine1,
    string? AddressLine2,
    string City,
    string StateOrProvince,
    string PostalCode,
    string CountryCode,
    string? ContactName,
    string? ContactEmail,
    string? ContactPhone,
    bool IsDefaultBilling,
    bool IsDefaultShipping,
    string Status);

public sealed record SupplierDto(
    long Id,
    long CompanyId,
    string SupplierCode,
    string SupplierName,
    string SupplierType,
    bool SupportsSubcontracting,
    long? DefaultBranchId,
    long? DefaultLanguageId,
    string? TaxRegistrationNo,
    string? PaymentTermsCode,
    string Status);

public sealed record SupplierUpsertRequest(
    long CompanyId,
    string SupplierCode,
    string SupplierName,
    string SupplierType,
    bool SupportsSubcontracting,
    long? DefaultBranchId,
    long? DefaultLanguageId,
    string? TaxRegistrationNo,
    string? PaymentTermsCode,
    string Status);

public sealed record SupplierAddressDto(
    long Id,
    long CompanyId,
    long SupplierId,
    string AddressCode,
    string AddressType,
    string AddressLine1,
    string City,
    string StateOrProvince,
    string PostalCode,
    string CountryCode,
    string? ContactName,
    string? ContactEmail,
    string? ContactPhone,
    bool IsDefaultOrderAddress,
    string Status);

public sealed record SupplierAddressUpsertRequest(
    long CompanyId,
    long SupplierId,
    string AddressCode,
    string AddressType,
    string AddressLine1,
    string City,
    string StateOrProvince,
    string PostalCode,
    string CountryCode,
    string? ContactName,
    string? ContactEmail,
    string? ContactPhone,
    bool IsDefaultOrderAddress,
    string Status);

public sealed record SupplierLeadTimeDto(
    long Id,
    long CompanyId,
    long SupplierId,
    long? BranchId,
    long? ItemId,
    long? ItemGroupId,
    int LeadTimeDays,
    decimal? MinOrderQty,
    decimal? OrderMultipleQty,
    bool IsSubcontractLeadTime,
    int PriorityRank,
    string Status);

public sealed record SupplierLeadTimeUpsertRequest(
    long CompanyId,
    long SupplierId,
    long? BranchId,
    long? ItemId,
    long? ItemGroupId,
    int LeadTimeDays,
    decimal? MinOrderQty,
    decimal? OrderMultipleQty,
    bool IsSubcontractLeadTime,
    int PriorityRank,
    string Status);

public sealed record PartnerAuditEventDto(
    long Id,
    string EntityType,
    string ActionCode,
    string Actor,
    DateTimeOffset OccurredOn,
    string Outcome);

public sealed record CustomerPartnerProfileDto(
    long Id,
    long CompanyId,
    long CustomerId,
    string? LegalName,
    string? TaxCategory,
    string? CurrencyCode,
    string? CreditStatus,
    decimal? CreditLimitAmount,
    string? CreditHoldRule,
    string? PaymentTermsCode,
    long? DefaultSalesOwnerUserId,
    string? DefaultSalesOwnerName,
    long? DefaultSalesTeamId,
    long? DefaultTerritoryId,
    long? DefaultPriceListId,
    long? DefaultDiscountSchemeId,
    long? DefaultPaymentTermsId,
    long? DefaultTaxCategoryId,
    string? DefaultTaxTreatment,
    long? DefaultCurrencyId,
    long? DefaultTradeTermsId,
    string? CommercialSegment,
    string? OrderReleaseControl,
    string? DispatchPreference,
    string? DispatchInstruction,
    bool CatalogVisible,
    string? CatalogSegment,
    string Status);

public sealed record CustomerContactPointDto(
    long Id,
    long CompanyId,
    long CustomerId,
    long? CustomerAddressId,
    string ContactName,
    string ContactRole,
    string Channel,
    string ContactValue,
    bool IsPrimary,
    string? ConsentStatus,
    string? EscalationLevel,
    string Status);

public sealed record CustomerItemReferenceProfileDto(
    long Id,
    long CompanyId,
    long CustomerId,
    long? ItemId,
    string CustomerItemCode,
    string? DrawingNo,
    string? RevisionCode,
    string? PackagingOverride,
    string? SpecificationOverride,
    string ApprovalStatus,
    string Status);

public sealed record CustomerDocumentDto(
    long Id,
    long CompanyId,
    long CustomerId,
    string DocumentType,
    string Title,
    string? DocumentNo,
    string? RevisionCode,
    string? FileName,
    string? StorageUri,
    string ApprovalStatus,
    string VisibilityScope,
    DateOnly? EffectiveFrom,
    DateOnly? EffectiveTo,
    DateOnly? ExpiresOn,
    string Status);

public sealed record CustomerPartnerWorkspaceDto(
    CustomerPartnerProfileDto Profile,
    IReadOnlyCollection<CustomerContactPointDto> ContactPoints,
    IReadOnlyCollection<CustomerItemReferenceProfileDto> ItemReferences,
    IReadOnlyCollection<CustomerDocumentDto> Documents,
    IReadOnlyCollection<PartnerAuditEventDto> AuditEvents);

public sealed record CustomerPartnerProfileUpsertRequest(
    CustomerPartnerProfileSectionRequest Profile,
    IReadOnlyCollection<CustomerContactPointUpsertRequest> ContactPoints,
    IReadOnlyCollection<CustomerItemReferenceProfileUpsertRequest> ItemReferences,
    IReadOnlyCollection<CustomerDocumentUpsertRequest> Documents);

public sealed record CustomerPartnerProfileSectionRequest(
    string? LegalName,
    string? TaxCategory,
    string? CurrencyCode,
    string? CreditStatus,
    decimal? CreditLimitAmount,
    string? CreditHoldRule,
    string? PaymentTermsCode,
    long? DefaultSalesOwnerUserId,
    string? DefaultSalesOwnerName,
    long? DefaultSalesTeamId,
    long? DefaultTerritoryId,
    long? DefaultPriceListId,
    long? DefaultDiscountSchemeId,
    long? DefaultPaymentTermsId,
    long? DefaultTaxCategoryId,
    string? DefaultTaxTreatment,
    long? DefaultCurrencyId,
    long? DefaultTradeTermsId,
    string? CommercialSegment,
    string? OrderReleaseControl,
    string? DispatchPreference,
    string? DispatchInstruction,
    bool CatalogVisible,
    string? CatalogSegment,
    string Status);

public sealed record CustomerContactPointUpsertRequest(
    long? Id,
    long? CustomerAddressId,
    string ContactName,
    string ContactRole,
    string Channel,
    string ContactValue,
    bool IsPrimary,
    string? ConsentStatus,
    string? EscalationLevel,
    string Status);

public sealed record CustomerItemReferenceProfileUpsertRequest(
    long? Id,
    long? ItemId,
    string CustomerItemCode,
    string? DrawingNo,
    string? RevisionCode,
    string? PackagingOverride,
    string? SpecificationOverride,
    string ApprovalStatus,
    string Status);

public sealed record CustomerDocumentUpsertRequest(
    long? Id,
    string DocumentType,
    string Title,
    string? DocumentNo,
    string? RevisionCode,
    string? FileName,
    string? StorageUri,
    string ApprovalStatus,
    string VisibilityScope,
    DateOnly? EffectiveFrom,
    DateOnly? EffectiveTo,
    DateOnly? ExpiresOn,
    string Status);

public sealed record SupplierPartnerProfileDto(
    long Id,
    long CompanyId,
    long SupplierId,
    string? LegalName,
    string? TaxCategory,
    string? CurrencyCode,
    string? PaymentTermsCode,
    string? PreferredStatus,
    string? ComplianceStatus,
    string? CapabilitySummary,
    decimal? QualityRating,
    string? ProcurementReleaseControl,
    int? LeadTimeReviewDays,
    string Status);

public sealed record SupplierContactPointDto(
    long Id,
    long CompanyId,
    long SupplierId,
    long? SupplierAddressId,
    string ContactName,
    string ContactRole,
    string Channel,
    string ContactValue,
    bool IsPrimary,
    string? ConsentStatus,
    string? EscalationLevel,
    string Status);

public sealed record SupplierVendorReferenceProfileDto(
    long Id,
    long CompanyId,
    long SupplierId,
    long? ItemId,
    string VendorItemCode,
    decimal? MinimumOrderQty,
    int? LeadTimeDays,
    long? PurchaseUomId,
    string? ComplianceStatus,
    string? DocumentStatus,
    string ApprovalStatus,
    string Status);

public sealed record SupplierDocumentDto(
    long Id,
    long CompanyId,
    long SupplierId,
    string DocumentType,
    string Title,
    string? DocumentNo,
    string? RevisionCode,
    string? FileName,
    string? StorageUri,
    string ApprovalStatus,
    string VisibilityScope,
    DateOnly? EffectiveFrom,
    DateOnly? EffectiveTo,
    DateOnly? ExpiresOn,
    string Status);

public sealed record SupplierPartnerWorkspaceDto(
    SupplierPartnerProfileDto Profile,
    IReadOnlyCollection<SupplierContactPointDto> ContactPoints,
    IReadOnlyCollection<SupplierVendorReferenceProfileDto> VendorReferences,
    IReadOnlyCollection<SupplierDocumentDto> Documents,
    IReadOnlyCollection<PartnerAuditEventDto> AuditEvents);

public sealed record SupplierPartnerProfileUpsertRequest(
    SupplierPartnerProfileSectionRequest Profile,
    IReadOnlyCollection<SupplierContactPointUpsertRequest> ContactPoints,
    IReadOnlyCollection<SupplierVendorReferenceProfileUpsertRequest> VendorReferences,
    IReadOnlyCollection<SupplierDocumentUpsertRequest> Documents);

public sealed record SupplierPartnerProfileSectionRequest(
    string? LegalName,
    string? TaxCategory,
    string? CurrencyCode,
    string? PaymentTermsCode,
    string? PreferredStatus,
    string? ComplianceStatus,
    string? CapabilitySummary,
    decimal? QualityRating,
    string? ProcurementReleaseControl,
    int? LeadTimeReviewDays,
    string Status);

public sealed record SupplierContactPointUpsertRequest(
    long? Id,
    long? SupplierAddressId,
    string ContactName,
    string ContactRole,
    string Channel,
    string ContactValue,
    bool IsPrimary,
    string? ConsentStatus,
    string? EscalationLevel,
    string Status);

public sealed record SupplierVendorReferenceProfileUpsertRequest(
    long? Id,
    long? ItemId,
    string VendorItemCode,
    decimal? MinimumOrderQty,
    int? LeadTimeDays,
    long? PurchaseUomId,
    string? ComplianceStatus,
    string? DocumentStatus,
    string ApprovalStatus,
    string Status);

public sealed record SupplierDocumentUpsertRequest(
    long? Id,
    string DocumentType,
    string Title,
    string? DocumentNo,
    string? RevisionCode,
    string? FileName,
    string? StorageUri,
    string ApprovalStatus,
    string VisibilityScope,
    DateOnly? EffectiveFrom,
    DateOnly? EffectiveTo,
    DateOnly? ExpiresOn,
    string Status);
