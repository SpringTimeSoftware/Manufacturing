using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Attachments;

namespace STS.Mfg.Application.Abstractions.Attachments;

public interface IAttachmentStorage
{
    Task<string> SaveAsync(Stream content, string fileName, CancellationToken cancellationToken = default);

    Task<Stream> OpenReadAsync(string storagePath, CancellationToken cancellationToken = default);

    Task<bool> ExistsAsync(string storagePath, CancellationToken cancellationToken = default);
}

public interface IAttachmentService
{
    Task<PagedResult<AttachmentRecordDto>> ListAsync(
        AttachmentFilter filter,
        CancellationToken cancellationToken = default);

    Task<AttachmentRecordDto> SaveAsync(
        AttachmentSaveRequest request,
        Stream content,
        CancellationToken cancellationToken = default);
}
