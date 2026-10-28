namespace Medilog.Domain.Entities;

public class LaboratoryResult
{
    public Guid ResultId { get; set; } = Guid.NewGuid();
    public Guid PatientId { get; set; }
    public Guid? VisitId { get; set; }
    public string TestName { get; set; } = string.Empty;
    public DateOnly TestDate { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
    public decimal Value { get; set; }
    public string Unit { get; set; } = string.Empty;
    public string? ReferenceRange { get; set; }
    public string? Notes { get; set; }
    public Patient Patient { get; set; } = null!;
    public MedicalVisit? Visit { get; set; }
}
