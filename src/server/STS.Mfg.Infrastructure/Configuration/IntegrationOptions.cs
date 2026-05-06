namespace STS.Mfg.Infrastructure.Configuration;

public sealed class IntegrationOptions
{
    public const string SectionName = "Integrations";

    public bool Enabled { get; init; }

    public IReadOnlyCollection<string> ConfiguredProviders { get; init; } = Array.Empty<string>();
}
