using STS.Mfg.Domain.Abstractions;

namespace STS.Mfg.Domain.Platform.Documents;

public sealed class DocumentLink : ValueObject
{
    public DocumentLink(string documentType, long documentId)
    {
        if (string.IsNullOrWhiteSpace(documentType))
        {
            throw new ArgumentException("Document type is required.", nameof(documentType));
        }

        if (documentId <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(documentId), "Document id must be greater than zero.");
        }

        DocumentType = documentType.Trim();
        DocumentId = documentId;
    }

    public string DocumentType { get; }

    public long DocumentId { get; }

    protected override IEnumerable<object?> GetEqualityComponents()
    {
        yield return DocumentType;
        yield return DocumentId;
    }
}
