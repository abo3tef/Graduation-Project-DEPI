using System.Security.Claims;
using Medilog.Application.Security;

namespace Medilog.Api.Authorization;

/// <summary>
/// Maps the authenticated principal to ICurrentUser.
/// User id : ClaimTypes.NameIdentifier, falling back to "sub" (must be a GUID).
/// Role    : ClaimTypes.Role, falling back to "role" (Doctor | Secretary | Admin, case-insensitive).
/// </summary>
public sealed class ClaimsPrincipalCurrentUser : ICurrentUser
{
    private readonly ClaimsPrincipal _principal;

    public ClaimsPrincipalCurrentUser(ClaimsPrincipal principal) => _principal = principal;

    public bool IsAuthenticated => _principal.Identity?.IsAuthenticated == true && UserId is not null;

    public Guid? UserId
    {
        get
        {
            var raw = _principal.FindFirst(ClaimTypes.NameIdentifier)?.Value
                      ?? _principal.FindFirst("sub")?.Value;
            return Guid.TryParse(raw, out var id) ? id : null;
        }
    }

    public string? Role => Roles().FirstOrDefault();

    public bool IsInRole(string role) => Roles().Any(r => MedilogRoles.Matches(r, role));

    private IEnumerable<string> Roles() =>
        _principal.FindAll(ClaimTypes.Role).Concat(_principal.FindAll("role")).Select(c => c.Value);
}
