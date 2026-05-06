using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using STS.Mfg.Application.Abstractions.Security;
using STS.Mfg.Application.Exceptions;
using STS.Mfg.Domain.Platform.Security;

namespace STS.Mfg.Infrastructure.Platform.Security;

public sealed class CurrentUserContextAccessor(IHttpContextAccessor httpContextAccessor) : ICurrentUserContextAccessor
{
    public CurrentUserContext GetCurrent()
    {
        var httpContext = httpContextAccessor.HttpContext;
        var principal = httpContext?.User;

        if (principal?.Identity?.IsAuthenticated != true)
        {
            return CurrentUserContext.Anonymous with
            {
                ClientType = httpContext?.Request.Headers["X-Client-Type"].ToString() ?? "unknown"
            };
        }

        var userIdClaim = principal.FindFirstValue(AppClaimTypes.UserId) ?? principal.FindFirstValue(ClaimTypes.NameIdentifier);
        var companyIdClaim = principal.FindFirstValue(AppClaimTypes.CompanyId);
        var branchIdClaim = principal.FindFirstValue(AppClaimTypes.BranchId);

        return new CurrentUserContext(
            true,
            long.TryParse(userIdClaim, NumberStyles.Integer, CultureInfo.InvariantCulture, out var userId) ? userId : null,
            principal.FindFirstValue(JwtRegisteredClaimNames.UniqueName),
            principal.FindFirstValue(ClaimTypes.Name),
            principal.FindFirstValue(JwtRegisteredClaimNames.Email),
            principal.FindFirstValue(AppClaimTypes.LanguageCode) ?? "en-IN",
            principal.FindFirstValue(AppClaimTypes.ClientType) ?? httpContext?.Request.Headers["X-Client-Type"].ToString() ?? "unknown",
            long.TryParse(companyIdClaim, NumberStyles.Integer, CultureInfo.InvariantCulture, out var companyId) ? companyId : null,
            long.TryParse(branchIdClaim, NumberStyles.Integer, CultureInfo.InvariantCulture, out var branchId) ? branchId : null,
            principal.FindAll(ClaimTypes.Role).Select(claim => claim.Value).Distinct(StringComparer.OrdinalIgnoreCase).ToArray());
    }

    public CurrentUserContext GetRequired()
    {
        var current = GetCurrent();

        return current.IsAuthenticated
            ? current
            : throw new AuthenticationFailureException("Authentication is required.");
    }
}
