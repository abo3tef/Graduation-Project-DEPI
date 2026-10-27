using Microsoft.EntityFrameworkCore;
using Medilog.Domain.Entities;

namespace Medilog.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Doctor> Doctors => Set<Doctor>();
    public DbSet<Patient> Patients => Set<Patient>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Doctor>(entity =>
        {
            entity.HasKey(doctor => doctor.DoctorId);

            entity.Property(doctor => doctor.FullName)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(doctor => doctor.Email)
                .IsRequired()
                .HasMaxLength(254);

            entity.HasIndex(doctor => doctor.Email)
                .IsUnique();

            entity.Property(doctor => doctor.PasswordHash)
                .IsRequired()
                .HasMaxLength(500);

            entity.Property(doctor => doctor.Phone)
                .HasMaxLength(30);

            entity.Property(doctor => doctor.Specialization)
                .HasMaxLength(150);

            entity.Property(doctor => doctor.AccountStatus)
                .IsRequired()
                .HasMaxLength(30);
        });

        modelBuilder.Entity<Patient>(entity =>
        {
            entity.HasKey(patient => patient.PatientId);

            entity.Property(patient => patient.FullName)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(patient => patient.Gender)
                .IsRequired()
                .HasMaxLength(30);

            entity.Property(patient => patient.Phone)
                .HasMaxLength(30);

            entity.Property(patient => patient.Address)
                .HasMaxLength(500);

            entity.Property(patient => patient.BloodType)
                .HasMaxLength(10);

            entity.Property(patient => patient.EmergencyContact)
                .HasMaxLength(200);

            entity.HasIndex(patient => patient.DoctorId);

            entity.HasOne(patient => patient.Doctor)
                .WithMany(doctor => doctor.Patients)
                .HasForeignKey(patient => patient.DoctorId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}