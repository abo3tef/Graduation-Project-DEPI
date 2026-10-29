using Medilog.Domain.Entities;

namespace Medilog.Application.Common.Interfaces;

public interface IVisitRepository
{
    Task AddAsync(Visit visit, CancellationToken cancellationToken);

    Task<Visit?> GetForAppointmentAsync(Guid appointmentId, CancellationToken cancellationToken);

    Task<IReadOnlyList<Visit>> GetAsync(DateTime fromUtc, DateTime toUtc, CancellationToken cancellationToken);
}
