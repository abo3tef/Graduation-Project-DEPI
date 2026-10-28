using Medilog.Domain.Enums;

namespace Medilog.Domain.Entities;

public class Secretary
{
    public Guid SecretaryId { get; set; } = Guid.NewGuid();
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public AccountStatus AccountStatus { get; set; } = AccountStatus.Active;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Doctor> Doctors { get; set; } = new List<Doctor>();
}
