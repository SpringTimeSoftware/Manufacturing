namespace STS.Mfg.Application.Abstractions.Security;

public sealed record CurrentUserContext(
    bool IsAuthenticated,
    long? UserId,
    string? UserName,
    string? DisplayName,
    string? Email,
    string LanguageCode,
    string ClientType,
    long? ActiveCompanyId,
    long? ActiveBranchId,
    IReadOnlyCollection<string> Roles)
{
    public static CurrentUserContext Anonymous { get; } = new(
        false,
        null,
        null,
        null,
        null,
        "en-IN",
        "unknown",
        null,
        null,
        Array.Empty<string>());
}
