using System.Security.Claims;
using Medilog.Application.Common.Interfaces;
using Medilog.Domain.Enums;

namespace Medilog.Api.Auth;

public sealed class HttpCurrentUser(IHttpContextAccessor accessor) : ICurrentUser
{
    public Guid? UserId
    {
        get
        {
            var value = accessor.HttpContext?.User.FindFirst("sub")?.Value
                ?? accessor.HttpContext?.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(value, out var id) ? id : null;
        }
    }

    public UserRole? Role
    {
        get
        {
            var value = accessor.HttpContext?.User.FindFirst("role")?.Value
                ?? accessor.HttpContext?.User.FindFirst(ClaimTypes.Role)?.Value;
            return Enum.TryParse<UserRole>(value, ignoreCase: true, out var role) ? role : null;
        }
    }

    public string? FullName =>
        accessor.HttpContext?.User.FindFirst("name")?.Value
        ?? accessor.HttpContext?.User.FindFirst(ClaimTypes.Name)?.Value;

    public bool IsAuthenticated =>
        accessor.HttpContext?.User.Identity?.IsAuthenticated == true;
}

public sealed class AcceptLanguageContext(IHttpContextAccessor accessor) : ILanguageContext
{
    public string LanguageCode
    {
        get
        {
            var header = accessor.HttpContext?.Request.Headers.AcceptLanguage.ToString() ?? string.Empty;
            return header.StartsWith("en", StringComparison.OrdinalIgnoreCase) ? "en" : "ar";
        }
    }

    public bool IsArabic => LanguageCode == "ar";
}

public sealed class SystemSettings(IConfiguration configuration) : ISystemSettings
{
    public bool DemoMode => configuration.GetValue<bool>("Demo:Enabled");
}
