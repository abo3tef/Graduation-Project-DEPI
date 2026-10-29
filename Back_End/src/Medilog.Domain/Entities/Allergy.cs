using Medilog.Domain.Enums;

namespace Medilog.Domain.Entities;

public class Allergy
{
    public Guid AllergyId { get; set; } = Guid.NewGuid();
    public Guid PatientId { get; set; }
    public string AllergyName { get; set; } = string.Empty;
    public AllergySeverity? Severity { get; set; }
    public string? Description { get; set; }
    public string? Notes { get; set; }
    public Patient Patient { get; set; } = null!;
}
