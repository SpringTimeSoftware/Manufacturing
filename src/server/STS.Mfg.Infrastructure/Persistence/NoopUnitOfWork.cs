using STS.Mfg.Application.Abstractions;

namespace STS.Mfg.Infrastructure.Persistence;

public sealed class NoopUnitOfWork : IUnitOfWork
{
    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        return Task.FromResult(0);
    }
}
