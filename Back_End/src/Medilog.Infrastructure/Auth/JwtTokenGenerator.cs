using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Medilog.Application.Common.Interfaces;
using Medilog.Domain.Entities;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Medilog.Infrastructure.Auth;

public sealed class JwtTokenGenerator(IOptions<JwtOptions> options) : IJwtTokenGenerator
{
    public (string Token, DateTime ExpiresAt) Create(User user)
    {
        var settings = options.Value;
        if (string.IsNullOrWhiteSpace(settings.Key))
        {
            throw new InvalidOperationException("Jwt:Key is not configured.");
        }

        var issuedAt = DateTime.UtcNow;
        var expiresAt = issuedAt.AddMinutes(settings.ExpiryMinutes);
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
            new Claim("role", user.Role.ToString()),
            new Claim("name", user.FullName),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N"))
        };

        var credentials = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(settings.Key)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: settings.Issuer,
            audience: settings.Audience,
            claims: claims,
            notBefore: issuedAt,
            expires: expiresAt,
            signingCredentials: credentials);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }
}
