using Medilog.Application.Common.Exceptions;
using Medilog.Application.DTOs.Auth;
using Medilog.Application.Services;

namespace Medilog.Api.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/auth")
            .WithTags("Auth")
            .RequireRateLimiting("auth");

        group.MapPost("/login", async (
            LoginRequest? request,
            AuthService authService,
            CancellationToken cancellationToken) =>
        {
            if (request is null)
            {
                throw new BadRequestException("A login body is required.", "body_required");
            }

            var response = await authService.LoginAsync(request, cancellationToken);
            return Results.Ok(response);
        })
        .AllowAnonymous()
        .RequireRateLimiting("login")
        .WithName("Login");

        // JWTs are stateless; logout is completed by the client discarding the token.
        group.MapPost("/logout", () => Results.NoContent())
            .RequireAuthorization()
            .WithName("Logout");

        group.MapGet("/me", async (
            AuthService authService,
            CancellationToken cancellationToken) =>
            Results.Ok(await authService.GetMeAsync(cancellationToken)))
            .RequireAuthorization()
            .WithName("GetCurrentUser");

        return app;
    }
}
