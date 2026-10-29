using Medilog.Application.Common.Interfaces;
using Medilog.Domain.Entities;
using Medilog.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Medilog.Infrastructure.Repositories;

public sealed class VisitRepository(AppDbContext db) : IVisitRepository
{
    public async Task AddAsync(Visit visit, CancellationToken cancellationToken) =>
        await db.Visits.AddAsync(visit, cancellationToken);

    public Task<Visit?> GetForAppointmentAsync(Guid appointmentId, CancellationToken cancellationToken) =>
        db.Visits.AsNoTracking()
            .FirstOrDefaultAsync(visit => visit.AppointmentId == appointmentId, cancellationToken);

    public async Task<IReadOnlyList<Visit>> GetAsync(
        DateTime fromUtc,
        DateTime toUtc,
        CancellationToken cancellationToken) =>
        await db.Visits.AsNoTracking()
            .Where(visit => visit.VisitedAt >= fromUtc && visit.VisitedAt < toUtc)
            .OrderBy(visit => visit.VisitedAt)
            .ToListAsync(cancellationToken);
}
