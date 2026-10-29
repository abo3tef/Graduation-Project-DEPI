using FluentValidation;
using Medilog.Application.DTOs.Auth;

namespace Medilog.Application.Validators;

public sealed class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithErrorCode("email_required")
            .EmailAddress().WithErrorCode("email_invalid")
            .MaximumLength(254);

        RuleFor(x => x.Password)
            .NotEmpty().WithErrorCode("password_required")
            .MinimumLength(6).WithErrorCode("password_too_short");
    }
}
