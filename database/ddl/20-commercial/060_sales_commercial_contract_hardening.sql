IF COL_LENGTH(N'sales.Quotes', N'SalesOwnerUserId') IS NULL
    ALTER TABLE sales.Quotes ADD SalesOwnerUserId BIGINT NULL;
IF COL_LENGTH(N'sales.Quotes', N'SalesOwnerName') IS NULL
    ALTER TABLE sales.Quotes ADD SalesOwnerName NVARCHAR(128) NULL;
IF COL_LENGTH(N'sales.Quotes', N'InternalRemarks') IS NULL
    ALTER TABLE sales.Quotes ADD InternalRemarks NVARCHAR(1000) NULL;
IF COL_LENGTH(N'sales.Quotes', N'CustomerFacingRemarks') IS NULL
    ALTER TABLE sales.Quotes ADD CustomerFacingRemarks NVARCHAR(1000) NULL;
IF COL_LENGTH(N'sales.Quotes', N'PrintRemarks') IS NULL
    ALTER TABLE sales.Quotes ADD PrintRemarks NVARCHAR(1000) NULL;
IF COL_LENGTH(N'sales.Quotes', N'PaymentTermsId') IS NULL
    ALTER TABLE sales.Quotes ADD PaymentTermsId BIGINT NULL;
IF COL_LENGTH(N'sales.Quotes', N'PriceListId') IS NULL
    ALTER TABLE sales.Quotes ADD PriceListId BIGINT NULL;
IF COL_LENGTH(N'sales.Quotes', N'DiscountSchemeId') IS NULL
    ALTER TABLE sales.Quotes ADD DiscountSchemeId BIGINT NULL;
IF COL_LENGTH(N'sales.Quotes', N'TaxCategoryId') IS NULL
    ALTER TABLE sales.Quotes ADD TaxCategoryId BIGINT NULL;
IF COL_LENGTH(N'sales.Quotes', N'TaxTreatment') IS NULL
    ALTER TABLE sales.Quotes ADD TaxTreatment NVARCHAR(32) NULL;
IF COL_LENGTH(N'sales.Quotes', N'CurrencyId') IS NULL
    ALTER TABLE sales.Quotes ADD CurrencyId BIGINT NULL;
IF COL_LENGTH(N'sales.Quotes', N'ExchangeRateId') IS NULL
    ALTER TABLE sales.Quotes ADD ExchangeRateId BIGINT NULL;
IF COL_LENGTH(N'sales.Quotes', N'ExchangeRateSnapshot') IS NULL
    ALTER TABLE sales.Quotes ADD ExchangeRateSnapshot DECIMAL(18,8) NULL;
IF COL_LENGTH(N'sales.Quotes', N'TradeTermsId') IS NULL
    ALTER TABLE sales.Quotes ADD TradeTermsId BIGINT NULL;

IF COL_LENGTH(N'sales.Quotes', N'FreightAmount') IS NULL
    ALTER TABLE sales.Quotes ADD FreightAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_Quotes_FreightAmount DEFAULT(0);
IF COL_LENGTH(N'sales.Quotes', N'PackingAmount') IS NULL
    ALTER TABLE sales.Quotes ADD PackingAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_Quotes_PackingAmount DEFAULT(0);
IF COL_LENGTH(N'sales.Quotes', N'InsuranceAmount') IS NULL
    ALTER TABLE sales.Quotes ADD InsuranceAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_Quotes_InsuranceAmount DEFAULT(0);
IF COL_LENGTH(N'sales.Quotes', N'OtherChargesAmount') IS NULL
    ALTER TABLE sales.Quotes ADD OtherChargesAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_Quotes_OtherChargesAmount DEFAULT(0);
IF COL_LENGTH(N'sales.Quotes', N'AddLessAmount') IS NULL
    ALTER TABLE sales.Quotes ADD AddLessAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_Quotes_AddLessAmount DEFAULT(0);
IF COL_LENGTH(N'sales.Quotes', N'RoundOffAmount') IS NULL
    ALTER TABLE sales.Quotes ADD RoundOffAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_Quotes_RoundOffAmount DEFAULT(0);
