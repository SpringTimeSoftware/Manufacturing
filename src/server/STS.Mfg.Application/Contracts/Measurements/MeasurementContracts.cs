using STS.Mfg.Application.Contracts;

namespace STS.Mfg.Application.Contracts.Measurements;

public sealed record MeasurementFilter(
    int Page = 1,
    int PageSize = 25,
    string? Search = null,
    string? Status = null,
    long? CompanyId = null) : QueryFilter(Page, PageSize, Search, Status);

public sealed record UomClassDto(long Id, string ClassCode, string ClassName, long? BaseUomId, bool SupportsFormulaConversion, string Status);
public sealed record UomClassUpsertRequest(string ClassCode, string ClassName, long? BaseUomId, bool SupportsFormulaConversion, string Status);
public sealed record UomDto(long Id, string UomCode, string UomName, string? Symbol, long UomClassId, int DecimalPrecision, bool IsSystemBase, string Status);
public sealed record UomUpsertRequest(string UomCode, string UomName, string? Symbol, long UomClassId, int DecimalPrecision, bool IsSystemBase, string Status);
public sealed record UomConversionDto(long Id, long FromUomId, long ToUomId, string ConversionMode, decimal FactorNumerator, decimal FactorDenominator, string? FormulaTokenSet, string RoundMode, int PrecisionScale, string Status);
public sealed record UomConversionUpsertRequest(long FromUomId, long ToUomId, string ConversionMode, decimal FactorNumerator, decimal FactorDenominator, string? FormulaTokenSet, string RoundMode, int PrecisionScale, string Status);
public sealed record MeasurementProfileDto(long Id, string ProfileCode, string ProfileName, string ProfileType, long StockUomClassId, bool AllowsCatchWeight, bool RequiresDimensions, bool RequiresDensity, bool RequiresThickness, bool RequiresPackSize, bool SupportsCommercialProductionSplit, string Status);
public sealed record MeasurementProfileUpsertRequest(string ProfileCode, string ProfileName, string ProfileType, long StockUomClassId, bool AllowsCatchWeight, bool RequiresDimensions, bool RequiresDensity, bool RequiresThickness, bool RequiresPackSize, bool SupportsCommercialProductionSplit, string Status);
public sealed record MeasurementFormulaDto(long Id, long MeasurementProfileId, string FormulaCode, string FormulaName, string FormulaPurpose, string ExpressionTemplate, long OutputUomId, int PrecisionScale, string Status);
public sealed record MeasurementFormulaUpsertRequest(long MeasurementProfileId, string FormulaCode, string FormulaName, string FormulaPurpose, string ExpressionTemplate, long OutputUomId, int PrecisionScale, string Status);
