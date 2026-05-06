using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using STS.Mfg.Application;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Auth;
using STS.Mfg.Application.Contracts.Auth;
using STS.Mfg.Domain.Platform.Security;
using STS.Mfg.Infrastructure;

namespace STS.Mfg.Tests;

public sealed class AuthServiceTests
{
    [Fact]
    public async Task LoginAsync_ShouldIssueTokensForBootstrapUser()
    {
        await using var scope = BuildServices().CreateAsyncScope();
        var authService = scope.ServiceProvider.GetRequiredService<IAuthService>();

        var session = await authService.LoginAsync(new LoginRequest("platform.admin", "Platform@123", 1, 11, "web"));

        Assert.False(string.IsNullOrWhiteSpace(session.AccessToken));
        Assert.False(string.IsNullOrWhiteSpace(session.RefreshToken));
        Assert.Equal(1000, session.User.UserId);
        Assert.Contains(AppRoles.PlatformAdmin, session.User.Roles);
        Assert.Equal(1, session.User.ActiveContext.CompanyId);
        Assert.Equal(11, session.User.ActiveContext.BranchId);
    }

    [Fact]
    public async Task RefreshAsync_ShouldRotateRefreshToken()
    {
        await using var scope = BuildServices().CreateAsyncScope();
        var authService = scope.ServiceProvider.GetRequiredService<IAuthService>();

        var initial = await authService.LoginAsync(new LoginRequest("company.admin", "Company@123", 1, 12, "web"));
        var refreshed = await authService.RefreshAsync(new RefreshTokenRequest(initial.RefreshToken, "web"));

        Assert.NotEqual(initial.RefreshToken, refreshed.RefreshToken);
        Assert.Equal(1001, refreshed.User.UserId);
        Assert.Equal(12, refreshed.User.ActiveContext.BranchId);
    }

    private static ServiceProvider BuildServices()
    {
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Security:SigningKey"] = "tests-only-signing-key-12345678901234567890",
                ["ConnectionStrings:SqlServer"] = "Server=(localdb)\\MSSQLLocalDB;Database=STS_Mfg_Tests;Trusted_Connection=True;TrustServerCertificate=True"
            })
            .Build();

        var services = new ServiceCollection();
        services.AddLogging();
        services.AddApplicationLayer();
        services.AddInfrastructureLayer(configuration);
        services.AddSingleton<IAuditTrail, TestAuditTrail>();

        return services.BuildServiceProvider();
    }

    private sealed class TestAuditTrail : IAuditTrail
    {
        public Task WriteAsync(AuditEntryDraft entry, CancellationToken cancellationToken = default)
        {
            _ = entry;
            _ = cancellationToken;
            return Task.CompletedTask;
        }
    }
}
