using Medilog.Application.Common.Interfaces;

namespace Medilog.Application.DTOs.Patients;

public sealed record PatientListItemDto(
    Guid Id,
    string Code,
    string FullName,
    string? Phone,
    DateOnly BirthDate,
    string Gender,
    int Age,
    DateTime? LastVisitAt);

/// <summary>
/// <paramref name="FullName"/> is the display name for the request language (English when available);
/// <paramref name="Name"/> is the name exactly as stored, which is what an edit form must submit back.
/// </summary>
public sealed record PatientDetailDto(
    Guid Id,
    string Code,
    string FullName,
    string? Phone,
    DateOnly BirthDate,
    string Gender,
    int Age,
    DateTime? LastVisitAt,
    string? Notes,
    DateTime CreatedAt,
    string? Address = null,
    string? EmergencyContact = null,
    Guid DoctorId = default,
    string Name = "");

/// <summary>
/// <paramref name="DoctorId"/> selects the owning doctor. It is optional for a doctor (always themselves)
/// and for a secretary assigned to exactly one doctor; it is required for a secretary with several doctors.
/// </summary>
public sealed record CreatePatientRequest(
    string Name,
    string Phone,
    DateOnly BirthDate,
    string Gender,
    string? Notes,
    string? Address = null,
    string? EmergencyContact = null,
    Guid? DoctorId = null);

public sealed record UpdatePatientRequest(
    string Name,
    string Phone,
    DateOnly BirthDate,
    string Gender,
    string? Notes,
    string? Address = null,
    string? EmergencyContact = null);

/// <summary>
/// Every field is optional. Defaults are declared on the constructor, not on properties, because
/// minimal-API <c>[AsParameters]</c> binding only honors constructor defaults; <paramref name="Sort"/>
/// falls back to the most recent visit first.
/// </summary>
public sealed record PatientSearchQuery(
    string? Search = null,
    int Page = 1,
    int PageSize = 10,
    string? Sort = null,
    string? Gender = null,
    int? MinAge = null,
    int? MaxAge = null)
{
    public PatientSort ParsedSort => Sort switch
    {
        "name_asc" => PatientSort.NameAsc,
        "name_desc" => PatientSort.NameDesc,
        "code_asc" => PatientSort.CodeAsc,
        "code_desc" => PatientSort.CodeDesc,
        "lastVisit_asc" => PatientSort.LastVisitAsc,
        "age_asc" => PatientSort.AgeAsc,
        "age_desc" => PatientSort.AgeDesc,
        _ => PatientSort.LastVisitDesc
    };
}
