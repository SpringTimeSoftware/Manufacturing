using Microsoft.EntityFrameworkCore;
using STS.Mfg.Application.Abstractions;
using STS.Mfg.Domain.Abstractions;

namespace STS.Mfg.Infrastructure.Persistence;

public sealed class EfRepository<TEntity>(MfgDbContext dbContext) : IRepository<TEntity>
    where TEntity : AggregateRoot
{
    public async Task<TEntity?> GetByIdAsync(long id, CancellationToken cancellationToken = default)
    {
        return await dbContext.Set<TEntity>().FirstOrDefaultAsync(entity => entity.Id == id, cancellationToken);
    }

    public async Task AddAsync(TEntity entity, CancellationToken cancellationToken = default)
    {
        await dbContext.Set<TEntity>().AddAsync(entity, cancellationToken);
    }

    public void Remove(TEntity entity)
    {
        dbContext.Set<TEntity>().Remove(entity);
    }
}
