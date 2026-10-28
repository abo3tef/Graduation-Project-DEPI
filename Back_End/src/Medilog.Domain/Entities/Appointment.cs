using Medilog.Domain.Enums;

namespace Medilog.Domain.Entities;

public class Appointment
{
    public Guid AppointmentId { get; set; } = Guid.NewGuid();
    public Guid PatientId { get; set; }
    public Guid DoctorId { get; set; }
    public Guid CreatedBy { get; set; }
    public DateOnly AppointmentDate { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly? EndTime { get; set; }
    public string? Reason { get; set; }
    public AppointmentStatus Status { get; set; } = AppointmentStatus.Scheduled;
    public string? Notes { get; set; }
    public string? CancellationReason { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Patient Patient { get; set; } = null!;
    public Doctor Doctor { get; set; } = null!;
    public MedicalVisit? MedicalVisit { get; set; }
}
