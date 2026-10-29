namespace Medilog.Domain.Entities;

public class MedicalNote
{
    public Guid NoteId { get; set; } = Guid.NewGuid();
    public Guid PatientId { get; set; }
    public Guid DoctorId { get; set; }
    public Guid? VisitId { get; set; }
    public string NoteContent { get; set; } = string.Empty;
    public DateTime CreatedDate { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedDate { get; set; }
    public Patient Patient { get; set; } = null!;
    public User Doctor { get; set; } = null!;
    public Visit? Visit { get; set; }
}
