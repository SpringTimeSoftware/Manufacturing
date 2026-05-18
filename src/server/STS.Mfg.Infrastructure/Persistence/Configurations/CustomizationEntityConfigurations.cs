using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using STS.Mfg.Domain.Platform.Customization;

namespace STS.Mfg.Infrastructure.Persistence.Configurations;

public sealed class UdfDefinitionConfiguration : IEntityTypeConfiguration<UdfDefinition>
{
    public void Configure(EntityTypeBuilder<UdfDefinition> builder)
    {
        builder.ToTable("UdfDefinitions", "platform");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.Module).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.EntityType).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.EntitySubType).HasMaxLength(64);
        builder.Property(entity => entity.EntityLevel).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.FieldKey).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.Label).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.Description).HasMaxLength(512);
        builder.Property(entity => entity.DataType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.ControlType).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.LookupSource).HasMaxLength(128);
        builder.Property(entity => entity.LookupSourceType).HasMaxLength(32);
        builder.Property(entity => entity.OptionSetCode).HasMaxLength(96);
        builder.Property(entity => entity.MinNumber).HasPrecision(18, 6);
        builder.Property(entity => entity.MaxNumber).HasPrecision(18, 6);
        builder.Property(entity => entity.DefaultValue).HasMaxLength(512);
        builder.Property(entity => entity.PlaceholderText).HasMaxLength(160);
        builder.Property(entity => entity.HelpText).HasMaxLength(512);
        builder.Property(entity => entity.SectionName).HasMaxLength(96);
        builder.Property(entity => entity.ValidationRulesJson).HasColumnType("nvarchar(max)");
        builder.Property(entity => entity.RoleVisibility).HasMaxLength(512).IsRequired();
        builder.Property(entity => entity.LifecycleGate).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.ValueLockPolicy).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.Status).HasMaxLength(32).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.EntityType, entity.EntityLevel, entity.FieldKey }).IsUnique();
        builder.HasIndex(entity => new { entity.Module, entity.EntityType, entity.Status });
    }
}

public sealed class UdfValueConfiguration : IEntityTypeConfiguration<UdfValue>
{
    public void Configure(EntityTypeBuilder<UdfValue> builder)
    {
        builder.ToTable("UdfValues", "platform");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.EntityType).HasMaxLength(64);
        builder.Property(entity => entity.ValueText).HasColumnType("nvarchar(max)");
        builder.Property(entity => entity.ValueLongText).HasColumnType("nvarchar(max)");
        builder.Property(entity => entity.ValueNumber).HasPrecision(18, 6);
        builder.Property(entity => entity.ValueDecimal).HasPrecision(18, 6);
        builder.Property(entity => entity.ValueMoneyAmount).HasPrecision(19, 4);
        builder.Property(entity => entity.ValueOptionCode).HasMaxLength(96);
        builder.Property(entity => entity.ValueJson).HasColumnType("nvarchar(max)");
        builder.Property(entity => entity.DisplayValue).HasMaxLength(512);
        builder.Property(entity => entity.Status).HasMaxLength(32).IsRequired();
        builder.HasIndex(entity => new { entity.DefinitionId, entity.EntityId, entity.EntityLineId }).IsUnique();
        builder.HasIndex(entity => new { entity.EntityType, entity.EntityId });
    }
}

public sealed class UdfPlacementConfiguration : IEntityTypeConfiguration<UdfPlacement>
{
    public void Configure(EntityTypeBuilder<UdfPlacement> builder)
    {
        builder.ToTable("UdfPlacements", "platform");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.Module).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.ScreenKey).HasMaxLength(128).IsRequired();
        builder.Property(entity => entity.RoutePath).HasMaxLength(256);
        builder.Property(entity => entity.EntityType).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.EntityLevel).HasMaxLength(32).IsRequired();
        builder.Property(entity => entity.SectionName).HasMaxLength(96).IsRequired();
        builder.Property(entity => entity.TabName).HasMaxLength(96);
        builder.Property(entity => entity.GroupName).HasMaxLength(96);
        builder.Property(entity => entity.VisibleConditionJson).HasColumnType("nvarchar(max)");
        builder.Property(entity => entity.EditableConditionJson).HasColumnType("nvarchar(max)");
        builder.Property(entity => entity.RequiredConditionJson).HasColumnType("nvarchar(max)");
        builder.Property(entity => entity.PermissionKey).HasMaxLength(128);
        builder.Property(entity => entity.Status).HasMaxLength(32).IsRequired();
        builder.HasIndex(entity => new { entity.ScreenKey, entity.EntityType, entity.EntityLevel, entity.Status });
    }
}

