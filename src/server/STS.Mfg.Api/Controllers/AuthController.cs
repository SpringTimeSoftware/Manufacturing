using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using STS.Mfg.Application.Abstractions.Auth;
using STS.Mfg.Application.Abstractions.Platform;
using STS.Mfg.Application.Contracts;
using STS.Mfg.Application.Contracts.Auth;
using STS.Mfg.Application.Contracts.Platform;

namespace STS.Mfg.Api.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController(
    IAuthService authService,
    IPlatformRuntimeService platformRuntimeService) : ApiControllerBase
{
    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<ApiEnvelope<AuthSessionResponse>>> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        var response = await authService.LoginAsync(request, cancellationToken);
        return OkEnvelope(response, "Login succeeded.");
    }

    [AllowAnonymous]
    [HttpPost("forgot-password")]
    public async Task<ActionResult<ApiEnvelope<ForgotPasswordResponse>>> ForgotPassword(
        [FromBody] ForgotPasswordRequest request,
        CancellationToken cancellationToken)
    {
        var response = await platformRuntimeService.RequestForgotPasswordAsync(request, cancellationToken);
        return OkEnvelope(response, "Recovery request captured.");
    }

    [AllowAnonymous]
    [HttpPost("refresh")]
    public async Task<ActionResult<ApiEnvelope<AuthSessionResponse>>> Refresh(
        [FromBody] RefreshTokenRequest request,
        CancellationToken cancellationToken)
    {
        var response = await authService.RefreshAsync(request, cancellationToken);
        return OkEnvelope(response, "Token refreshed.");
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<ApiEnvelope<CurrentUserResponse>>> Me(CancellationToken cancellationToken)
    {
        var response = await authService.GetCurrentUserAsync(cancellationToken);
        return OkEnvelope(response);
    }

    [Authorize]
    [HttpPost("switch-context")]
    public async Task<ActionResult<ApiEnvelope<AuthSessionResponse>>> SwitchContext(
        [FromBody] SwitchOperatingContextRequest request,
        CancellationToken cancellationToken)
    {
        var response = await authService.SwitchContextAsync(request, cancellationToken);
        return OkEnvelope(response, "Operating context switched.");
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<ActionResult<ApiEnvelope<ActionResponse>>> Logout(
        [FromBody] LogoutRequest request,
        CancellationToken cancellationToken)
    {
        var response = await authService.LogoutAsync(request, cancellationToken);
        return OkEnvelope(response, "Logout succeeded.");
    }
}
