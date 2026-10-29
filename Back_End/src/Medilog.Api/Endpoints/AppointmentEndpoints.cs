using Medilog.Application.Common.Exceptions;
using Medilog.Application.DTOs.Appointments;
using Medilog.Application.Services;

namespace Medilog.Api.Endpoints;

public static class AppointmentEndpoints
{
    public static IEndpointRouteBuilder MapAppointmentEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/appointments")
            .WithTags("Appointments")
            .RequireAuthorization();

        group.MapGet("", async (
            [AsParameters] AppointmentQuery query,
            AppointmentService service,
            CancellationToken cancellationToken) =>
            Results.Ok(await service.GetAsync(query, cancellationToken)))
            .WithName("GetAppointments");

        group.MapPost("", async (
            CreateAppointmentRequest? request,
            AppointmentService service,
            CancellationToken cancellationToken) =>
        {
            if (request is null)
            {
                throw new BadRequestException("An appointment body is required.", "body_required");
            }

            return Results.Created(
                "/api/v1/appointments",
                await service.CreateAsync(request, cancellationToken));
        })
        .RequireAuthorization("SecretaryOnly")
        .WithName("CreateAppointment");

        group.MapPatch("/{id:guid}", async (
            Guid id,
            UpdateAppointmentRequest? request,
            AppointmentService service,
            CancellationToken cancellationToken) =>
        {
            if (request is null)
            {
                throw new BadRequestException("An appointment body is required.", "body_required");
            }

            return Results.Ok(await service.UpdateAsync(id, request, cancellationToken));
        })
        .RequireAuthorization("SecretaryOnly")
        .WithName("UpdateAppointment");

        group.MapPatch("/{id:guid}/status", async (
            Guid id,
            UpdateAppointmentStatusRequest? request,
            AppointmentService service,
            CancellationToken cancellationToken) =>
        {
            if (request is null)
            {
                throw new BadRequestException("A status body is required.", "body_required");
            }

            return Results.Ok(await service.UpdateStatusAsync(id, request, cancellationToken));
        })
        .WithName("UpdateAppointmentStatus");

        group.MapDelete("/{id:guid}", async (
            Guid id,
            AppointmentService service,
            CancellationToken cancellationToken) =>
        {
            await service.DeleteAsync(id, cancellationToken);
            return Results.NoContent();
        })
        .RequireAuthorization("SecretaryOnly")
        .WithName("DeleteAppointment");

        group.MapPost("/{id:guid}/visit", async (
            Guid id,
            LinkVisitRequest? request,
            AppointmentService service,
            CancellationToken cancellationToken) =>
        {
            if (request is null)
            {
                throw new BadRequestException("A visit body is required.", "body_required");
            }

            return Results.Ok(await service.LinkVisitAsync(id, request, cancellationToken));
        })
        .RequireAuthorization("DoctorOnly")
        .WithName("LinkAppointmentVisit");

        return app;
    }
}
