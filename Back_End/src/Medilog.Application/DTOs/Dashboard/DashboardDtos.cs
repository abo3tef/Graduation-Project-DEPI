using Medilog.Application.DTOs.Patients;

namespace Medilog.Application.DTOs.Dashboard;

public sealed record DashboardStatDto(string Key, int Value, IReadOnlyList<int> Trend);

public sealed record TodayAppointmentDto(
    Guid Id,
    DateTime StartsAt,
    string PatientName,
    string Reason,
    string Status);

public sealed record DashboardSummaryDto(
    IReadOnlyList<DashboardStatDto> Stats,
    int PendingCount,
    IReadOnlyList<TodayAppointmentDto> TodayAppointments,
    IReadOnlyList<PatientListItemDto> RecentPatients,
    bool DemoMode);

public sealed record VisitsPointDto(DateOnly Date, int Value);

public sealed record VisitsDto(string Range, IReadOnlyList<VisitsPointDto> Points);

public sealed record VisitDto(
    Guid Id,
    Guid PatientId,
    Guid? AppointmentId,
    DateTime VisitedAt,
    string? ChiefComplaint,
    string? ClinicalNotes);