IF COL_LENGTH(N'sales.Quotes', N'SubtotalAmount') IS NULL
    ALTER TABLE sales.Quotes ADD SubtotalAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_Quotes_SubtotalAmount DEFAULT(0);
IF COL_LENGTH(N'sales.Quotes', N'DiscountTotalAmount') IS NULL
    ALTER TABLE sales.Quotes ADD DiscountTotalAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_Quotes_DiscountTotalAmount DEFAULT(0);
IF COL_LENGTH(N'sales.Quotes', N'TaxableAmount') IS NULL
    ALTER TABLE sales.Quotes ADD TaxableAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_Quotes_TaxableAmount DEFAULT(0);
IF COL_LENGTH(N'sales.Quotes', N'TaxTotalAmount') IS NULL
    ALTER TABLE sales.Quotes ADD TaxTotalAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_Quotes_TaxTotalAmount DEFAULT(0);
IF COL_LENGTH(N'sales.Quotes', N'GrandTotalAmount') IS NULL
    ALTER TABLE sales.Quotes ADD GrandTotalAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_Quotes_GrandTotalAmount DEFAULT(0);
IF COL_LENGTH(N'sales.Quotes', N'CommercialStatus') IS NULL
    ALTER TABLE sales.Quotes ADD CommercialStatus NVARCHAR(24) NOT NULL CONSTRAINT DF_Quotes_CommercialStatus DEFAULT(N'Draft');
IF COL_LENGTH(N'sales.Quotes', N'RevisionNo') IS NULL
    ALTER TABLE sales.Quotes ADD RevisionNo INT NOT NULL CONSTRAINT DF_Quotes_RevisionNo DEFAULT(1);
IF COL_LENGTH(N'sales.Quotes', N'ReleasedAt') IS NULL
    ALTER TABLE sales.Quotes ADD ReleasedAt DATETIMEOFFSET(7) NULL;
IF COL_LENGTH(N'sales.Quotes', N'ReleasedByUserId') IS NULL
    ALTER TABLE sales.Quotes ADD ReleasedByUserId BIGINT NULL;
IF COL_LENGTH(N'sales.Quotes', N'ConvertedAt') IS NULL
    ALTER TABLE sales.Quotes ADD ConvertedAt DATETIMEOFFSET(7) NULL;
IF COL_LENGTH(N'sales.Quotes', N'ConvertedByUserId') IS NULL
    ALTER TABLE sales.Quotes ADD ConvertedByUserId BIGINT NULL;
IF COL_LENGTH(N'sales.Quotes', N'ReopenedAt') IS NULL
    ALTER TABLE sales.Quotes ADD ReopenedAt DATETIMEOFFSET(7) NULL;
IF COL_LENGTH(N'sales.Quotes', N'ReopenedByUserId') IS NULL
    ALTER TABLE sales.Quotes ADD ReopenedByUserId BIGINT NULL;
IF COL_LENGTH(N'sales.Quotes', N'LegacyCommercialIncomplete') IS NULL
    ALTER TABLE sales.Quotes ADD LegacyCommercialIncomplete BIT NOT NULL CONSTRAINT DF_Quotes_LegacyCommercialIncomplete DEFAULT(1);

UPDATE sales.Quotes
SET CommercialStatus = CASE WHEN Status IN (N'Released', N'Converted', N'Closed', N'Cancelled') THEN Status ELSE N'Draft' END
WHERE CommercialStatus IS NULL OR CommercialStatus = N'';

IF COL_LENGTH(N'sales.QuoteLines', N'ItemRevisionId') IS NULL
    ALTER TABLE sales.QuoteLines ADD ItemRevisionId BIGINT NULL;
IF COL_LENGTH(N'sales.QuoteLines', N'EngineeringDocumentRevisionId') IS NULL
    ALTER TABLE sales.QuoteLines ADD EngineeringDocumentRevisionId BIGINT NULL;
IF COL_LENGTH(N'sales.QuoteLines', N'BomRevisionId') IS NULL
    ALTER TABLE sales.QuoteLines ADD BomRevisionId BIGINT NULL;
IF COL_LENGTH(N'sales.QuoteLines', N'RoutingId') IS NULL
    ALTER TABLE sales.QuoteLines ADD RoutingId BIGINT NULL;
