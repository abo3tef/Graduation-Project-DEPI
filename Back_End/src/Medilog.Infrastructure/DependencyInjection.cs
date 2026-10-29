using Medilog.Application.Interfaces;
using Medilog.Infrastructure.Security;
using Microsoft.Extensions.DependencyInjection;

namespace Medilog.Infrastructure;

public static class DependencyInjection
{
    /// <summary>Registers Infrastructure services. AppDbContext is registered by the API host.</summary>
    public static IServiceCollection AddInfrastructureSecurity(this IServiceCollection services)
    {
        services.AddScoped<IAccessScopeStore, AccessScopeStore>();
        return services;
    }
}
