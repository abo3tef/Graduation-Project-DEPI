namespace Medilog.Application.Common.Exceptions;

public sealed class NotFoundException(string message, string code = "not_found")
    : Exception(message)
{
    public string Code { get; } = code;
}

public sealed class ConflictException(string message, string code = "conflict")
    : Exception(message)
{
    public string Code { get; } = code;
}

public sealed class ForbiddenException(string message, string code = "forbidden")
    : Exception(message)
{
    public string Code { get; } = code;
}

public sealed class UnauthorizedException(string message, string code = "unauthorized")
    : Exception(message)
{
    public string Code { get; } = code;
}

public sealed class BadRequestException(string message, string code = "bad_request")
    : Exception(message)
{
    public string Code { get; } = code;
}