IF COL_LENGTH(N'sales.QuoteLines', N'PriceSourceType') IS NULL
    ALTER TABLE sales.QuoteLines ADD PriceSourceType NVARCHAR(32) NOT NULL CONSTRAINT DF_QuoteLines_PriceSourceType DEFAULT(N'Manual');
IF COL_LENGTH(N'sales.QuoteLines', N'PriceListLineId') IS NULL
    ALTER TABLE sales.QuoteLines ADD PriceListLineId BIGINT NULL;
IF COL_LENGTH(N'sales.QuoteLines', N'DiscountSchemeId') IS NULL
    ALTER TABLE sales.QuoteLines ADD DiscountSchemeId BIGINT NULL;
IF COL_LENGTH(N'sales.QuoteLines', N'DiscountRuleId') IS NULL
    ALTER TABLE sales.QuoteLines ADD DiscountRuleId BIGINT NULL;
IF COL_LENGTH(N'sales.QuoteLines', N'TaxCodeId') IS NULL
    ALTER TABLE sales.QuoteLines ADD TaxCodeId BIGINT NULL;
IF COL_LENGTH(N'sales.QuoteLines', N'TaxRateSnapshot') IS NULL
    ALTER TABLE sales.QuoteLines ADD TaxRateSnapshot DECIMAL(9,4) NOT NULL CONSTRAINT DF_QuoteLines_TaxRateSnapshot DEFAULT(0);
IF COL_LENGTH(N'sales.QuoteLines', N'LineSubtotal') IS NULL
    ALTER TABLE sales.QuoteLines ADD LineSubtotal DECIMAL(18,4) NOT NULL CONSTRAINT DF_QuoteLines_LineSubtotal DEFAULT(0);
IF COL_LENGTH(N'sales.QuoteLines', N'LineTaxableAmount') IS NULL
    ALTER TABLE sales.QuoteLines ADD LineTaxableAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_QuoteLines_LineTaxableAmount DEFAULT(0);
IF COL_LENGTH(N'sales.QuoteLines', N'LineTotalAmount') IS NULL
    ALTER TABLE sales.QuoteLines ADD LineTotalAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_QuoteLines_LineTotalAmount DEFAULT(0);
IF COL_LENGTH(N'sales.QuoteLines', N'LineInternalRemarks') IS NULL
    ALTER TABLE sales.QuoteLines ADD LineInternalRemarks NVARCHAR(1000) NULL;
IF COL_LENGTH(N'sales.QuoteLines', N'LineCustomerFacingRemarks') IS NULL
    ALTER TABLE sales.QuoteLines ADD LineCustomerFacingRemarks NVARCHAR(1000) NULL;
IF COL_LENGTH(N'sales.QuoteLines', N'OverrideReason') IS NULL
    ALTER TABLE sales.QuoteLines ADD OverrideReason NVARCHAR(512) NULL;
IF COL_LENGTH(N'sales.QuoteLines', N'OverrideByUserId') IS NULL
    ALTER TABLE sales.QuoteLines ADD OverrideByUserId BIGINT NULL;
IF COL_LENGTH(N'sales.QuoteLines', N'OverrideAt') IS NULL
    ALTER TABLE sales.QuoteLines ADD OverrideAt DATETIMEOFFSET(7) NULL;

UPDATE sales.QuoteLines
SET TaxRateSnapshot = TaxPercent,
    LineSubtotal = ROUND(Quantity * UnitPrice, 2),
    LineTaxableAmount = ROUND((Quantity * UnitPrice) - DiscountAmount, 2),
    LineTotalAmount = LineAmount
WHERE LineTotalAmount = 0 AND LineAmount <> 0;

IF COL_LENGTH(N'sales.SalesOrders', N'SourceQuoteRevisionNo') IS NULL
    ALTER TABLE sales.SalesOrders ADD SourceQuoteRevisionNo INT NULL;
IF COL_LENGTH(N'sales.SalesOrders', N'SourceQuoteVersionNo') IS NULL
    ALTER TABLE sales.SalesOrders ADD SourceQuoteVersionNo INT NULL;
