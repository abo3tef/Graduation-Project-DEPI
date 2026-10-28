using Medilog.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Medilog.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Doctor> Doctors => Set<Doctor>();
    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<MedicalVisit> MedicalVisits => Set<MedicalVisit>();
    public DbSet<Diagnosis> Diagnoses => Set<Diagnosis>();
    public DbSet<Medication> Medications => Set<Medication>();
    public DbSet<Allergy> Allergies => Set<Allergy>();
    public DbSet<ChronicCondition> ChronicConditions => Set<ChronicCondition>();
    public DbSet<VitalSigns> VitalSigns => Set<VitalSigns>();
    public DbSet<LaboratoryResult> LaboratoryResults => Set<LaboratoryResult>();
    public DbSet<MedicalNote> MedicalNotes => Set<MedicalNote>();
    public DbSet<MedicalDocument> MedicalDocuments => Set<MedicalDocument>();
    public DbSet<Secretary> Secretaries => Set<Secretary>();
    public DbSet<Appointment> Appointments => Set<Appointment>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Doctor>(entity =>
        {
            entity.HasKey(x => x.DoctorId);
            entity.Property(x => x.FullName).IsRequired().HasMaxLength(200);
            entity.Property(x => x.Email).IsRequired().HasMaxLength(254);
            entity.HasIndex(x => x.Email).IsUnique();
            entity.Property(x => x.PasswordHash).IsRequired().HasMaxLength(500);
            entity.Property(x => x.Phone).HasMaxLength(30);
            entity.Property(x => x.Specialization).HasMaxLength(150);
            entity.Property(x => x.AccountStatus).IsRequired().HasMaxLength(30);
        });

        modelBuilder.Entity<Patient>(entity =>
        {
            entity.HasKey(x => x.PatientId);
            entity.Property(x => x.FullName).IsRequired().HasMaxLength(200);
            entity.Property(x => x.Gender).IsRequired().HasMaxLength(30);
            entity.Property(x => x.Phone).HasMaxLength(30);
            entity.Property(x => x.Address).HasMaxLength(500);
            entity.Property(x => x.BloodType).HasMaxLength(10);
            entity.Property(x => x.EmergencyContact).HasMaxLength(200);
            entity.HasIndex(x => x.DoctorId);
            entity.HasOne(x => x.Doctor).WithMany(x => x.Patients).HasForeignKey(x => x.DoctorId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<MedicalVisit>(entity =>
        {
            entity.HasKey(x => x.VisitId);
            entity.Property(x => x.VisitDate).IsRequired();
            entity.HasIndex(x => new { x.PatientId, x.VisitDate });
            entity.HasOne(x => x.Patient).WithMany().HasForeignKey(x => x.PatientId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(x => x.Doctor).WithMany().HasForeignKey(x => x.DoctorId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(x => x.Appointment).WithOne(x => x.MedicalVisit).HasForeignKey<MedicalVisit>(x => x.AppointmentId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Diagnosis>(entity =>
        {
            entity.HasKey(x => x.DiagnosisId);
            entity.Property(x => x.DiagnosisName).IsRequired().HasMaxLength(200);
            entity.HasIndex(x => new { x.PatientId, x.DiagnosisDate });
            entity.HasOne(x => x.Visit).WithMany(x => x.Diagnoses).HasForeignKey(x => x.VisitId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(x => x.Patient).WithMany().HasForeignKey(x => x.PatientId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Medication>(entity =>
        {
            entity.HasKey(x => x.MedicationId);
            entity.Property(x => x.MedicationName).IsRequired().HasMaxLength(200);
            entity.Property(x => x.Dosage).IsRequired().HasMaxLength(100);
            entity.Property(x => x.Frequency).IsRequired().HasMaxLength(100);
            entity.Property(x => x.Duration).HasMaxLength(100);
            entity.HasIndex(x => x.PatientId);
            entity.HasOne(x => x.Visit).WithMany(x => x.Medications).HasForeignKey(x => x.VisitId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(x => x.Patient).WithMany().HasForeignKey(x => x.PatientId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Allergy>(entity =>
        {
            entity.HasKey(x => x.AllergyId);
            entity.Property(x => x.AllergyName).IsRequired().HasMaxLength(200);
            entity.Property(x => x.Severity).HasConversion<string>().HasMaxLength(20);
            entity.HasIndex(x => x.PatientId);
            entity.HasOne(x => x.Patient).WithMany().HasForeignKey(x => x.PatientId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ChronicCondition>(entity =>
        {
            entity.HasKey(x => x.ConditionId);
            entity.Property(x => x.ConditionName).IsRequired().HasMaxLength(200);
            entity.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            entity.HasIndex(x => x.PatientId);
            entity.HasOne(x => x.Patient).WithMany().HasForeignKey(x => x.PatientId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<VitalSigns>(entity =>
        {
            entity.HasKey(x => x.VitalSignsId);
            entity.Property(x => x.BloodPressure).HasMaxLength(20);
            entity.Property(x => x.Temperature).HasPrecision(5, 2);
            entity.Property(x => x.Weight).HasPrecision(7, 2);
            entity.Property(x => x.Height).HasPrecision(6, 2);
            entity.HasIndex(x => x.VisitId);
            entity.HasOne(x => x.Visit).WithMany(x => x.VitalSigns).HasForeignKey(x => x.VisitId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<LaboratoryResult>(entity =>
        {
            entity.HasKey(x => x.ResultId);
            entity.Property(x => x.TestName).IsRequired().HasMaxLength(200);
            entity.Property(x => x.Value).HasPrecision(18, 4);
            entity.Property(x => x.Unit).IsRequired().HasMaxLength(50);
            entity.Property(x => x.ReferenceRange).HasMaxLength(100);
            entity.HasIndex(x => new { x.PatientId, x.TestDate });
            entity.HasOne(x => x.Patient).WithMany().HasForeignKey(x => x.PatientId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(x => x.Visit).WithMany(x => x.LaboratoryResults).HasForeignKey(x => x.VisitId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<MedicalNote>(entity =>
        {
            entity.HasKey(x => x.NoteId);
            entity.Property(x => x.NoteContent).IsRequired();
            entity.HasIndex(x => new { x.PatientId, x.CreatedDate });
            entity.HasOne(x => x.Patient).WithMany().HasForeignKey(x => x.PatientId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(x => x.Doctor).WithMany().HasForeignKey(x => x.DoctorId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(x => x.Visit).WithMany(x => x.MedicalNotes).HasForeignKey(x => x.VisitId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<MedicalDocument>(entity =>
        {
            entity.HasKey(x => x.DocumentId);
            entity.Property(x => x.FileName).IsRequired().HasMaxLength(255);
            entity.Property(x => x.Type).HasConversion<string>().HasMaxLength(10);
            entity.Property(x => x.Location).IsRequired().HasMaxLength(1000);
            entity.HasIndex(x => x.PatientId);
            entity.HasOne(x => x.Patient).WithMany().HasForeignKey(x => x.PatientId).OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(x => x.Uploader).WithMany().HasForeignKey(x => x.UploadedBy).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Secretary>(entity =>
        {
            entity.HasKey(x => x.SecretaryId);
            entity.Property(x => x.FullName).IsRequired().HasMaxLength(200);
            entity.Property(x => x.Email).IsRequired().HasMaxLength(254);
            entity.HasIndex(x => x.Email).IsUnique();
            entity.Property(x => x.PasswordHash).IsRequired().HasMaxLength(500);
            entity.Property(x => x.Phone).HasMaxLength(30);
            entity.Property(x => x.AccountStatus).HasConversion<string>().HasMaxLength(20);
            entity.HasMany(x => x.Doctors).WithMany(x => x.Secretaries)
                .UsingEntity("SecretaryDoctors");
        });

        modelBuilder.Entity<Appointment>(entity =>
        {
            entity.HasKey(x => x.AppointmentId);
            entity.Property(x => x.Status).HasConversion<string>().HasMaxLength(20);
            entity.HasIndex(x => new { x.DoctorId, x.AppointmentDate, x.StartTime });
            entity.HasIndex(x => new { x.PatientId, x.AppointmentDate });
            entity.HasOne(x => x.Patient).WithMany().HasForeignKey(x => x.PatientId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(x => x.Doctor).WithMany().HasForeignKey(x => x.DoctorId).OnDelete(DeleteBehavior.Restrict);
        });
    }
}