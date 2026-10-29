using Medilog.Application.Common.Interfaces;
using Medilog.Domain.Entities;
using Medilog.Domain.Enums;
using Medilog.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Medilog.Infrastructure.Repositories;

public sealed class UserRepository(AppDbContext db) : IUserRepository
{
    public Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken) =>
        db.Users.FirstOrDefaultAsync(user => user.Email == email, cancellationToken);

    public Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken) =>
        db.Users.FirstOrDefaultAsync(user => user.UserId == id, cancellationToken);

    public Task<User?> GetPrimaryDoctorAsync(CancellationToken cancellationToken) =>
        db.Users
            .Where(user => user.Role == UserRole.Doctor && user.AccountStatus == AccountStatus.Active)
            .OrderBy(user => user.CreatedAt)
            .FirstOrDefaultAsync(cancellationToken);

    public Task<bool> AnyAsync(CancellationToken cancellationToken) =>
        db.Users.AnyAsync(cancellationToken);
}