IF COL_LENGTH(N'sales.SalesOrders', N'SalesOwnerUserId') IS NULL
    ALTER TABLE sales.SalesOrders ADD SalesOwnerUserId BIGINT NULL;
IF COL_LENGTH(N'sales.SalesOrders', N'SalesOwnerName') IS NULL
    ALTER TABLE sales.SalesOrders ADD SalesOwnerName NVARCHAR(128) NULL;
IF COL_LENGTH(N'sales.SalesOrders', N'InternalRemarks') IS NULL
    ALTER TABLE sales.SalesOrders ADD InternalRemarks NVARCHAR(1000) NULL;
IF COL_LENGTH(N'sales.SalesOrders', N'CustomerFacingRemarks') IS NULL
    ALTER TABLE sales.SalesOrders ADD CustomerFacingRemarks NVARCHAR(1000) NULL;
IF COL_LENGTH(N'sales.SalesOrders', N'PrintRemarks') IS NULL
    ALTER TABLE sales.SalesOrders ADD PrintRemarks NVARCHAR(1000) NULL;
IF COL_LENGTH(N'sales.SalesOrders', N'PaymentTermsId') IS NULL
    ALTER TABLE sales.SalesOrders ADD PaymentTermsId BIGINT NULL;
IF COL_LENGTH(N'sales.SalesOrders', N'PriceListId') IS NULL
    ALTER TABLE sales.SalesOrders ADD PriceListId BIGINT NULL;
IF COL_LENGTH(N'sales.SalesOrders', N'DiscountSchemeId') IS NULL
    ALTER TABLE sales.SalesOrders ADD DiscountSchemeId BIGINT NULL;
IF COL_LENGTH(N'sales.SalesOrders', N'TaxCategoryId') IS NULL
    ALTER TABLE sales.SalesOrders ADD TaxCategoryId BIGINT NULL;
IF COL_LENGTH(N'sales.SalesOrders', N'TaxTreatment') IS NULL
    ALTER TABLE sales.SalesOrders ADD TaxTreatment NVARCHAR(32) NULL;
IF COL_LENGTH(N'sales.SalesOrders', N'CurrencyId') IS NULL
    ALTER TABLE sales.SalesOrders ADD CurrencyId BIGINT NULL;
IF COL_LENGTH(N'sales.SalesOrders', N'ExchangeRateId') IS NULL
    ALTER TABLE sales.SalesOrders ADD ExchangeRateId BIGINT NULL;
IF COL_LENGTH(N'sales.SalesOrders', N'ExchangeRateSnapshot') IS NULL
    ALTER TABLE sales.SalesOrders ADD ExchangeRateSnapshot DECIMAL(18,8) NULL;
IF COL_LENGTH(N'sales.SalesOrders', N'TradeTermsId') IS NULL
    ALTER TABLE sales.SalesOrders ADD TradeTermsId BIGINT NULL;
IF COL_LENGTH(N'sales.SalesOrders', N'FreightAmount') IS NULL
    ALTER TABLE sales.SalesOrders ADD FreightAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_SalesOrders_FreightAmount DEFAULT(0);
IF COL_LENGTH(N'sales.SalesOrders', N'PackingAmount') IS NULL
    ALTER TABLE sales.SalesOrders ADD PackingAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_SalesOrders_PackingAmount DEFAULT(0);
IF COL_LENGTH(N'sales.SalesOrders', N'InsuranceAmount') IS NULL
    ALTER TABLE sales.SalesOrders ADD InsuranceAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_SalesOrders_InsuranceAmount DEFAULT(0);
IF COL_LENGTH(N'sales.SalesOrders', N'OtherChargesAmount') IS NULL
    ALTER TABLE sales.SalesOrders ADD OtherChargesAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_SalesOrders_OtherChargesAmount DEFAULT(0);
IF COL_LENGTH(N'sales.SalesOrders', N'AddLessAmount') IS NULL
    ALTER TABLE sales.SalesOrders ADD AddLessAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_SalesOrders_AddLessAmount DEFAULT(0);
IF COL_LENGTH(N'sales.SalesOrders', N'RoundOffAmount') IS NULL
    ALTER TABLE sales.SalesOrders ADD RoundOffAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_SalesOrders_RoundOffAmount DEFAULT(0);
