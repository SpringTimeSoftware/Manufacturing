using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STS.Mfg.Application.Abstractions.Localization;
using STS.Mfg.Application.Abstractions.Platform;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Localization;
using STS.Mfg.Application.Contracts.Platform;

namespace STS.Mfg.Api.Controllers;

[ApiController]
[Route("api/localization")]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
public sealed class LocalizationController(
    ITranslationService translationService,
    IPlatformRuntimeService platformRuntimeService) : ApiControllerBase
{
    [HttpGet("resources")]
    public async Task<ActionResult<ApiEnvelope<TranslationBundleResponse>>> GetResources(
        [FromQuery] string? languageCode,
        [FromQuery] string? module,
        [FromQuery] string[]? keys,
        CancellationToken cancellationToken)
    {
        var request = new TranslationResourceRequest(languageCode, module, keys ?? Array.Empty<string>());
        var response = await translationService.GetResourcesAsync(request, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("resources")]
    [Authorize(Policy = AppPolicies.CompanyAdministration)]
    public async Task<ActionResult<ApiEnvelope<ActionResponse>>> UpsertResource(
        [FromBody] TranslationResourceUpsertRequest request,
        CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.UpsertTranslationResourceAsync(request, cancellationToken);
        return OkEnvelope(response, "Translation resource saved.");
    }
}
