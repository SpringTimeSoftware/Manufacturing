using STS.Mfg.Application.Contracts.Platform;

namespace STS.Mfg.Tests;

public sealed class PlatformExtensibilityContractsTests
{
    [Fact]
    public void UdfDefinitionFilter_ShouldCarryConcreteQueryShape()
    {
        var filter = new UdfDefinitionFilter(Search: "drawing", Status: "Active", EntityType: "Item");

        Assert.Equal("drawing", filter.Search);
        Assert.Equal("Active", filter.Status);
        Assert.Equal("Item", filter.EntityType);
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
            "Active");

        Assert.Equal("Item", request.EntityType);
        Assert.Equal("Text", request.ControlType);
        Assert.Equal(64, request.MaxLength);
        Assert.Equal("CompanyAdmin,EngineeringManager", request.RoleVisibility);
    }
}