IF COL_LENGTH(N'sales.SalesOrders', N'SubtotalAmount') IS NULL
    ALTER TABLE sales.SalesOrders ADD SubtotalAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_SalesOrders_SubtotalAmount DEFAULT(0);
IF COL_LENGTH(N'sales.SalesOrders', N'DiscountTotalAmount') IS NULL
    ALTER TABLE sales.SalesOrders ADD DiscountTotalAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_SalesOrders_DiscountTotalAmount DEFAULT(0);
IF COL_LENGTH(N'sales.SalesOrders', N'TaxableAmount') IS NULL
    ALTER TABLE sales.SalesOrders ADD TaxableAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_SalesOrders_TaxableAmount DEFAULT(0);
IF COL_LENGTH(N'sales.SalesOrders', N'TaxTotalAmount') IS NULL
    ALTER TABLE sales.SalesOrders ADD TaxTotalAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_SalesOrders_TaxTotalAmount DEFAULT(0);
IF COL_LENGTH(N'sales.SalesOrders', N'GrandTotalAmount') IS NULL
    ALTER TABLE sales.SalesOrders ADD GrandTotalAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_SalesOrders_GrandTotalAmount DEFAULT(0);
IF COL_LENGTH(N'sales.SalesOrders', N'CommercialStatus') IS NULL
    ALTER TABLE sales.SalesOrders ADD CommercialStatus NVARCHAR(24) NOT NULL CONSTRAINT DF_SalesOrders_CommercialStatus DEFAULT(N'Draft');
IF COL_LENGTH(N'sales.SalesOrders', N'ReleasedAt') IS NULL
    ALTER TABLE sales.SalesOrders ADD ReleasedAt DATETIMEOFFSET(7) NULL;
IF COL_LENGTH(N'sales.SalesOrders', N'ReleasedByUserId') IS NULL
    ALTER TABLE sales.SalesOrders ADD ReleasedByUserId BIGINT NULL;
IF COL_LENGTH(N'sales.SalesOrders', N'LegacyCommercialIncomplete') IS NULL
    ALTER TABLE sales.SalesOrders ADD LegacyCommercialIncomplete BIT NOT NULL CONSTRAINT DF_SalesOrders_LegacyCommercialIncomplete DEFAULT(1);

IF COL_LENGTH(N'sales.SalesOrderLines', N'ItemRevisionId') IS NULL
    ALTER TABLE sales.SalesOrderLines ADD ItemRevisionId BIGINT NULL;
IF COL_LENGTH(N'sales.SalesOrderLines', N'EngineeringDocumentRevisionId') IS NULL
    ALTER TABLE sales.SalesOrderLines ADD EngineeringDocumentRevisionId BIGINT NULL;
IF COL_LENGTH(N'sales.SalesOrderLines', N'BomRevisionId') IS NULL
    ALTER TABLE sales.SalesOrderLines ADD BomRevisionId BIGINT NULL;
IF COL_LENGTH(N'sales.SalesOrderLines', N'RoutingId') IS NULL
    ALTER TABLE sales.SalesOrderLines ADD RoutingId BIGINT NULL;
IF COL_LENGTH(N'sales.SalesOrderLines', N'UnitPrice') IS NULL
    ALTER TABLE sales.SalesOrderLines ADD UnitPrice DECIMAL(18,4) NOT NULL CONSTRAINT DF_SalesOrderLines_UnitPrice DEFAULT(0);
IF COL_LENGTH(N'sales.SalesOrderLines', N'PriceSourceType') IS NULL
    ALTER TABLE sales.SalesOrderLines ADD PriceSourceType NVARCHAR(32) NOT NULL CONSTRAINT DF_SalesOrderLines_PriceSourceType DEFAULT(N'Manual');
IF COL_LENGTH(N'sales.SalesOrderLines', N'PriceListLineId') IS NULL
    ALTER TABLE sales.SalesOrderLines ADD PriceListLineId BIGINT NULL;
IF COL_LENGTH(N'sales.SalesOrderLines', N'DiscountSchemeId') IS NULL
    ALTER TABLE sales.SalesOrderLines ADD DiscountSchemeId BIGINT NULL;
