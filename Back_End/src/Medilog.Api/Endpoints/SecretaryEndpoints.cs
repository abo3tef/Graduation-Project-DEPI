using Medilog.Api.Authorization;
using Medilog.Application.Interfaces;
using Medilog.Application.Security;

namespace Medilog.Api.Endpoints;

public static class SecretaryEndpoints
{
    public static IEndpointRouteBuilder MapSecretaryEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/secretary")
            .WithTags("Secretary")
            .RequireAuthorization(MedilogPolicies.SecretaryOnly);

        // The secretary id always comes from the authenticated principal, never from the URL or body.
        group.MapGet("/me", async (HttpContext http, IAccessScopeStore store, CancellationToken ct) =>
        {
            var user = new ClaimsPrincipalCurrentUser(http.User);
            var account = await store.GetSecretaryAccountAsync(user.UserId!.Value, ct);
            return account is null ? Results.NotFound() : Results.Ok(account);
        })
        .WithName("GetSecretaryAccount");

        return app;
    }
}
