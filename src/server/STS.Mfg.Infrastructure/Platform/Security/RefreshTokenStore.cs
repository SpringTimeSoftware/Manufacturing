using System.Collections.Concurrent;

namespace STS.Mfg.Infrastructure.Platform.Security;

internal sealed class RefreshTokenStore(TimeProvider timeProvider)
{
    private readonly ConcurrentDictionary<string, RefreshTokenSession> _tokens = new(StringComparer.Ordinal);

    public RefreshTokenSession Issue(BootstrapUserRecord user, BootstrapContextGrant? context, string clientType, int refreshTokenDays)
    {
        var now = timeProvider.GetUtcNow();
        var token = Convert.ToBase64String(Guid.NewGuid().ToByteArray()) + Convert.ToBase64String(Guid.NewGuid().ToByteArray());
        var session = new RefreshTokenSession(
            token,
            user.UserId,
            context?.CompanyId,
            context?.BranchId,
            clientType,
            now,
            now.AddDays(refreshTokenDays));

        _tokens[token] = session;
        return session;
    }

    public RefreshTokenSession? GetValid(string refreshToken)
    {
        if (!_tokens.TryGetValue(refreshToken, out var session))
        {
            return null;
        }

        if (session.ExpiresOnUtc <= timeProvider.GetUtcNow())
        {
            _tokens.TryRemove(refreshToken, out _);
            return null;
        }

        return session;
    }

    public void Revoke(string refreshToken)
    {
        _tokens.TryRemove(refreshToken, out _);
    }

    public void RevokeAll(long userId)
    {
        foreach (var token in _tokens.Where(pair => pair.Value.UserId == userId).Select(pair => pair.Key).ToArray())
        {
            _tokens.TryRemove(token, out _);
        }
    }
}

internal sealed record RefreshTokenSession(
    string RefreshToken,
    long UserId,
    long? CompanyId,
    long? BranchId,
    string ClientType,
    DateTimeOffset IssuedOnUtc,
    DateTimeOffset ExpiresOnUtc);
