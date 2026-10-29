using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Policy;

namespace Medilog.Api.Authorization;

/// <summary>
/// Returns 403 for authenticated callers who fail a policy and 401 for anonymous callers.
/// When an authentication scheme is configured (JWT bearer etc.), challenges are delegated to the
/// default handler so scheme-specific headers are preserved. Until then, anonymous calls get a plain 401
/// instead of an "authentication scheme not specified" server error.
/// </summary>
public sealed class MedilogAuthorizationResultHandler(IAuthenticationSchemeProvider schemes) : IAuthorizationMiddlewareResultHandler
{
    private readonly AuthorizationMiddlewareResultHandler _default = new();

    public async Task HandleAsync(RequestDelegate next, HttpContext context, AuthorizationPolicy policy, PolicyAuthorizationResult result)
    {
        if (result.Succeeded)
        {
            await next(context);
            return;
        }

        var authenticated = context.User.Identity?.IsAuthenticated == true;

        if (authenticated || result.Forbidden)
        {
            context.Response.StatusCode = StatusCodes.Status403Forbidden;
            return;
        }

        if (await schemes.GetDefaultChallengeSchemeAsync() is not null)
        {
            await _default.HandleAsync(next, context, policy, result);
            return;
        }

        context.Response.StatusCode = StatusCodes.Status401Unauthorized;
    }
}
