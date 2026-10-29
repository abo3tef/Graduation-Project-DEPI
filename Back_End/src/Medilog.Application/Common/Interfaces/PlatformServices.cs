using Medilog.Domain.Entities;
using Medilog.Domain.Enums;

namespace Medilog.Application.Common.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken);

    Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<User?> GetPrimaryDoctorAsync(CancellationToken cancellationToken);

    Task<bool> AnyAsync(CancellationToken cancellationToken);
}

public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken);
}

public interface IPasswordHasher
{
    string Hash(string password);

    bool Verify(string password, string passwordHash);
}

public interface IJwtTokenGenerator
{
    (string Token, DateTime ExpiresAt) Create(User user);
}

public interface ICurrentUser
{
    Guid? UserId { get; }
    UserRole? Role { get; }
    string? FullName { get; }
    bool IsAuthenticated { get; }
}

public interface ILanguageContext
{
    /// <summary>"ar" or "en".</summary>
    string LanguageCode { get; }
    bool IsArabic { get; }
}

public interface IClock
{
    DateTime UtcNow { get; }
}

public interface ISystemSettings
{
    bool DemoMode { get; }
}
