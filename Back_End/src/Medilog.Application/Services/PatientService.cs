using FluentValidation;
using FluentValidation.Results;
using Medilog.Application.Common.Exceptions;
using Medilog.Application.Common.Interfaces;
using Medilog.Application.Common.Text;
using Medilog.Application.DTOs.Patients;
using Medilog.Application.Interfaces;
using Medilog.Application.Mappings;
using Medilog.Application.Security;
using Medilog.Domain.Common;
using Medilog.Domain.Entities;
using Medilog.Domain.Enums;
using CurrentUser = Medilog.Application.Security.ICurrentUser;

namespace Medilog.Application.Services;

/// <summary>
/// Administrative patient data. Every operation is limited to the caller's accessible doctors
/// (doctor: self; secretary: assigned doctors). A patient outside that scope is reported as
/// not found so its existence is never revealed. Secretaries only handle basic patient
/// information, so clinical notes and the last-visit date are never returned to them and
/// their edits never touch the notes.
/// </summary>
public sealed class PatientService(
    IPatientRepository patients,
    IUnitOfWork unitOfWork,
    IClock clock,
    ILanguageContext language,
    CurrentUser currentUser,
    IResourceAccessService access,
    IValidator<CreatePatientRequest> createValidator,
    IValidator<UpdatePatientRequest> updateValidator,
    IValidator<PatientSearchQuery> searchValidator)
{
    private bool IsSecretary => currentUser.IsInRole(MedilogRoles.Secretary);

    public async Task<Common.Models.PagedResult<PatientListItemDto>> SearchAsync(
        PatientSearchQuery query,
        CancellationToken cancellationToken)
    {
        await searchValidator.ValidateAndThrowAsync(query, cancellationToken);

        var doctorIds = await access.GetAccessibleDoctorIdsAsync(currentUser, cancellationToken);
        if (doctorIds.Count == 0)
        {
            return new Common.Models.PagedResult<PatientListItemDto>(
                Array.Empty<PatientListItemDto>(), query.Page, query.PageSize, 0);
        }

        var now = clock.UtcNow;
        var today = ClinicTime.Today(now);
        var search = string.IsNullOrWhiteSpace(query.Search)
            ? null
            : TextNormalizer.NormalizeDigits(query.Search.Trim());

        var criteria = new PatientSearchCriteria(
            search,
            doctorIds,
            string.IsNullOrWhiteSpace(query.Gender) ? null : query.Gender,
            query.MinAge.HasValue ? today.AddYears(-query.MinAge.Value) : null,
            query.MaxAge.HasValue ? today.AddYears(-(query.MaxAge.Value + 1)) : null);

        var page = await patients.SearchAsync(
            criteria,
            query.Page,
            query.PageSize,
            query.ParsedSort,
            cancellationToken);

        var includeMedical = !IsSecretary;
        var items = page.Items
            .Select(item => item.ToListItem(language, now, includeMedical))
            .ToArray();

        return new Common.Models.PagedResult<PatientListItemDto>(items, page.Page, page.PageSize, page.Total);
    }

    public async Task<PatientDetailDto> GetAsync(Guid id, CancellationToken cancellationToken)
    {
        var patient = await LoadAccessibleAsync(id, cancellationToken);
        return patient.ToDetail(language, clock.UtcNow, !IsSecretary);
    }

    public async Task<PatientDetailDto> CreateAsync(
        CreatePatientRequest request,
        CancellationToken cancellationToken)
    {
        await createValidator.ValidateAndThrowAsync(request, cancellationToken);

        var doctorId = await ResolveOwnerDoctorAsync(request.DoctorId, cancellationToken);

        var phone = TextNormalizer.NormalizePhone(request.Phone);
        if (await patients.PhoneExistsAsync(phone, doctorId, null, cancellationToken))
        {
            throw new ConflictException("A patient already uses this phone number.", "duplicate_phone");
        }

        var patient = new Patient
        {
            Code = await patients.GetNextCodeAsync(cancellationToken),
            DoctorId = doctorId,
            FullName = request.Name.Trim(),
            Phone = phone,
            BirthDate = request.BirthDate,
            Gender = ParseGender(request.Gender),
            Address = Clean(request.Address),
            EmergencyContact = Clean(request.EmergencyContact),
            Notes = IsSecretary ? null : Clean(request.Notes),
            CreatedAt = clock.UtcNow
        };

        await patients.AddAsync(patient, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        var created = await patients.GetAsync(patient.PatientId, cancellationToken)
            ?? throw new NotFoundException("Patient not found.", "patient_not_found");

        return created.ToDetail(language, clock.UtcNow, !IsSecretary);
    }

    public async Task<PatientDetailDto> UpdateAsync(
        Guid id,
        UpdatePatientRequest request,
        CancellationToken cancellationToken)
    {
        await updateValidator.ValidateAndThrowAsync(request, cancellationToken);

        var existing = await LoadAccessibleAsync(id, cancellationToken);

        var phone = TextNormalizer.NormalizePhone(request.Phone);
        if (await patients.PhoneExistsAsync(phone, existing.Patient.DoctorId, id, cancellationToken))
        {
            throw new ConflictException("A patient already uses this phone number.", "duplicate_phone");
        }

        existing.Patient.FullName = request.Name.Trim();
        existing.Patient.Phone = phone;
        existing.Patient.BirthDate = request.BirthDate;
        existing.Patient.Gender = ParseGender(request.Gender);
        existing.Patient.Address = Clean(request.Address);
        existing.Patient.EmergencyContact = Clean(request.EmergencyContact);

        if (!IsSecretary)
        {
            existing.Patient.Notes = Clean(request.Notes);
        }

        await unitOfWork.SaveChangesAsync(cancellationToken);

        var updated = await patients.GetAsync(id, cancellationToken)
            ?? throw new NotFoundException("Patient not found.", "patient_not_found");

        return updated.ToDetail(language, clock.UtcNow, !IsSecretary);
    }

    private async Task<Common.Models.PatientWithLastVisit> LoadAccessibleAsync(
        Guid id,
        CancellationToken cancellationToken)
    {
        if (!await access.CanAccessPatientBasicInfoAsync(currentUser, id, cancellationToken))
        {
            throw new NotFoundException("Patient not found.", "patient_not_found");
        }

        return await patients.GetAsync(id, cancellationToken)
            ?? throw new NotFoundException("Patient not found.", "patient_not_found");
    }

    /// <summary>
    /// The owning doctor of a new patient: a doctor always owns their own patients; a secretary
    /// picks one of their assigned doctors (implied when exactly one is assigned).
    /// </summary>
    private async Task<Guid> ResolveOwnerDoctorAsync(Guid? requested, CancellationToken cancellationToken)
    {
        var accessible = await access.GetAccessibleDoctorIdsAsync(currentUser, cancellationToken);
        if (accessible.Count == 0)
        {
            throw new ForbiddenException("No doctor is available for this account.", "no_assigned_doctor");
        }

        if (requested is { } doctorId)
        {
            return accessible.Contains(doctorId)
                ? doctorId
                : throw new ForbiddenException("This doctor is not available for this account.", "doctor_not_allowed");
        }

        if (accessible.Count == 1)
        {
            return accessible.First();
        }

        throw new ValidationException(new[]
        {
            new ValidationFailure(nameof(CreatePatientRequest.DoctorId), "Choose the doctor for this patient.")
            {
                ErrorCode = "doctor_required"
            }
        });
    }

    private static string? Clean(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static Gender ParseGender(string gender) =>
        Enum.TryParse<Gender>(gender, ignoreCase: true, out var parsed) ? parsed : Gender.Unspecified;
}
