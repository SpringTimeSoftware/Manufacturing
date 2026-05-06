using STS.Mfg.Domain.Platform.Security;

namespace STS.Mfg.Infrastructure.Platform.Security;

internal interface IBootstrapIdentityDirectory
{
    BootstrapUserRecord? FindByUserName(string userName);

    BootstrapUserRecord? FindById(long userId);
}

internal sealed class BootstrapIdentityDirectory : IBootstrapIdentityDirectory
{
    private readonly IReadOnlyDictionary<string, BootstrapUserRecord> _usersByName;
    private readonly IReadOnlyDictionary<long, BootstrapUserRecord> _usersById;

    public BootstrapIdentityDirectory()
    {
        var users = BuildUsers();
        _usersByName = users.ToDictionary(user => user.UserName, StringComparer.OrdinalIgnoreCase);
        _usersById = users.ToDictionary(user => user.UserId);
    }

    public BootstrapUserRecord? FindByUserName(string userName)
    {
        return _usersByName.TryGetValue(userName.Trim(), out var user) ? user : null;
    }

    public BootstrapUserRecord? FindById(long userId)
    {
        return _usersById.TryGetValue(userId, out var user) ? user : null;
    }

    private static IReadOnlyCollection<BootstrapUserRecord> BuildUsers()
    {
        var acmeNorth = new BootstrapContextGrant(1, "ACME", "Acme Manufacturing", 11, "ACME-N", "Acme North Plant", new long[] { 101, 102 }, new long[] { 301 }, RecordVisibilityMode.AllInScope, Array.Empty<long>());
        var acmeSouth = new BootstrapContextGrant(1, "ACME", "Acme Manufacturing", 12, "ACME-S", "Acme South Plant", new long[] { 201 }, new long[] { 302, 401 }, RecordVisibilityMode.AllInScope, Array.Empty<long>());
        var ownExecution = new BootstrapContextGrant(1, "ACME", "Acme Manufacturing", 11, "ACME-N", "Acme North Plant", Array.Empty<long>(), new long[] { 301 }, RecordVisibilityMode.Own, Array.Empty<long>());
        var teamExecution = new BootstrapContextGrant(1, "ACME", "Acme Manufacturing", 11, "ACME-N", "Acme North Plant", Array.Empty<long>(), new long[] { 301 }, RecordVisibilityMode.Team, new long[] { 1006, 1007 });

        return new[]
        {
            new BootstrapUserRecord(
                999,
                "super.admin",
                "Super Admin",
                "super.admin@sts.local",
                "en-IN",
                BootstrapPasswordHasher.Hash("Super@123"),
                new[] { AppRoles.SuperAdmin },
                new[] { acmeNorth, acmeSouth }),
            new BootstrapUserRecord(
                1000,
                "platform.admin",
                "Platform Admin",
                "platform.admin@sts.local",
                "en-IN",
                BootstrapPasswordHasher.Hash("Platform@123"),
                new[] { AppRoles.PlatformAdmin },
                new[] { acmeNorth, acmeSouth }),
            new BootstrapUserRecord(
                1001,
                "company.admin",
                "Company Admin",
                "company.admin@sts.local",
                "en-IN",
                BootstrapPasswordHasher.Hash("Company@123"),
                new[] { AppRoles.CompanyAdmin },
                new[] { acmeNorth, acmeSouth }),
            new BootstrapUserRecord(
                1002,
                "planning.manager",
                "Planning Manager",
                "planning.manager@sts.local",
                "en-IN",
                BootstrapPasswordHasher.Hash("Planning@123"),
                new[] { AppRoles.PlanningManager },
                new[] { acmeNorth, acmeSouth }),
            new BootstrapUserRecord(
                1003,
                "stores.keeper",
                "Stores Keeper",
                "stores.keeper@sts.local",
                "en-IN",
                BootstrapPasswordHasher.Hash("Stores@123"),
                new[] { AppRoles.StoreKeeper },
                new[] { acmeNorth }),
            new BootstrapUserRecord(
                1004,
                "prod.supervisor",
                "Production Supervisor",
                "prod.supervisor@sts.local",
                "en-IN",
                BootstrapPasswordHasher.Hash("Production@123"),
                new[] { AppRoles.ProductionSupervisor },
                new[] { teamExecution }),
            new BootstrapUserRecord(
                1005,
                "machine.operator",
                "Machine Operator",
                "machine.operator@sts.local",
                "en-IN",
                BootstrapPasswordHasher.Hash("Operator@123"),
                new[] { AppRoles.MachineOperator },
                new[] { ownExecution }),
            new BootstrapUserRecord(
                1006,
                "qc.inspector",
                "QC Inspector",
                "qc.inspector@sts.local",
                "en-IN",
                BootstrapPasswordHasher.Hash("Quality@123"),
                new[] { AppRoles.QCInspector },
                new[] { acmeSouth with { AllowedWarehouseIds = Array.Empty<long>(), AllowedDepartmentIds = new long[] { 401 } } }),
            new BootstrapUserRecord(
                1007,
                "dispatch.manager",
                "Dispatch Manager",
                "dispatch.manager@sts.local",
                "en-IN",
                BootstrapPasswordHasher.Hash("Dispatch@123"),
                new[] { AppRoles.DispatchManager },
                new[] { acmeSouth with { AllowedWarehouseIds = new long[] { 201 }, AllowedDepartmentIds = Array.Empty<long>() } })
        };
    }
}

internal sealed record BootstrapUserRecord(
    long UserId,
    string UserName,
    string DisplayName,
    string Email,
    string LanguageCode,
    string PasswordHash,
    IReadOnlyCollection<string> Roles,
    IReadOnlyCollection<BootstrapContextGrant> Contexts);

internal sealed record BootstrapContextGrant(
    long CompanyId,
    string CompanyCode,
    string CompanyName,
    long BranchId,
    string BranchCode,
    string BranchName,
    IReadOnlyCollection<long> AllowedWarehouseIds,
    IReadOnlyCollection<long> AllowedDepartmentIds,
    RecordVisibilityMode VisibilityMode,
    IReadOnlyCollection<long> TeamUserIds);
