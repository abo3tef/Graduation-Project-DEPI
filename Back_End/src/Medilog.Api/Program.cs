using Medilog.Api.Authorization;
using Medilog.Api.Endpoints;
using Medilog.Application.Interfaces;
using Medilog.Application.Services;
using Medilog.Infrastructure;
using Medilog.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' was not found.");

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// Role-based and secretary-scope authorization (Member 5).
// Authentication itself (scheme, token validation) is registered by the auth implementation.
builder.Services.AddInfrastructureSecurity();
builder.Services.AddScoped<IResourceAccessService, ResourceAccessService>();
builder.Services.AddScoped<IAuthorizationHandler, MedilogRoleHandler>();
builder.Services.AddSingleton<IAuthorizationMiddlewareResultHandler, MedilogAuthorizationResultHandler>();
builder.Services.AddAuthorizationBuilder().AddMedilogPolicies();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapSecretaryEndpoints();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.Run();

record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
