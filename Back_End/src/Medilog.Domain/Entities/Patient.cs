namespace Medilog.Domain.Entities;

public class Patient
{
    public Guid PatientId { get; set; } = Guid.NewGuid();
    public Guid DoctorId { get; set; } 
    public string FullName { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string Gender { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Address { get; set; }
    public string? BloodType { get; set; }
    public string? EmergencyContact { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Doctor Doctor { get; set; } = null!;
}