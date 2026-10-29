using Medilog.Application.Security;

namespace Medilog.Application.Interfaces;

/// <summary>
/// Server-side ownership and assignment checks for appointments and basic patient information.
/// Members 3, 4 and 6 must call these before reading or writing a doctor-scoped resource.
/// Unknown resources and resources outside the caller's scope both return false, so callers
/// should answer with the same 404/403 either way and never reveal that a resource exists.
/// Medical records are not covered here: they are doctor-only (see the MedicalRecords policy).
/// </summary>
public interface IResourceAccessService
{
    /// <summary>Doctor: own id only. Secretary: assigned doctors only. Admin/other: none.</summary>
    Task<IReadOnlyCollection<Guid>> GetAccessibleDoctorIdsAsync(ICurrentUser user, CancellationToken ct = default);

    Task<bool> CanAccessDoctorScheduleAsync(ICurrentUser user, Guid doctorId, CancellationToken ct = default);

    Task<bool> CanAccessAppointmentAsync(ICurrentUser user, Guid appointmentId, CancellationToken ct = default);

    /// <summary>Basic patient information (name, DOB, gender, phone, address, emergency contact) only.</summary>
    Task<bool> CanAccessPatientBasicInfoAsync(ICurrentUser user, Guid patientId, CancellationToken ct = default);
}
