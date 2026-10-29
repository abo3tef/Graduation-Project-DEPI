namespace Medilog.Application.Common;

/// <summary>Reason codes are stable API values; the UI localizes them.</summary>
public static class AppointmentReasons
{
    public const string BpFollowUp = "bp-followup";
    public const string NewCheckup = "new-checkup";
    public const string LabResults = "lab-results";
    public const string FollowUp = "follow-up";

    public static readonly IReadOnlySet<string> All = new HashSet<string>(StringComparer.Ordinal)
    {
        BpFollowUp,
        NewCheckup,
        LabResults,
        FollowUp
    };

    public static bool IsValid(string? reason) => reason is not null && All.Contains(reason);
}
