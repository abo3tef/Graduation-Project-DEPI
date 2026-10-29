using Medilog.Domain.Enums;

namespace Medilog.Domain.Entities;

public class ChronicCondition
{
    public Guid ConditionId { get; set; } = Guid.NewGuid();
    public Guid PatientId { get; set; }
    public string ConditionName { get; set; } = string.Empty;
    public DateOnly? DiagnosisDate { get; set; }
    public ChronicConditionStatus? Status { get; set; }
    public string? Notes { get; set; }
    public Patient Patient { get; set; } = null!;
}
