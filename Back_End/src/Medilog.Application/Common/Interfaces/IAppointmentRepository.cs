using Medilog.Domain.Entities;

namespace Medilog.Application.Common.Interfaces;

public interface IAppointmentRepository
{
    Task<IReadOnlyList<Appointment>> GetAsync(
        DateTime fromUtc,
        DateTime toUtc,
        Guid? patientId,
        CancellationToken cancellationToken);

    Task<Appointment?> GetAsync(Guid id, CancellationToken cancellationToken);

    Task AddAsync(Appointment appointment, CancellationToken cancellationToken);

    void Remove(Appointment appointment);

    Task<bool> HasConflictAsync(
        Guid doctorId,
        DateTime startUtc,
        DateTime endUtc,
        Guid? excludeId,
        CancellationToken cancellationToken);

    Task<int> CountScheduledAsync(CancellationToken cancellationToken);
}
