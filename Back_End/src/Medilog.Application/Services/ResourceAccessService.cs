using Medilog.Application.Interfaces;
using Medilog.Application.Security;

namespace Medilog.Application.Services;

public sealed class ResourceAccessService(IAccessScopeStore store) : IResourceAccessService
{
    private static readonly IReadOnlyCollection<Guid> None = Array.Empty<Guid>();

    public async Task<IReadOnlyCollection<Guid>> GetAccessibleDoctorIdsAsync(ICurrentUser user, CancellationToken ct = default)
    {
        if (!user.IsAuthenticated || user.UserId is not { } userId)
            return None;

        if (user.IsInRole(MedilogRoles.Doctor))
            return new[] { userId };

        if (user.IsInRole(MedilogRoles.Secretary))
            return await store.GetAssignedDoctorIdsAsync(userId, ct);

        return None; // Admin and unknown roles have no appointment/patient scope.
    }

    public async Task<bool> CanAccessDoctorScheduleAsync(ICurrentUser user, Guid doctorId, CancellationToken ct = default)
    {
        var accessible = await GetAccessibleDoctorIdsAsync(user, ct);
        return accessible.Contains(doctorId);
    }

    public async Task<bool> CanAccessAppointmentAsync(ICurrentUser user, Guid appointmentId, CancellationToken ct = default)
    {
        var doctorId = await store.GetAppointmentDoctorIdAsync(appointmentId, ct);
        return doctorId is { } id && await CanAccessDoctorScheduleAsync(user, id, ct);
    }

    public async Task<bool> CanAccessPatientBasicInfoAsync(ICurrentUser user, Guid patientId, CancellationToken ct = default)
    {
        var doctorId = await store.GetPatientDoctorIdAsync(patientId, ct);
        return doctorId is { } id && await CanAccessDoctorScheduleAsync(user, id, ct);
    }
}
