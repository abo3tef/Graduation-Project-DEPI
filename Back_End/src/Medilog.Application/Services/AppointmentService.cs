using FluentValidation;
using Medilog.Application.Common;
using Medilog.Application.Common.Exceptions;
using Medilog.Application.Common.Interfaces;
using Medilog.Application.DTOs.Appointments;
using Medilog.Application.Mappings;
using Medilog.Domain.Common;
using Medilog.Domain.Entities;
using Medilog.Domain.Enums;

namespace Medilog.Application.Services;

public sealed class AppointmentService(
    IAppointmentRepository appointments,
    IPatientRepository patients,
    IVisitRepository visits,
    IUserRepository users,
    IUnitOfWork unitOfWork,
    ICurrentUser currentUser,
    IClock clock,
    ILanguageContext language,
    IValidator<CreateAppointmentRequest> createValidator,
    IValidator<UpdateAppointmentRequest> updateValidator,
    IValidator<UpdateAppointmentStatusRequest> statusValidator,
    IValidator<LinkVisitRequest> visitValidator,
    IValidator<AppointmentQuery> queryValidator)
{
    public async Task<IReadOnlyList<AppointmentDto>> GetAsync(
        AppointmentQuery query,
        CancellationToken cancellationToken)
    {
        await queryValidator.ValidateAndThrowAsync(query, cancellationToken);

        var today = ClinicTime.Today(clock.UtcNow);
        DateTime fromUtc;
        DateTime toUtc;

        if (query.Date.HasValue)
        {
            fromUtc = ClinicTime.StartOfDayUtc(query.Date.Value);
            toUtc = ClinicTime.EndOfDayUtc(query.Date.Value);
        }
        else if (query.From.HasValue && query.To.HasValue)
        {
            fromUtc = ClinicTime.StartOfDayUtc(query.From.Value);
            toUtc = ClinicTime.EndOfDayUtc(query.To.Value);
        }
        else
        {
            fromUtc = ClinicTime.StartOfDayUtc(today);
            toUtc = ClinicTime.EndOfDayUtc(today);
        }

        var items = await appointments.GetAsync(fromUtc, toUtc, query.PatientId, cancellationToken);
        return items.Select(item => item.ToDto(language)).ToArray();
    }

    public async Task<AppointmentDto> CreateAsync(
        CreateAppointmentRequest request,
        CancellationToken cancellationToken)
    {
        await createValidator.ValidateAndThrowAsync(request, cancellationToken);

        var patient = await patients.GetAsync(request.PatientId, cancellationToken)
            ?? throw new NotFoundException("Patient not found.", "patient_not_found");

        var doctor = await ResolveDoctorAsync(cancellationToken);
        var startsAt = ToUtc(request.StartsAt);
        var duration = request.DurationMinutes ?? Appointment.DefaultDurationMinutes;
        await EnsureNoConflictAsync(doctor.UserId, startsAt, startsAt.AddMinutes(duration), null, cancellationToken);

        var appointment = new Appointment
        {
            PatientId = patient.Patient.PatientId,
            DoctorId = doctor.UserId,
            CreatedBy = currentUser.UserId ?? doctor.UserId,
            StartsAt = startsAt,
            DurationMinutes = duration,
            Reason = request.Reason,
            Status = AppointmentStatus.Scheduled,
            Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim(),
            CreatedAt = clock.UtcNow
        };

        await appointments.AddAsync(appointment, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return await GetDtoAsync(appointment.AppointmentId, cancellationToken);
    }

    public async Task<AppointmentDto> UpdateAsync(
        Guid id,
        UpdateAppointmentRequest request,
        CancellationToken cancellationToken)
    {
        await updateValidator.ValidateAndThrowAsync(request, cancellationToken);

        var appointment = await appointments.GetAsync(id, cancellationToken)
            ?? throw new NotFoundException("Appointment not found.", "appointment_not_found");

        if (appointment.Status is AppointmentStatus.Completed or AppointmentStatus.Cancelled or AppointmentStatus.NoShow)
        {
            throw new ConflictException("Closed appointments cannot be edited.", "appointment_closed");
        }

        var patient = await patients.GetAsync(request.PatientId, cancellationToken)
            ?? throw new NotFoundException("Patient not found.", "patient_not_found");

        var startsAt = ToUtc(request.StartsAt);
        var duration = request.DurationMinutes ?? Appointment.DefaultDurationMinutes;
        await EnsureNoConflictAsync(appointment.DoctorId, startsAt, startsAt.AddMinutes(duration), id, cancellationToken);

        appointment.PatientId = patient.Patient.PatientId;
        appointment.StartsAt = startsAt;
        appointment.DurationMinutes = duration;
        appointment.Reason = request.Reason;
        appointment.Notes = string.IsNullOrWhiteSpace(request.Notes) ? null : request.Notes.Trim();

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return await GetDtoAsync(id, cancellationToken);
    }

    public async Task<AppointmentDto> UpdateStatusAsync(
        Guid id,
        UpdateAppointmentStatusRequest request,
        CancellationToken cancellationToken)
    {
        await statusValidator.ValidateAndThrowAsync(request, cancellationToken);

        var appointment = await appointments.GetAsync(id, cancellationToken)
            ?? throw new NotFoundException("Appointment not found.", "appointment_not_found");

        var next = Enum.Parse<AppointmentStatus>(request.Status, ignoreCase: true);
        if (!AppointmentWorkflow.CanTransition(appointment.Status, next))
        {
            throw new ConflictException(
                $"An appointment cannot move from {DtoMapper.StatusCode(appointment.Status)} to {DtoMapper.StatusCode(next)}.",
                "invalid_status_transition");
        }

        appointment.Status = next;
        appointment.CancellationReason = next == AppointmentStatus.Cancelled
            ? request.CancellationReason?.Trim()
            : null;

        await unitOfWork.SaveChangesAsync(cancellationToken);
        return await GetDtoAsync(id, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken)
    {
        var appointment = await appointments.GetAsync(id, cancellationToken)
            ?? throw new NotFoundException("Appointment not found.", "appointment_not_found");

        appointments.Remove(appointment);
        await unitOfWork.SaveChangesAsync(cancellationToken);
    }

    public async Task<AppointmentDto> LinkVisitAsync(
        Guid id,
        LinkVisitRequest request,
        CancellationToken cancellationToken)
    {
        if (currentUser.Role is not (UserRole.Doctor or UserRole.Admin) || currentUser.UserId is null)
        {
            throw new ForbiddenException("Only a doctor can link a visit.", "doctor_only");
        }

        await visitValidator.ValidateAndThrowAsync(request, cancellationToken);

        var appointment = await appointments.GetAsync(id, cancellationToken)
            ?? throw new NotFoundException("Appointment not found.", "appointment_not_found");

        if (appointment.Status is not (AppointmentStatus.Confirmed or AppointmentStatus.Completed))
        {
            throw new ConflictException(
                "Confirm the appointment before linking a visit.",
                "appointment_not_confirmed");
        }

        if (await visits.GetForAppointmentAsync(id, cancellationToken) is not null)
        {
            throw new ConflictException("A visit is already linked to this appointment.", "visit_already_linked");
        }

        var visit = new Visit
        {
            PatientId = appointment.PatientId,
            DoctorId = currentUser.UserId.Value,
            AppointmentId = appointment.AppointmentId,
            VisitedAt = appointment.StartsAt,
            ChiefComplaint = string.IsNullOrWhiteSpace(request.ChiefComplaint) ? null : request.ChiefComplaint.Trim(),
            ClinicalNotes = string.IsNullOrWhiteSpace(request.ClinicalNotes) ? null : request.ClinicalNotes.Trim()
        };

        await visits.AddAsync(visit, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        return await GetDtoAsync(id, cancellationToken);
    }

    private async Task<User> ResolveDoctorAsync(CancellationToken cancellationToken)
    {
        if ((currentUser.Role is UserRole.Doctor or UserRole.Admin) && currentUser.UserId.HasValue)
        {
            var current = await users.GetByIdAsync(currentUser.UserId.Value, cancellationToken);
            if (current is not null)
            {
                return current;
            }
        }

        return await users.GetPrimaryDoctorAsync(cancellationToken)
            ?? throw new ConflictException("No doctor is configured for this clinic.", "doctor_missing");
    }

    private async Task EnsureNoConflictAsync(
        Guid doctorId,
        DateTime startUtc,
        DateTime endUtc,
        Guid? excludeId,
        CancellationToken cancellationToken)
    {
        if (await appointments.HasConflictAsync(doctorId, startUtc, endUtc, excludeId, cancellationToken))
        {
            throw new ConflictException(
                "This time overlaps another appointment.",
                "appointment_conflict");
        }
    }

    private async Task<AppointmentDto> GetDtoAsync(Guid id, CancellationToken cancellationToken)
    {
        var appointment = await appointments.GetAsync(id, cancellationToken)
            ?? throw new NotFoundException("Appointment not found.", "appointment_not_found");

        return appointment.ToDto(language);
    }

    private static DateTime ToUtc(DateTime value) => value.Kind switch
    {
        DateTimeKind.Utc => value,
        DateTimeKind.Local => value.ToUniversalTime(),
        _ => DateTime.SpecifyKind(value, DateTimeKind.Utc)
    };
}
