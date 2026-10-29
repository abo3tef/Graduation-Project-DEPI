namespace Medilog.Application.DTOs.Auth;

public sealed record LoginRequest(string Email, string Password);

public sealed record UserDto(
    Guid Id,
    string FullName,
    string Email,
    string Role,
    string? Phone,
    string? Specialization);

public sealed record AuthResponseDto(string Token, DateTime ExpiresAt, UserDto User);
