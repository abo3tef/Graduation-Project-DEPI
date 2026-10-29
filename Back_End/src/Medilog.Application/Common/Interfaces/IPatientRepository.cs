using Medilog.Application.Common.Models;
using Medilog.Domain.Entities;

namespace Medilog.Application.Common.Interfaces;

public enum PatientSort
{
    NameAsc,
    NameDesc,
    CodeAsc,
    CodeDesc,
    LastVisitDesc,
    LastVisitAsc,
    AgeAsc,
    AgeDesc
}

public interface IPatientRepository
{
    Task<PagedPatients> SearchAsync(
        string? search,
        int page,
        int pageSize,
        PatientSort sort,
        CancellationToken cancellationToken);

    Task<PatientWithLastVisit?> GetAsync(Guid id, CancellationToken cancellationToken);

    Task<bool> PhoneExistsAsync(string phone, Guid? excludeId, CancellationToken cancellationToken);

    Task<int> CountAsync(CancellationToken cancellationToken);

    Task<IReadOnlyList<DateTime>> GetCreationDatesAsync(CancellationToken cancellationToken);

    Task<IReadOnlyList<PatientWithLastVisit>> GetRecentAsync(int take, CancellationToken cancellationToken);

    Task<string> GetNextCodeAsync(CancellationToken cancellationToken);

    Task AddAsync(Patient patient, CancellationToken cancellationToken);
}
