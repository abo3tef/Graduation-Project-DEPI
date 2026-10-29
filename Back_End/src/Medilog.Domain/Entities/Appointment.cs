using Medilog.Domain.Enums;

namespace Medilog.Domain.Entities;

public class Appointment
{
    public const int DefaultDurationMinutes = 30;

    public Guid AppointmentId { get; set; } = Guid.NewGuid();
    public Guid PatientId { get; set; }
    public Guid DoctorId { get; set; }
    public Guid CreatedBy { get; set; }

    /// <summary>UTC start instant. Display formatting always uses Africa/Cairo.</summary>
    public DateTime StartsAt { get; set; }

    public int DurationMinutes { get; set; } = DefaultDurationMinutes;

    /// <summary>Stable reason code, e.g. bp-followup, new-checkup, lab-results, follow-up.</summary>
    public string Reason { get; set; } = string.Empty;

    public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled;
    public string? Notes { get; set; }
    public string? CancellationReason { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime EndsAt => StartsAt.AddMinutes(DurationMinutes);

    public Patient Patient { get; set; } = null!;
    public User Doctor { get; set; } = null!;
    public Visit? Visit { get; set; }
}
