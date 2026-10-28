namespace Medilog.Domain.Entities;

public class Diagnosis
{
    public Guid DiagnosisId { get; set; } = Guid.NewGuid();
    public Guid VisitId { get; set; }
    public Guid PatientId { get; set; }
    public string DiagnosisName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateOnly DiagnosisDate { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
    public MedicalVisit Visit { get; set; } = null!;
    public Patient Patient { get; set; } = null!;
}