public sealed class UdfOptionSetConfiguration : IEntityTypeConfiguration<UdfOptionSet>
{
    public void Configure(EntityTypeBuilder<UdfOptionSet> builder)
    {
        builder.ToTable("UdfOptionSets", "platform");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.OptionSetCode).HasMaxLength(96).IsRequired();
        builder.Property(entity => entity.OptionSetName).HasMaxLength(160).IsRequired();
        builder.Property(entity => entity.Description).HasMaxLength(512);
        builder.Property(entity => entity.Status).HasMaxLength(32).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.OptionSetCode }).IsUnique();
    }
}

public sealed class UdfOptionConfiguration : IEntityTypeConfiguration<UdfOption>
{
    public void Configure(EntityTypeBuilder<UdfOption> builder)
    {
        builder.ToTable("UdfOptions", "platform");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.OptionCode).HasMaxLength(96).IsRequired();
        builder.Property(entity => entity.OptionName).HasMaxLength(160).IsRequired();
        builder.Property(entity => entity.ColorToken).HasMaxLength(32);
        builder.Property(entity => entity.Status).HasMaxLength(32).IsRequired();
        builder.HasIndex(entity => new { entity.OptionSetId, entity.OptionCode }).IsUnique();
    }
}

public sealed class UdfValueHistoryConfiguration : IEntityTypeConfiguration<UdfValueHistory>
{
    public void Configure(EntityTypeBuilder<UdfValueHistory> builder)
    {
        builder.ToTable("UdfValueHistory", "platform");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.EntityType).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.PriorDisplayValue).HasMaxLength(512);
        builder.Property(entity => entity.NextDisplayValue).HasMaxLength(512);
        builder.Property(entity => entity.ChangeReason).HasMaxLength(256);
        builder.HasIndex(entity => new { entity.DefinitionId, entity.EntityType, entity.EntityId, entity.EntityLineId });
    }
}

public sealed class CustomObjectConfiguration : IEntityTypeConfiguration<CustomObject>
{
    public void Configure(EntityTypeBuilder<CustomObject> builder)
    {
        builder.ToTable("CustomObjects", "platform");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ObjectCode).HasMaxLength(96).IsRequired();
        builder.Property(entity => entity.ObjectName).HasMaxLength(160).IsRequired();
        builder.Property(entity => entity.Module).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.Category).HasMaxLength(64);
        builder.Property(entity => entity.PrimaryDisplayFieldCode).HasMaxLength(96);
        builder.Property(entity => entity.Description).HasMaxLength(512);
        builder.Property(entity => entity.Status).HasMaxLength(32).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.ObjectCode }).IsUnique();
    }
}

public sealed class CustomObjectRecordConfiguration : IEntityTypeConfiguration<CustomObjectRecord>
{
    public void Configure(EntityTypeBuilder<CustomObjectRecord> builder)
    {
        builder.ToTable("CustomObjectRecords", "platform");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.RecordNo).HasMaxLength(96).IsRequired();
        builder.Property(entity => entity.DisplayValue).HasMaxLength(256);
        builder.Property(entity => entity.LinkedEntityType).HasMaxLength(64);
        builder.Property(entity => entity.Status).HasMaxLength(32).IsRequired();
        builder.HasIndex(entity => new { entity.CustomObjectId, entity.RecordNo }).IsUnique();
    }
}

public sealed class CustomScreenConfiguration : IEntityTypeConfiguration<CustomScreen>
{
    public void Configure(EntityTypeBuilder<CustomScreen> builder)
    {
        builder.ToTable("CustomScreens", "platform");
        builder.HasKey(entity => entity.Id);
        builder.Property(entity => entity.ScreenCode).HasMaxLength(96).IsRequired();
        builder.Property(entity => entity.ScreenName).HasMaxLength(160).IsRequired();
        builder.Property(entity => entity.Module).HasMaxLength(64).IsRequired();
        builder.Property(entity => entity.NavigationGroup).HasMaxLength(64);
        builder.Property(entity => entity.BoundEntityType).HasMaxLength(64);
        builder.Property(entity => entity.RoutePath).HasMaxLength(256).IsRequired();
        builder.Property(entity => entity.LayoutJson).HasColumnType("nvarchar(max)").IsRequired();
        builder.Property(entity => entity.ListViewJson).HasColumnType("nvarchar(max)");
        builder.Property(entity => entity.PermissionKey).HasMaxLength(128);
        builder.Property(entity => entity.Status).HasMaxLength(32).IsRequired();
        builder.HasIndex(entity => new { entity.CompanyId, entity.ScreenCode }).IsUnique();
    }
}
