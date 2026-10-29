using Medilog.Application.DTOs;
using Medilog.Application.Interfaces;
using Medilog.Domain.Enums;
using Medilog.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Medilog.Infrastructure.Security;

/// <summary>
/// Reads secretary assignments and resource owners straight from the database on every call,
/// so deactivation or unassignment takes effect immediately (nothing is trusted from token claims).
/// </summary>
public sealed class AccessScopeStore(AppDbContext db) : IAccessScopeStore
{
    public async Task<IReadOnlyCollection<Guid>> GetAssignedDoctorIdsAsync(Guid secretaryId, CancellationToken ct = default)
    {
        return await db.Secretaries
            .AsNoTracking()
            .Where(s => s.SecretaryId == secretaryId && s.AccountStatus == AccountStatus.Active)
            .SelectMany(s => s.Doctors)
            .Select(d => d.DoctorId)
            .ToListAsync(ct);
    }

    public Task<bool> IsActiveSecretaryAsync(Guid secretaryId, CancellationToken ct = default)
    {
        return db.Secretaries
            .AsNoTracking()
            .AnyAsync(s => s.SecretaryId == secretaryId && s.AccountStatus == AccountStatus.Active, ct);
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
        var secretary = await db.Secretaries
            .AsNoTracking()
            .Where(s => s.SecretaryId == secretaryId)
            .Select(s => new
            {
                s.SecretaryId,
                s.FullName,
                s.Email,
                s.Phone,
                s.AccountStatus,
                s.CreatedAt,
                Doctors = s.Doctors
                    .OrderBy(d => d.FullName)
                    .Select(d => new AssignedDoctorDto(d.DoctorId, d.FullName, d.Specialization))
                    .ToList()
            })
            .FirstOrDefaultAsync(ct);

        // PasswordHash is never selected or returned.
        return secretary is null
            ? null
            : new SecretaryAccountDto(
                secretary.SecretaryId,
                secretary.FullName,
                secretary.Email,
                secretary.Phone,
                secretary.AccountStatus.ToString(),
                secretary.CreatedAt,
                secretary.Doctors);
    }
}
