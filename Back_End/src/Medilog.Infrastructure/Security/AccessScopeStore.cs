using Medilog.Application.DTOs;
using Medilog.Application.Interfaces;
using Medilog.Domain.Enums;
using Medilog.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Medilog.Infrastructure.Security;

/// <summary>
/// Reads account state, secretary assignments and resource owners straight from the database on
/// every call, so deactivation or unassignment takes effect immediately (nothing is trusted from
/// token claims). Secretaries and doctors are both <c>User</c> rows distinguished by <c>Role</c>;
/// a secretary's doctors come from the <c>SecretaryDoctors</c> link table and only active doctors count.
/// </summary>
public sealed class AccessScopeStore(AppDbContext db) : IAccessScopeStore
{
    public async Task<IReadOnlyCollection<Guid>> GetAssignedDoctorIdsAsync(Guid secretaryId, CancellationToken ct = default)
    {
        if (!await IsActiveSecretaryAsync(secretaryId, ct))
        {
            return [];
        }

        return await AssignedActiveDoctors(secretaryId).Select(d => d.UserId).ToListAsync(ct);
    }

    public Task<bool> IsActiveSecretaryAsync(Guid secretaryId, CancellationToken ct = default)
    {
        return db.Users
            .AsNoTracking()
            .AnyAsync(u => u.UserId == secretaryId
                && u.Role == UserRole.Secretary
                && u.AccountStatus == AccountStatus.Active, ct);
    }

    public async Task<Guid?> GetPatientDoctorIdAsync(Guid patientId, CancellationToken ct = default)
    {
        return await db.Patients
            .AsNoTracking()
            .Where(p => p.PatientId == patientId)
            .Select(p => (Guid?)p.DoctorId)
            .FirstOrDefaultAsync(ct);
    }

    public async Task<Guid?> GetAppointmentDoctorIdAsync(Guid appointmentId, CancellationToken ct = default)
    {
        return await db.Appointments
            .AsNoTracking()
            .Where(a => a.AppointmentId == appointmentId)
            .Select(a => (Guid?)a.DoctorId)
            .FirstOrDefaultAsync(ct);
    }

    public async Task<SecretaryAccountDto?> GetSecretaryAccountAsync(Guid secretaryId, CancellationToken ct = default)
    {
        // PasswordHash is never selected or returned.
        var secretary = await db.Users
            .AsNoTracking()
            .Where(u => u.UserId == secretaryId && u.Role == UserRole.Secretary)
            .Select(u => new { u.UserId, u.FullName, u.Email, u.Phone, u.AccountStatus, u.CreatedAt })
            .FirstOrDefaultAsync(ct);

        if (secretary is null)
        {
            return null;
        }

        var doctors = secretary.AccountStatus == AccountStatus.Active
            ? await AssignedActiveDoctors(secretaryId)
                .OrderBy(d => d.FullName)
                .Select(d => new AssignedDoctorDto(d.UserId, d.FullName, d.Specialization))
                .ToListAsync(ct)
            : [];

        return new SecretaryAccountDto(
            secretary.UserId,
            secretary.FullName,
            secretary.Email,
            secretary.Phone,
            secretary.AccountStatus.ToString(),
            secretary.CreatedAt,
            doctors);
    }

    private IQueryable<Domain.Entities.User> AssignedActiveDoctors(Guid secretaryId) =>
        db.SecretaryDoctors
            .AsNoTracking()
            .Where(link => link.SecretaryId == secretaryId)
            .Select(link => link.Doctor)
            .Where(d => d.Role == UserRole.Doctor && d.AccountStatus == AccountStatus.Active);
}
