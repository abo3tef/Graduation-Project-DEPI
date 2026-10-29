using Medilog.Domain.Enums;

namespace Medilog.Domain.Entities;

public class MedicalDocument
{
    public Guid DocumentId { get; set; } = Guid.NewGuid();
    public Guid PatientId { get; set; }
    public Guid UploadedBy { get; set; }
    public string FileName { get; set; } = string.Empty;
    public DocumentType Type { get; set; }
    public string Location { get; set; } = string.Empty;
    public DateTime UploadDate { get; set; } = DateTime.UtcNow;
    public string? Description { get; set; }
    public Patient Patient { get; set; } = null!;
    public User Uploader { get; set; } = null!;
}
