using FluentValidation;
using Medilog.Application.Common.Exceptions;
using Medilog.Application.Common.Interfaces;
using Medilog.Application.Common.Text;
using Medilog.Application.DTOs.Patients;
using Medilog.Application.Mappings;
using Medilog.Domain.Entities;
using Medilog.Domain.Enums;

namespace Medilog.Application.Services;

public sealed class PatientService(
    IPatientRepository patients,
    IUnitOfWork unitOfWork,
    IClock clock,
    ILanguageContext language,
    IValidator<CreatePatientRequest> createValidator,
    IValidator<UpdatePatientRequest> updateValidator,
    IValidator<PatientSearchQuery> searchValidator)
{
    public async Task<Common.Models.PagedResult<PatientListItemDto>> SearchAsync(
        PatientSearchQuery query,
        CancellationToken cancellationToken)
    {
        await searchValidator.ValidateAndThrowAsync(query, cancellationToken);

        var page = await patients.SearchAsync(
            string.IsNullOrWhiteSpace(query.Search) ? null : query.Search.Trim(),
            query.Page,
            query.PageSize,
            query.ParsedSort,
            cancellationToken);

        var now = clock.UtcNow;
        var items = page.Items
            .Select(item => item.ToListItem(language, now))
            .ToArray();

        return new Common.Models.PagedResult<PatientListItemDto>(items, page.Page, page.PageSize, page.Total);
    }

    public async Task<PatientDetailDto> GetAsync(Guid id, CancellationToken cancellationToken)
    {
        var patient = await patients.GetAsync(id, cancellationToken)
            ?? throw new NotFoundException("Patient not found.", "patient_not_found");

        return patient.ToDetail(language, clock.UtcNow);
    }

    public async Task<PatientDetailDto> CreateAsync(
        CreatePatientRequest request,
        CancellationToken cancellationToken)
    {
        await createValidator.ValidateAndThrowAsync(request, cancellationToken);

        var phone = TextNormalizer.NormalizePhone(request.Phone);
        if (await patients.PhoneExistsAsync(phone, null, cancellationToken))
        {
            throw new ConflictException("A patient already uses this phone number.", "duplicate_phone");
        }

        var patient = new Patient
        {
            Code = await patients.GetNextCodeAsync(cancellationToken),
            FullName = request.Name.Trim(),
            Phone = phone,
            BirthDate = request.BirthDate,
            Gender = ParseGender(request.Gender),
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
            CreatedAt = clock.UtcNow
        };

        await patients.AddAsync(patient, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var created = await patients.GetAsync(patient.PatientId, cancellationToken)
            ?? throw new NotFoundException("Patient not found.", "patient_not_found");

        return created.ToDetail(language, clock.UtcNow);
    }

    public async Task<PatientDetailDto> UpdateAsync(
        Guid id,
        UpdatePatientRequest request,
        CancellationToken cancellationToken)
    {
        await updateValidator.ValidateAndThrowAsync(request, cancellationToken);

        var existing = await patients.GetAsync(id, cancellationToken)
            ?? throw new NotFoundException("Patient not found.", "patient_not_found");

        var phone = TextNormalizer.NormalizePhone(request.Phone);
        if (await patients.PhoneExistsAsync(phone, id, cancellationToken))
        {
            throw new ConflictException("A patient already uses this phone number.", "duplicate_phone");
        }

        existing.Patient.FullName = request.Name.Trim();
        existing.Patient.Phone = phone;
        existing.Patient.BirthDate = request.BirthDate;
        existing.Patient.Gender = ParseGender(request.Gender);
        existing.Patient.Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();

        await unitOfWork.SaveChangesAsync(cancellationToken);

        var updated = await patients.GetAsync(id, cancellationToken)
            ?? throw new NotFoundException("Patient not found.", "patient_not_found");

        return updated.ToDetail(language, clock.UtcNow);
    }

    private static Gender ParseGender(string gender) =>
        Enum.TryParse<Gender>(gender, ignoreCase: true, out var parsed) ? parsed : Gender.Unspecified;
}
