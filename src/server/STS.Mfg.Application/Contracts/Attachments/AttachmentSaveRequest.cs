namespace STS.Mfg.Application.Contracts.Attachments;

public sealed record AttachmentSaveRequest(
    long? CompanyId,
    long? BranchId,
    string RelatedDocumentType,
    long RelatedDocumentId,
    string FileName,
    string ContentType);
