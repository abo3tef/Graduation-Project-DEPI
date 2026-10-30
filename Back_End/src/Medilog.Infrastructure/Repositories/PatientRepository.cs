using Medilog.Application.Common.Interfaces;
using Medilog.Application.Common.Models;
using Medilog.Domain.Entities;
using Medilog.Domain.Enums;
using Medilog.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Medilog.Infrastructure.Repositories;

public sealed class PatientRepository(AppDbContext db) : IPatientRepository
{
    public async Task<PagedPatients> SearchAsync(
        PatientSearchCriteria criteria,
        int page,
        int pageSize,
        PatientSort sort,
        CancellationToken cancellationToken)
    {
        var doctorIds = criteria.DoctorIds.ToArray();
        var query = db.Patients.AsNoTracking()
            .Where(patient => doctorIds.Contains(patient.DoctorId));

        if (!string.IsNullOrWhiteSpace(criteria.Search))
        {
            var term = criteria.Search.Trim();
            query = query.Where(patient =>
                patient.FullName.Contains(term)
                || (patient.FullNameEn != null && patient.FullNameEn.Contains(term))
                || patient.Code.Contains(term)
                || (patient.Phone != null && patient.Phone.Contains(term)));
        }

        if (!string.IsNullOrWhiteSpace(criteria.Gender)
            && Enum.TryParse<Gender>(criteria.Gender, ignoreCase: true, out var gender))
        {
            query = query.Where(patient => patient.Gender == gender);
        }

        if (criteria.BornOnOrBefore is { } bornOnOrBefore)
        {
            query = query.Where(patient => patient.BirthDate <= bornOnOrBefore);
        }

        if (criteria.BornAfter is { } bornAfter)
        {
            query = query.Where(patient => patient.BirthDate > bornAfter);
        }

        var total = await query.CountAsync(cancellationToken);

        IOrderedQueryable<Patient> ordered = sort switch
        {
            PatientSort.NameAsc => query.OrderBy(patient => patient.FullName),
            PatientSort.NameDesc => query.OrderByDescending(patient => patient.FullName),
            PatientSort.CodeAsc => query.OrderBy(patient => patient.Code),
            PatientSort.CodeDesc => query.OrderByDescending(patient => patient.Code),
            PatientSort.LastVisitAsc => query.OrderBy(patient =>
                db.Visits.Where(visit => visit.PatientId == patient.PatientId)
                    .Max(visit => (DateTime?)visit.VisitedAt)),
            PatientSort.AgeAsc => query.OrderByDescending(patient => patient.BirthDate),
            PatientSort.AgeDesc => query.OrderBy(patient => patient.BirthDate),
            _ => query.OrderByDescending(patient =>
                db.Visits.Where(visit => visit.PatientId == patient.PatientId)
                    .Max(visit => (DateTime?)visit.VisitedAt))
        };

        var rows = await ordered
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(patient => new PatientWithLastVisit(
                patient,
                db.Visits.Where(visit => visit.PatientId == patient.PatientId)
                    .Max(visit => (DateTime?)visit.VisitedAt)))
            .ToListAsync(cancellationToken);

        return new PagedPatients(rows, page, pageSize, total);
    }

    public async Task<PatientWithLastVisit?> GetAsync(Guid id, CancellationToken cancellationToken)
    {
        var patient = await db.Patients.FirstOrDefaultAsync(x => x.PatientId == id, cancellationToken);
        if (patient is null)
        {
            return null;
        }

        var lastVisit = await db.Visits
            .Where(visit => visit.PatientId == id)
            .MaxAsync(visit => (DateTime?)visit.VisitedAt, cancellationToken);

        return new PatientWithLastVisit(patient, lastVisit);
    }

    public Task<bool> PhoneExistsAsync(
        string phone,
        Guid doctorId,
        Guid? excludeId,
        CancellationToken cancellationToken) =>
        db.Patients.AnyAsync(
            patient => patient.DoctorId == doctorId
                && patient.Phone == phone
                && (excludeId == null || patient.PatientId != excludeId),
            cancellationToken);

    public Task<int> CountAsync(CancellationToken cancellationToken) =>
        db.Patients.CountAsync(cancellationToken);

    public async Task<IReadOnlyList<DateTime>> GetCreationDatesAsync(CancellationToken cancellationToken) =>
        await db.Patients.AsNoTracking()
            .Select(patient => patient.CreatedAt)
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<PatientWithLastVisit>> GetRecentAsync(
        int take,
        CancellationToken cancellationToken)
    {
        return await db.Patients.AsNoTracking()
            .Where(patient => patient.Visits.Any())
            .OrderByDescending(patient =>
                db.Visits.Where(visit => visit.PatientId == patient.PatientId)
                    .Max(visit => (DateTime?)visit.VisitedAt))
            .Take(take)
            .Select(patient => new PatientWithLastVisit(
                patient,
                db.Visits.Where(visit => visit.PatientId == patient.PatientId)
                    .Max(visit => (DateTime?)visit.VisitedAt)))
            .ToListAsync(cancellationToken);
    }

    public async Task<string> GetNextCodeAsync(CancellationToken cancellationToken)
    {
        var latest = await db.Patients.AsNoTracking()
            .OrderByDescending(patient => patient.Code)
            .Select(patient => patient.Code)
            .FirstOrDefaultAsync(cancellationToken);

        var sequence = 0;
        if (!string.IsNullOrWhiteSpace(latest) && latest.StartsWith("PT-", StringComparison.OrdinalIgnoreCase))
        {
            int.TryParse(latest[3..], out sequence);
        }

        return $"PT-{sequence + 1:D4}";
    }

    public async Task AddAsync(Patient patient, CancellationToken cancellationToken) =>
        await db.Patients.AddAsync(patient, cancellationToken);
}
