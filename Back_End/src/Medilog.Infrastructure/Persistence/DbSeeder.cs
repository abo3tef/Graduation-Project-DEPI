using Medilog.Application.Common.Interfaces;
using Medilog.Domain.Common;
using Medilog.Domain.Entities;
using Medilog.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace Medilog.Infrastructure.Persistence;

/// <summary>
/// Development/demo seed. It is only applied when Demo:Enabled is true and the
/// database has no users. No real patient data belongs here.
/// </summary>
public static class DbSeeder
{
    public const string DoctorEmail = "doctor@medilog.local";
    public const string SecretaryEmail = "secretary@medilog.local";
    public const string DoctorPassword = "Doctor123!";
    public const string SecretaryPassword = "Secretary123!";

    public static async Task SeedAsync(
        AppDbContext db,
        IPasswordHasher passwordHasher,
        IClock clock,
        CancellationToken cancellationToken)
    {
        if (await db.Users.AnyAsync(cancellationToken))
        {
            return;
        }

        var now = clock.UtcNow;
        var today = ClinicTime.Today(now);

        var doctor = new User
        {
            FullName = "د. عادل منصور",
            FullNameEn = "Dr. Adel Mansour",
            Email = DoctorEmail,
            PasswordHash = passwordHasher.Hash(DoctorPassword),
            Phone = "01001234567",
            Specialization = "Internal medicine",
            Role = UserRole.Doctor,
            CreatedAt = now.AddMonths(-8)
        };

        var secretary = new User
        {
            FullName = "سارة حسن",
            FullNameEn = "Sara Hassan",
            Email = SecretaryEmail,
            PasswordHash = passwordHasher.Hash(SecretaryPassword),
            Phone = "01107654321",
            Role = UserRole.Secretary,
            CreatedAt = now.AddMonths(-8)
        };

        db.Users.AddRange(doctor, secretary);

        var patients = new List<Patient>
        {
            NewPatient("PT-0148", "سعاد محمود حسن", "Soaad Mahmoud Hassan", "01005550148", new DateOnly(1972, 3, 14), Gender.Female, now.AddDays(-190), "تعاني من ارتفاع ضغط الدم المزمن."),
            NewPatient("PT-0152", "منى سعيد", "Mona Saeed", "01005550152", new DateOnly(1985, 6, 2), Gender.Female, now.AddDays(-150), "متابعة دورية لضغط الدم."),
            NewPatient("PT-0171", "كريم عادل", "Karim Adel", "01115550171", new DateOnly(1993, 9, 20), Gender.Male, now.AddDays(-95), null),
            NewPatient("PT-0189", "هالة يوسف", "Hala Youssef", "01225550189", new DateOnly(1964, 1, 30), Gender.Female, now.AddDays(-70), "حساسية من البنسلين."),
            NewPatient("PT-0195", "أحمد فتحي", "Ahmed Fathy", "01005550195", new DateOnly(1979, 11, 5), Gender.Male, now.AddDays(-60), "مريض سكري من النوع الثاني."),
            NewPatient("PT-0203", "نور حسن", "Nour Hassan", "01115550203", new DateOnly(1990, 4, 12), Gender.Female, now.AddDays(-40), null),
            NewPatient("PT-0211", "عمر خالد", "Omar Khaled", "01225550211", new DateOnly(1988, 7, 23), Gender.Male, now.AddDays(-35), null),
            NewPatient("PT-0218", "سلمى إبراهيم", "Salma Ibrahim", "01005550218", new DateOnly(1997, 2, 8), Gender.Female, now.AddDays(-28), null),
            NewPatient("PT-0224", "يوسف علي", "Youssef Ali", "01115550224", new DateOnly(1969, 12, 19), Gender.Male, now.AddDays(-20), "متابعة بعد قسطرة."),
            NewPatient("PT-0231", "آية مصطفى", "Aya Mostafa", "01225550231", new DateOnly(2001, 5, 30), Gender.Female, now.AddDays(-12), null),
            NewPatient("PT-0237", "محمود سمير", "Mahmoud Samir", "01005550237", new DateOnly(1958, 8, 17), Gender.Male, now.AddDays(-5), "ضغط مرتفع وحساسية من الأسبرين."),
            NewPatient("PT-0242", "نادية فاروق", "Nadia Farouk", "01115550242", new DateOnly(1975, 10, 1), Gender.Female, now.AddDays(-3), null),
            NewPatient("PT-0249", "طارق نبيل", "Tarek Nabil", "01225550249", new DateOnly(1983, 3, 11), Gender.Male, now.AddDays(-1), null)
        };

        foreach (var patient in patients)
        {
            patient.DoctorId = doctor.UserId;
        }

        patients[0].Address = "12 شارع النيل، المعادي، القاهرة";
        patients[0].EmergencyContact = "حسن محمود - 01005550001";
        patients[1].Address = "5 شارع الجامعة، الجيزة";
        patients[1].EmergencyContact = "سعيد علي - 01005550002";
        patients[2].Address = "8 شارع التحرير، الدقي، الجيزة";

        db.Patients.AddRange(patients);
        db.SecretaryDoctors.Add(new SecretaryDoctor { SecretaryId = secretary.UserId, DoctorId = doctor.UserId });

        // Visits over the last four weeks. The pattern is deterministic so the
        // dashboard chart is stable across fresh runs.
        var visitCounts = new[] { 2, 3, 1, 4, 2, 3, 2, 1, 3, 2, 4, 2, 1, 3, 2, 2, 3, 1, 4, 2, 3, 1, 2, 3, 2, 4, 1, 3 };
        var visits = new List<Visit>();
        for (var daysAgo = 27; daysAgo >= 0; daysAgo--)
        {
            var day = today.AddDays(-daysAgo);
            var count = visitCounts[27 - daysAgo];
            for (var index = 0; index < count; index++)
            {
                var patient = patients[(daysAgo + index) % patients.Count];
                visits.Add(new Visit
                {
                    PatientId = patient.PatientId,
                    DoctorId = doctor.UserId,
                    VisitedAt = AtCairo(day, 9 + index * 2, 0),
                    ChiefComplaint = index % 3 == 0 ? "متابعة دورية" : null,
                    ClinicalNotes = index % 2 == 0 ? "الحالة مستقرة." : null
                });
            }
        }

        db.Visits.AddRange(visits);

        var appointments = new List<Appointment>
        {
            NewAppointment(patients[1], doctor, secretary, AtCairo(today, 10, 0), "bp-followup", AppointmentStatus.Confirmed, now),
            NewAppointment(patients[2], doctor, secretary, AtCairo(today, 10, 30), "new-checkup", AppointmentStatus.Scheduled, now),
            NewAppointment(patients[3], doctor, secretary, AtCairo(today, 11, 0), "lab-results", AppointmentStatus.Completed, now),
            NewAppointment(patients[4], doctor, secretary, AtCairo(today, 12, 0), "follow-up", AppointmentStatus.Scheduled, now),
            NewAppointment(patients[0], doctor, secretary, AtCairo(today.AddDays(1), 9, 30), "follow-up", AppointmentStatus.Confirmed, now),
            NewAppointment(patients[5], doctor, secretary, AtCairo(today.AddDays(1), 11, 0), "new-checkup", AppointmentStatus.Scheduled, now),
            NewAppointment(patients[6], doctor, secretary, AtCairo(today.AddDays(-1), 10, 0), "lab-results", AppointmentStatus.Completed, now),
            NewAppointment(patients[7], doctor, secretary, AtCairo(today.AddDays(-1), 11, 30), "bp-followup", AppointmentStatus.Completed, now),
            NewAppointment(patients[8], doctor, secretary, AtCairo(today.AddDays(2), 10, 30), "follow-up", AppointmentStatus.Scheduled, now),
            NewAppointment(patients[9], doctor, secretary, AtCairo(today.AddDays(2), 12, 0), "new-checkup", AppointmentStatus.Confirmed, now),
            NewAppointment(patients[10], doctor, secretary, AtCairo(today.AddDays(3), 9, 0), "bp-followup", AppointmentStatus.Scheduled, now),
            NewAppointment(patients[11], doctor, secretary, AtCairo(today.AddDays(4), 10, 0), "lab-results", AppointmentStatus.Scheduled, now),
            NewAppointment(patients[12], doctor, secretary, AtCairo(today.AddDays(5), 11, 30), "new-checkup", AppointmentStatus.Confirmed, now),
            NewAppointment(patients[0], doctor, secretary, AtCairo(today.AddDays(7), 9, 30), "bp-followup", AppointmentStatus.Scheduled, now),
            NewAppointment(patients[3], doctor, secretary, AtCairo(today.AddDays(8), 10, 30), "follow-up", AppointmentStatus.Scheduled, now)
        };

        db.Appointments.AddRange(appointments);

        // Link visits for the completed appointments so the patient file shows a
        // realistic history.
        foreach (var appointment in appointments.Where(a => a.Status == AppointmentStatus.Completed))
        {
            db.Visits.Add(new Visit
            {
                PatientId = appointment.PatientId,
                DoctorId = appointment.DoctorId,
                AppointmentId = appointment.AppointmentId,
                VisitedAt = appointment.StartsAt,
                ChiefComplaint = "زيارة مرتبطة بالموعد",
                ClinicalNotes = "تمت المراجعة، الحالة مستقرة."
            });
        }

        await db.SaveChangesAsync(cancellationToken);
    }

    private static Patient NewPatient(
        string code,
        string name,
        string nameEn,
        string phone,
        DateOnly birthDate,
        Gender gender,
        DateTime createdAt,
        string? notes) => new()
    {
        Code = code,
        FullName = name,
        FullNameEn = nameEn,
        Phone = phone,
        BirthDate = birthDate,
        Gender = gender,
        CreatedAt = createdAt,
        Notes = notes
    };

    private static Appointment NewAppointment(
        Patient patient,
        User doctor,
        User createdBy,
        DateTime startsAt,
        string reason,
        AppointmentStatus status,
        DateTime createdAt) => new()
    {
        PatientId = patient.PatientId,
        DoctorId = doctor.UserId,
        CreatedBy = createdBy.UserId,
        StartsAt = startsAt,
        DurationMinutes = 30,
        Reason = reason,
        Status = status,
        CreatedAt = createdAt.AddDays(-2)
    };

    private static DateTime AtCairo(DateOnly date, int hour, int minute)
    {
        var local = date.ToDateTime(new TimeOnly(hour, minute), DateTimeKind.Unspecified);
        return TimeZoneInfo.ConvertTimeToUtc(local, ClinicTime.TimeZone);
    }
}
