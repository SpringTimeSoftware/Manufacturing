using STS.Mfg.Domain.Abstractions;

namespace STS.Mfg.Domain.Platform.Customization;

public sealed class UdfDefinition : AuditableEntity, ICompanyScoped
{
    private UdfDefinition()
    {
    }

    public long? CompanyId { get; private set; }
    public string Module { get; private set; } = string.Empty;
    public string EntityType { get; private set; } = string.Empty;
    public string? EntitySubType { get; private set; }
    public string EntityLevel { get; private set; } = string.Empty;
    public string FieldKey { get; private set; } = string.Empty;
    public string Label { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string DataType { get; private set; } = string.Empty;
    public string ControlType { get; private set; } = string.Empty;
    public string? LookupSource { get; private set; }
    public string? LookupSourceType { get; private set; }
    public string? OptionSetCode { get; private set; }
    public bool IsRequired { get; private set; }
    public bool IsUnique { get; private set; }
    public bool IsReadOnly { get; private set; }
    public decimal? MinNumber { get; private set; }
    public decimal? MaxNumber { get; private set; }
    public int? MaxLength { get; private set; }
    public int? DecimalScale { get; private set; }
    public string? DefaultValue { get; private set; }
    public string? PlaceholderText { get; private set; }
    public string? HelpText { get; private set; }
    public int DisplayOrder { get; private set; }
    public string? SectionName { get; private set; }
    public DateTimeOffset? EffectiveFrom { get; private set; }
    public DateTimeOffset? EffectiveTo { get; private set; }
    public int VersionNo { get; private set; }
    public string? ValidationRulesJson { get; private set; }
    public string RoleVisibility { get; private set; } = string.Empty;
    public bool IsReportable { get; private set; }
    public bool AllowIntegration { get; private set; }
    public bool AllowMobile { get; private set; }
    public bool IsSensitive { get; private set; }
    public string LifecycleGate { get; private set; } = string.Empty;
    public string ValueLockPolicy { get; private set; } = string.Empty;
    public string Status { get; private set; } = string.Empty;
}

public sealed class UdfValue : AuditableEntity, ICompanyScoped
{
    private UdfValue()
    {
    }

    public long? CompanyId { get; private set; }
    public long DefinitionId { get; private set; }
    public string? EntityType { get; private set; }
    public long EntityId { get; private set; }
    public long? EntityLineId { get; private set; }
    public int? EntityVersionNo { get; private set; }
    public string? ValueText { get; private set; }
    public string? ValueLongText { get; private set; }
    public long? ValueInteger { get; private set; }
    public decimal? ValueNumber { get; private set; }
    public decimal? ValueDecimal { get; private set; }
    public decimal? ValueMoneyAmount { get; private set; }
    public long? ValueCurrencyId { get; private set; }
    public DateTimeOffset? ValueDate { get; private set; }
    public DateTimeOffset? ValueDateTime { get; private set; }
    public bool? ValueBoolean { get; private set; }
    public long? ValueOptionId { get; private set; }
    public string? ValueOptionCode { get; private set; }
    public string? ValueJson { get; private set; }
    public long? AttachmentReferenceId { get; private set; }
    public string? DisplayValue { get; private set; }
    public string Status { get; private set; } = string.Empty;
}

public sealed class UdfPlacement : AuditableEntity, ICompanyScoped
{
    private UdfPlacement()
    {
    }

    public long? CompanyId { get; private set; }
    public long UdfDefinitionId { get; private set; }
    public string Module { get; private set; } = string.Empty;
    public string ScreenKey { get; private set; } = string.Empty;
    public string? RoutePath { get; private set; }
    public string EntityType { get; private set; } = string.Empty;
    public string EntityLevel { get; private set; } = string.Empty;
    public string SectionName { get; private set; } = string.Empty;
    public string? TabName { get; private set; }
    public string? GroupName { get; private set; }
    public int DisplayOrder { get; private set; }
    public int? ColumnSpan { get; private set; }
    public string? VisibleConditionJson { get; private set; }
    public string? EditableConditionJson { get; private set; }
    public string? RequiredConditionJson { get; private set; }
    public string? PermissionKey { get; private set; }
    public string Status { get; private set; } = string.Empty;
}

public sealed class UdfOptionSet : AuditableEntity, ICompanyScoped
{
    private UdfOptionSet()
    {
    }

    public long? CompanyId { get; private set; }
    public string OptionSetCode { get; private set; } = string.Empty;
    public string OptionSetName { get; private set; } = string.Empty;
    public string? Description { get; private set; }
    public string Status { get; private set; } = string.Empty;
}

public sealed class UdfOption : AuditableEntity
{
    private UdfOption()
    {
    }

    public long OptionSetId { get; private set; }
    public string OptionCode { get; private set; } = string.Empty;
    public string OptionName { get; private set; } = string.Empty;
    public int DisplayOrder { get; private set; }
    public string? ColorToken { get; private set; }
    public DateTimeOffset? EffectiveFrom { get; private set; }
    public DateTimeOffset? EffectiveTo { get; private set; }
    public string Status { get; private set; } = string.Empty;
}

public sealed class UdfValueHistory
{
    private UdfValueHistory()
    {
    }

    public long Id { get; private set; }
    public long UdfValueId { get; private set; }
    public long DefinitionId { get; private set; }
    public string EntityType { get; private set; } = string.Empty;
    public long EntityId { get; private set; }
    public long? EntityLineId { get; private set; }
    public string? PriorDisplayValue { get; private set; }
    public string? NextDisplayValue { get; private set; }
    public string? ChangeReason { get; private set; }
    public DateTimeOffset ChangedOn { get; private set; }
    public long? ChangedByUserId { get; private set; }
}

public sealed class CustomObject : AuditableEntity, ICompanyScoped
{
    private CustomObject()
    {
    }

    public long? CompanyId { get; private set; }
    public string ObjectCode { get; private set; } = string.Empty;
    public string ObjectName { get; private set; } = string.Empty;
    public string Module { get; private set; } = string.Empty;
    public string? Category { get; private set; }
    public string? PrimaryDisplayFieldCode { get; private set; }
    public string? Description { get; private set; }
    public string Status { get; private set; } = string.Empty;
}

public sealed class CustomObjectRecord : AuditableEntity, ICompanyScoped
{
    private CustomObjectRecord()
    {
    }

    public long? CompanyId { get; private set; }
    public long CustomObjectId { get; private set; }
    public string RecordNo { get; private set; } = string.Empty;
    public string? DisplayValue { get; private set; }
    public string? LinkedEntityType { get; private set; }
    public long? LinkedEntityId { get; private set; }
    public string Status { get; private set; } = string.Empty;
}

public sealed class CustomScreen : AuditableEntity, ICompanyScoped
{
    private CustomScreen()
    {
    }

    public long? CompanyId { get; private set; }
    public string ScreenCode { get; private set; } = string.Empty;
    public string ScreenName { get; private set; } = string.Empty;
    public string Module { get; private set; } = string.Empty;
    public string? NavigationGroup { get; private set; }
    public string? BoundEntityType { get; private set; }
    public long? CustomObjectId { get; private set; }
    public string RoutePath { get; private set; } = string.Empty;
    public string LayoutJson { get; private set; } = "{}";
    public string? ListViewJson { get; private set; }
    public string? PermissionKey { get; private set; }
    public string Status { get; private set; } = string.Empty;
}
