using Medilog.Application.Common.Interfaces;
using Medilog.Application.Common.Models;
using Medilog.Application.DTOs.Appointments;
using Medilog.Application.DTOs.Auth;
using Medilog.Application.DTOs.Patients;
using Medilog.Application.DTOs.Dashboard;
using Medilog.Domain.Entities;
using Medilog.Domain.Enums;

namespace Medilog.Application.Mappings;

public static class DtoMapper
{
    public static UserDto ToDto(this User user) => new(
        user.UserId,
        user.FullName,
        user.Email,
        RoleCode(user.Role),
        user.Phone,
        user.Specialization);

    /// <param name="includeMedicalSummary">
    /// False for callers limited to basic patient information (secretaries): the last-visit date,
    /// which derives from medical records, is withheld.
    /// </param>
    public static PatientListItemDto ToListItem(
        this PatientWithLastVisit item,
        ILanguageContext language,
        DateTime utcNow,
        bool includeMedicalSummary = true) => new(
        item.Patient.PatientId,
        item.Patient.Code,
        DisplayName(item.Patient.FullName, item.Patient.FullNameEn, language),
        item.Patient.Phone,
        item.Patient.BirthDate,
        GenderCode(item.Patient.Gender),
        Common.Text.TextNormalizer.CalculateAge(item.Patient.BirthDate, utcNow),
        includeMedicalSummary ? AsUtc(item.LastVisitAt) : null);

    /// <param name="includeMedicalSummary">
    /// False for callers limited to basic patient information (secretaries): clinical notes and the
    /// last-visit date are withheld.
    /// </param>
    public static PatientDetailDto ToDetail(
        this PatientWithLastVisit item,
        ILanguageContext language,
        DateTime utcNow,
        bool includeMedicalSummary = true) => new(
        item.Patient.PatientId,
        item.Patient.Code,
        DisplayName(item.Patient.FullName, item.Patient.FullNameEn, language),
        item.Patient.Phone,
        item.Patient.BirthDate,
        GenderCode(item.Patient.Gender),
        Common.Text.TextNormalizer.CalculateAge(item.Patient.BirthDate, utcNow),
        includeMedicalSummary ? AsUtc(item.LastVisitAt) : null,
        includeMedicalSummary ? item.Patient.Notes : null,
        AsUtc(item.Patient.CreatedAt),
        item.Patient.Address,
        item.Patient.EmergencyContact,
        item.Patient.DoctorId,
        item.Patient.FullName);

    public static AppointmentDto ToDto(this Appointment appointment, ILanguageContext language) => new(
        appointment.AppointmentId,
        appointment.PatientId,
        appointment.Patient.Code,
        DisplayName(appointment.Patient.FullName, appointment.Patient.FullNameEn, language),
        AsUtc(appointment.StartsAt),
        appointment.DurationMinutes,
        appointment.Reason,
        StatusCode(appointment.Status),
        DisplayName(appointment.Doctor.FullName, appointment.Doctor.FullNameEn, language),
        appointment.Notes,
        appointment.CancellationReason,
        appointment.Visit?.VisitId);

    public static TodayAppointmentDto ToTodayDto(this Appointment appointment, ILanguageContext language) => new(
        appointment.AppointmentId,
        AsUtc(appointment.StartsAt),
        DisplayName(appointment.Patient.FullName, appointment.Patient.FullNameEn, language),
        appointment.Reason,
        StatusCode(appointment.Status));

    public static string StatusCode(AppointmentStatus status) => status switch
    {
        AppointmentStatus.NoShow => "no-show",
        _ => status.ToString().ToLowerInvariant()
    };

    public static string GenderCode(Gender gender) => gender.ToString().ToLowerInvariant();

    public static string RoleCode(UserRole role) => role.ToString().ToLowerInvariant();

    public static string DisplayName(string arabic, string? english, ILanguageContext language) =>
        language.IsArabic ? arabic : string.IsNullOrWhiteSpace(english) ? arabic : english;

    private static DateTime AsUtc(DateTime value) => value.Kind switch
    {
        DateTimeKind.Utc => value,
        DateTimeKind.Local => value.ToUniversalTime(),
        _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
    };

    private static DateTime? AsUtc(DateTime? value) => value.HasValue ? AsUtc(value.Value) : null;
}
