using FluentValidation;
using Medilog.Application.Common.Exceptions;
using Medilog.Application.Common.Interfaces;
using Medilog.Application.DTOs.Auth;
using Medilog.Application.Mappings;
using Medilog.Domain.Enums;

namespace Medilog.Application.Services;

public sealed class AuthService(
    IUserRepository users,
    IPasswordHasher passwordHasher,
    IJwtTokenGenerator tokenGenerator,
    ICurrentUser currentUser,
    IValidator<LoginRequest> loginValidator)
{
    public async Task<AuthResponseDto> LoginAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        await loginValidator.ValidateAndThrowAsync(request, cancellationToken);

        var email = request.Email.Trim().ToLowerInvariant();
        var user = await users.GetByEmailAsync(email, cancellationToken);
        if (user is null || !passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedException("The email or password is incorrect.", "invalid_credentials");
        }

        if (user.AccountStatus != AccountStatus.Active)
        {
            throw new UnauthorizedException("This account is inactive.", "account_inactive");
        }

        var (token, expiresAt) = tokenGenerator.Create(user);
        return new AuthResponseDto(token, expiresAt, user.ToDto());
    }

    public async Task<UserDto> GetMeAsync(CancellationToken cancellationToken)
    {
        if (currentUser.UserId is null)
        {
            throw new UnauthorizedException("Authentication is required.");
        }

        var user = await users.GetByIdAsync(currentUser.UserId.Value, cancellationToken)
            ?? throw new UnauthorizedException("The signed-in account no longer exists.", "account_missing");

        if (user.AccountStatus != AccountStatus.Active)
        {
            throw new UnauthorizedException("This account is inactive.", "account_inactive");
        }

        return user.ToDto();
    }
}
