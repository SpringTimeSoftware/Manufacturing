namespace STS.Mfg.Infrastructure.Configuration;

public sealed class SecurityOptions
{
    public const string SectionName = "Security";

    public string Issuer { get; init; } = "sts-mfg";

    public string Audience { get; init; } = "sts-mfg-api";

    public bool RequireHttpsMetadata { get; init; } = true;

    public string SigningKey { get; init; } = "dev-only-bootstrap-signing-key-change-me";

    public int AccessTokenMinutes { get; init; } = 60;

    public int RefreshTokenDays { get; init; } = 7;
}
