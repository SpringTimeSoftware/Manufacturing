using STS.Mfg.Application.Contracts.Masters;
using STS.Mfg.Domain.Masters;

namespace STS.Mfg.Tests;

public sealed class ItemAttributeValueSetTests
{
    [Fact]
    public void ItemAttributeValueSetContractsCarryGovernedValues()
    {
        var request = new ItemAttributeUpsertRequest(
            1,
            "THICKNESS",
            "Thickness",
            "List",
            true,
            null,
            "Active",
            new[]
            {
                new ItemAttributeValueUpsertRequest(null, "6MM", "6mm", 20, "Active")
            });

        Assert.Equal("List", request.DataType);
        Assert.True(request.IsVariantAxis);
        Assert.Single(request.Values);
        Assert.Equal("6MM", request.Values.First().AttributeValueCode);
    }

    [Fact]
    public void ItemAttributeDomainUpdatesAuditReadyState()
    {
        var attribute = ItemAttribute.Create(1, "GRADE", "Material Grade", "List", true, null, "Draft", 99);
        var value = ItemAttributeValue.Create(attribute.Id, "SS304", "SS304", 10, "Active", 99);

        attribute.Update("GRADE", "Material Grade", "List", true, null, "Active", 100);
        value.Update("SS316", "SS316", 20, "Active", 100);

        Assert.Equal("Active", attribute.Status);
        Assert.Equal("SS316", value.AttributeValueCode);
        Assert.Equal(20, value.SortOrder);
    }
}
