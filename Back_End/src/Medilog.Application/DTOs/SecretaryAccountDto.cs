namespace Medilog.Application.DTOs;

public sealed record AssignedDoctorDto(Guid DoctorId, string FullName, string? Specialization);

public sealed record SecretaryAccountDto(
    Guid SecretaryId,
    string FullName,
    string Email,
    string? Phone,
    string AccountStatus,
    DateTime CreatedAt,
    IReadOnlyList<AssignedDoctorDto> AssignedDoctors);
