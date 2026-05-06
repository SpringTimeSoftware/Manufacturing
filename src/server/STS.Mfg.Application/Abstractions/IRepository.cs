using STS.Mfg.Domain.Abstractions;

namespace STS.Mfg.Application.Abstractions;

public interface IRepository<TEntity>
    where TEntity : AggregateRoot
{
    Task<TEntity?> GetByIdAsync(long id, CancellationToken cancellationToken = default);
    Task AddAsync(TEntity entity, CancellationToken cancellationToken = default);
    void Remove(TEntity entity);
}
