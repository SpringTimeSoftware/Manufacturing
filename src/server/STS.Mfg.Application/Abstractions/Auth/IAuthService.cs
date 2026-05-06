using STS.Mfg.Application.Contracts.Auth;
using STS.Mfg.Application.Contracts;

namespace STS.Mfg.Application.Abstractions.Auth;

public interface IAuthService
{
    Task<AuthSessionResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);

    Task<AuthSessionResponse> RefreshAsync(RefreshTokenRequest request, CancellationToken cancellationToken = default);

    Task<CurrentUserResponse> GetCurrentUserAsync(CancellationToken cancellationToken = default);

    Task<AuthSessionResponse> SwitchContextAsync(SwitchOperatingContextRequest request, CancellationToken cancellationToken = default);

    Task<ActionResponse> LogoutAsync(LogoutRequest request, CancellationToken cancellationToken = default);
}
