using System.Data.Common;

namespace STS.Mfg.Application.Abstractions.Persistence;

public interface ISqlConnectionFactory
{
    Task<DbConnection> OpenConnectionAsync(CancellationToken cancellationToken = default);
}
