using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Medilog.Application.DTOs.Appointments;
using Medilog.Application.DTOs.Auth;
using Medilog.Application.DTOs.Dashboard;
using Medilog.Application.DTOs.Patients;
using Medilog.Application.Common.Models;

namespace Medilog.Api.Tests;

public sealed class ApiEndpointsTests(MedilogApiFactory factory) : IClassFixture<MedilogApiFactory>
{
    [Fact]
    public async Task Health_IsAnonymousAndOk()
    {
        using var client = factory.CreateClient();
        var response = await client.GetAsync("/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Login_WithWrongPassword_ReturnsUnauthorizedProblem()
    {
        using var client = factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/v1/auth/login",
            new LoginRequest("secretary@medilog.local", "not-the-password"));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);

        using var body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.Equal("invalid_credentials", body.RootElement.GetProperty("code").GetString());
    }

    [Fact]
    public async Task Patients_WithoutToken_ReturnsUnauthorized()
    {
        using var client = factory.CreateClient();
        var response = await client.GetAsync("/api/v1/patients");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Patients_SearchByArabicName_ReturnsSeededPatient()
    {
        using var client = await factory.CreateAuthorizedClientAsync();
        var response = await client.GetAsync("/api/v1/patients?search=%D8%B3%D8%B9%D8%A7%D8%AF&page=1&pageSize=10&sort=name_asc");

        response.EnsureSuccessStatusCode();
        var page = await response.Content.ReadFromJsonAsync<PagedResult<PatientListItemDto>>();

        Assert.NotNull(page);
        Assert.Contains(page!.Items, item => item.FullName.Contains("سعاد"));
    }

    [Fact]
    public async Task Patients_CreateNormalizesArabicDigits_AndRejectsDuplicatePhone()
    {
        using var client = await factory.CreateAuthorizedClientAsync();
        var request = new CreatePatientRequest(
            "مريض اختبار",
            "٠١٠٩٩٩٨٨٧٦٥",
            new DateOnly(1990, 5, 10),
            "female",
            null);

        var created = await client.PostAsJsonAsync("/api/v1/patients", request);
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);

        var patient = await created.Content.ReadFromJsonAsync<PatientDetailDto>();
        Assert.NotNull(patient);
        Assert.Equal("01099988765", patient!.Phone);
        Assert.StartsWith("PT-", patient.Code);

        var duplicate = await client.PostAsJsonAsync("/api/v1/patients", request);
        Assert.Equal(HttpStatusCode.Conflict, duplicate.StatusCode);

        using var body = JsonDocument.Parse(await duplicate.Content.ReadAsStringAsync());
        Assert.Equal("duplicate_phone", body.RootElement.GetProperty("code").GetString());
    }

    [Fact]
    public async Task Patients_CreateAsDoctor_ReturnsForbidden()
    {
        using var client = await factory.CreateAuthorizedClientAsync(secretary: false);
        var response = await client.PostAsJsonAsync("/api/v1/patients", new CreatePatientRequest(
            "مريض ممنوع",
            "01077776666",
            new DateOnly(1985, 1, 1),
            "male",
            null));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Appointments_TodayMatchesSeed()
    {
        using var client = await factory.CreateAuthorizedClientAsync();
        var appointments = await client.GetFromJsonAsync<List<AppointmentDto>>("/api/v1/appointments");

        Assert.NotNull(appointments);
        Assert.True(appointments!.Count >= 3);
    }

    [Fact]
    public async Task Appointments_ConflictingTime_ReturnsConflict()
    {
        using var client = await factory.CreateAuthorizedClientAsync();
        var appointments = await client.GetFromJsonAsync<List<AppointmentDto>>("/api/v1/appointments");

        var existing = appointments!.First(appointment => appointment.Status != "cancelled");
        var response = await client.PostAsJsonAsync("/api/v1/appointments", new CreateAppointmentRequest(
            existing.PatientId,
            existing.StartsAt,
            30,
            "follow-up",
            null));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);

        using var body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.Equal("appointment_conflict", body.RootElement.GetProperty("code").GetString());
    }

    [Fact]
    public async Task Appointments_DoctorCanAdvanceStatus()
    {
        using var client = await factory.CreateAuthorizedClientAsync(secretary: false);
        var appointments = await client.GetFromJsonAsync<List<AppointmentDto>>("/api/v1/appointments");

        var scheduled = appointments!.First(appointment => appointment.Status == "scheduled");

        var confirmed = await client.PatchAsJsonAsync(
            $"/api/v1/appointments/{scheduled.Id}/status",
            new UpdateAppointmentStatusRequest("confirmed", null));

        Assert.Equal(HttpStatusCode.OK, confirmed.StatusCode);

        var completed = await client.PatchAsJsonAsync(
            $"/api/v1/appointments/{scheduled.Id}/status",
            new UpdateAppointmentStatusRequest("completed", null));

        Assert.Equal(HttpStatusCode.OK, completed.StatusCode);
        var updated = await completed.Content.ReadFromJsonAsync<AppointmentDto>();
        Assert.Equal("completed", updated!.Status);
    }

    [Fact]
    public async Task Dashboard_ReturnsFourLocalizedStats()
    {
        using var client = await factory.CreateAuthorizedClientAsync();
        var summary = await client.GetFromJsonAsync<DashboardSummaryDto>("/api/v1/dashboard/summary");

        Assert.NotNull(summary);
        Assert.Equal(4, summary!.Stats.Count);
        Assert.True(summary.DemoMode);
        Assert.NotEmpty(summary.TodayAppointments);

        var visits = await client.GetFromJsonAsync<VisitsDto>("/api/v1/dashboard/visits?range=week");
        Assert.NotNull(visits);
        Assert.Equal(7, visits!.Points.Count);
    }
}
