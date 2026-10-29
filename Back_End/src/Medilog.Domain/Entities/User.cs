using Medilog.Domain.Enums;

namespace Medilog.Domain.Entities;

/// <summary>
/// An authenticated member of the clinic team. Patients are medical records,
/// not users, and never have accounts (per the SRS).
/// </summary>
public class User
{
    public Guid UserId { get; set; } = Guid.NewGuid();
    public string FullName { get; set; } = string.Empty;
    public string? FullNameEn { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Specialization { get; set; }
    public UserRole Role { get; set; }
    public AccountStatus AccountStatus { get; set; } = AccountStatus.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
    public ICollection<Visit> Visits { get; set; } = new List<Visit>();
}
