using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using STS.Mfg.Application.Abstractions.Attachments;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Attachments;
using STS.Mfg.Application.Exceptions;

namespace STS.Mfg.Api.Controllers;

[ApiController]
[Authorize(Policy = AppPolicies.BranchOperations)]
[Route("api/attachments")]
public sealed class AttachmentsController(IAttachmentService attachmentService) : ApiControllerBase
{
    [HttpGet]
    public async Task<ActionResult<ApiEnvelope<PagedResult<AttachmentRecordDto>>>> List(
        [FromQuery] AttachmentFilter filter,
        CancellationToken cancellationToken)
    {
        var response = await attachmentService.ListAsync(filter, cancellationToken);
        return OkEnvelope(response);
    }

    [HttpPost]
    public async Task<ActionResult<ApiEnvelope<AttachmentRecordDto>>> Create(
        [FromForm] AttachmentUploadForm request,
        CancellationToken cancellationToken)
    {
        if (request.File is null || request.File.Length == 0)
        {
            throw new ValidationFailureException(
                [new ApiError("validation.required", nameof(request.File), "A file is required before linking a document.")]);
        }

        await using var stream = request.File.OpenReadStream();
        var response = await attachmentService.SaveAsync(
            new AttachmentSaveRequest(
                request.CompanyId,
                request.BranchId,
                request.RelatedDocumentType,
                request.RelatedDocumentId,
                request.File.FileName,
                string.IsNullOrWhiteSpace(request.File.ContentType) ? "application/octet-stream" : request.File.ContentType),
            stream,
            cancellationToken);

        return OkEnvelope(response, "Attachment linked.");
    }
}

public sealed class AttachmentUploadForm
{
    public long? CompanyId { get; init; }

    public long? BranchId { get; init; }

    public string RelatedDocumentType { get; init; } = string.Empty;

    public long RelatedDocumentId { get; init; }

    public IFormFile? File { get; init; }
}
