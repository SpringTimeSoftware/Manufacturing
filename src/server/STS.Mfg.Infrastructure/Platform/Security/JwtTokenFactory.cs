using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using STS.Mfg.Domain.Platform.Security;
using STS.Mfg.Infrastructure.Configuration;

namespace STS.Mfg.Infrastructure.Platform.Security;

internal sealed class JwtTokenFactory(
    IOptions<SecurityOptions> options,
    RefreshTokenStore refreshTokenStore,
    TimeProvider timeProvider)
{
    public AuthTokenSession Create(BootstrapUserRecord user, BootstrapContextGrant? context, string clientType)
    {
        var securityOptions = options.Value;
        var issuedOn = timeProvider.GetUtcNow();
        var expiresOn = issuedOn.AddMinutes(securityOptions.AccessTokenMinutes);
        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(securityOptions.SigningKey));

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.UserId.ToString(CultureInfo.InvariantCulture)),
            new(JwtRegisteredClaimNames.UniqueName, user.UserName),
            new(JwtRegisteredClaimNames.Email, user.Email),
            new(ClaimTypes.NameIdentifier, user.UserId.ToString(CultureInfo.InvariantCulture)),
            new(ClaimTypes.Name, user.DisplayName),
            new(AppClaimTypes.UserId, user.UserId.ToString(CultureInfo.InvariantCulture)),
            new(AppClaimTypes.LanguageCode, user.LanguageCode),
            new(AppClaimTypes.ClientType, clientType)
        };

        foreach (var role in user.Roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        if (context is not null)
        {
            claims.Add(new Claim(AppClaimTypes.CompanyId, context.CompanyId.ToString(CultureInfo.InvariantCulture)));
            claims.Add(new Claim(AppClaimTypes.BranchId, context.BranchId.ToString(CultureInfo.InvariantCulture)));
        }

        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Issuer = securityOptions.Issuer,
            Audience = securityOptions.Audience,
            Subject = new ClaimsIdentity(claims),
            NotBefore = issuedOn.UtcDateTime,
            Expires = expiresOn.UtcDateTime,
            SigningCredentials = credentials
        };

        var handler = new JwtSecurityTokenHandler();
        var accessToken = handler.WriteToken(handler.CreateToken(tokenDescriptor));
        var refreshToken = refreshTokenStore.Issue(user, context, clientType, securityOptions.RefreshTokenDays);

        return new AuthTokenSession(accessToken, refreshToken.RefreshToken, expiresOn);
    }
}

internal sealed record AuthTokenSession(string AccessToken, string RefreshToken, DateTimeOffset ExpiresOnUtc);
