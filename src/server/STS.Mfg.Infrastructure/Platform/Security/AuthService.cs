using Microsoft.Extensions.Logging;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Auth;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Auth;
using STS.Mfg.Application.Exceptions;
using STS.Mfg.Domain.Platform.Security;

namespace STS.Mfg.Infrastructure.Platform.Security;

internal sealed class AuthService(
    IBootstrapIdentityDirectory identityDirectory,
    JwtTokenFactory tokenFactory,
    RefreshTokenStore refreshTokenStore,
    ICurrentUserContextAccessor currentUserContextAccessor,
    IDataScopeService dataScopeService,
    IAuditTrail auditTrail,
    ILogger<AuthService> logger) : IAuthService
{
    public async Task<AuthSessionResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var user = identityDirectory.FindByUserName(request.UserName)
            ?? throw new AuthenticationFailureException("Invalid user name or password.", "auth.invalid_credentials");

        if (!BootstrapPasswordHasher.Verify(user.PasswordHash, request.Password))
        {
            throw new AuthenticationFailureException("Invalid user name or password.", "auth.invalid_credentials");
        }

        var context = ResolveContext(user, request.CompanyId, request.BranchId);
        var session = tokenFactory.Create(user, context, NormalizeClientType(request.ClientType));
        await WriteAuditAsync(user, context, "auth.login", cancellationToken);

        logger.LogInformation("Bootstrap user {UserName} logged in for company {CompanyId} branch {BranchId}.", user.UserName, context?.CompanyId, context?.BranchId);

        return BuildSessionResponse(user, context, session);
    }

    public async Task<AuthSessionResponse> RefreshAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default)
    {
        var refreshSession = refreshTokenStore.GetValid(request.RefreshToken)
            ?? throw new AuthenticationFailureException("Refresh token is invalid or expired.", "auth.invalid_refresh_token");

        refreshTokenStore.Revoke(request.RefreshToken);

        var user = identityDirectory.FindById(refreshSession.UserId)
            ?? throw new AuthenticationFailureException("Refresh token user is not available.", "auth.invalid_refresh_token");

        var context = ResolveContext(user, refreshSession.CompanyId, refreshSession.BranchId);
        var session = tokenFactory.Create(user, context, string.IsNullOrWhiteSpace(request.ClientType) ? refreshSession.ClientType : NormalizeClientType(request.ClientType));
        await WriteAuditAsync(user, context, "auth.refresh", cancellationToken);

        return BuildSessionResponse(user, context, session);
    }

    public Task<CurrentUserResponse> GetCurrentUserAsync(CancellationToken cancellationToken = default)
    {
        _ = cancellationToken;
        var current = currentUserContextAccessor.GetRequired();
        var user = identityDirectory.FindById(current.UserId!.Value)
            ?? throw new AuthenticationFailureException("Authenticated user is not provisioned.", "auth.user_not_found");

        var context = ResolveContext(user, current.ActiveCompanyId, current.ActiveBranchId);
        return Task.FromResult(BuildCurrentUserResponse(user, context));
    }

    public async Task<AuthSessionResponse> SwitchContextAsync(SwitchOperatingContextRequest request, CancellationToken cancellationToken = default)
    {
        var current = currentUserContextAccessor.GetRequired();
        var user = identityDirectory.FindById(current.UserId!.Value)
            ?? throw new AuthenticationFailureException("Authenticated user is not provisioned.", "auth.user_not_found");

        var scope = dataScopeService.GetCurrentScope();

        if (!scope.AllowsContext(request.CompanyId, request.BranchId))
        {
            throw new ScopeViolationException("The requested company or branch is not assigned to the current user.");
        }

        var context = ResolveContext(user, request.CompanyId, request.BranchId);

        if (!string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            refreshTokenStore.Revoke(request.RefreshToken);
        }

        var session = tokenFactory.Create(user, context, current.ClientType);
        await WriteAuditAsync(user, context, "auth.context_switch", cancellationToken);

        return BuildSessionResponse(user, context, session);
    }

    public async Task<ActionResponse> LogoutAsync(LogoutRequest request, CancellationToken cancellationToken = default)
    {
        var current = currentUserContextAccessor.GetRequired();
        var user = identityDirectory.FindById(current.UserId!.Value)
            ?? throw new AuthenticationFailureException("Authenticated user is not provisioned.", "auth.user_not_found");
        var context = ResolveContext(user, current.ActiveCompanyId, current.ActiveBranchId);

        if (request.RevokeAll)
        {
            refreshTokenStore.RevokeAll(user.UserId);
        }
        else if (!string.IsNullOrWhiteSpace(request.RefreshToken))
        {
            refreshTokenStore.Revoke(request.RefreshToken);
        }

        await WriteAuditAsync(user, context, "auth.logout", cancellationToken);

        return new ActionResponse("auth-session", "LoggedOut", user.UserName, Array.Empty<string>());
    }

    private static string NormalizeClientType(string? clientType)
    {
        return string.IsNullOrWhiteSpace(clientType) ? "web" : clientType.Trim().ToLowerInvariant();
    }

    private static BootstrapContextGrant? ResolveContext(BootstrapUserRecord user, long? companyId, long? branchId)
    {
        if (!companyId.HasValue && !branchId.HasValue)
        {
            return user.Contexts.FirstOrDefault();
        }

        var context = user.Contexts.FirstOrDefault(candidate =>
            candidate.CompanyId == companyId &&
            candidate.BranchId == branchId);

        return context ?? throw new ScopeViolationException("The requested company or branch is not mapped to the current user.");
    }

    private async Task WriteAuditAsync(BootstrapUserRecord user, BootstrapContextGrant? context, string actionCode, CancellationToken cancellationToken)
    {
        await auditTrail.WriteAsync(
            new AuditEntryDraft(
                "Platform",
                "AuthSession",
                actionCode,
                user.UserId.ToString(),
                null,
                $"{{\"userName\":\"{user.UserName}\",\"companyId\":{context?.CompanyId.ToString() ?? "null"},\"branchId\":{context?.BranchId.ToString() ?? "null"}}}",
                null),
            cancellationToken);
    }

    private static AuthSessionResponse BuildSessionResponse(BootstrapUserRecord user, BootstrapContextGrant? context, AuthTokenSession session)
    {
        return new AuthSessionResponse(
            session.AccessToken,
            session.RefreshToken,
            session.ExpiresOnUtc,
            BuildCurrentUserResponse(user, context));
    }

    private static CurrentUserResponse BuildCurrentUserResponse(BootstrapUserRecord user, BootstrapContextGrant? activeContext)
    {
        var availableContexts = user.Contexts
            .Select(context => new AvailableContextResponse(
                context.CompanyId,
                context.CompanyCode,
                context.CompanyName,
                context.BranchId,
                context.BranchCode,
                context.BranchName))
            .ToArray();

        return new CurrentUserResponse(
            user.UserId,
            user.UserName,
            user.DisplayName,
            user.Email,
            user.LanguageCode,
            new ActiveContextResponse(
                activeContext?.CompanyId,
                activeContext?.BranchId,
                activeContext?.CompanyCode,
                activeContext?.CompanyName,
                activeContext?.BranchCode,
                activeContext?.BranchName),
            availableContexts,
            user.Roles.ToArray(),
            new DataScopeSnapshot(
                user.Roles.Contains(AppRoles.SuperAdmin, StringComparer.OrdinalIgnoreCase)
                    || user.Roles.Contains(AppRoles.PlatformAdmin, StringComparer.OrdinalIgnoreCase),
                activeContext?.VisibilityMode ?? RecordVisibilityMode.AllInScope,
                activeContext?.AllowedWarehouseIds?.ToArray() ?? Array.Empty<long>(),
                activeContext?.AllowedDepartmentIds?.ToArray() ?? Array.Empty<long>(),
                activeContext?.TeamUserIds?.ToArray() ?? Array.Empty<long>()));
    }
}
