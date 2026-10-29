using FluentValidation;
using Medilog.Application.Common;
using Medilog.Application.DTOs.Appointments;
using Medilog.Domain.Enums;

namespace Medilog.Application.Validators;

public sealed class CreateAppointmentRequestValidator : AbstractValidator<CreateAppointmentRequest>
{
    public CreateAppointmentRequestValidator()
    {
        RuleFor(x => x.PatientId)
            .NotEmpty().WithErrorCode("patient_required");

        RuleFor(x => x.StartsAt)
            .NotEmpty().WithErrorCode("starts_at_required");

        RuleFor(x => x.DurationMinutes)
            .InclusiveBetween(15, 180).WithErrorCode("duration_invalid")
            .When(x => x.DurationMinutes.HasValue);

        RuleFor(x => x.Reason)
            .Must(AppointmentReasons.IsValid).WithErrorCode("reason_invalid");

        RuleFor(x => x.Notes)
            .MaximumLength(1000).WithErrorCode("notes_too_long");
    }
}

public sealed class UpdateAppointmentRequestValidator : AbstractValidator<UpdateAppointmentRequest>
{
    public UpdateAppointmentRequestValidator()
    {
        RuleFor(x => x.PatientId)
            .NotEmpty().WithErrorCode("patient_required");

        RuleFor(x => x.StartsAt)
            .NotEmpty().WithErrorCode("starts_at_required");

        RuleFor(x => x.DurationMinutes)
            .InclusiveBetween(15, 180).WithErrorCode("duration_invalid")
            .When(x => x.DurationMinutes.HasValue);

        RuleFor(x => x.Reason)
            .Must(AppointmentReasons.IsValid).WithErrorCode("reason_invalid");

        RuleFor(x => x.Notes)
            .MaximumLength(1000).WithErrorCode("notes_too_long");
    }
}

public sealed class UpdateAppointmentStatusRequestValidator : AbstractValidator<UpdateAppointmentStatusRequest>
{
    public UpdateAppointmentStatusRequestValidator()
    {
        RuleFor(x => x.Status)
            .NotEmpty().WithErrorCode("status_required")
            .Must(BeValidStatus).WithErrorCode("status_invalid");

        RuleFor(x => x.CancellationReason)
            .MaximumLength(500).WithErrorCode("cancellation_reason_too_long")
            .NotEmpty().WithErrorCode("cancellation_reason_required")
            .When(x => string.Equals(x.Status, "cancelled", StringComparison.OrdinalIgnoreCase));
    }

    private static bool BeValidStatus(string status) =>
        Enum.TryParse<AppointmentStatus>(status, ignoreCase: true, out var parsed)
        && Enum.IsDefined(parsed);
}

public sealed class LinkVisitRequestValidator : AbstractValidator<LinkVisitRequest>
{
    public LinkVisitRequestValidator()
    {
        RuleFor(x => x.ChiefComplaint).MaximumLength(500).WithErrorCode("complaint_too_long");
        RuleFor(x => x.ClinicalNotes).MaximumLength(4000).WithErrorCode("notes_too_long");
    }
}

public sealed class AppointmentQueryValidator : AbstractValidator<AppointmentQuery>
{
    public AppointmentQueryValidator()
    {
        RuleFor(x => x.To)
            .GreaterThanOrEqualTo(x => x.From!.Value).WithErrorCode("range_invalid")
            .When(x => x.From.HasValue && x.To.HasValue);

        RuleFor(x => x.To)
            .Must((query, _) => query.From.HasValue).WithErrorCode("range_invalid")
            .When(x => x.To.HasValue);

        RuleFor(x => x.From)
            .Must((query, _) => query.To.HasValue).WithErrorCode("range_invalid")
            .When(x => x.From.HasValue);
    }
}
