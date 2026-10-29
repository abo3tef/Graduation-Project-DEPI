using Medilog.Domain.Enums;

namespace Medilog.Domain.Entities;

/// <summary>
/// Status transitions are a domain rule, not an HTTP concern.
/// </summary>
public static class AppointmentWorkflow
{
    public static bool CanTransition(AppointmentStatus current, AppointmentStatus next)
    {
        if (current == next)
        {
            return true;
        }

        return current switch
        {
            AppointmentStatus.Scheduled => next is AppointmentStatus.Confirmed
                or AppointmentStatus.Cancelled
                or AppointmentStatus.NoShow,
            AppointmentStatus.Confirmed => next is AppointmentStatus.Completed
                or AppointmentStatus.Cancelled
                or AppointmentStatus.NoShow,
            _ => false
        };
    }

    public static IReadOnlyList<AppointmentStatus> NextStatuses(AppointmentStatus current) =>
        Enum.GetValues<AppointmentStatus>()
            .Where(status => status != current && CanTransition(current, status))
            .ToArray();
}
