namespace Medilog.Application.Security;

/// <summary>
/// The authenticated caller, as resolved from the authenticated principal.
/// UserId must equal Doctor.DoctorId, Secretary.SecretaryId, or the admin's id.
/// </summary>
public interface ICurrentUser
{
    bool IsAuthenticated { get; }
    Guid? UserId { get; }
    string? Role { get; }
    bool IsInRole(string role);
}
