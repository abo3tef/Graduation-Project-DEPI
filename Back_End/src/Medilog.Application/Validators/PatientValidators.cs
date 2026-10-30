using FluentValidation;
using Medilog.Application.Common.Interfaces;
using Medilog.Application.Common.Text;
using Medilog.Application.DTOs.Patients;
using Medilog.Domain.Common;

namespace Medilog.Application.Validators;

public sealed class CreatePatientRequestValidator : AbstractValidator<CreatePatientRequest>
{
    public CreatePatientRequestValidator(IClock clock)
    {
        var today = ClinicTime.Today(clock.UtcNow);

        RuleFor(x => x.Name)
            .NotEmpty().WithErrorCode("name_required")
            .MinimumLength(2).WithErrorCode("name_too_short")
            .MaximumLength(200).WithErrorCode("name_too_long");

        RuleFor(x => x.Phone)
            .NotEmpty().WithErrorCode("phone_required")
            .Must(BeEgyptianMobile).WithErrorCode("phone_invalid")
            .When(x => !string.IsNullOrWhiteSpace(x.Phone));

        RuleFor(x => x.BirthDate)
            .NotEmpty().WithErrorCode("birth_date_required")
            .LessThanOrEqualTo(today).WithErrorCode("birth_date_future")
            .GreaterThanOrEqualTo(today.AddYears(-130)).WithErrorCode("birth_date_invalid");

        RuleFor(x => x.Gender)
            .Must(gender => gender is "female" or "male" or "unspecified")
            .WithErrorCode("gender_invalid");

        RuleFor(x => x.Notes)
            .MaximumLength(2000).WithErrorCode("notes_too_long");

        RuleFor(x => x.Address)
            .MaximumLength(500).WithErrorCode("address_too_long");

        RuleFor(x => x.EmergencyContact)
            .MaximumLength(300).WithErrorCode("emergency_contact_too_long");
    }

    private static bool BeEgyptianMobile(string? phone) =>
        System.Text.RegularExpressions.Regex.IsMatch(
            TextNormalizer.NormalizePhone(phone),
            @"^01[0125][0-9]{8}$");
}

public sealed class UpdatePatientRequestValidator : AbstractValidator<UpdatePatientRequest>
{
    public UpdatePatientRequestValidator(IClock clock)
    {
        var today = ClinicTime.Today(clock.UtcNow);

        RuleFor(x => x.Name)
            .NotEmpty().WithErrorCode("name_required")
            .MinimumLength(2).WithErrorCode("name_too_short")
            .MaximumLength(200).WithErrorCode("name_too_long");

        RuleFor(x => x.Phone)
            .NotEmpty().WithErrorCode("phone_required")
            .Must(BeEgyptianMobile).WithErrorCode("phone_invalid")
            .When(x => !string.IsNullOrWhiteSpace(x.Phone));

        RuleFor(x => x.BirthDate)
            .NotEmpty().WithErrorCode("birth_date_required")
            .LessThanOrEqualTo(today).WithErrorCode("birth_date_future")
            .GreaterThanOrEqualTo(today.AddYears(-130)).WithErrorCode("birth_date_invalid");

        RuleFor(x => x.Gender)
            .Must(gender => gender is "female" or "male" or "unspecified")
            .WithErrorCode("gender_invalid");

        RuleFor(x => x.Notes)
            .MaximumLength(2000).WithErrorCode("notes_too_long");

        RuleFor(x => x.Address)
            .MaximumLength(500).WithErrorCode("address_too_long");

        RuleFor(x => x.EmergencyContact)
            .MaximumLength(300).WithErrorCode("emergency_contact_too_long");
    }

    private static bool BeEgyptianMobile(string? phone) =>
        System.Text.RegularExpressions.Regex.IsMatch(
            TextNormalizer.NormalizePhone(phone),
            @"^01[0125][0-9]{8}$");
}

public sealed class PatientSearchQueryValidator : AbstractValidator<PatientSearchQuery>
{
    private static readonly HashSet<string> AllowedSorts = new(StringComparer.Ordinal)
    {
        "name_asc", "name_desc", "code_asc", "code_desc",
        "lastVisit_asc", "lastVisit_desc", "age_asc", "age_desc"
    };

    public PatientSearchQueryValidator()
    {
        RuleFor(x => x.Page).GreaterThanOrEqualTo(1).WithErrorCode("page_invalid");
        RuleFor(x => x.PageSize).InclusiveBetween(1, 50).WithErrorCode("page_size_invalid");
        RuleFor(x => x.Search).MaximumLength(100).WithErrorCode("search_too_long");
        RuleFor(x => x.Gender)
            .Must(gender => gender is "female" or "male" or "unspecified")
            .When(x => !string.IsNullOrWhiteSpace(x.Gender))
            .WithErrorCode("gender_invalid");
        RuleFor(x => x.MinAge).InclusiveBetween(0, 130)
            .When(x => x.MinAge.HasValue).WithErrorCode("age_invalid");
        RuleFor(x => x.MaxAge).InclusiveBetween(0, 130)
            .When(x => x.MaxAge.HasValue).WithErrorCode("age_invalid");
        RuleFor(x => x.MaxAge)
            .GreaterThanOrEqualTo(x => x.MinAge!.Value)
            .When(x => x.MinAge.HasValue && x.MaxAge.HasValue)
            .WithErrorCode("age_range_invalid");
        RuleFor(x => x.Sort)
            .Must(sort => sort is null || AllowedSorts.Contains(sort))
            .WithErrorCode("sort_invalid");
    }
}
