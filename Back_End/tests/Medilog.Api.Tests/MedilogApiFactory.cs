using System.Net.Http.Headers;
using System.Net.Http.Json;
using Medilog.Application.DTOs.Auth;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Configuration;

namespace Medilog.Api.Tests;

public sealed class MedilogApiFactory : WebApplicationFactory<Program>
{
    private const string TestKey = "medilog-integration-tests-signing-key-0123456789abcdef";

    private readonly string _databasePath = Path.Combine(
        Path.GetTempPath(),
        $"medilog-tests-{Guid.NewGuid():N}.db");

    private readonly SemaphoreSlim _loginLock = new(1, 1);
    private string? _secretaryToken;
    private string? _doctorToken;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");

        // Program reads the connection string while building services, before the in-memory
        // configuration below is applied, so it must also be supplied as a host setting.
        // Otherwise every run shares one persistent medilog.dev.db in the test output folder.
        builder.UseSetting("ConnectionStrings:DefaultConnection", $"Data Source={_databasePath}");

        builder.ConfigureAppConfiguration((_, configuration) =>
        {
            configuration.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:DefaultConnection"] = $"Data Source={_databasePath}",
                ["Jwt:Key"] = TestKey,
                ["Demo:Enabled"] = "true"
            });
        });
    }

    public async Task<string> GetTokenAsync(bool secretary)
    {
        await _loginLock.WaitAsync();
        try
        {
            var cached = secretary ? _secretaryToken : _doctorToken;
            if (cached is not null)
            {
                return cached;
            }

            using var client = CreateClient();
            var response = await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest(
                secretary ? "secretary@medilog.local" : "doctor@medilog.local",
                secretary ? "Secretary123!" : "Doctor123!"));

            response.EnsureSuccessStatusCode();
            var payload = await response.Content.ReadFromJsonAsync<AuthResponseDto>();
            var token = payload!.Token;

            if (secretary)
            {
                _secretaryToken = token;
            }
            else
            {
                _doctorToken = token;
            }

            return token;
        }
        finally
        {
            _loginLock.Release();
        }
    }

    public async Task<HttpClient> CreateAuthorizedClientAsync(bool secretary = true)
    {
        var client = CreateClient();
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", await GetTokenAsync(secretary));
        return client;
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);

        try
        {
            if (File.Exists(_databasePath))
            {
                File.Delete(_databasePath);
            }
        }
        catch (IOException)
        {
            // The test run is over; a locked temp file is harmless.
        }
    }
}
