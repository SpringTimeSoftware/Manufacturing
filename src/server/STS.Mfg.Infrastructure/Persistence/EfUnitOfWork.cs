using STS.Mfg.Application.Abstractions;

namespace STS.Mfg.Infrastructure.Persistence;

public sealed class EfUnitOfWork(MfgDbContext dbContext) : IUnitOfWork
{
    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return dbContext.SaveChangesAsync(cancellationToken);
    }
}
