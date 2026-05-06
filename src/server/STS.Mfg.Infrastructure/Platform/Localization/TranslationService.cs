using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using STS.Mfg.Application.Abstractions.Localization;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts.Localization;
using STS.Mfg.Infrastructure.Configuration;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Infrastructure.Platform.Localization;

public sealed class TranslationService(
    MfgDbContext dbContext,
    ICurrentUserContextAccessor currentUserContextAccessor,
    IOptions<LocalizationOptions> options) : ITranslationService
{
    private static readonly IReadOnlyDictionary<string, string> BootstrapTranslations = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
    {
        ["nav.dashboard"] = "Dashboard",
        ["nav.workOrders"] = "Work Orders",
        ["nav.machineBoard"] = "Machine Board",
        ["nav.inventory"] = "Inventory",
        ["msg.validationFailed"] = "Validation failed."
    };

    public async Task<TranslationBundleResponse> GetResourcesAsync(
        TranslationResourceRequest request,
        CancellationToken cancellationToken = default)
    {
        var currentUser = currentUserContextAccessor.GetCurrent();
        var languageCode = request.LanguageCode ?? currentUser.LanguageCode ?? options.Value.DefaultLanguageCode;
        var resources = new Dictionary<string, string>(BootstrapTranslations, StringComparer.OrdinalIgnoreCase);

        try
        {
            var candidates = await dbContext.Translations
                .Where(entry => entry.LanguageCode == languageCode)
                .Where(entry => string.IsNullOrWhiteSpace(request.Module) || entry.Module == request.Module)
                .Where(entry => request.Keys.Count == 0 || request.Keys.Contains(entry.TranslationKey))
                .Where(entry =>
                    (entry.CompanyId == null || entry.CompanyId == currentUser.ActiveCompanyId) &&
                    (entry.BranchId == null || entry.BranchId == currentUser.ActiveBranchId))
                .OrderBy(entry => entry.TranslationKey)
                .Select(entry => new { entry.TranslationKey, entry.TranslationValue, entry.CompanyId, entry.BranchId })
                .ToListAsync(cancellationToken);

            foreach (var group in candidates.GroupBy(entry => entry.TranslationKey))
            {
                var winner = group
                    .OrderByDescending(entry => entry.BranchId == currentUser.ActiveBranchId)
                    .ThenByDescending(entry => entry.CompanyId == currentUser.ActiveCompanyId)
                    .First();

                resources[group.Key] = winner.TranslationValue;
            }
        }
        catch
        {
        }

        if (request.Keys.Count > 0)
        {
            resources = resources
                .Where(entry => request.Keys.Contains(entry.Key, StringComparer.OrdinalIgnoreCase))
                .ToDictionary(entry => entry.Key, entry => entry.Value, StringComparer.OrdinalIgnoreCase);
        }

        return new TranslationBundleResponse(languageCode, resources);
    }
}
