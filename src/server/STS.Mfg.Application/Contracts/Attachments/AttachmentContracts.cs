using STS.Mfg.Application.Contracts;

namespace STS.Mfg.Application.Contracts.Attachments;

public sealed record AttachmentFilter(
    int Page = 1,
    int PageSize = 25,
    string? Search = null,
    string? Status = null,
    long? CompanyId = null,
    long? BranchId = null,
    string? RelatedDocumentType = null,
    long? RelatedDocumentId = null) : QueryFilter(Page, PageSize, Search, Status);

public sealed record AttachmentRecordDto(
    long Id,
    long? CompanyId,
    long? BranchId,
    string RelatedDocumentType,
    long RelatedDocumentId,
    string FileName,
    string ContentType,
    long FileSizeBytes,
    long? UploadedByUserId,
    DateTimeOffset CreatedOn,
    string Status);

public sealed record AttachmentContentResult(
    string FileName,
    string ContentType,
    Stream Content);