IF COL_LENGTH(N'sales.SalesOrderLines', N'DiscountRuleId') IS NULL
    ALTER TABLE sales.SalesOrderLines ADD DiscountRuleId BIGINT NULL;
IF COL_LENGTH(N'sales.SalesOrderLines', N'DiscountPercent') IS NULL
    ALTER TABLE sales.SalesOrderLines ADD DiscountPercent DECIMAL(9,4) NOT NULL CONSTRAINT DF_SalesOrderLines_DiscountPercent DEFAULT(0);
IF COL_LENGTH(N'sales.SalesOrderLines', N'DiscountAmount') IS NULL
    ALTER TABLE sales.SalesOrderLines ADD DiscountAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_SalesOrderLines_DiscountAmount DEFAULT(0);
IF COL_LENGTH(N'sales.SalesOrderLines', N'TaxCodeId') IS NULL
    ALTER TABLE sales.SalesOrderLines ADD TaxCodeId BIGINT NULL;
IF COL_LENGTH(N'sales.SalesOrderLines', N'TaxRateSnapshot') IS NULL
    ALTER TABLE sales.SalesOrderLines ADD TaxRateSnapshot DECIMAL(9,4) NOT NULL CONSTRAINT DF_SalesOrderLines_TaxRateSnapshot DEFAULT(0);
IF COL_LENGTH(N'sales.SalesOrderLines', N'TaxAmount') IS NULL
    ALTER TABLE sales.SalesOrderLines ADD TaxAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_SalesOrderLines_TaxAmount DEFAULT(0);
IF COL_LENGTH(N'sales.SalesOrderLines', N'LineSubtotal') IS NULL
    ALTER TABLE sales.SalesOrderLines ADD LineSubtotal DECIMAL(18,4) NOT NULL CONSTRAINT DF_SalesOrderLines_LineSubtotal DEFAULT(0);
IF COL_LENGTH(N'sales.SalesOrderLines', N'LineTaxableAmount') IS NULL
    ALTER TABLE sales.SalesOrderLines ADD LineTaxableAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_SalesOrderLines_LineTaxableAmount DEFAULT(0);
IF COL_LENGTH(N'sales.SalesOrderLines', N'LineTotalAmount') IS NULL
    ALTER TABLE sales.SalesOrderLines ADD LineTotalAmount DECIMAL(18,4) NOT NULL CONSTRAINT DF_SalesOrderLines_LineTotalAmount DEFAULT(0);
IF COL_LENGTH(N'sales.SalesOrderLines', N'LineInternalRemarks') IS NULL
    ALTER TABLE sales.SalesOrderLines ADD LineInternalRemarks NVARCHAR(1000) NULL;
IF COL_LENGTH(N'sales.SalesOrderLines', N'LineCustomerFacingRemarks') IS NULL
    ALTER TABLE sales.SalesOrderLines ADD LineCustomerFacingRemarks NVARCHAR(1000) NULL;
IF COL_LENGTH(N'sales.SalesOrderLines', N'OverrideReason') IS NULL
    ALTER TABLE sales.SalesOrderLines ADD OverrideReason NVARCHAR(512) NULL;
IF COL_LENGTH(N'sales.SalesOrderLines', N'OverrideByUserId') IS NULL
    ALTER TABLE sales.SalesOrderLines ADD OverrideByUserId BIGINT NULL;
IF COL_LENGTH(N'sales.SalesOrderLines', N'OverrideAt') IS NULL
    ALTER TABLE sales.SalesOrderLines ADD OverrideAt DATETIMEOFFSET(7) NULL;

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_Quotes_CommercialStatus' AND object_id = OBJECT_ID(N'sales.Quotes'))
    CREATE INDEX IX_Quotes_CommercialStatus ON sales.Quotes(CompanyId, BranchId, CommercialStatus);
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'IX_SalesOrders_SourceQuote' AND object_id = OBJECT_ID(N'sales.SalesOrders'))
    CREATE INDEX IX_SalesOrders_SourceQuote ON sales.SalesOrders(SourceQuoteId, SourceQuoteRevisionNo);
