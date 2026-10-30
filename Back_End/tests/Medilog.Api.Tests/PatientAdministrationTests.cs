using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Medilog.Application.Common.Interfaces;
using Medilog.Application.Common.Models;
using Medilog.Application.DTOs.Auth;
using Medilog.Application.DTOs.Patients;
using Medilog.Domain.Entities;
using Medilog.Domain.Enums;
using Medilog.Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;

namespace Medilog.Api.Tests;

public sealed class PatientAdministrationTests(MedilogApiFactory factory) : IClassFixture<MedilogApiFactory>
{
    private static int _phoneSequence = 10;

    private static string NextPhone() => $"0101{Interlocked.Increment(ref _phoneSequence):D7}";

    private static CreatePatientRequest NewRequest(
        string? phone = null,
        string name = "مريض اختبار",
        string gender = "female",
        DateOnly? birthDate = null,
        string? notes = null,
        string? address = null,
        string? emergencyContact = null,
        Guid? doctorId = null) => new(
        name,
        phone ?? NextPhone(),
        birthDate ?? new DateOnly(1990, 5, 10),
        gender,
        notes,
        address,
        emergencyContact,
        doctorId);

    private async Task<Guid> CurrentUserIdAsync(HttpClient client)
    {
        var me = await client.GetFromJsonAsync<UserDto>("/api/v1/auth/me");
        return me!.Id;
    }

    private async Task<HttpClient> LoginAsync(string email, string password)
    {
        using var anonymous = factory.CreateClient();
        var response = await anonymous.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest(email, password));
        response.EnsureSuccessStatusCode();
        var payload = await response.Content.ReadFromJsonAsync<AuthResponseDto>();

