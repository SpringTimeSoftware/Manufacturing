using STS.Mfg.Domain.Platform.Security;

namespace STS.Mfg.Application.Contracts.Auth;

public sealed record LoginRequest(
    string UserName,
    string Password,
    long? CompanyId,
    long? BranchId,
    string? ClientType);

public sealed record RefreshTokenRequest(string RefreshToken, string? ClientType);

public sealed record LogoutRequest(string? RefreshToken, bool RevokeAll = false);

public sealed record SwitchOperatingContextRequest(long CompanyId, long BranchId, string? RefreshToken = null);

public sealed record AvailableContextResponse(
    long CompanyId,
    string CompanyCode,
    string CompanyName,
    long BranchId,
    string BranchCode,
    string BranchName);

public sealed record DataScopeSnapshot(
    bool HasDeploymentAccess,
    RecordVisibilityMode VisibilityMode,
    IReadOnlyCollection<long> AllowedWarehouseIds,
    IReadOnlyCollection<long> AllowedDepartmentIds,
    IReadOnlyCollection<long> TeamUserIds);

public sealed record ActiveContextResponse(
    long? CompanyId,
    long? BranchId,
    string? CompanyCode,
    string? CompanyName,
    string? BranchCode,
    string? BranchName);

public sealed record CurrentUserResponse(
    long UserId,
    string UserName,
    string DisplayName,
    string? Email,
    string LanguageCode,
    ActiveContextResponse ActiveContext,
    IReadOnlyCollection<AvailableContextResponse> AvailableContexts,
    IReadOnlyCollection<string> Roles,
    DataScopeSnapshot Scope);

public sealed record AuthSessionResponse(
    string AccessToken,
    string RefreshToken,
    DateTimeOffset AccessTokenExpiresOnUtc,
    CurrentUserResponse User);
