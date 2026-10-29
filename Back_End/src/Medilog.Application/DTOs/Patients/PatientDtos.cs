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
    DateTime CreatedAt);

public sealed record CreatePatientRequest(
    string Name,
    string Phone,
    DateOnly BirthDate,
    string Gender,
    string? Notes);

public sealed record UpdatePatientRequest(
    string Name,
    string Phone,
    DateOnly BirthDate,
    string Gender,
    string? Notes);

public sealed record PatientSearchQuery
{
    public string? Search { get; init; }
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 10;
    public string Sort { get; init; } = "lastVisit_desc";

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
