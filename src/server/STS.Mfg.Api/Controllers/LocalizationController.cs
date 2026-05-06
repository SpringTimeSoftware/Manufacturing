using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STS.Mfg.Application.Abstractions.Localization;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Localization;

namespace STS.Mfg.Api.Controllers;

[ApiController]
[Route("api/localization")]
[Authorize(Policy = AppPolicies.AuthenticatedUser)]
public sealed class LocalizationController(ITranslationService translationService) : ApiControllerBase
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
}
