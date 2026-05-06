using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Domain.Platform.Security;

namespace STS.Mfg.Infrastructure.Platform.Security;

internal static class AuthorizationSetup
{
    public static IServiceCollection AddAuthorizationPolicies(this IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            options.AddPolicy(AppPolicies.AuthenticatedUser, policy => policy.RequireAuthenticatedUser());
            options.AddPolicy(AppPolicies.PlatformAdministration, policy => policy.RequireRole(AppRoles.SuperAdmin, AppRoles.PlatformAdmin));
            options.AddPolicy(AppPolicies.CompanyAdministration, policy => policy.RequireRole(AppRoles.SuperAdmin, AppRoles.PlatformAdmin, AppRoles.CompanyAdmin));
            options.AddPolicy(AppPolicies.BranchOperations, policy => policy.RequireAuthenticatedUser().AddRequirements(new ScopeRequirement(ScopeRequirementKind.Branch)));
            options.AddPolicy(AppPolicies.WarehouseOperations, policy => policy.RequireAuthenticatedUser().AddRequirements(new ScopeRequirement(ScopeRequirementKind.Warehouse)));
            options.AddPolicy(AppPolicies.AuditRead, policy => policy.RequireAuthenticatedUser().AddRequirements(new ScopeRequirement(ScopeRequirementKind.Audit)));
            options.AddPolicy(AppPolicies.DiagnosticsRead, policy => policy.RequireRole(AppRoles.SuperAdmin, AppRoles.PlatformAdmin, AppRoles.CompanyAdmin, AppRoles.PlantHead));
        });

        services.AddScoped<IAuthorizationHandler, ScopeAuthorizationHandler>();

        return services;
    }
}

internal enum ScopeRequirementKind
{
    Branch,
    Warehouse,
    Audit
}

internal sealed class ScopeRequirement(ScopeRequirementKind kind) : IAuthorizationRequirement
{
    public ScopeRequirementKind Kind { get; } = kind;
}

internal sealed class ScopeAuthorizationHandler(IDataScopeService dataScopeService) : AuthorizationHandler<ScopeRequirement>
{
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, ScopeRequirement requirement)
    {
        var scope = dataScopeService.GetCurrentScope();

        var success = requirement.Kind switch
        {
            ScopeRequirementKind.Branch => scope.HasDeploymentAccess || scope.ActiveBranchId.HasValue,
            ScopeRequirementKind.Warehouse => scope.HasDeploymentAccess || scope.AllowedWarehouseIds.Count > 0,
            ScopeRequirementKind.Audit => scope.Roles.Contains(AppRoles.SuperAdmin, StringComparer.OrdinalIgnoreCase)
                || scope.Roles.Contains(AppRoles.PlatformAdmin, StringComparer.OrdinalIgnoreCase)
                || scope.Roles.Contains(AppRoles.CompanyAdmin, StringComparer.OrdinalIgnoreCase)
                || scope.Roles.Contains(AppRoles.PlantHead, StringComparer.OrdinalIgnoreCase),
            _ => false
        };

        if (success)
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}
