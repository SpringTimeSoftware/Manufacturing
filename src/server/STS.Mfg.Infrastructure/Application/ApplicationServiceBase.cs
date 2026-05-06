using System.Text.Json;
using STS.Mfg.Application.Abstractions.Audit;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Exceptions;
using STS.Mfg.Infrastructure.Persistence;

namespace STS.Mfg.Infrastructure.Application;

internal abstract class ApplicationServiceBase(
    MfgDbContext dbContext,
    IDataScopeService dataScopeService,
    ICurrentUserContextAccessor currentUserContextAccessor,
    IAuditTrail auditTrail)
{
    private static readonly JsonSerializerOptions SnapshotSerializerOptions = new(JsonSerializerDefaults.Web);

    protected MfgDbContext DbContext { get; } = dbContext;

    protected DataScopeContext GetScope() => dataScopeService.GetCurrentScope();

    protected long? GetUserId() => currentUserContextAccessor.GetRequired().UserId;

    protected void EnsureContextAccess(long? companyId, long? branchId) => dataScopeService.EnsureContextAccess(companyId, branchId);

    protected void EnsureWarehouseAccess(long? warehouseId) => dataScopeService.EnsureWarehouseAccess(warehouseId);

    protected void EnsureDepartmentAccess(long? departmentId) => dataScopeService.EnsureDepartmentAccess(departmentId);

    protected void EnsureRecordAccess(long? ownerUserId) => dataScopeService.EnsureRecordAccess(ownerUserId);

    protected static void ThrowIfInvalid(params ApiError?[] errors) => ThrowIfInvalid(errors.AsEnumerable());

    protected static void ThrowIfInvalid(IEnumerable<ApiError?> errors)
    {
        var materialized = errors.Where(error => error is not null).Cast<ApiError>().ToArray();
        if (materialized.Length > 0)
        {
            throw new ValidationFailureException(materialized);
        }
    }

    protected static ApiError? Required(string? value, string field, string message) =>
        string.IsNullOrWhiteSpace(value) ? new ApiError("validation.required", field, message) : null;

    protected static ApiError? Positive(long value, string field, string message) =>
        value <= 0 ? new ApiError("validation.out_of_range", field, message) : null;

    protected static ApiError? Positive(decimal value, string field, string message) =>
        value <= 0 ? new ApiError("validation.out_of_range", field, message) : null;

    protected static ApiError? NonNegative(int value, string field, string message) =>
        value < 0 ? new ApiError("validation.out_of_range", field, message) : null;

    protected static ApiError? NonNegative(decimal? value, string field, string message) =>
        value.HasValue && value.Value < 0 ? new ApiError("validation.out_of_range", field, message) : null;

    protected static ApiError? Immutable<T>(T existingValue, T requestedValue, string field, string message) =>
        EqualityComparer<T>.Default.Equals(existingValue, requestedValue) ? null : new ApiError("validation.immutable", field, message);

    protected static ApiError? MaxLength(string? value, int maxLength, string field, string message) =>
        !string.IsNullOrWhiteSpace(value) && value.Trim().Length > maxLength ? new ApiError("validation.max_length", field, message) : null;

    protected static string? Normalize(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    protected static PagedResult<TTarget> MapPage<TSource, TTarget>(
        PagedResult<TSource> page,
        Func<TSource, TTarget> map) =>
        new(page.Items.Select(map).ToArray(), page.Page, page.PageSize, page.TotalCount, page.TotalPages);

    protected static TEntity EnsureFound<TEntity>(TEntity? entity, string message, string errorCode)
        where TEntity : class =>
        entity ?? throw new ResourceNotFoundException(message, errorCode);

    protected async Task WriteAuditAsync(
        string module,
        string entityType,
        string actionCode,
        long entityId,
        object? before,
        object? after,
        CancellationToken cancellationToken)
    {
        await auditTrail.WriteAsync(
            new AuditEntryDraft(
                module,
                entityType,
                actionCode,
                entityId.ToString(System.Globalization.CultureInfo.InvariantCulture),
                SerializeSnapshot(before),
                SerializeSnapshot(after),
                null),
            cancellationToken);
    }

    private static string? SerializeSnapshot(object? snapshot) =>
        snapshot is null ? null : JsonSerializer.Serialize(snapshot, SnapshotSerializerOptions);
}
