using Microsoft.EntityFrameworkCore;
using STS.Mfg.Application.Abstractions.Notifications;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Infrastructure.Platform.Notifications;

public sealed class NotificationTemplateLookup(MfgDbContext dbContext) : INotificationTemplateLookup
{
    private static readonly IReadOnlyDictionary<string, string> BootstrapTemplates = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
    {
        ["system.login|InApp"] = "Welcome back, {{UserName}}.",
        ["system.alert|InApp"] = "{{Message}}"
    };

    public async Task<string?> ResolveTemplateAsync(
        string templateCode,
        string channelType,
        long? companyId,
        long? branchId,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var template = await dbContext.NotificationTemplates
                .Where(candidate => candidate.TemplateCode == templateCode && candidate.ChannelType == channelType)
                .OrderByDescending(candidate => candidate.BranchId == branchId)
                .ThenByDescending(candidate => candidate.CompanyId == companyId)
                .Select(candidate => candidate.TemplateBody)
                .FirstOrDefaultAsync(cancellationToken);

            if (!string.IsNullOrWhiteSpace(template))
            {
                return template;
            }
        }
        catch
        {
        }

        return BootstrapTemplates.TryGetValue($"{templateCode}|{channelType}", out var bootstrapTemplate)
            ? bootstrapTemplate
            : null;
    }
}
