DECLARE @now DATETIMEOFFSET(7) = SYSUTCDATETIME();

IF NOT EXISTS (SELECT 1 FROM measure.UomClasses WHERE Id = 1 OR ClassCode = N'COUNT')
BEGIN
    SET IDENTITY_INSERT measure.UomClasses ON;
    INSERT INTO measure.UomClasses
        (Id, ClassCode, ClassName, BaseUomId, SupportsFormulaConversion, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (1, N'COUNT', N'Count', NULL, 0, N'Active', @now, NULL, @now, NULL);
    SET IDENTITY_INSERT measure.UomClasses OFF;
END;

IF NOT EXISTS (SELECT 1 FROM measure.UomClasses WHERE Id = 2 OR ClassCode = N'WEIGHT')
BEGIN
    SET IDENTITY_INSERT measure.UomClasses ON;
    INSERT INTO measure.UomClasses
        (Id, ClassCode, ClassName, BaseUomId, SupportsFormulaConversion, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (2, N'WEIGHT', N'Weight', NULL, 0, N'Active', @now, NULL, @now, NULL);
    SET IDENTITY_INSERT measure.UomClasses OFF;
END;

IF NOT EXISTS (SELECT 1 FROM measure.Uoms WHERE Id = 1 OR UomCode = N'PCS')
BEGIN
    SET IDENTITY_INSERT measure.Uoms ON;
    INSERT INTO measure.Uoms
        (Id, UomCode, UomName, Symbol, UomClassId, DecimalPrecision, IsSystemBase, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (1, N'PCS', N'Pieces', N'pcs', 1, 0, 1, N'Active', @now, NULL, @now, NULL);
    SET IDENTITY_INSERT measure.Uoms OFF;
END;

IF NOT EXISTS (SELECT 1 FROM measure.Uoms WHERE Id = 2 OR UomCode = N'KG')
BEGIN
    SET IDENTITY_INSERT measure.Uoms ON;
    INSERT INTO measure.Uoms
        (Id, UomCode, UomName, Symbol, UomClassId, DecimalPrecision, IsSystemBase, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (2, N'KG', N'Kilogram', N'kg', 2, 3, 1, N'Active', @now, NULL, @now, NULL);
    SET IDENTITY_INSERT measure.Uoms OFF;
END;

IF NOT EXISTS (SELECT 1 FROM measure.MeasurementProfiles WHERE Id = 1 OR ProfileCode = N'STD-COUNT')
BEGIN
    SET IDENTITY_INSERT measure.MeasurementProfiles ON;
    INSERT INTO measure.MeasurementProfiles
        (Id, ProfileCode, ProfileName, ProfileType, StockUomClassId, AllowsCatchWeight, RequiresDimensions, RequiresDensity, RequiresThickness, RequiresPackSize, SupportsCommercialProductionSplit, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (1, N'STD-COUNT', N'Standard Count Item', N'CountOnly', 1, 0, 0, 0, 0, 0, 0, N'Active', @now, NULL, @now, NULL);
    SET IDENTITY_INSERT measure.MeasurementProfiles OFF;
END;

IF NOT EXISTS (SELECT 1 FROM [master].[ItemGroups] WHERE Id = 1 OR (CompanyId = 1 AND ItemGroupCode = N'RAW'))
BEGIN
    SET IDENTITY_INSERT [master].[ItemGroups] ON;
    INSERT INTO [master].[ItemGroups]
        (Id, CompanyId, ItemGroupCode, ItemGroupName, ParentItemGroupId, DefaultMeasurementProfileId, DefaultQcRequired, DefaultTraceabilityMode, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (1, 1, N'RAW', N'Raw Materials', NULL, 1, 0, N'Lot', N'Active', @now, NULL, @now, NULL);
    SET IDENTITY_INSERT [master].[ItemGroups] OFF;
END;

IF NOT EXISTS (SELECT 1 FROM [master].[ItemGroups] WHERE Id = 2 OR (CompanyId = 1 AND ItemGroupCode = N'FG'))
BEGIN
    SET IDENTITY_INSERT [master].[ItemGroups] ON;
    INSERT INTO [master].[ItemGroups]
        (Id, CompanyId, ItemGroupCode, ItemGroupName, ParentItemGroupId, DefaultMeasurementProfileId, DefaultQcRequired, DefaultTraceabilityMode, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (2, 1, N'FG', N'Finished Goods', NULL, 1, 1, N'Lot', N'Active', @now, NULL, @now, NULL);
    SET IDENTITY_INSERT [master].[ItemGroups] OFF;
END;

IF NOT EXISTS (SELECT 1 FROM [master].[Items] WHERE Id = 10001 OR (CompanyId = 1 AND ItemCode = N'RM-PLATE-001'))
BEGIN
    SET IDENTITY_INSERT [master].[Items] ON;
    INSERT INTO [master].[Items]
        (Id, CompanyId, ItemCode, ItemName, ShortName, ItemType, ItemGroupId, MeasurementProfileId, StockUomId, PurchaseUomId, SalesUomId, ProductionUomId, QcUomId, TraceabilityMode, IsCatchWeightItem, IsQcRequired, IsBatchExpiryTracked, DefaultIssueMethod, DefaultMakeType, DefaultWarehouseId, DefaultBinId, LeadTimeDays, ReorderPolicy, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (10001, 1, N'RM-PLATE-001', N'Mild Steel Plate 6mm', N'MS Plate 6mm', N'RawMaterial', 1, 1, 2, 2, NULL, NULL, 2, N'Lot', 0, 1, 0, N'Manual', N'Buy', 101, 1001, 7, N'MRP', N'Active', @now, NULL, @now, NULL);
    SET IDENTITY_INSERT [master].[Items] OFF;
END;

IF NOT EXISTS (SELECT 1 FROM [master].[Items] WHERE Id = 10002 OR (CompanyId = 1 AND ItemCode = N'FG-BRACKET-001'))
BEGIN
    SET IDENTITY_INSERT [master].[Items] ON;
    INSERT INTO [master].[Items]
        (Id, CompanyId, ItemCode, ItemName, ShortName, ItemType, ItemGroupId, MeasurementProfileId, StockUomId, PurchaseUomId, SalesUomId, ProductionUomId, QcUomId, TraceabilityMode, IsCatchWeightItem, IsQcRequired, IsBatchExpiryTracked, DefaultIssueMethod, DefaultMakeType, DefaultWarehouseId, DefaultBinId, LeadTimeDays, ReorderPolicy, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (10002, 1, N'FG-BRACKET-001', N'Fabricated Mounting Bracket', N'Mounting Bracket', N'FinishedGood', 2, 1, 1, NULL, 1, 1, 1, N'Lot', 0, 1, 0, N'Backflush', N'Make', 201, 2001, 3, N'MRP', N'Active', @now, NULL, @now, NULL);
    SET IDENTITY_INSERT [master].[Items] OFF;
END;

IF NOT EXISTS (SELECT 1 FROM [master].[ItemUoms] WHERE ItemId = 10001 AND UomRole = N'Stock' AND UomId = 2)
BEGIN
    INSERT INTO [master].[ItemUoms]
        (CompanyId, ItemId, ItemVariantId, UomRole, UomId, BaseToThisNumerator, BaseToThisDenominator, MeasurementFormulaId, IsDefault, IsCatchWeightActualUom, MinOrderQty, RoundingScale, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (1, 10001, NULL, N'Stock', 2, 1, 1, NULL, 1, 0, NULL, 3, N'Active', @now, NULL, @now, NULL);
END;

IF NOT EXISTS (SELECT 1 FROM [master].[ItemUoms] WHERE ItemId = 10002 AND UomRole = N'Stock' AND UomId = 1)
BEGIN
    INSERT INTO [master].[ItemUoms]
        (CompanyId, ItemId, ItemVariantId, UomRole, UomId, BaseToThisNumerator, BaseToThisDenominator, MeasurementFormulaId, IsDefault, IsCatchWeightActualUom, MinOrderQty, RoundingScale, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (1, 10002, NULL, N'Stock', 1, 1, 1, NULL, 1, 0, NULL, 0, N'Active', @now, NULL, @now, NULL);
END;

IF NOT EXISTS (SELECT 1 FROM [master].[ItemBarcodes] WHERE BarcodeValue = N'FG-BRACKET-001')
BEGIN
    INSERT INTO [master].[ItemBarcodes]
        (CompanyId, ItemId, ItemVariantId, UomId, BarcodeValue, BarcodeType, ScanPurpose, PreferenceRank, IsPrimary, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (1, 10002, NULL, 1, N'FG-BRACKET-001', N'Code128', N'Inventory', 1, 1, N'Active', @now, NULL, @now, NULL);
END;

IF NOT EXISTS (SELECT 1 FROM [master].[Customers] WHERE Id = 20001 OR (CompanyId = 1 AND CustomerCode = N'CUST-DEMO'))
BEGIN
    SET IDENTITY_INSERT [master].[Customers] ON;
    INSERT INTO [master].[Customers]
        (Id, CompanyId, CustomerCode, CustomerName, ShortName, CustomerType, DefaultBranchId, DefaultLanguageId, TaxRegistrationNo, PaymentTermsCode, CreditDays, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (20001, 1, N'CUST-DEMO', N'Demo Industrial Customer', N'Demo Customer', N'Domestic', 12, NULL, NULL, N'NET30', 30, N'Active', @now, NULL, @now, NULL);
    SET IDENTITY_INSERT [master].[Customers] OFF;
END;

IF NOT EXISTS (SELECT 1 FROM [master].[CustomerAddresses] WHERE CustomerId = 20001 AND AddressCode = N'SHIP-01')
BEGIN
    INSERT INTO [master].[CustomerAddresses]
        (CompanyId, CustomerId, AddressCode, AddressType, AddressLine1, AddressLine2, City, StateOrProvince, PostalCode, CountryCode, ContactName, ContactEmail, ContactPhone, IsDefaultBilling, IsDefaultShipping, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (1, 20001, N'SHIP-01', N'Shipping', N'Demo Industrial Estate', NULL, N'Pune', N'MH', N'411001', N'IN', N'Demo Buyer', N'buyer@demo.local', NULL, 1, 1, N'Active', @now, NULL, @now, NULL);
END;

IF NOT EXISTS (SELECT 1 FROM [master].[Suppliers] WHERE Id = 30001 OR (CompanyId = 1 AND SupplierCode = N'SUP-DEMO'))
BEGIN
    SET IDENTITY_INSERT [master].[Suppliers] ON;
    INSERT INTO [master].[Suppliers]
        (Id, CompanyId, SupplierCode, SupplierName, SupplierType, SupportsSubcontracting, DefaultBranchId, DefaultLanguageId, TaxRegistrationNo, PaymentTermsCode, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (30001, 1, N'SUP-DEMO', N'Demo Steel Supplier', N'Material', 0, 11, NULL, NULL, N'NET15', N'Active', @now, NULL, @now, NULL);
    SET IDENTITY_INSERT [master].[Suppliers] OFF;
END;

IF NOT EXISTS (SELECT 1 FROM [master].[SupplierAddresses] WHERE SupplierId = 30001 AND AddressCode = N'ORDER-01')
BEGIN
    INSERT INTO [master].[SupplierAddresses]
        (CompanyId, SupplierId, AddressCode, AddressType, AddressLine1, City, StateOrProvince, PostalCode, CountryCode, ContactName, ContactEmail, ContactPhone, IsDefaultOrderAddress, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (1, 30001, N'ORDER-01', N'Order', N'Demo Supplier Yard', N'Pune', N'MH', N'411002', N'IN', N'Demo Supplier Desk', N'supply@demo.local', NULL, 1, N'Active', @now, NULL, @now, NULL);
END;

IF NOT EXISTS (SELECT 1 FROM [master].[SupplierLeadTimes] WHERE SupplierId = 30001 AND BranchId = 11 AND ItemId = 10001)
BEGIN
    INSERT INTO [master].[SupplierLeadTimes]
        (CompanyId, BranchId, SupplierId, ItemId, ItemGroupId, LeadTimeDays, MinOrderQty, OrderMultipleQty, IsSubcontractLeadTime, PriorityRank, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (1, 11, 30001, 10001, NULL, 7, NULL, NULL, 0, 1, N'Active', @now, NULL, @now, NULL);
END;

IF OBJECT_ID(N'[master].[ItemMedia]', N'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM [master].[ItemMedia] WHERE ItemId = 10002 AND Title = N'Primary bracket image')
BEGIN
    INSERT INTO [master].[ItemMedia]
        (CompanyId, ItemId, ItemVariantId, MediaType, Title, FileName, MimeType, StorageUri, ThumbnailUri, IsPrimary, SortOrder, ApprovalStatus, VisibilityScope, RetiredOnUtc, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (1, 10002, NULL, N'Product photo', N'Primary bracket image', N'fg-bracket-primary.jpg', N'image/jpeg', N'catalog/fg-bracket-primary.jpg', NULL, 1, 10, N'Approved', N'Catalog', NULL, N'Active', @now, NULL, @now, NULL);
END;

IF OBJECT_ID(N'[master].[ItemDocuments]', N'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM [master].[ItemDocuments] WHERE ItemId = 10002 AND DocumentNo = N'QAP-FG-BR-001')
BEGIN
    INSERT INTO [master].[ItemDocuments]
        (CompanyId, ItemId, ItemVariantId, DocumentType, Title, DocumentNo, RevisionCode, FileName, StorageUri, ApprovalStatus, VisibilityScope, EffectiveFrom, EffectiveTo, ExpiresOn, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (1, 10002, NULL, N'Quality plan', N'Bracket inspection plan', N'QAP-FG-BR-001', N'A', N'QAP-FG-BR-001.pdf', N'documents/QAP-FG-BR-001.pdf', N'Approved', N'Internal', CONVERT(date, @now), NULL, NULL, N'Active', @now, NULL, @now, NULL);
END;

IF OBJECT_ID(N'[master].[ItemCatalog]', N'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM [master].[ItemCatalog] WHERE ItemId = 10002)
BEGIN
    INSERT INTO [master].[ItemCatalog]
        (CompanyId, ItemId, CatalogTitle, CatalogSection, MarketingDescription, CustomerVisibleSpecsJson, PublishStatus, IsCatalogVisible, EffectiveFrom, EffectiveTo, PreviewSlug, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (1, 10002, N'Fabricated Mounting Bracket', N'Fabricated components', N'Powder-coated mounting bracket with controlled weld, paint, packing, and dispatch inspection requirements.', N'{"material":"Mild steel","finish":"Powder coated black","pack":"50 PCS carton"}', N'Ready for review', 1, CONVERT(date, @now), NULL, N'fabricated-mounting-bracket', N'Active', @now, NULL, @now, NULL);
END;

IF OBJECT_ID(N'[master].[ItemPackaging]', N'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM [master].[ItemPackaging] WHERE ItemId = 10002)
BEGIN
    INSERT INTO [master].[ItemPackaging]
        (CompanyId, ItemId, PackagingUomId, InnerPackQty, CartonQty, PalletQty, NetWeight, GrossWeight, WeightUomId, LengthValue, WidthValue, HeightValue, DimensionUomId, LabelCount, PackingInstructions, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (1, 10002, 1, 10, 50, 1000, 1.2000, 1.3200, 2, 180, 95, 42, NULL, 2, N'Apply part label and customer reference label on adjacent carton faces.', N'Active', @now, NULL, @now, NULL);
END;

IF OBJECT_ID(N'[master].[ItemPhysicalSpecs]', N'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM [master].[ItemPhysicalSpecs] WHERE ItemId = 10002)
BEGIN
    INSERT INTO [master].[ItemPhysicalSpecs]
        (CompanyId, ItemId, LengthValue, WidthValue, HeightValue, ThicknessValue, DimensionUomId, Grade, Material, ColorFinish, ShelfLifeDays, StorageCondition, ToleranceNote, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (1, 10002, 180, 95, 42, 6, NULL, N'MS E250', N'Mild steel', N'Powder coated black', NULL, N'Covered FG rack, dry storage', N'Customer drawing tolerance applies.', N'Active', @now, NULL, @now, NULL);
END;

IF OBJECT_ID(N'[master].[ItemCustomerReferences]', N'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM [master].[ItemCustomerReferences] WHERE ItemId = 10002 AND CustomerId = 20001 AND CustomerItemCode = N'CUST-BR-001')
BEGIN
    INSERT INTO [master].[ItemCustomerReferences]
        (CompanyId, ItemId, CustomerId, CustomerItemCode, DrawingNo, RevisionCode, PackagingOverride, SpecificationOverride, ApprovalStatus, EffectiveFrom, EffectiveTo, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (1, 10002, 20001, N'CUST-BR-001', N'DRW-BR-001', N'A', N'50 PCS carton', N'Black powder coat', N'Approved', CONVERT(date, @now), NULL, N'Active', @now, NULL, @now, NULL);
END;

IF OBJECT_ID(N'[master].[ItemVendorReferences]', N'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM [master].[ItemVendorReferences] WHERE ItemId = 10001 AND SupplierId = 30001 AND VendorItemCode = N'MSPL-6MM')
BEGIN
    INSERT INTO [master].[ItemVendorReferences]
        (CompanyId, ItemId, SupplierId, VendorItemCode, MinimumOrderQty, LeadTimeDays, PurchaseUomId, ComplianceStatus, DocumentStatus, EffectiveFrom, EffectiveTo, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (1, 10001, 30001, N'MSPL-6MM', 500, 7, 2, N'Mill certificate required', N'Current', CONVERT(date, @now), NULL, N'Active', @now, NULL, @now, NULL);
END;

IF OBJECT_ID(N'[master].[ItemAliases]', N'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM [master].[ItemAliases] WHERE ItemId = 10002 AND AliasValue = N'Mounting Bracket')
BEGIN
    INSERT INTO [master].[ItemAliases]
        (CompanyId, ItemId, AliasType, AliasValue, LanguageCode, IsPrimary, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (1, 10002, N'Display name', N'Mounting Bracket', N'en', 1, N'Active', @now, NULL, @now, NULL);
END;

IF OBJECT_ID(N'[master].[ItemManufacturingPolicies]', N'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM [master].[ItemManufacturingPolicies] WHERE ItemId = 10002)
BEGIN
    INSERT INTO [master].[ItemManufacturingPolicies]
        (CompanyId, ItemId, BomPolicy, RoutingPolicy, IssueMethod, ScrapAllowancePercent, OperationLinkage, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (1, 10002, N'Released BOM required', N'Operation-linked route', N'Backflush', 2.0000, N'Cutting, bending, welding, finishing', N'Active', @now, NULL, @now, NULL);
END;

IF OBJECT_ID(N'[master].[ItemPlanningPolicies]', N'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM [master].[ItemPlanningPolicies] WHERE ItemId = 10002)
BEGIN
    INSERT INTO [master].[ItemPlanningPolicies]
        (CompanyId, ItemId, MrpEnabled, SafetyStockQty, ReorderPointQty, MinimumQty, MaximumQty, LeadTimeDays, LotSizeQty, AbcClass, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (1, 10002, 1, 25, 40, 25, 250, 3, 50, N'A', N'Active', @now, NULL, @now, NULL);
END;

IF OBJECT_ID(N'[master].[ItemInventoryPolicies]', N'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM [master].[ItemInventoryPolicies] WHERE ItemId = 10002)
BEGIN
    INSERT INTO [master].[ItemInventoryPolicies]
        (CompanyId, ItemId, DefaultWarehouseId, DefaultBinId, SerialTrackingMode, LotTrackingMode, IsCatchWeightItem, NegativeStockPolicy, ExpiryPolicy, ShelfLifeDays, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (1, 10002, 201, 2001, N'None', N'Lot', 0, N'Blocked', N'Not required', NULL, N'Active', @now, NULL, @now, NULL);
END;

IF OBJECT_ID(N'[master].[ItemQualityPolicies]', N'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM [master].[ItemQualityPolicies] WHERE ItemId = 10002)
BEGIN
    INSERT INTO [master].[ItemQualityPolicies]
        (CompanyId, ItemId, QcRequired, InspectionPlanId, InspectionPlanCode, CertificateRequirement, HoldRule, TraceabilityDepth, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (1, 10002, 1, NULL, N'QAP-FG-BR-001', N'Certificate of conformity', N'Hold until accepted', N'Item lot and customer drawing revision', N'Active', @now, NULL, @now, NULL);
END;

IF OBJECT_ID(N'[sales].[Currencies]', N'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM [sales].[Currencies] WHERE CompanyId = 1 AND CurrencyCode = N'INR')
BEGIN
    INSERT INTO [sales].[Currencies]
        (CompanyId, CurrencyCode, CurrencyName, Symbol, DecimalPrecision, RoundingMode, IsBaseCurrency, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (1, N'INR', N'Indian Rupee', N'Rs', 2, N'HalfUp', 1, N'Active', @now, NULL, @now, NULL);
END;

IF OBJECT_ID(N'[sales].[TaxCategories]', N'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM [sales].[TaxCategories] WHERE CompanyId = 1 AND TaxCategoryCode = N'GST18')
BEGIN
    INSERT INTO [sales].[TaxCategories]
        (CompanyId, TaxCategoryCode, TaxCategoryName, TaxScope, DefaultRatePercent, IsRecoverable, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (1, N'GST18', N'GST standard goods 18%', N'Domestic sale', 18.0000, 1, N'Active', @now, NULL, @now, NULL);
END;

IF OBJECT_ID(N'[sales].[TaxCodes]', N'U') IS NOT NULL
   AND OBJECT_ID(N'[sales].[TaxCategories]', N'U') IS NOT NULL
   AND NOT EXISTS (
        SELECT 1
        FROM [sales].[TaxCodes] code
        INNER JOIN [sales].[TaxCategories] category ON category.Id = code.TaxCategoryId
        WHERE category.CompanyId = 1 AND category.TaxCategoryCode = N'GST18' AND code.TaxCodeValue = N'GST18-LOCAL')
BEGIN
    INSERT INTO [sales].[TaxCodes]
        (TaxCategoryId, TaxCodeValue, TaxCodeName, RatePercent, EffectiveFrom, EffectiveTo, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    SELECT
        category.Id, N'GST18-LOCAL', N'GST 18% domestic supply', 18.0000, CONVERT(date, @now), NULL, N'Active', @now, NULL, @now, NULL
    FROM [sales].[TaxCategories] category
    WHERE category.CompanyId = 1 AND category.TaxCategoryCode = N'GST18';
END;

IF OBJECT_ID(N'[sales].[PaymentTerms]', N'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM [sales].[PaymentTerms] WHERE CompanyId = 1 AND PaymentTermsCode = N'NET30')
BEGIN
    INSERT INTO [sales].[PaymentTerms]
        (CompanyId, PaymentTermsCode, PaymentTermsName, NetDays, DiscountDays, DiscountPercent, DueCalculationMode, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (1, N'NET30', N'Net 30 days', 30, NULL, NULL, N'InvoiceDate', N'Active', @now, NULL, @now, NULL);
END;

IF OBJECT_ID(N'[sales].[TradeTerms]', N'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM [sales].[TradeTerms] WHERE CompanyId = 1 AND TradeTermsCode = N'EXW')
BEGIN
    INSERT INTO [sales].[TradeTerms]
        (CompanyId, TradeTermsCode, TradeTermsName, TradeMode, ResponsibilitySummary, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (1, N'EXW', N'Ex Works', N'Domestic dispatch', N'Customer-arranged pickup from agreed STS dispatch point.', N'Active', @now, NULL, @now, NULL);
END;

IF OBJECT_ID(N'[sales].[PriceLists]', N'U') IS NOT NULL
   AND OBJECT_ID(N'[sales].[Currencies]', N'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM [sales].[PriceLists] WHERE CompanyId = 1 AND PriceListCode = N'STD-INR-2026')
BEGIN
    INSERT INTO [sales].[PriceLists]
        (CompanyId, PriceListCode, PriceListName, CurrencyId, PriceListType, EffectiveFrom, EffectiveTo, CustomerSegment, ApprovalStatus, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    SELECT
        1, N'STD-INR-2026', N'Standard domestic INR price list', currency.Id, N'Standard Sales', CONVERT(date, @now), NULL, N'Domestic industrial', N'Draft', N'Active', @now, NULL, @now, NULL
    FROM [sales].[Currencies] currency
    WHERE currency.CompanyId = 1 AND currency.CurrencyCode = N'INR';
END;

IF OBJECT_ID(N'[sales].[PriceListLines]', N'U') IS NOT NULL
   AND OBJECT_ID(N'[sales].[PriceLists]', N'U') IS NOT NULL
   AND NOT EXISTS (
        SELECT 1
        FROM [sales].[PriceListLines] line
        INNER JOIN [sales].[PriceLists] list ON list.Id = line.PriceListId
        WHERE list.CompanyId = 1 AND list.PriceListCode = N'STD-INR-2026' AND line.ItemId = 10002)
BEGIN
    INSERT INTO [sales].[PriceListLines]
        (PriceListId, LineNo, ItemId, ItemGroupId, UomId, MinQuantity, UnitPrice, DiscountEligible, TaxCategoryId, EffectiveFrom, EffectiveTo, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    SELECT
        list.Id, 10, 10002, NULL, 1, 1, 875.000000, 1, tax.Id, CONVERT(date, @now), NULL, N'Active', @now, NULL, @now, NULL
    FROM [sales].[PriceLists] list
    LEFT JOIN [sales].[TaxCategories] tax ON tax.CompanyId = list.CompanyId AND tax.TaxCategoryCode = N'GST18'
    WHERE list.CompanyId = 1 AND list.PriceListCode = N'STD-INR-2026';
END;

IF OBJECT_ID(N'[sales].[PriceAssignments]', N'U') IS NOT NULL
   AND OBJECT_ID(N'[sales].[PriceLists]', N'U') IS NOT NULL
   AND NOT EXISTS (
        SELECT 1
        FROM [sales].[PriceAssignments] assignment
        INNER JOIN [sales].[PriceLists] list ON list.Id = assignment.PriceListId
        WHERE list.CompanyId = 1 AND list.PriceListCode = N'STD-INR-2026' AND assignment.CustomerId = 20001)
BEGIN
    INSERT INTO [sales].[PriceAssignments]
        (PriceListId, CustomerId, CustomerGroupCode, ItemGroupId, BranchId, PriorityRank, EffectiveFrom, EffectiveTo, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    SELECT
        list.Id, 20001, NULL, NULL, 11, 10, CONVERT(date, @now), NULL, N'Active', @now, NULL, @now, NULL
    FROM [sales].[PriceLists] list
    WHERE list.CompanyId = 1 AND list.PriceListCode = N'STD-INR-2026';
END;

IF OBJECT_ID(N'[sales].[DiscountSchemes]', N'U') IS NOT NULL
   AND OBJECT_ID(N'[sales].[Currencies]', N'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM [sales].[DiscountSchemes] WHERE CompanyId = 1 AND SchemeCode = N'VOL-STD-2026')
BEGIN
    INSERT INTO [sales].[DiscountSchemes]
        (CompanyId, SchemeCode, SchemeName, DiscountType, CurrencyId, EffectiveFrom, EffectiveTo, RequiresApproval, ApprovalStatus, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    SELECT
        1, N'VOL-STD-2026', N'Standard volume discount', N'Quantity Break', currency.Id, CONVERT(date, @now), NULL, 1, N'Draft', N'Active', @now, NULL, @now, NULL
    FROM [sales].[Currencies] currency
    WHERE currency.CompanyId = 1 AND currency.CurrencyCode = N'INR';
END;

IF OBJECT_ID(N'[sales].[DiscountRules]', N'U') IS NOT NULL
   AND OBJECT_ID(N'[sales].[DiscountSchemes]', N'U') IS NOT NULL
   AND NOT EXISTS (
        SELECT 1
        FROM [sales].[DiscountRules] rule
        INNER JOIN [sales].[DiscountSchemes] scheme ON scheme.Id = rule.DiscountSchemeId
        WHERE scheme.CompanyId = 1 AND scheme.SchemeCode = N'VOL-STD-2026' AND rule.RuleNo = 10)
BEGIN
    INSERT INTO [sales].[DiscountRules]
        (DiscountSchemeId, RuleNo, RuleName, ApplicabilityType, CustomerId, CustomerGroupCode, ItemId, ItemGroupId, MinQuantity, DiscountPercent, DiscountAmount, PriceListId, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    SELECT
        scheme.Id, 10, N'Bracket order quantity break', N'Item', NULL, NULL, 10002, NULL, 25, 3.0000, NULL, list.Id, N'Active', @now, NULL, @now, NULL
    FROM [sales].[DiscountSchemes] scheme
    LEFT JOIN [sales].[PriceLists] list ON list.CompanyId = scheme.CompanyId AND list.PriceListCode = N'STD-INR-2026'
    WHERE scheme.CompanyId = 1 AND scheme.SchemeCode = N'VOL-STD-2026';
END;

IF NOT EXISTS (SELECT 1 FROM resource.WorkCenters WHERE Id = 50001 OR (CompanyId = 1 AND WorkCenterCode = N'FAB'))
BEGIN
    SET IDENTITY_INSERT resource.WorkCenters ON;
    INSERT INTO resource.WorkCenters
        (Id, CompanyId, BranchId, DepartmentId, WorkCenterCode, WorkCenterName, CapacityUomId, DefaultShiftPatternCode, ParallelCapacityUnits, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (50001, 1, 11, 301, N'FAB', N'Fabrication Cell', 1, N'GENERAL', 1, N'Active', @now, NULL, @now, NULL);
    SET IDENTITY_INSERT resource.WorkCenters OFF;
END;

IF NOT EXISTS (SELECT 1 FROM resource.Operations WHERE Id = 51001 OR (CompanyId = 1 AND OperationCode = N'CUT'))
BEGIN
    SET IDENTITY_INSERT resource.Operations ON;
    INSERT INTO resource.Operations
        (Id, CompanyId, OperationCode, OperationName, OperationType, DefaultWorkCenterId, DefaultSetupMinutes, DefaultRunMinutesPerUnit, DefaultTeardownMinutes, AllowsOverlap, IsOutsideProcessing, RequiresQcCheckpoint, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (51001, 1, N'CUT', N'Cutting', N'Fabrication', 50001, 15, 2, 5, 0, 0, 1, N'Active', @now, NULL, @now, NULL);
    SET IDENTITY_INSERT resource.Operations OFF;
END;

IF NOT EXISTS (SELECT 1 FROM resource.Machines WHERE Id = 52001 OR (CompanyId = 1 AND MachineCode = N'CUT-01'))
BEGIN
    SET IDENTITY_INSERT resource.Machines ON;
    INSERT INTO resource.Machines
        (Id, CompanyId, BranchId, WorkCenterId, MachineCode, MachineName, CapacityPerHour, CurrentStatus, DefaultShiftId, IsUnderMaintenance, IsSchedulingEnabled, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (52001, 1, 11, 50001, N'CUT-01', N'Cutting Machine 01', 30, N'Idle', 1, 0, 1, N'Active', @now, NULL, @now, NULL);
    SET IDENTITY_INSERT resource.Machines OFF;
END;

IF NOT EXISTS (SELECT 1 FROM resource.Routings WHERE Id = 53001 OR (CompanyId = 1 AND RoutingCode = N'RT-BRACKET'))
BEGIN
    SET IDENTITY_INSERT resource.Routings ON;
    INSERT INTO resource.Routings
        (Id, CompanyId, RoutingCode, RoutingName, OutputItemId, RevisionCode, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (53001, 1, N'RT-BRACKET', N'Mounting Bracket Routing', 10002, N'A', N'Active', @now, NULL, @now, NULL);
    SET IDENTITY_INSERT resource.Routings OFF;
END;

IF NOT EXISTS (SELECT 1 FROM resource.RoutingOperations WHERE RoutingId = 53001 AND SequenceNo = 10)
BEGIN
    INSERT INTO resource.RoutingOperations
        (RoutingId, SequenceNo, OperationId, WorkCenterId, ToolId, SetupMinutes, RunMinutesPerUnit, TeardownMinutes, OverlapPercent, IsOutsideProcessing, RequiresQcCheckpoint, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (53001, 10, 51001, 50001, NULL, 15, 2, 5, NULL, 0, 1, N'Active', @now, NULL, @now, NULL);
END;

IF NOT EXISTS (SELECT 1 FROM engineering.Boms WHERE Id = 60001 OR (CompanyId = 1 AND BomCode = N'BOM-BRACKET'))
BEGIN
    SET IDENTITY_INSERT engineering.Boms ON;
    INSERT INTO engineering.Boms
        (Id, CompanyId, ItemId, BomCode, BomName, CurrentReleasedRevisionId, Status, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (60001, 1, 10002, N'BOM-BRACKET', N'Mounting Bracket BOM', NULL, N'Active', @now, NULL, @now, NULL);
    SET IDENTITY_INSERT engineering.Boms OFF;
END;

IF NOT EXISTS (SELECT 1 FROM engineering.BomRevisions WHERE Id = 60002 OR (BomId = 60001 AND RevisionCode = N'A'))
BEGIN
    SET IDENTITY_INSERT engineering.BomRevisions ON;
    INSERT INTO engineering.BomRevisions
        (Id, BomId, RevisionCode, EffectiveFrom, EffectiveTo, ApprovalStatus, RoutingId, ChangeSummary, IsPhantomParentAllowed, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (60002, 60001, N'A', CONVERT(date, @now), NULL, N'Released', 53001, N'Minimum runnable BOM revision', 0, @now, NULL, @now, NULL);
    SET IDENTITY_INSERT engineering.BomRevisions OFF;
END;

UPDATE engineering.Boms
SET CurrentReleasedRevisionId = 60002,
    ModifiedOn = @now
WHERE Id = 60001 AND CurrentReleasedRevisionId IS NULL;

IF NOT EXISTS (SELECT 1 FROM engineering.BomLines WHERE BomRevisionId = 60002 AND SequenceNo = 10)
BEGIN
    INSERT INTO engineering.BomLines
        (BomRevisionId, SequenceNo, ComponentItemId, QuantityPer, IssueUomId, ScrapPercent, IssueMethod, IsPhantom, AlternateItemId, EffectiveFrom, EffectiveTo, CreatedOn, CreatedByUserId, ModifiedOn, ModifiedByUserId)
    VALUES
        (60002, 10, 10001, 1.500000, 2, 2.0000, N'Manual', 0, NULL, CONVERT(date, @now), NULL, @now, NULL, @now, NULL);
END;
