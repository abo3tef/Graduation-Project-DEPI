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

/// <summary>
/// Filters for a patient search. <paramref name="DoctorIds"/> is the caller's accessible workspace and is
/// always applied. <paramref name="BornOnOrBefore"/> and <paramref name="BornAfter"/> bound the birth date
/// (derived from the minimum and maximum age).
/// </summary>
public sealed record PatientSearchCriteria(
    string? Search,
    IReadOnlyCollection<Guid> DoctorIds,
    string? Gender = null,
    DateOnly? BornOnOrBefore = null,
    DateOnly? BornAfter = null);

public interface IPatientRepository
{
    Task<PagedPatients> SearchAsync(
        PatientSearchCriteria criteria,
        int page,
        int pageSize,
        PatientSort sort,
        CancellationToken cancellationToken);

    Task<PatientWithLastVisit?> GetAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>True when another patient of the same doctor already uses the phone number.</summary>
    Task<bool> PhoneExistsAsync(string phone, Guid doctorId, Guid? excludeId, CancellationToken cancellationToken);

    Task<int> CountAsync(CancellationToken cancellationToken);

    Task<IReadOnlyList<DateTime>> GetCreationDatesAsync(CancellationToken cancellationToken);

    Task<IReadOnlyList<PatientWithLastVisit>> GetRecentAsync(int take, CancellationToken cancellationToken);

    Task<string> GetNextCodeAsync(CancellationToken cancellationToken);

    Task AddAsync(Patient patient, CancellationToken cancellationToken);
}
