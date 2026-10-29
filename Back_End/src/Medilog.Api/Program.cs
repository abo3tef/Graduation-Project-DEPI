using System.Security.Cryptography;
using System.Text;
using System.Threading.RateLimiting;
using Medilog.Api.Auth;
using Medilog.Api.Endpoints;
using Medilog.Api.Middleware;
using Medilog.Application;
using Medilog.Application.Common.Interfaces;
using Medilog.Infrastructure;
using Medilog.Infrastructure.Auth;
using Medilog.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<ICurrentUser, HttpCurrentUser>();
builder.Services.AddScoped<ILanguageContext, AcceptLanguageContext>();
builder.Services.AddScoped<ISystemSettings, SystemSettings>();

builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<ApiExceptionHandler>();

builder.Services.AddOpenApi();

var allowedOrigins = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? ["http://localhost:3000", "http://localhost:3001"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
        policy.WithOrigins(allowedOrigins)
            .AllowAnyHeader()
            .AllowAnyMethod()
            .WithExposedHeaders("X-Request-Id"));
});

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddFixedWindowLimiter("auth", limiter =>
    {
        limiter.Window = TimeSpan.FromMinutes(1);
        limiter.PermitLimit = 30;
        limiter.QueueLimit = 0;
    });

    options.AddPolicy("login", context => RateLimitPartition.GetFixedWindowLimiter(
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions
        {
            Window = TimeSpan.FromMinutes(1),
            PermitLimit = 8,
            QueueLimit = 0
        }));
});

// The key is resolved at options-build time so test configuration overrides and
// environment variables are honored. In Development an ephemeral key keeps the
// demo secret-free; outside Development a real key must be configured.
builder.Services.PostConfigure<JwtOptions>(options =>
{
    if (!string.IsNullOrWhiteSpace(options.Key))
    {
        return;
    }

    if (!builder.Environment.IsDevelopment())
    {
        throw new InvalidOperationException(
            "Jwt:Key must be configured outside the Development environment.");
    }

    options.Key = Convert.ToBase64String(RandomNumberGenerator.GetBytes(48));
});

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer();

builder.Services
    .AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
    .Configure<IOptions<JwtOptions>>((options, jwtOptions) =>
    {
        var jwt = jwtOptions.Value;
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwt.Issuer,
            ValidateAudience = true,
            ValidAudience = jwt.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key!)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1),
            NameClaimType = "name",
            RoleClaimType = "role"
        };
    });

builder.Services.AddAuthorizationBuilder()
    .AddPolicy("SecretaryOnly", policy => policy.RequireRole("Secretary", "Admin"))
    .AddPolicy("DoctorOnly", policy => policy.RequireRole("Doctor", "Admin"));

var app = builder.Build();

app.UseExceptionHandler();
app.UseMiddleware<StatusCodeProblemMiddleware>();
app.UseMiddleware<SecurityHeadersMiddleware>();
app.UseMiddleware<RequestLoggingMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("Frontend");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

var api = app.MapGroup("/api/v1").WithTags("Medilog");
api.MapAuthEndpoints();
api.MapPatientEndpoints();
api.MapAppointmentEndpoints();
api.MapDashboardEndpoints();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }))
    .AllowAnonymous()
    .WithTags("Health");

await using (var scope = app.Services.CreateAsyncScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await db.Database.MigrateAsync();

    if (app.Configuration.GetValue<bool>("Demo:Enabled"))
    {
        await DbSeeder.SeedAsync(
            db,
            scope.ServiceProvider.GetRequiredService<IPasswordHasher>(),
            scope.ServiceProvider.GetRequiredService<IClock>(),
            CancellationToken.None);
    }
}

app.Run();

public partial class Program;
