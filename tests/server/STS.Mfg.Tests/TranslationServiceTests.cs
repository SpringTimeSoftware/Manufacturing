using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using STS.Mfg.Application.Abstractions.Localization;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts.Localization;
using STS.Mfg.Infrastructure.Configuration;
using STS.Mfg.Infrastructure.Persistence;
using STS.Mfg.Infrastructure.Platform.Localization;

namespace STS.Mfg.Tests;

public sealed class TranslationServiceTests
{
    [Fact]
    public async Task GetResourcesAsync_ShouldReturnBootstrapTranslations_WhenDatabaseHasNoRows()
    {
        await using var dbContext = CreateDbContext();
        ITranslationService translationService = new TranslationService(
            dbContext,
            new TestCurrentUserContextAccessor(),
            Options.Create(new LocalizationOptions { DefaultLanguageCode = "en-IN" }));

        var bundle = await translationService.GetResourcesAsync(
            new TranslationResourceRequest("en-IN", null, new[] { "nav.dashboard", "msg.validationFailed" }));

        Assert.Equal("en-IN", bundle.LanguageCode);
        Assert.Equal("Dashboard", bundle.Resources["nav.dashboard"]);
        Assert.Equal("Validation failed.", bundle.Resources["msg.validationFailed"]);
    }

    private static MfgDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<MfgDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString("N"))
            .Options;

        return new MfgDbContext(options);
    }

    private sealed class TestCurrentUserContextAccessor : ICurrentUserContextAccessor
    {
        public CurrentUserContext GetCurrent()
        {
            return new CurrentUserContext(
                true,
                1000,
                "platform.admin",
                "Platform Admin",
                "platform.admin@sts.local",
                "en-IN",
                "web",
                1,
                11,
                Array.Empty<string>());
        }

        public CurrentUserContext GetRequired() => GetCurrent();
    }
}