        var client = factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", payload!.Token);
        return client;
    }

    /// <summary>Creates a second doctor with one patient of their own, and returns the doctor id and patient id.</summary>
    private async Task<(Guid DoctorId, Guid PatientId, string Phone)> SeedOtherDoctorWithPatientAsync()
    {
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

        var doctor = new User
        {
            FullName = "د. طبيب آخر",
            Email = $"other-{Guid.NewGuid():N}@medilog.local",
            PasswordHash = hasher.Hash("Other123!"),
            Role = UserRole.Doctor
        };

        var phone = NextPhone();
        var patient = new Patient
        {
            Code = $"PT-9{Random.Shared.Next(100, 999)}",
            FullName = "مريض طبيب آخر",
            Phone = phone,
            BirthDate = new DateOnly(1980, 1, 1),
            Gender = Gender.Male,
            DoctorId = doctor.UserId
        };

        db.Users.Add(doctor);
        db.Patients.Add(patient);
        await db.SaveChangesAsync();
        return (doctor.UserId, patient.PatientId, phone);
    }

    [Fact]
    public async Task Create_AsDoctor_OwnsPatient_AndStoresAdministrativeFields()
    {
        using var doctor = await factory.CreateAuthorizedClientAsync(secretary: false);
        var doctorId = await CurrentUserIdAsync(doctor);

        var response = await doctor.PostAsJsonAsync("/api/v1/patients", NewRequest(
            address: "  15 شارع الهرم، الجيزة  ",
            emergencyContact: "محمد - 01012345678",
            notes: "ملاحظة سريرية"));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var patient = await response.Content.ReadFromJsonAsync<PatientDetailDto>();

        Assert.Equal(doctorId, patient!.DoctorId);
        Assert.Equal("15 شارع الهرم، الجيزة", patient.Address);
        Assert.Equal("محمد - 01012345678", patient.EmergencyContact);
        Assert.Equal("ملاحظة سريرية", patient.Notes);
    }

    [Fact]
    public async Task Create_AsSecretary_UsesTheOnlyAssignedDoctor_AndNeverStoresNotes()
    {
        using var secretary = await factory.CreateAuthorizedClientAsync();
        using var doctor = await factory.CreateAuthorizedClientAsync(secretary: false);

        var response = await secretary.PostAsJsonAsync("/api/v1/patients", NewRequest(notes: "سري"));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<PatientDetailDto>();
        Assert.Equal(await CurrentUserIdAsync(doctor), created!.DoctorId);
        Assert.Null(created.Notes);

        var asDoctor = await doctor.GetFromJsonAsync<PatientDetailDto>($"/api/v1/patients/{created.Id}");
        Assert.Null(asDoctor!.Notes);
    }

    [Fact]
    public async Task Create_AsSecretary_WithDoctorOutsideAssignment_IsForbidden()
    {
        var other = await SeedOtherDoctorWithPatientAsync();
        using var secretary = await factory.CreateAuthorizedClientAsync();

        var response = await secretary.PostAsJsonAsync(
            "/api/v1/patients", NewRequest(doctorId: other.DoctorId));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        using var body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        Assert.Equal("doctor_not_allowed", body.RootElement.GetProperty("code").GetString());
    }

    [Fact]
    public async Task Create_AsSecretaryWithSeveralDoctors_RequiresChoosingOne()
    {
        var other = await SeedOtherDoctorWithPatientAsync();
        var email = $"multi-{Guid.NewGuid():N}@medilog.local";

        Guid seededDoctorId;
        using (var scope = factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
            using var doctorClient = await factory.CreateAuthorizedClientAsync(secretary: false);
            seededDoctorId = await CurrentUserIdAsync(doctorClient);

            var secretary = new User
            {
                FullName = "سكرتيرة متعددة",
                Email = email,
                PasswordHash = hasher.Hash("Multi123!"),
                Role = UserRole.Secretary
            };
            db.Users.Add(secretary);
            db.SecretaryDoctors.AddRange(
                new SecretaryDoctor { SecretaryId = secretary.UserId, DoctorId = seededDoctorId },
                new SecretaryDoctor { SecretaryId = secretary.UserId, DoctorId = other.DoctorId });
            await db.SaveChangesAsync();
        }

        using var client = await LoginAsync(email, "Multi123!");

        var missing = await client.PostAsJsonAsync("/api/v1/patients", NewRequest());
        Assert.Equal(HttpStatusCode.BadRequest, missing.StatusCode);
        using var body = JsonDocument.Parse(await missing.Content.ReadAsStringAsync());
        Assert.Contains("doctor_required", body.RootElement.GetProperty("codes").GetProperty("doctorId")
            .EnumerateArray().Select(code => code.GetString()));

        var chosen = await client.PostAsJsonAsync("/api/v1/patients", NewRequest(doctorId: other.DoctorId));
        Assert.Equal(HttpStatusCode.Created, chosen.StatusCode);
        var patient = await chosen.Content.ReadFromJsonAsync<PatientDetailDto>();
        Assert.Equal(other.DoctorId, patient!.DoctorId);
    }

    [Fact]
    public async Task Update_ChangesAdministrativeData_AndSecretaryLeavesNotesUntouched()
    {
        using var doctor = await factory.CreateAuthorizedClientAsync(secretary: false);
        using var secretary = await factory.CreateAuthorizedClientAsync();

        var created = await (await doctor.PostAsJsonAsync("/api/v1/patients",
            NewRequest(notes: "ملاحظة الطبيب"))).Content.ReadFromJsonAsync<PatientDetailDto>();

        var newPhone = NextPhone();
        var response = await secretary.PatchAsJsonAsync($"/api/v1/patients/{created!.Id}",
            new UpdatePatientRequest(
                "اسم معدل",
                newPhone,
                new DateOnly(1991, 6, 11),
                "male",
                "محاولة تعديل الملاحظات",
                "عنوان جديد",
                "جهة اتصال جديدة"));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var updated = await response.Content.ReadFromJsonAsync<PatientDetailDto>();
        Assert.Equal("اسم معدل", updated!.FullName);
        Assert.Equal(newPhone, updated.Phone);
        Assert.Equal("male", updated.Gender);
        Assert.Equal("عنوان جديد", updated.Address);
        Assert.Equal("جهة اتصال جديدة", updated.EmergencyContact);
        Assert.Null(updated.Notes);

        var asDoctor = await doctor.GetFromJsonAsync<PatientDetailDto>($"/api/v1/patients/{created.Id}");
        Assert.Equal("ملاحظة الطبيب", asDoctor!.Notes);
    }

    [Fact]
    public async Task Update_ToAnotherPatientsPhone_ReturnsConflict()
    {
        using var doctor = await factory.CreateAuthorizedClientAsync(secretary: false);
        var first = await (await doctor.PostAsJsonAsync("/api/v1/patients", NewRequest()))
            .Content.ReadFromJsonAsync<PatientDetailDto>();
        var second = await (await doctor.PostAsJsonAsync("/api/v1/patients", NewRequest()))
            .Content.ReadFromJsonAsync<PatientDetailDto>();

        var response = await doctor.PatchAsJsonAsync($"/api/v1/patients/{second!.Id}",
            new UpdatePatientRequest("اسم", first!.Phone!, new DateOnly(1990, 1, 1), "female", null));

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Theory]
    [InlineData("", "01012345678", "female", "name_required")]
    [InlineData("اسم", "12345", "female", "phone_invalid")]
    [InlineData("اسم", "01012345678", "robot", "gender_invalid")]
    public async Task Create_WithInvalidData_ReturnsValidationCodes(
        string name, string phone, string gender, string expectedCode)
    {
        using var doctor = await factory.CreateAuthorizedClientAsync(secretary: false);
        var response = await doctor.PostAsJsonAsync("/api/v1/patients",
            NewRequest(phone: phone, name: name, gender: gender));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        using var body = JsonDocument.Parse(await response.Content.ReadAsStringAsync());
        var codes = body.RootElement.GetProperty("codes").EnumerateObject()
            .SelectMany(property => property.Value.EnumerateArray().Select(code => code.GetString()));
        Assert.Contains(expectedCode, codes);
    }

    [Fact]
    public async Task Create_WithOverlongAddressOrFutureBirthDate_IsRejected()
    {
        using var doctor = await factory.CreateAuthorizedClientAsync(secretary: false);

        var longAddress = await doctor.PostAsJsonAsync("/api/v1/patients",
            NewRequest(address: new string('أ', 501)));
        Assert.Equal(HttpStatusCode.BadRequest, longAddress.StatusCode);

        var future = await doctor.PostAsJsonAsync("/api/v1/patients",
            NewRequest(birthDate: DateOnly.FromDateTime(DateTime.UtcNow.AddYears(1))));
        Assert.Equal(HttpStatusCode.BadRequest, future.StatusCode);
    }

    [Fact]
    public async Task OtherDoctorsPatient_IsInvisibleToDoctorAndUnassignedSecretary()
    {
        var other = await SeedOtherDoctorWithPatientAsync();
        using var doctor = await factory.CreateAuthorizedClientAsync(secretary: false);
        using var secretary = await factory.CreateAuthorizedClientAsync();

        foreach (var client in new[] { doctor, secretary })
        {
            var get = await client.GetAsync($"/api/v1/patients/{other.PatientId}");
            Assert.Equal(HttpStatusCode.NotFound, get.StatusCode);

            var patch = await client.PatchAsJsonAsync($"/api/v1/patients/{other.PatientId}",
                new UpdatePatientRequest("اختراق", NextPhone(), new DateOnly(1990, 1, 1), "male", null));
            Assert.Equal(HttpStatusCode.NotFound, patch.StatusCode);

            var list = await client.GetFromJsonAsync<PagedResult<PatientListItemDto>>(
                $"/api/v1/patients?search={other.Phone}");
            Assert.Empty(list!.Items);
        }
    }

    [Fact]
    public async Task Search_FindsByNameCodeAndPhone_IncludingArabicDigits()
    {
        using var doctor = await factory.CreateAuthorizedClientAsync(secretary: false);
        var phone = NextPhone();
        var created = await (await doctor.PostAsJsonAsync("/api/v1/patients",
            NewRequest(phone: phone, name: "بحث متعدد الحقول"))).Content.ReadFromJsonAsync<PatientDetailDto>();

        async Task<bool> FoundAsync(string term)
        {
            var page = await doctor.GetFromJsonAsync<PagedResult<PatientListItemDto>>(
                $"/api/v1/patients?search={Uri.EscapeDataString(term)}");
            return page!.Items.Any(item => item.Id == created!.Id);
        }

        Assert.True(await FoundAsync("متعدد الحقول"));
        Assert.True(await FoundAsync(created!.Code));
        Assert.True(await FoundAsync(phone));
        Assert.True(await FoundAsync(phone.Replace('0', '٠').Replace('1', '١').Replace('8', '٨')));
    }

    [Fact]
    public async Task Search_FiltersByGenderAndAgeRange()
    {
        using var doctor = await factory.CreateAuthorizedClientAsync(secretary: false);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var tag = Guid.NewGuid().ToString("N")[..6];

        async Task<PatientDetailDto> CreateAsync(string gender, int age) =>
            (await (await doctor.PostAsJsonAsync("/api/v1/patients", NewRequest(
                name: $"فلتر {tag} {gender} {age}",
                gender: gender,
                birthDate: today.AddYears(-age).AddDays(-30)))).Content.ReadFromJsonAsync<PatientDetailDto>())!;

        var youngMale = await CreateAsync("male", 20);
        var midFemale = await CreateAsync("female", 40);
        var oldFemale = await CreateAsync("female", 70);

        async Task<HashSet<Guid>> QueryAsync(string filter)
        {
            var page = await doctor.GetFromJsonAsync<PagedResult<PatientListItemDto>>(
                $"/api/v1/patients?search={tag}&pageSize=50&{filter}");
            return page!.Items.Select(item => item.Id).ToHashSet();
        }

        Assert.Equal(new HashSet<Guid> { midFemale.Id, oldFemale.Id }, await QueryAsync("gender=female"));
        Assert.Equal(new HashSet<Guid> { youngMale.Id }, await QueryAsync("gender=male"));
        Assert.Equal(new HashSet<Guid> { midFemale.Id }, await QueryAsync("minAge=30&maxAge=50"));
        Assert.Equal(new HashSet<Guid> { midFemale.Id, oldFemale.Id }, await QueryAsync("minAge=40"));
        Assert.Equal(new HashSet<Guid> { youngMale.Id, midFemale.Id }, await QueryAsync("maxAge=40"));
        Assert.Equal(new HashSet<Guid> { oldFemale.Id }, await QueryAsync("gender=female&minAge=60"));
    }

    [Fact]
    public async Task Search_WithInvalidFilters_ReturnsBadRequest()
    {
        using var doctor = await factory.CreateAuthorizedClientAsync(secretary: false);

        Assert.Equal(HttpStatusCode.BadRequest,
            (await doctor.GetAsync("/api/v1/patients?gender=robot")).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest,
            (await doctor.GetAsync("/api/v1/patients?minAge=50&maxAge=20")).StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest,
            (await doctor.GetAsync("/api/v1/patients?minAge=-1")).StatusCode);
    }

    [Fact]
    public async Task Detail_ExposesTheStoredName_EvenWhenTheDisplayNameIsEnglish()
    {
        using var doctor = await factory.CreateAuthorizedClientAsync(secretary: false);
        doctor.DefaultRequestHeaders.AcceptLanguage.ParseAdd("en");

        var page = await doctor.GetFromJsonAsync<PagedResult<PatientListItemDto>>(
            "/api/v1/patients?search=PT-0148");
        var detail = await doctor.GetFromJsonAsync<PatientDetailDto>(
            $"/api/v1/patients/{page!.Items.Single().Id}");

        Assert.Equal("Soaad Mahmoud Hassan", detail!.FullName);
        Assert.Equal("سعاد محمود حسن", detail.Name);

        // Saving the form with the stored name leaves the Arabic name intact.
        doctor.DefaultRequestHeaders.AcceptLanguage.Clear();
        var saved = await doctor.PatchAsJsonAsync($"/api/v1/patients/{detail.Id}",
            new UpdatePatientRequest(detail.Name, detail.Phone!, detail.BirthDate, detail.Gender, detail.Notes));
        Assert.Equal(HttpStatusCode.OK, saved.StatusCode);
        var after = await saved.Content.ReadFromJsonAsync<PatientDetailDto>();
        Assert.Equal("سعاد محمود حسن", after!.Name);
    }

    [Fact]
    public async Task Secretary_NeverSeesClinicalNotesOrLastVisit()
    {
        using var secretary = await factory.CreateAuthorizedClientAsync();
        var page = await secretary.GetFromJsonAsync<PagedResult<PatientListItemDto>>(
            "/api/v1/patients?pageSize=50");

        Assert.NotEmpty(page!.Items);
        Assert.All(page.Items, item => Assert.Null(item.LastVisitAt));

        var detail = await secretary.GetFromJsonAsync<PatientDetailDto>(
            $"/api/v1/patients/{page.Items[0].Id}");
        Assert.Null(detail!.Notes);
        Assert.Null(detail.LastVisitAt);
    }
}
