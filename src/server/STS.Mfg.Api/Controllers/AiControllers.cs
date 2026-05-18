using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STS.Mfg.Application.Abstractions.AI;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.AI;

namespace STS.Mfg.Api.Controllers;

[ApiController]
[Authorize(Policy = AppPolicies.PlatformAdministration)]
[Route("api/ai")]
public sealed class AiSetupController(IAiService aiService) : ApiControllerBase
{
    [HttpGet("providers")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<AiProviderDto>>>> ListProviders([FromQuery] AiFilter filter, CancellationToken cancellationToken)
    {
        var response = await aiService.ListProvidersAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("providers/{id:long}")]
    public async Task<ActionResult<ApiEnvelope<AiProviderDto>>> GetProvider(long id, CancellationToken cancellationToken)
    {
        var response = await aiService.GetProviderAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("providers")]
    public async Task<ActionResult<ApiEnvelope<AiProviderDto>>> CreateProvider([FromBody] AiProviderUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await aiService.CreateProviderAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(GetProvider), new { id = response.Id }, response, "AI provider created.");
    }

    [HttpPut("providers/{id:long}")]
    public async Task<ActionResult<ApiEnvelope<AiProviderDto>>> UpdateProvider(long id, [FromBody] AiProviderUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await aiService.UpdateProviderAsync(id, request, cancellationToken);
        return OkEnvelope(response, "AI provider updated.");
    }

    [HttpGet("models")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<AiModelDto>>>> ListModels([FromQuery] AiFilter filter, CancellationToken cancellationToken)
    {
        var response = await aiService.ListModelsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("models/{id:long}")]
    public async Task<ActionResult<ApiEnvelope<AiModelDto>>> GetModel(long id, CancellationToken cancellationToken)
    {
        var response = await aiService.GetModelAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("models")]
    public async Task<ActionResult<ApiEnvelope<AiModelDto>>> CreateModel([FromBody] AiModelUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await aiService.CreateModelAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(GetModel), new { id = response.Id }, response, "AI model created.");
    }

    [HttpPut("models/{id:long}")]
    public async Task<ActionResult<ApiEnvelope<AiModelDto>>> UpdateModel(long id, [FromBody] AiModelUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await aiService.UpdateModelAsync(id, request, cancellationToken);
        return OkEnvelope(response, "AI model updated.");
    }

    [HttpGet("prompt-templates")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<AiPromptTemplateDto>>>> ListTemplates([FromQuery] AiFilter filter, CancellationToken cancellationToken)
    {
        var response = await aiService.ListPromptTemplatesAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("prompt-templates/{id:long}")]
    public async Task<ActionResult<ApiEnvelope<AiPromptTemplateDto>>> GetTemplate(long id, CancellationToken cancellationToken)
    {
        var response = await aiService.GetPromptTemplateAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("prompt-templates")]
    public async Task<ActionResult<ApiEnvelope<AiPromptTemplateDto>>> CreateTemplate([FromBody] AiPromptTemplateUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await aiService.CreatePromptTemplateAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(GetTemplate), new { id = response.Id }, response, "AI prompt template created.");
    }

    [HttpPut("prompt-templates/{id:long}")]
    public async Task<ActionResult<ApiEnvelope<AiPromptTemplateDto>>> UpdateTemplate(long id, [FromBody] AiPromptTemplateUpsertRequest request, CancellationToken cancellationToken)
    {
        var response = await aiService.UpdatePromptTemplateAsync(id, request, cancellationToken);
        return OkEnvelope(response, "AI prompt template updated.");
    }

    [HttpGet("provider-health")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<AiProviderHealthDto>>>> GetProviderHealth(CancellationToken cancellationToken)
    {
        var response = await aiService.GetProviderHealthAsync(cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("execution-policy")]
    public async Task<ActionResult<ApiEnvelope<AiExecutionPolicyDto>>> GetExecutionPolicy(CancellationToken cancellationToken)
    {
        var response = await aiService.GetExecutionPolicyAsync(cancellationToken);
        return OkEnvelope(response);
    }
}

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/ai")]
public sealed class AiRunsController(IAiService aiService) : ApiControllerBase
{
    [HttpGet("runs")]
    public async Task<ActionResult<ApiEnvelope<PagedResult<AiRunDto>>>> ListRuns([FromQuery] AiFilter filter, CancellationToken cancellationToken)
    {
        var response = await aiService.ListRunsAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpGet("runs/{id:long}")]
    public async Task<ActionResult<ApiEnvelope<AiRunDto>>> GetRun(long id, CancellationToken cancellationToken)
    {
        var response = await aiService.GetRunAsync(id, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("runs/draft")]
    public async Task<ActionResult<ApiEnvelope<AiRunDto>>> CreateDraft([FromBody] AiDraftRequest request, CancellationToken cancellationToken)
    {
        var response = await aiService.CreateDraftRunAsync(request, cancellationToken);
        return CreatedEnvelope(nameof(GetRun), new { id = response.Id }, response, "AI draft generated for review.");
    }

    [HttpPost("runs/{id:long}/review")]
    public async Task<ActionResult<ApiEnvelope<AiRunDto>>> ReviewRun(long id, [FromBody] AiReviewRequest request, CancellationToken cancellationToken)
    {
        var response = await aiService.ReviewRunAsync(id, request, cancellationToken);
        return OkEnvelope(response, "AI draft review recorded.");
    }

    [HttpPost("translations/draft")]
    public async Task<ActionResult<ApiEnvelope<TranslationDraftDto>>> CreateTranslationDraft([FromBody] TranslationDraftRequest request, CancellationToken cancellationToken)
    {
        var response = await aiService.CreateTranslationDraftAsync(request, cancellationToken);
        return OkEnvelope(response, "Translation draft generated for review.");
    }

    [HttpPost("translations/multi-language-draft")]
    public async Task<ActionResult<ApiEnvelope<MultiLanguageTranslationDraftDto>>> CreateMultiLanguageTranslationDraft([FromBody] MultiLanguageTranslationDraftRequest request, CancellationToken cancellationToken)
    {
        var response = await aiService.CreateMultiLanguageTranslationDraftAsync(request, cancellationToken);
        return OkEnvelope(response, "Multi-language translation draft generated for review.");
    }

    [HttpPost("daily-summaries/draft")]
    public async Task<ActionResult<ApiEnvelope<AiDailySummaryDraftDto>>> CreateDailySummaryDraft([FromBody] AiDailySummaryRequest request, CancellationToken cancellationToken)
    {
        var response = await aiService.CreateDailySummaryDraftAsync(request, cancellationToken);
        return OkEnvelope(response, "AI daily summary draft generated for review.");
    }

    [HttpGet("assistant/intents")]
    public async Task<ActionResult<ApiEnvelope<IReadOnlyCollection<AiAssistantIntentDefinitionDto>>>> ListAssistantIntents(CancellationToken cancellationToken)
    {
        var response = await aiService.ListAssistantIntentsAsync(cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost("assistant/plan")]
    public async Task<ActionResult<ApiEnvelope<AiAssistantQueryPlanDto>>> CreateAssistantPlan([FromBody] AiAssistantPlanRequest request, CancellationToken cancellationToken)
    {
        var response = await aiService.CreateAssistantPlanAsync(request, cancellationToken);
        return OkEnvelope(response, "Assistant query plan prepared.");
    }
}
