namespace Medilog.Application.DTOs.Appointments;

public sealed record AppointmentDto(
    Guid Id,
    Guid PatientId,
    string PatientCode,
    string PatientName,
    DateTime StartsAt,
    int DurationMinutes,
    string Reason,
    string Status,
    string DoctorName,
    string? Notes,
    string? CancellationReason,
    Guid? VisitId);

public sealed record CreateAppointmentRequest(
    Guid PatientId,
    DateTime StartsAt,
    int? DurationMinutes,
    string Reason,
    string? Notes);

public sealed record UpdateAppointmentRequest(
    Guid PatientId,
    DateTime StartsAt,
    int? DurationMinutes,
    string Reason,
    string? Notes);

public sealed record UpdateAppointmentStatusRequest(string Status, string? CancellationReason);

public sealed record LinkVisitRequest(string? ChiefComplaint, string? ClinicalNotes);

public sealed record AppointmentQuery
{
    public DateOnly? Date { get; init; }
    public DateOnly? From { get; init; }
    public DateOnly? To { get; init; }
    public Guid? PatientId { get; init; }
}
