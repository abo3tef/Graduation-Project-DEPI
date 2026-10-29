using Medilog.Application.Common.Interfaces;
using Medilog.Application.Interfaces;
using Medilog.Infrastructure.Auth;
using Medilog.Infrastructure.Persistence;
using Medilog.Infrastructure.Repositories;
using Medilog.Infrastructure.Security;
using Medilog.Infrastructure.Time;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Medilog.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? "Data Source=medilog.db";

        services.AddDbContext<AppDbContext>(options => options.UseSqlite(connectionString));

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IPatientRepository, PatientRepository>();
        services.AddScoped<IAppointmentRepository, AppointmentRepository>();
        services.AddScoped<IVisitRepository, VisitRepository>();
        services.AddScoped<IUnitOfWork>(provider => provider.GetRequiredService<AppDbContext>());

        services.AddSingleton<IPasswordHasher, Pbkdf2PasswordHasher>();
        services.AddSingleton<IClock, SystemClock>();
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();

        return services;
    }

    /// <summary>Registers Infrastructure security and scope services (Member 5).</summary>
    public static IServiceCollection AddInfrastructureSecurity(this IServiceCollection services)
    {
        services.AddScoped<IAccessScopeStore, AccessScopeStore>();
        
        return services;
    }
}