namespace Medilog.Domain.Entities;

public class Medication
{
    public Guid MedicationId { get; set; } = Guid.NewGuid();
    public Guid VisitId { get; set; }
    public Guid PatientId { get; set; }
    public string MedicationName { get; set; } = string.Empty;
    public string Dosage { get; set; } = string.Empty;
    public string Frequency { get; set; } = string.Empty;
    public string? Duration { get; set; }
    public string? Instructions { get; set; }
    public MedicalVisit Visit { get; set; } = null!;
    public Patient Patient { get; set; } = null!;
}
