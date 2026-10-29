using Medilog.Application.Services;

namespace Medilog.Api.Endpoints;

public static class DashboardEndpoints
{
    public static IEndpointRouteBuilder MapDashboardEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/dashboard")
            .WithTags("Dashboard")
            .RequireAuthorization();

        group.MapGet("/summary", async (
            DashboardService service,
            CancellationToken cancellationToken) =>
            Results.Ok(await service.GetSummaryAsync(cancellationToken)))
            .WithName("GetDashboardSummary");

        group.MapGet("/visits", async (
            string? range,
            DashboardService service,
            CancellationToken cancellationToken) =>
            Results.Ok(await service.GetVisitsAsync(range ?? "week", cancellationToken)))
            .WithName("GetDashboardVisits");

        return app;
    }
}
