namespace Medilog.Domain.Entities;

public class MedicalVisit
{
    public Guid VisitId { get; set; } = Guid.NewGuid();
    public Guid PatientId { get; set; }
    public Guid DoctorId { get; set; }
    public Guid? AppointmentId { get; set; }
    public DateTime VisitDate { get; set; } = DateTime.UtcNow;
    public string? ChiefComplaint { get; set; }
    public string? Symptoms { get; set; }
    public string? ClinicalNotes { get; set; }
    public Patient Patient { get; set; } = null!;
    public Doctor Doctor { get; set; } = null!;
    public Appointment? Appointment { get; set; }
    public ICollection<Diagnosis> Diagnoses { get; set; } = new List<Diagnosis>();
    public ICollection<Medication> Medications { get; set; } = new List<Medication>();
    public ICollection<VitalSigns> VitalSigns { get; set; } = new List<VitalSigns>();
    public ICollection<LaboratoryResult> LaboratoryResults { get; set; } = new List<LaboratoryResult>();
    public ICollection<MedicalNote> MedicalNotes { get; set; } = new List<MedicalNote>();
}
