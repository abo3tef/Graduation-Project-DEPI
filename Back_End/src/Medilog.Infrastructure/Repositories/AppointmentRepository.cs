using Medilog.Application.Common.Interfaces;
using Medilog.Domain.Entities;
using Medilog.Domain.Enums;
using Medilog.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Medilog.Infrastructure.Repositories;

public sealed class AppointmentRepository(AppDbContext db) : IAppointmentRepository
{
    public async Task<IReadOnlyList<Appointment>> GetAsync(
        DateTime fromUtc,
        DateTime toUtc,
        Guid? patientId,
        CancellationToken cancellationToken)
    {
        var query = db.Appointments.AsNoTracking()
            .Include(appointment => appointment.Patient)
            .Include(appointment => appointment.Doctor)
            .Include(appointment => appointment.Visit)
            .Where(appointment => appointment.StartsAt >= fromUtc && appointment.StartsAt < toUtc);

        if (patientId.HasValue)
        {
            query = query.Where(appointment => appointment.PatientId == patientId.Value);
        }

        return await query
            .OrderBy(appointment => appointment.StartsAt)
            .ToListAsync(cancellationToken);
    }

    public Task<Appointment?> GetAsync(Guid id, CancellationToken cancellationToken) =>
        db.Appointments
            .Include(appointment => appointment.Patient)
            .Include(appointment => appointment.Doctor)
            .Include(appointment => appointment.Visit)
            .FirstOrDefaultAsync(appointment => appointment.AppointmentId == id, cancellationToken);

    public async Task AddAsync(Appointment appointment, CancellationToken cancellationToken) =>
        await db.Appointments.AddAsync(appointment, cancellationToken);

    public void Remove(Appointment appointment) => db.Appointments.Remove(appointment);

    public async Task<bool> HasConflictAsync(
        Guid doctorId,
        DateTime startUtc,
        DateTime endUtc,
        Guid? excludeId,
        CancellationToken cancellationToken)
    {
        var candidates = await db.Appointments.AsNoTracking()
            .Where(appointment => appointment.DoctorId == doctorId
                && appointment.Status != AppointmentStatus.Cancelled
                && appointment.Status != AppointmentStatus.NoShow
                && (excludeId == null || appointment.AppointmentId != excludeId)
                && appointment.StartsAt >= startUtc.AddHours(-4)
                && appointment.StartsAt < endUtc.AddHours(4))
            .Select(appointment => new { appointment.StartsAt, appointment.DurationMinutes })
            .ToListAsync(cancellationToken);

        return candidates.Any(candidate =>
            candidate.StartsAt < endUtc
            && candidate.StartsAt.AddMinutes(candidate.DurationMinutes) > startUtc);
    }

    public Task<int> CountScheduledAsync(CancellationToken cancellationToken) =>
        db.Appointments.CountAsync(
            appointment => appointment.Status == AppointmentStatus.Scheduled,
            cancellationToken);
}
