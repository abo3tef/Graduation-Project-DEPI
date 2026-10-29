using Medilog.Application.Security;
using Microsoft.AspNetCore.Authorization;

namespace Medilog.Api.Authorization;

public static class MedilogPolicies
{
    /// <summary>Doctors only. Use on EVERY medical-record endpoint (visits, diagnoses, medications/prescriptions,
    /// allergies, chronic conditions, vital signs, lab results, notes, documents, timeline).</summary>
    public const string MedicalRecords = "Medilog.MedicalRecords";

    /// <summary>Doctors and active secretaries. For appointments and basic patient information; the endpoint must
    /// still call IResourceAccessService to validate the doctor / resource scope.</summary>
    public const string Scheduling = "Medilog.Scheduling";

    /// <summary>Active secretaries only.</summary>
    public const string SecretaryOnly = "Medilog.SecretaryOnly";

    public static AuthorizationBuilder AddMedilogPolicies(this AuthorizationBuilder builder) => builder
        .AddPolicy(MedicalRecords, p => p.AddRequirements(new MedilogRoleRequirement(MedilogRoles.Doctor)))
        .AddPolicy(Scheduling, p => p.AddRequirements(new MedilogRoleRequirement(MedilogRoles.Doctor, MedilogRoles.Secretary)))
        .AddPolicy(SecretaryOnly, p => p.AddRequirements(new MedilogRoleRequirement(MedilogRoles.Secretary)));

    public static TBuilder RequireMedicalRecordAccess<TBuilder>(this TBuilder builder)
        where TBuilder : IEndpointConventionBuilder => builder.RequireAuthorization(MedicalRecords);

    public static TBuilder RequireSchedulingAccess<TBuilder>(this TBuilder builder)
        where TBuilder : IEndpointConventionBuilder => builder.RequireAuthorization(Scheduling);
}
