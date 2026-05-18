using STS.Mfg.Application.Contracts.Platform;

namespace STS.Mfg.Tests;

public sealed class PlatformExtensibilityContractsTests
{
    [Fact]
    public void UdfDefinitionFilter_ShouldCarryConcreteQueryShape()
    {
        var filter = new UdfDefinitionFilter(Search: "drawing", Status: "Active", EntityType: "Item", Module: "Master", EntityLevel: "Header");

        Assert.Equal("drawing", filter.Search);
        Assert.Equal("Active", filter.Status);
        Assert.Equal("Item", filter.EntityType);
        Assert.Equal("Master", filter.Module);
        Assert.Equal("Header", filter.EntityLevel);
        Assert.Equal(1, filter.Page);
        Assert.Equal(100, filter.PageSize);
    }

    [Fact]
    public void UdfDefinitionUpsertRequest_ShouldCaptureGovernedValidationMetadata()
    {
        var request = new UdfDefinitionUpsertRequest(
            1,
            "Item",
            "customerDrawingNo",
            "Customer drawing number",
            "Text",
            "Text",
            null,
            false,
            null,
            null,
            64,
            null,
            "CompanyAdmin,EngineeringManager",
            "Active",
            Module: "Master",
            EntityLevel: "Header",
            Description: "Customer drawing identifier",
            IsReportable: true,
            AllowIntegration: true,
            LifecycleGate: "Release",
            ValueLockPolicy: "LockOnRelease");

        Assert.Equal("Item", request.EntityType);
        Assert.Equal("Text", request.ControlType);
        Assert.Equal(64, request.MaxLength);
        Assert.Equal("CompanyAdmin,EngineeringManager", request.RoleVisibility);
        Assert.Equal("Master", request.Module);
        Assert.Equal("Header", request.EntityLevel);
        Assert.True(request.IsReportable);
        Assert.True(request.AllowIntegration);
        Assert.Equal("LockOnRelease", request.ValueLockPolicy);
    }

    [Fact]
    public void UdfPlacementRequest_ShouldBindFieldToRealWorkspace()
    {
        var request = new UdfPlacementUpsertRequest(
            UdfDefinitionId: 10,
            CompanyId: 1,
            Module: "Commercial",
            ScreenKey: "commercial.quotes",
            RoutePath: "/sales/quotes",
            EntityType: "Quote",
            EntityLevel: "Header",
            SectionName: "Commercial evidence",
            TabName: "Header",
            GroupName: "Approval",
            DisplayOrder: 40,
            ColumnSpan: 6,
            VisibleConditionJson: null,
            EditableConditionJson: null,
            RequiredConditionJson: null,
            PermissionKey: "udf.value.edit",
            Status: "Active");

        Assert.Equal("commercial.quotes", request.ScreenKey);
        Assert.Equal("Quote", request.EntityType);
        Assert.Equal("Header", request.EntityLevel);
        Assert.Equal("udf.value.edit", request.PermissionKey);
    }

    [Fact]
    public void UdfValueRequest_ShouldCarryTypedHeaderAndLineValues()
    {
        var headerValue = new UdfValueUpsertRequest(
            DefinitionId: 10,
            EntityId: 25,
            ValueText: null,
            ValueNumber: null,
            ValueDate: null,
            ValueBoolean: null,
            CompanyId: 1,
            EntityLineId: null,
            EntityVersionNo: 3,
            ValueDecimal: 12.5m,
            DisplayValue: "12.5",
            ChangeReason: "Pack 10 validation");

        var lineValue = headerValue with
        {
            EntityLineId = 2501,
            ValueDecimal = null,
            ValueOptionCode = "PRIORITY",
            DisplayValue = "Priority"
        };

        Assert.Null(headerValue.EntityLineId);
        Assert.Equal(3, headerValue.EntityVersionNo);
        Assert.Equal(12.5m, headerValue.ValueDecimal);
        Assert.Equal(2501, lineValue.EntityLineId);
        Assert.Equal("PRIORITY", lineValue.ValueOptionCode);
    }

    [Fact]
    public void CustomObjectAndScreenContracts_ShouldPersistMetadataDrivenExtension()
    {
        var customObject = new CustomObjectUpsertRequest(
            CompanyId: 1,
            ObjectCode: "CUSTOMER_SCORECARD",
            ObjectName: "Customer scorecard",
            Module: "Commercial",
            Category: "Customer",
            PrimaryDisplayFieldCode: "scorecardName",
            Description: "Customer extension",
            Status: "Active");

        var customScreen = new CustomScreenUpsertRequest(
            CompanyId: 1,
            ScreenCode: "customer-scorecards",
            ScreenName: "Customer Scorecards",
            Module: "Commercial",
            NavigationGroup: "Customers",
            BoundEntityType: "CustomObject",
            CustomObjectId: 10,
            RoutePath: "/custom/customer-scorecards",
            LayoutJson: "{\"sections\":[]}",
            ListViewJson: "{\"columns\":[]}",
            PermissionKey: "custom.object.record.edit",
            Status: "Active");

        Assert.Equal("CUSTOMER_SCORECARD", customObject.ObjectCode);
        Assert.Equal("Commercial", customObject.Module);
        Assert.Equal("/custom/customer-scorecards", customScreen.RoutePath);
        Assert.Equal("custom.object.record.edit", customScreen.PermissionKey);
    }
}
