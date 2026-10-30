namespace Medilog.Domain.Entities;

/// <summary>
/// Assigns a secretary to a doctor (many-to-many). Each (SecretaryId, DoctorId) pair is unique.
/// Both ids reference <see cref="User"/> rows with the Secretary and Doctor roles respectively.
/// </summary>
public class SecretaryDoctor
{
    public Guid SecretaryId { get; set; }
    public Guid DoctorId { get; set; }

    public User Secretary { get; set; } = null!;
    public User Doctor { get; set; } = null!;
}
