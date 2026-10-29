namespace Medilog.Infrastructure.Auth;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "Medilog";
    public string Audience { get; set; } = "Medilog.Web";
    public string? Key { get; set; }
    public int ExpiryMinutes { get; set; } = 480;
}
