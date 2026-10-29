using Medilog.Application.DTOs;

namespace Medilog.Application.Interfaces;

/// <summary>
/// Read-only lookups needed to make access decisions. Implemented in Infrastructure.
/// </summary>
public interface IAccessScopeStore
{
    /// <summary>Doctor ids assigned to the secretary. Empty when the secretary is missing or inactive.</summary>
    Task<IReadOnlyCollection<Guid>> GetAssignedDoctorIdsAsync(Guid secretaryId, CancellationToken ct = default);

    /// <summary>True only when the secretary exists and the account is Active.</summary>
    Task<bool> IsActiveSecretaryAsync(Guid secretaryId, CancellationToken ct = default);

    /// <summary>The doctor who owns the patient record, or null if the patient does not exist.</summary>
    Task<Guid?> GetPatientDoctorIdAsync(Guid patientId, CancellationToken ct = default);

    /// <summary>The doctor of the appointment, or null if the appointment does not exist.</summary>
    Task<Guid?> GetAppointmentDoctorIdAsync(Guid appointmentId, CancellationToken ct = default);

    /// <summary>Account details with assigned doctors, or null if the secretary does not exist.</summary>
    Task<SecretaryAccountDto?> GetSecretaryAccountAsync(Guid secretaryId, CancellationToken ct = default);
}
