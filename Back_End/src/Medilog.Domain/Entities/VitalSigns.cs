namespace Medilog.Domain.Entities;

public class VitalSigns
{
    public Guid VitalSignsId { get; set; } = Guid.NewGuid();
    public Guid VisitId { get; set; }
    public string? BloodPressure { get; set; }
    public int? HeartRate { get; set; }
    public decimal? Temperature { get; set; }
    public int? RespiratoryRate { get; set; }
    public decimal? Weight { get; set; }
    public decimal? Height { get; set; }
    public int? SpO2 { get; set; }
    public Visit Visit { get; set; } = null!;
}
