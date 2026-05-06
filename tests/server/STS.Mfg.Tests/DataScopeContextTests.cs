using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Domain.Platform.Security;

namespace STS.Mfg.Tests;

public sealed class DataScopeContextTests
{
    [Fact]
    public void AllowsWarehouse_ShouldRespectAllowedWarehouseList()
    {
        var scope = CreateScope(RecordVisibilityMode.AllInScope, allowedWarehouseIds: new[] { 101L, 102L });

        Assert.True(scope.AllowsWarehouse(101));
        Assert.False(scope.AllowsWarehouse(999));
    }

    [Fact]
    public void AllowsOwner_ShouldRestrictToTeamMembers_WhenVisibilityIsTeam()
    {
        var scope = CreateScope(RecordVisibilityMode.Team, teamUserIds: new[] { 22L, 23L });

        Assert.True(scope.AllowsOwner(21));
        Assert.True(scope.AllowsOwner(22));
        Assert.False(scope.AllowsOwner(99));
    }

    [Fact]
    public void AllowsOwner_ShouldRestrictToSelf_WhenVisibilityIsOwn()
    {
        var scope = CreateScope(RecordVisibilityMode.Own);

        Assert.True(scope.AllowsOwner(21));
        Assert.False(scope.AllowsOwner(22));
    }

    private static DataScopeContext CreateScope(
        RecordVisibilityMode visibilityMode,
        IReadOnlyCollection<long>? allowedWarehouseIds = null,
        IReadOnlyCollection<long>? teamUserIds = null)
    {
        return new DataScopeContext(
            21,
            1,
            11,
            false,
            visibilityMode,
            new[] { 1L },
            new[] { 11L },
            allowedWarehouseIds ?? Array.Empty<long>(),
            Array.Empty<long>(),
            teamUserIds ?? Array.Empty<long>(),
            Array.Empty<string>());
    }
}
