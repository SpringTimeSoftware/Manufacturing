using STS.Mfg.Domain.Abstractions;

namespace STS.Mfg.Domain.Measurements;

public sealed class UomClass : AuditableEntity
{
    private UomClass()
    {
    }

    public string ClassCode { get; private set; } = string.Empty;
    public string ClassName { get; private set; } = string.Empty;
    public long? BaseUomId { get; private set; }
    public bool SupportsFormulaConversion { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static UomClass Create(string classCode, string className, long? baseUomId, bool supportsFormulaConversion, string status, long? userId)
    {
        var entity = new UomClass();
        entity.Update(classCode, className, baseUomId, supportsFormulaConversion, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string classCode, string className, long? baseUomId, bool supportsFormulaConversion, string status, long? userId)
    {
        ClassCode = classCode.Trim();
        ClassName = className.Trim();
        BaseUomId = baseUomId;
        SupportsFormulaConversion = supportsFormulaConversion;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class Uom : AuditableEntity
{
    private Uom()
    {
    }

    public string UomCode { get; private set; } = string.Empty;
    public string UomName { get; private set; } = string.Empty;
    public string? Symbol { get; private set; }
    public long UomClassId { get; private set; }
    public int DecimalPrecision { get; private set; }
    public bool IsSystemBase { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static Uom Create(string uomCode, string uomName, string? symbol, long uomClassId, int decimalPrecision, bool isSystemBase, string status, long? userId)
    {
        var entity = new Uom { UomClassId = uomClassId };
        entity.Update(uomCode, uomName, symbol, decimalPrecision, isSystemBase, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(string uomCode, string uomName, string? symbol, int decimalPrecision, bool isSystemBase, string status, long? userId)
    {
        UomCode = uomCode.Trim();
        UomName = uomName.Trim();
        Symbol = string.IsNullOrWhiteSpace(symbol) ? null : symbol.Trim();
        DecimalPrecision = decimalPrecision;
        IsSystemBase = isSystemBase;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class UomConversion : AuditableEntity
{
    private UomConversion()
    {
    }

    public long FromUomId { get; private set; }
    public long ToUomId { get; private set; }
    public string ConversionMode { get; private set; } = string.Empty;
    public decimal FactorNumerator { get; private set; }
    public decimal FactorDenominator { get; private set; }
    public string? FormulaTokenSet { get; private set; }
    public string RoundMode { get; private set; } = string.Empty;
    public int PrecisionScale { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static UomConversion Create(
        long fromUomId,
        long toUomId,
        string conversionMode,
        decimal factorNumerator,
        decimal factorDenominator,
        string? formulaTokenSet,
        string roundMode,
        int precisionScale,
        string status,
        long? userId)
    {
        var entity = new UomConversion { FromUomId = fromUomId, ToUomId = toUomId };
        entity.Update(conversionMode, factorNumerator, factorDenominator, formulaTokenSet, roundMode, precisionScale, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string conversionMode,
        decimal factorNumerator,
        decimal factorDenominator,
        string? formulaTokenSet,
        string roundMode,
        int precisionScale,
        string status,
        long? userId)
    {
        ConversionMode = conversionMode.Trim();
        FactorNumerator = factorNumerator;
        FactorDenominator = factorDenominator;
        FormulaTokenSet = string.IsNullOrWhiteSpace(formulaTokenSet) ? null : formulaTokenSet.Trim();
        RoundMode = roundMode.Trim();
        PrecisionScale = precisionScale;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class MeasurementProfile : AuditableEntity
{
    private MeasurementProfile()
    {
    }

    public string ProfileCode { get; private set; } = string.Empty;
    public string ProfileName { get; private set; } = string.Empty;
    public string ProfileType { get; private set; } = string.Empty;
    public long StockUomClassId { get; private set; }
    public bool AllowsCatchWeight { get; private set; }
    public bool RequiresDimensions { get; private set; }
    public bool RequiresDensity { get; private set; }
    public bool RequiresThickness { get; private set; }
    public bool RequiresPackSize { get; private set; }
    public bool SupportsCommercialProductionSplit { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static MeasurementProfile Create(
        string profileCode,
        string profileName,
        string profileType,
        long stockUomClassId,
        bool allowsCatchWeight,
        bool requiresDimensions,
        bool requiresDensity,
        bool requiresThickness,
        bool requiresPackSize,
        bool supportsCommercialProductionSplit,
        string status,
        long? userId)
    {
        var entity = new MeasurementProfile { StockUomClassId = stockUomClassId };
        entity.Update(profileCode, profileName, profileType, allowsCatchWeight, requiresDimensions, requiresDensity, requiresThickness, requiresPackSize, supportsCommercialProductionSplit, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string profileCode,
        string profileName,
        string profileType,
        bool allowsCatchWeight,
        bool requiresDimensions,
        bool requiresDensity,
        bool requiresThickness,
        bool requiresPackSize,
        bool supportsCommercialProductionSplit,
        string status,
        long? userId)
    {
        ProfileCode = profileCode.Trim();
        ProfileName = profileName.Trim();
        ProfileType = profileType.Trim();
        AllowsCatchWeight = allowsCatchWeight;
        RequiresDimensions = requiresDimensions;
        RequiresDensity = requiresDensity;
        RequiresThickness = requiresThickness;
        RequiresPackSize = requiresPackSize;
        SupportsCommercialProductionSplit = supportsCommercialProductionSplit;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}

public sealed class MeasurementFormula : AuditableEntity
{
    private MeasurementFormula()
    {
    }

    public long MeasurementProfileId { get; private set; }
    public string FormulaCode { get; private set; } = string.Empty;
    public string FormulaName { get; private set; } = string.Empty;
    public string FormulaPurpose { get; private set; } = string.Empty;
    public string ExpressionTemplate { get; private set; } = string.Empty;
    public long OutputUomId { get; private set; }
    public int PrecisionScale { get; private set; }
    public string Status { get; private set; } = string.Empty;

    public static MeasurementFormula Create(
        long measurementProfileId,
        string formulaCode,
        string formulaName,
        string formulaPurpose,
        string expressionTemplate,
        long outputUomId,
        int precisionScale,
        string status,
        long? userId)
    {
        var entity = new MeasurementFormula { MeasurementProfileId = measurementProfileId, OutputUomId = outputUomId };
        entity.Update(formulaCode, formulaName, formulaPurpose, expressionTemplate, precisionScale, status, userId);
        entity.CreatedOn = DateTimeOffset.UtcNow;
        entity.CreatedByUserId = userId;
        return entity;
    }

    public void Update(
        string formulaCode,
        string formulaName,
        string formulaPurpose,
        string expressionTemplate,
        int precisionScale,
        string status,
        long? userId)
    {
        FormulaCode = formulaCode.Trim();
        FormulaName = formulaName.Trim();
        FormulaPurpose = formulaPurpose.Trim();
        ExpressionTemplate = expressionTemplate.Trim();
        PrecisionScale = precisionScale;
        Status = status.Trim();
        ModifiedOn = DateTimeOffset.UtcNow;
        ModifiedByUserId = userId;
    }
}
