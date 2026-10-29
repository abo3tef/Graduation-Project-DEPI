using Medilog.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Medilog.Infrastructure;

/// <summary>
/// Used by `dotnet ef` so migrations can be generated without booting the API host.
/// </summary>
public sealed class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? "Data Source=medilog.db";

        return new AppDbContext(new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(connectionString)
            .Options);
    }
}
