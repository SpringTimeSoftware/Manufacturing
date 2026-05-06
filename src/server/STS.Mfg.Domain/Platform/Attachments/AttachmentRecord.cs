using STS.Mfg.Domain.Abstractions;

namespace STS.Mfg.Domain.Platform.Attachments;

public sealed class AttachmentRecord : AggregateRoot, ICompanyScoped, IBranchScoped, IUserOwnedRecord
{
    private AttachmentRecord()
    {
    }

    private AttachmentRecord(
        long? companyId,
        long? branchId,
        string relatedDocumentType,
        long relatedDocumentId,
        string fileName,
        string contentType,
        string storagePath,
        long fileSizeBytes,
        long? uploadedByUserId)
    {
        CompanyId = companyId;
        BranchId = branchId;
        RelatedDocumentType = relatedDocumentType;
        RelatedDocumentId = relatedDocumentId;
        FileName = fileName;
        ContentType = contentType;
        StoragePath = storagePath;
        FileSizeBytes = fileSizeBytes;
        UploadedByUserId = uploadedByUserId;
        CreatedOn = DateTimeOffset.UtcNow;
    }

    public long? CompanyId { get; private set; }

    public long? BranchId { get; private set; }

    public string RelatedDocumentType { get; private set; } = string.Empty;

    public long RelatedDocumentId { get; private set; }

    public string FileName { get; private set; } = string.Empty;

    public string ContentType { get; private set; } = string.Empty;

    public string StoragePath { get; private set; } = string.Empty;

    public long FileSizeBytes { get; private set; }

    public long? UploadedByUserId { get; private set; }

    public DateTimeOffset CreatedOn { get; private set; }

    public long? OwnerUserId => UploadedByUserId;

    public static AttachmentRecord Create(
        long? companyId,
        long? branchId,
        string relatedDocumentType,
        long relatedDocumentId,
        string fileName,
        string contentType,
        string storagePath,
        long fileSizeBytes,
        long? uploadedByUserId)
    {
        return new AttachmentRecord(
            companyId,
            branchId,
            relatedDocumentType,
            relatedDocumentId,
            fileName,
            contentType,
            storagePath,
            fileSizeBytes,
            uploadedByUserId);
    }
}
