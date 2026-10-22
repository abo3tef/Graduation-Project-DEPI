namespace Medilog.Domain.Entities;

public class Doctor
{
    public Guid DoctorId { get; set; } = Guid.NewGuid();
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Specialization { get; set; }
    public string AccountStatus { get; set; } = "Active";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Patient> Patients { get; set; } = new List<Patient>();
}