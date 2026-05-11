using System.Globalization;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using STS.Mfg.Application.Abstractions.Attachments;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Attachments;
using STS.Mfg.Application.Exceptions;
using STS.Mfg.Domain.Platform.Attachments;
using STS.Mfg.Infrastructure.Application;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Infrastructure.Platform.Attachments;

internal sealed class AttachmentService(
    IAttachmentStorage attachmentStorage,
    MfgDbContext dbContext,
    IDataScopeService dataScopeService,
    ICurrentUserContextAccessor currentUserContextAccessor,
    IAuditTrail auditTrail)
    : ApplicationServiceBase(dbContext, dataScopeService, currentUserContextAccessor, auditTrail), IAttachmentService
{
    public async Task<PagedResult<AttachmentRecordDto>> ListAsync(
        AttachmentFilter filter,
        CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var query = DbContext.Attachments.AsNoTracking().ApplyActiveOrganizationScope(scope).ApplyRecordVisibility(scope);

        if (filter.CompanyId.HasValue)
        {
            query = query.Where(entity => entity.CompanyId == filter.CompanyId.Value);
        }

        if (filter.BranchId.HasValue)
        {
            query = query.Where(entity => entity.BranchId == filter.BranchId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.RelatedDocumentType))
        {
            var relatedDocumentType = filter.RelatedDocumentType.Trim();
            query = query.Where(entity => entity.RelatedDocumentType == relatedDocumentType);
        }

        if (filter.RelatedDocumentId.HasValue)
        {
            query = query.Where(entity => entity.RelatedDocumentId == filter.RelatedDocumentId.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Status) &&
            !string.Equals(filter.Status, "all", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(filter.Status, "linked", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(_ => false);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim();
            query = query.Where(entity =>
                entity.FileName.Contains(search) ||
                entity.ContentType.Contains(search) ||
                entity.RelatedDocumentType.Contains(search));
        }

        var page = await query
            .OrderByDescending(entity => entity.CreatedOn)
            .ThenByDescending(entity => entity.Id)
            .ToPagedResultAsync(filter, cancellationToken);

        return MapPage(page, MapAttachment);
    }

    public async Task<AttachmentRecordDto> SaveAsync(
        AttachmentSaveRequest request,
        Stream content,
        CancellationToken cancellationToken = default)
    {
        ThrowIfInvalid(
            Required(request.RelatedDocumentType, nameof(request.RelatedDocumentType), "Related document type is required."),
            Required(request.FileName, nameof(request.FileName), "File name is required."),
            Required(request.ContentType, nameof(request.ContentType), "Content type is required."),
            Positive(request.RelatedDocumentId, nameof(request.RelatedDocumentId), "Related document ID must be greater than zero."));

        EnsureContextAccess(request.CompanyId, request.BranchId);

        var storagePath = await attachmentStorage.SaveAsync(content, request.FileName, cancellationToken);
        var fileInfo = new FileInfo(storagePath);
        var attachment = AttachmentRecord.Create(
            request.CompanyId,
            request.BranchId,
            request.RelatedDocumentType.Trim(),
            request.RelatedDocumentId,
            request.FileName,
            request.ContentType,
            storagePath,
            fileInfo.Length,
            GetUserId());

        await DbContext.Attachments.AddAsync(attachment, cancellationToken);
        await DbContext.SaveChangesAsync(cancellationToken);

        var dto = MapAttachment(attachment);
        await WriteAuditAsync("platform", nameof(AttachmentRecord), "attachment.create", attachment.Id, null, dto, cancellationToken);
        return dto;
    }

    public async Task<AttachmentContentResult> OpenContentAsync(
        long attachmentId,
        CancellationToken cancellationToken = default)
    {
        var scope = GetScope();
        var attachment = await DbContext.Attachments
            .AsNoTracking()
            .ApplyActiveOrganizationScope(scope)
            .ApplyRecordVisibility(scope)
            .FirstOrDefaultAsync(entity => entity.Id == attachmentId, cancellationToken);

        attachment = EnsureFound(attachment, "Attachment is not available in the current operating scope.", "attachments.not_found");

        if (!await attachmentStorage.ExistsAsync(attachment.StoragePath, cancellationToken))
        {
            throw new ResourceNotFoundException("Attachment content is not available in storage.", "attachments.content_missing");
        }

        var content = await attachmentStorage.OpenReadAsync(attachment.StoragePath, cancellationToken);
        await WriteAuditAsync("platform", nameof(AttachmentRecord), "attachment.download", attachment.Id, null, MapAttachment(attachment), cancellationToken);

        return new AttachmentContentResult(
            attachment.FileName,
            attachment.ContentType,
            content);
    }

    private static AttachmentRecordDto MapAttachment(AttachmentRecord entity) =>
        new(
            entity.Id,
            entity.CompanyId,
            entity.BranchId,
            entity.RelatedDocumentType,
            entity.RelatedDocumentId,
            entity.FileName,
            entity.ContentType,
            entity.FileSizeBytes,
            entity.UploadedByUserId,
            entity.CreatedOn,
            "Linked");
}
