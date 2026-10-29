namespace Medilog.Application.Security;

/// <summary>
/// Role names expected in the authenticated principal's role claim.
/// Comparison is case-insensitive so "secretary" and "Secretary" are equivalent.
/// </summary>
public static class MedilogRoles
{
    public const string Doctor = "Doctor";
    public const string Secretary = "Secretary";
    public const string Admin = "Admin";

    public static bool Matches(string? actual, string expected) =>
        string.Equals(actual, expected, StringComparison.OrdinalIgnoreCase);
}
