using Medilog.Domain.Enums;

namespace Medilog.Domain.Entities;

public class Patient
{
    public Guid PatientId { get; set; } = Guid.NewGuid();

    /// <summary>Human-readable, auto-generated patient code, e.g. PT-0148.</summary>
    public string Code { get; set; } = string.Empty;

    public string FullName { get; set; } = string.Empty;

    /// <summary>Optional Latin display name used by the English UI.</summary>
    public string? FullNameEn { get; set; }

    public string? Phone { get; set; }
    public DateOnly BirthDate { get; set; }
    public Gender Gender { get; set; } = Gender.Unspecified;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Visit> Visits { get; set; } = new List<Visit>();
    public ICollection<Appointment> Appointments { get; set; } = new List<Appointment>();
}
