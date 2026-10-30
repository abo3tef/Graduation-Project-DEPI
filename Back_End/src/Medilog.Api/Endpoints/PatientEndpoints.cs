using Medilog.Api.Authorization;
using Medilog.Application.Common.Exceptions;
using Medilog.Application.DTOs.Patients;
using Medilog.Application.Services;

namespace Medilog.Api.Endpoints;

public static class PatientEndpoints
{
    public static IEndpointRouteBuilder MapPatientEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/patients")
            .WithTags("Patients")
            .RequireSchedulingAccess();

        group.MapGet("", async (
            [AsParameters] PatientSearchQuery query,
            PatientService service,
            CancellationToken cancellationToken) =>
            Results.Ok(await service.SearchAsync(query, cancellationToken)))
            .WithName("SearchPatients");

        group.MapGet("/{id:guid}", async (
            Guid id,
            PatientService service,
            CancellationToken cancellationToken) =>
            Results.Ok(await service.GetAsync(id, cancellationToken)))
            .WithName("GetPatient");

        group.MapPost("", async (
            CreatePatientRequest? request,
            PatientService service,
            CancellationToken cancellationToken) =>
        {
            if (request is null)
            {
                throw new BadRequestException("A patient body is required.", "body_required");
            }

            var patient = await service.CreateAsync(request, cancellationToken);
            return Results.CreatedAtRoute("GetPatient", new { id = patient.Id }, patient);
        })
        .WithName("CreatePatient");

        group.MapPatch("/{id:guid}", async (
            Guid id,
            UpdatePatientRequest? request,
            PatientService service,
            CancellationToken cancellationToken) =>
        {
            if (request is null)
            {
                throw new BadRequestException("A patient body is required.", "body_required");
            }

            return Results.Ok(await service.UpdateAsync(id, request, cancellationToken));
        })
        .WithName("UpdatePatient");

        return app;
    }
}
