using Medilog.Application.Interfaces;
using Medilog.Application.Security;
using Microsoft.AspNetCore.Authorization;

namespace Medilog.Api.Authorization;

public sealed class MedilogRoleRequirement(params string[] allowedRoles) : IAuthorizationRequirement
{
    public IReadOnlyCollection<string> AllowedRoles { get; } = allowedRoles;
}

/// <summary>
/// Deny-by-default role check. A principal that also carries the Secretary role is never allowed
/// into a requirement that does not list Secretary, and secretary accounts are re-checked against
/// the database (must exist and be Active) on every request.
/// </summary>
public sealed class MedilogRoleHandler(IAccessScopeStore store) : AuthorizationHandler<MedilogRoleRequirement>
{
    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, MedilogRoleRequirement requirement)
    {
        var user = new ClaimsPrincipalCurrentUser(context.User);
        if (!user.IsAuthenticated || user.UserId is not { } userId)
            return;

        var isSecretary = user.IsInRole(MedilogRoles.Secretary);
        var secretaryAllowed = requirement.AllowedRoles.Any(r => MedilogRoles.Matches(r, MedilogRoles.Secretary));

        if (isSecretary && !secretaryAllowed)
            return; // e.g. MedicalRecords policy: secretaries are always refused.

        if (!requirement.AllowedRoles.Any(user.IsInRole))
            return;

        if (isSecretary && !await store.IsActiveSecretaryAsync(userId))
            return;

        context.Succeed(requirement);
    }
}
