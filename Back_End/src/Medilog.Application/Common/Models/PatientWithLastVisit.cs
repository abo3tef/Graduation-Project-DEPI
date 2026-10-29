using Medilog.Domain.Entities;

namespace Medilog.Application.Common.Models;

/// <summary>A patient plus the projection-only last visit timestamp.</summary>
public sealed record PatientWithLastVisit(Patient Patient, DateTime? LastVisitAt);

public sealed record PagedPatients(
    IReadOnlyList<PatientWithLastVisit> Items,
    int Page,
    int PageSize,
    int Total)
{
    public int TotalPages => PageSize <= 0 ? 0 : (int)Math.Ceiling(Total / (double)PageSize);
}
